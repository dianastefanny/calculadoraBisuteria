import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";

import {
  createDesign,
  deleteDesignImage,
  fetchMaterials,
  getErrorMessage,
  getUnitLabel,
  updateDesign,
  uploadDesignImage,
} from "@/api/client";
import { Button } from "@/components/button";
import { FormError } from "@/components/form-error";
import { FormModal } from "@/components/form-modal";
import { SelectField } from "@/components/select-field";
import { TextField } from "@/components/text-field";
import {
  FIELD_TINT_BG,
  FIELD_TINT_BORDER,
  INK_TEXT,
  MUTED_TEXT,
  useFieldTintProps,
  useThemeColors,
} from "@/constants/app-theme";
import { formatAmount, useCurrency } from "@/constants/currency-store";
import { parseNumberInput } from "@/constants/number-input";

// Forma del material de un diseño, tal como la devuelve client.js.
export type ApiDesignMaterial = {
  materialId: string;
  quantity: string;
  materialName: string;
  materialUnit: string;
};

// Forma del diseño tal como lo devuelve src/api/client.js (mapDesignFromApi).
export type ApiDesign = {
  id: string;
  name: string;
  description: string;
  reference: string;
  imageUrl: string | null;
  materials: ApiDesignMaterial[];
};

// Tamaño máximo (ancho) y calidad con que se guarda la foto antes de subirla:
// 0.85 mantiene la foto nítida (se muestra en grande en la cotización que se
// comparte) y la deja en unos 300-600 KB, por debajo del límite de 2 MB del
// backend.
const PHOTO_MAX_WIDTH = 1080;
const PHOTO_QUALITY = 0.85;

/**
 * Abre la cámara o la galería con recorte cuadrado y devuelve la ruta local
 * de la foto ya reducida y comprimida en JPEG (lo que también le quita los
 * metadatos EXIF, como la ubicación). Devuelve null si el usuario cancela.
 */
async function pickDesignPhoto(source: "camera" | "library") {
  if (source === "camera") {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      throw new Error(
        "Para tomar la foto, permite el acceso a la cámara en los ajustes del celular.",
      );
    }
  }

  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  };
  const result =
    source === "camera"
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);

  if (result.canceled || !result.assets?.length) return null;

  const asset = result.assets[0];
  const context = ImageManipulator.manipulate(asset.uri);
  if (asset.width > PHOTO_MAX_WIDTH) {
    context.resize({ width: PHOTO_MAX_WIDTH });
  }
  const image = await context.renderAsync();
  const saved = await image.saveAsync({
    compress: PHOTO_QUALITY,
    format: SaveFormat.JPEG,
  });
  return saved.uri;
}

export type DesignFormModalProps = {
  visible: boolean;
  onClose: () => void;
  // Si se pasa un diseño, el modal lo edita; si no, crea uno nuevo.
  design?: ApiDesign | null;
  // Se llama después de crear/editar con éxito, para recargar la lista.
  onSaved: () => void;
};

/**
 * Modal para crear o editar un diseño: nombre, descripción y los materiales
 * que usa (con su cantidad) — conectado al backend real
 * (GET/POST/PUT /designs, GET /materials). Los materiales se agregan de a
 * uno: se elige un material ya registrado, se escribe la cantidad y
 * "Agregar" lo suma a la lista de abajo (cada uno se puede quitar antes de
 * guardar). Mismo patrón que MaterialFormModal/PackagingFormModal.
 */
