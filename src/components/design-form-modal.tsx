import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

import {
  createDesign,
  fetchMaterials,
  getErrorMessage,
  getUnitLabel,
  updateDesign,
} from "@/api/client";
import { Button } from "@/components/button";
import { FormError } from "@/components/form-error";
import { SelectField } from "@/components/select-field";
import { TextField } from "@/components/text-field";
import {
  CANVAS_BG,
  FIELD_TINT_BG,
  FIELD_TINT_BORDER,
  INK_TEXT,
  MUTED_TEXT,
  useFieldTintProps,
  useThemeColors,
} from "@/constants/app-theme";
import { formatAmount, useCurrency } from "@/constants/currency-store";

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
  materials: ApiDesignMaterial[];
};

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

  const save = async () => {
    if (!name.trim() || designMaterials.length === 0) {
      setError("Ingresa un nombre y agrega al menos un material.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        reference: reference.trim(),
        materials: designMaterials,
      };
      if (isEditing && design) {
        await updateDesign(design.id, payload);
      } else {
        await createDesign(payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        className="flex-1 items-center justify-center bg-black/50 p-6"
      >
        <Pressable
          className={`w-full max-w-sm rounded-2xl p-5 shadow-md shadow-black/20 ${CANVAS_BG}`}
        >
          <Text className={`mb-4 text-lg font-extrabold ${INK_TEXT}`}>
            {isEditing ? "Editar diseño" : "Nuevo diseño"}
          </Text>

          <ScrollView keyboardShouldPersistTaps="handled">
            <FormError message={error} />

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
              className="mt-3 mb-3 self-end px-4 py-3"
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
                      className={`flex-row items-center justify-between rounded-[9px] border p-3 ${FIELD_TINT_BORDER} ${FIELD_TINT_BG}`}
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
          </ScrollView>

          <View className="mt-2 flex-row items-center justify-end gap-4">
            <Pressable onPress={onClose} hitSlop={8}>
              <Text className={`font-bold ${MUTED_TEXT}`}>Cancelar</Text>
            </Pressable>
            <Button
              label={isEditing ? "Guardar cambios" : "Crear"}
              onPress={save}
              loading={submitting}
              className="px-6 py-3"
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
