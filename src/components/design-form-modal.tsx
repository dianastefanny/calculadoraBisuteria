import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

import { Button } from "@/components/button";
import { SelectField } from "@/components/select-field";
import { TextField } from "@/components/text-field";
import { AppColors } from "@/constants/app-theme";
import { useCurrency } from "@/constants/currency-store";
import {
  addDesign,
  updateDesign,
  type Design,
  type DesignMaterial,
} from "@/constants/demo-designs";
import { formatMaterialDetail, useMaterials } from "@/constants/demo-materials";

export type DesignFormModalProps = {
  visible: boolean;
  onClose: () => void;
  // Si se pasa un diseño, el modal lo edita; si no, crea uno nuevo.
  design?: Design | null;
};

// Estilo de campo compartido: fondo claro (el modal es una tarjeta blanca),
// coloreado con azul oscuro oficial en baja opacidad (paleta de 8 colores).
const FIELD_PROPS = {
  inputClassName: "border-brand-background/20 bg-brand-background/[0.08]",
  inputStyle: { color: AppColors.background },
  placeholderColor: AppColors.backgroundMuted,
};

/**
 * Modal para crear o editar un diseño: nombre, descripción y los materiales
 * que usa (con su cantidad). Los materiales se agregan de a uno: se elige un
 * material ya registrado, se escribe la cantidad y "Agregar" lo suma a la
 * lista de abajo (cada uno se puede quitar antes de guardar). Mismo patrón
 * que MaterialFormModal/PackagingFormModal. Los datos se guardan en el
 * almacén temporal de src/constants/demo-designs.ts; ver el TODO ahí para la
 * conexión futura con Laravel.
 */
export function DesignFormModal({
  visible,
  onClose,
  design,
}: DesignFormModalProps) {
  const isEditing = Boolean(design);
  const materials = useMaterials();
  const currency = useCurrency();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [designMaterials, setDesignMaterials] = useState<DesignMaterial[]>([]);

  // Campos temporales del "agregar material": se limpian después de cada Agregar.
  const [pickerMaterialId, setPickerMaterialId] = useState<string | null>(null);
  const [pickerQuantity, setPickerQuantity] = useState("");

  // Cada vez que se abre el modal, precarga los datos del diseño (edición) o
  // limpia el formulario (creación).
  useEffect(() => {
    if (!visible) return;
    setName(design?.name ?? "");
    setDescription(design?.description ?? "");
    setDesignMaterials(design?.materials ?? []);
    setPickerMaterialId(null);
    setPickerQuantity("");
  }, [visible, design]);

  const materialOptions = materials.map((material) => ({
    id: material.id,
    label: material.name,
    sublabel: formatMaterialDetail(material, currency.symbol),
  }));

  // Agrega el material elegido a la lista del diseño; si ya estaba agregado,
  // actualiza su cantidad en vez de duplicarlo.
  const addMaterialToDesign = () => {
    if (!pickerMaterialId || !pickerQuantity.trim()) return;

    setDesignMaterials((list) => {
      const alreadyAdded = list.some(
        (item) => item.materialId === pickerMaterialId,
      );
      if (alreadyAdded) {
        return list.map((item) =>
          item.materialId === pickerMaterialId
            ? { ...item, quantity: pickerQuantity }
            : item,
        );
      }
      return [...list, { materialId: pickerMaterialId, quantity: pickerQuantity }];
    });
    setPickerMaterialId(null);
    setPickerQuantity("");
  };

  const removeMaterialFromDesign = (materialId: string) => {
    setDesignMaterials((list) =>
      list.filter((item) => item.materialId !== materialId),
    );
  };

  // TODO (backend Laravel): reemplazar esto por una llamada real usando el
  // cliente ya preparado en src/api/client.js, por ejemplo:
  //   import { createDesign } from "@/api/client";
  //   await createDesign({ ...datosQueDefinaLaravel });
  const save = () => {
    const payload = { name, description, materials: designMaterials };
    if (isEditing && design) {
      updateDesign(design.id, payload);
    } else {
      addDesign(payload);
    }
    onClose();
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
        <Pressable className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-md shadow-black/20">
          <Text className="mb-4 text-lg font-extrabold text-brand-background">
            {isEditing ? "Editar diseño" : "Nuevo diseño"}
          </Text>

          <ScrollView keyboardShouldPersistTaps="handled">
            <Text className="mb-1 font-bold text-brand-background">
              Nombre del diseño
            </Text>
            <TextField
              value={name}
              onChangeText={setName}
              placeholder="Ej. Aretes Mandala"
              className="mb-3"
              autoCorrect={false}
              {...FIELD_PROPS}
            />

            <Text className="mb-1 font-bold text-brand-background">
              Descripción
            </Text>
            <TextField
              value={description}
              onChangeText={setDescription}
              placeholder="Breve descripción del diseño"
              className="mb-3"
              autoCorrect={false}
              {...FIELD_PROPS}
            />

            <Text className="mb-1 font-bold text-brand-background">
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
                  {...FIELD_PROPS}
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
              <Text className="mb-3 text-xs text-brand-background/55">
                Aún no has agregado materiales a este diseño.
              </Text>
            ) : (
              <View className="mb-3 gap-2">
                {designMaterials.map((item) => {
                  const material = materials.find(
                    (m) => m.id === item.materialId,
                  );
                  return (
                    <View
                      key={item.materialId}
                      className="flex-row items-center justify-between rounded-[9px] border border-brand-background/20 bg-brand-background/[0.08] p-3"
                    >
                      <View className="flex-1">
                        <Text className="font-bold text-brand-background">
                          {material?.name ?? "Material eliminado"}
                        </Text>
                        <Text className="text-xs text-brand-background/55">
                          {item.quantity} {material?.unit ?? ""}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => removeMaterialFromDesign(item.materialId)}
                        hitSlop={8}
                      >
                        <Ionicons
                          name="close-circle"
                          size={20}
                          color={AppColors.background}
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
              <Text className="font-bold text-brand-background/55">Cancelar</Text>
            </Pressable>
            <Button
              label={isEditing ? "Guardar cambios" : "Crear"}
              onPress={save}
              className="px-6 py-3"
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