export function DesignFormModal({
  visible,
  onClose,
  design,
  onSaved,
}: DesignFormModalProps) {
  const isEditing = Boolean(design);
  const currency = useCurrency();
  const theme = useThemeColors();
  const fieldProps = useFieldTintProps();

  const [materials, setMaterials] = useState<
    { id: string; name: string; unit: string; unitCost: string }[]
  >([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [reference, setReference] = useState("");
  const [designMaterials, setDesignMaterials] = useState<ApiDesignMaterial[]>(
    [],
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Foto: "newPhotoUri" es una foto recién elegida (aún sin subir);
  // "removePhoto" indica que el usuario quitó la foto que ya tenía el diseño.
  const [newPhotoUri, setNewPhotoUri] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [processingPhoto, setProcessingPhoto] = useState(false);

  // Campos temporales del "agregar material": se limpian después de cada Agregar.
  const [pickerMaterialId, setPickerMaterialId] = useState<string | null>(null);
  const [pickerQuantity, setPickerQuantity] = useState("");

  // Cada vez que se abre el modal, carga los materiales del usuario y
  // precarga los datos del diseño (edición) o limpia el formulario (creación).
  useEffect(() => {
    if (!visible) return;
    setError(null);
    setName(design?.name ?? "");
    setDescription(design?.description ?? "");
    setReference(design?.reference ?? "");
    setDesignMaterials(design?.materials ?? []);
    setNewPhotoUri(null);
    setRemovePhoto(false);
    setPickerMaterialId(null);
    setPickerQuantity("");

    fetchMaterials()
      .then(setMaterials)
      .catch((err) => setError(getErrorMessage(err)));
  }, [visible, design]);

  const materialOptions = materials.map((material) => ({
    id: material.id,
    label: material.name,
    sublabel: `${getUnitLabel(material.unit)} · ${currency.symbol}${formatAmount(material.unitCost, currency.code)} c/u`,
  }));

  // Agrega el material elegido a la lista del diseño; si ya estaba agregado,
  // actualiza su cantidad en vez de duplicarlo.
  const addMaterialToDesign = () => {
    if (!pickerMaterialId || !pickerQuantity.trim()) return;
    if (parseNumberInput(pickerQuantity) === null) {
      setError("La cantidad del material no es un número válido.");
      return;
    }
    setError(null);

    const pickedMaterial = materials.find((m) => m.id === pickerMaterialId);
    const newItem: ApiDesignMaterial = {
      materialId: pickerMaterialId,
      quantity: pickerQuantity,
      materialName: pickedMaterial?.name ?? "",
      materialUnit: pickedMaterial?.unit ?? "",
    };

    setDesignMaterials((list) => {
      const alreadyAdded = list.some(
        (item) => item.materialId === pickerMaterialId,
      );
      if (alreadyAdded) {
        return list.map((item) =>
          item.materialId === pickerMaterialId ? newItem : item,
        );
      }
      return [...list, newItem];
    });
    setPickerMaterialId(null);
    setPickerQuantity("");
  };

  const removeMaterialFromDesign = (materialId: string) => {
    setDesignMaterials((list) =>
      list.filter((item) => item.materialId !== materialId),
    );
  };

  // Foto que se muestra en la vista previa: la recién elegida o, si no se
  // quitó, la que ya tenía el diseño.
  const previewUri =
    newPhotoUri ?? (removePhoto ? null : (design?.imageUrl ?? null));

  const choosePhoto = async (source: "camera" | "library") => {
    setError(null);
    setProcessingPhoto(true);
    try {
      const uri = await pickDesignPhoto(source);
      if (uri) {
        setNewPhotoUri(uri);
        setRemovePhoto(false);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo cargar la foto.",
      );
    } finally {
      setProcessingPhoto(false);
    }
  };

  const askPhotoSource = () => {
    Alert.alert("Foto del diseño", "¿De dónde quieres tomar la foto?", [
      { text: "Tomar foto", onPress: () => choosePhoto("camera") },
      { text: "Elegir de la galería", onPress: () => choosePhoto("library") },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  const clearPhoto = () => {
    setNewPhotoUri(null);
    setRemovePhoto(true);
  };

  const save = async () => {
    if (!name.trim() || designMaterials.length === 0) {
      setError("Ingresa un nombre y agrega al menos un material.");
      return;
    }

    setError(null);
    setSubmitting(true);

    let savedDesignId: string;
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        reference: reference.trim(),
        materials: designMaterials,
      };
      const saved =
        isEditing && design
          ? await updateDesign(design.id, payload)
          : await createDesign(payload);
      savedDesignId = saved.id;
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
      return;
    }

    // La foto va en una petición aparte, después de guardar el diseño. Si
    // falla, el diseño ya quedó guardado: se avisa y se cierra igual, para
    // no crear un diseño repetido al volver a tocar "Crear".
    try {
      if (newPhotoUri) {
        await uploadDesignImage(savedDesignId, newPhotoUri);
      } else if (removePhoto && design?.imageUrl) {
        await deleteDesignImage(savedDesignId);
      }
    } catch (err) {
      Alert.alert(
        "Diseño guardado sin foto",
        `El diseño se guardó, pero no se pudo actualizar la foto: ${getErrorMessage(err)} Puedes intentarlo de nuevo editando el diseño.`,
      );
    }

    setSubmitting(false);
    onSaved();
    onClose();
  };

  return (
    <FormModal
      visible={visible}
      onClose={onClose}
      title={isEditing ? "Editar diseño" : "Nuevo diseño"}
      submitLabel={isEditing ? "Guardar cambios" : "Crear"}
      onSubmit={save}
      submitting={submitting}
    >
      <FormError message={error} />

      <Text className={`mb-1 font-bold ${INK_TEXT}`}>
        Foto del diseño (opcional)
      </Text>
      {previewUri ? (
        <View className="mb-3 flex-row items-center gap-3">
          <Image
            source={{ uri: previewUri }}
            style={{ width: 64, height: 64, borderRadius: 10 }}
            contentFit="cover"
            transition={150}
          />
          <View className="flex-1 gap-2">
            <Button
              label="Cambiar foto"
              icon="camera"
              onPress={askPhotoSource}
              loading={processingPhoto}
              size="sm"
            />
            <Pressable onPress={clearPhoto} hitSlop={8}>
              <Text className={`font-bold ${MUTED_TEXT}`}>
                Quitar foto
              </Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable
          onPress={askPhotoSource}
          disabled={processingPhoto}
          className={`mb-3 flex-row items-center justify-center gap-2 rounded-[9px] border border-dashed px-3 py-2 ${FIELD_TINT_BORDER} ${FIELD_TINT_BG}`}
        >
          <Ionicons name="camera-outline" size={20} color={theme.mutedInk} />
          <Text className={`text-sm ${MUTED_TEXT}`}>
            {processingPhoto ? "Preparando foto..." : "Agregar foto"}
          </Text>
        </Pressable>
      )}

      <Text className={`mb-1 font-bold ${INK_TEXT}`}>
        Nombre del diseño
      </Text>
      <TextField
        value={name}
        onChangeText={setName}
        placeholder="Ej. Aretes Mandala"
        className="mb-3"
        autoCorrect={false}
        {...fieldProps}
      />

      <Text className={`mb-1 font-bold ${INK_TEXT}`}>
        Descripción
      </Text>
      <TextField
        value={description}
        onChangeText={setDescription}
        placeholder="Breve descripción del diseño"
        className="mb-3"
        autoCorrect={false}
        {...fieldProps}
      />

      <Text className={`mb-1 font-bold ${INK_TEXT}`}>
        Referencia del diseño (opcional)
      </Text>
      <TextField
        value={reference}
        onChangeText={setReference}
        placeholder="Ej. AR-014"
        className="mb-3"
        autoCorrect={false}
        {...fieldProps}
      />

      <Text className={`mb-1 font-bold ${INK_TEXT}`}>
        Materiales
      </Text>
      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <SelectField
            value={pickerMaterialId}
            placeholder="Seleccionar material..."
            options={materialOptions}
            onSelect={setPickerMaterialId}
          />
        </View>
        <View style={{ flex: 1 }}>
          <TextField
            value={pickerQuantity}
            onChangeText={setPickerQuantity}
            keyboardType="numeric"
            placeholder="Cantidad"
            className="mb-0"
            {...fieldProps}
          />
        </View>
      </View>
      <Button
        label="Agregar"
        icon="add"
        onPress={addMaterialToDesign}
        size="sm"
        className="mt-2 mb-3 self-end"
      />

      {designMaterials.length === 0 ? (
        <Text className={`mb-3 text-sm ${MUTED_TEXT}`}>
          Aún no has agregado materiales a este diseño.
        </Text>
      ) : (
        <View className="mb-3 gap-2">
          {designMaterials.map((item) => {
            return (
              <View
                key={item.materialId}
                className={`flex-row items-center justify-between rounded-[9px] border px-3 py-2 ${FIELD_TINT_BORDER} ${FIELD_TINT_BG}`}
              >
                <View className="flex-1">
                  <Text className={`font-bold ${INK_TEXT}`}>
                    {item.materialName || "Material eliminado"}
                  </Text>
                  <Text className={`text-sm ${MUTED_TEXT}`}>
                    {item.quantity} {getUnitLabel(item.materialUnit)}
                  </Text>
                </View>
                <Pressable
                  onPress={() => removeMaterialFromDesign(item.materialId)}
                  hitSlop={8}
                >
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={theme.ink}
                  />
                </Pressable>
              </View>
            );
          })}
        </View>
      )}
    </FormModal>
  );
}
