import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

import { Button } from "@/components/button";
import { TextField } from "@/components/text-field";
import { AppColors } from "@/constants/app-theme";
import {
  addPackaging,
  updatePackaging,
  type Packaging,
} from "@/constants/demo-packaging";

export type PackagingFormModalProps = {
  visible: boolean;
  onClose: () => void;
  // Si se pasa un empaque, el modal lo edita; si no, crea uno nuevo.
  packaging?: Packaging | null;
};

// Estilo de campo compartido: fondo claro (el modal es una tarjeta blanca),
// coloreado con azul oscuro oficial en baja opacidad (paleta de 8 colores).
// inputStyle (no solo className) porque en algunos celulares el texto
// quedaba invisible: la clase de color de inputClassName no siempre
// sobrescribe el "text-white" por defecto del campo.
const FIELD_PROPS = {
  inputClassName: "border-brand-background/20 bg-brand-background/[0.08]",
  inputStyle: { color: AppColors.background },
  placeholderColor: AppColors.backgroundMuted,
};

/**
 * Modal para crear o editar un empaque: nombre, descripción, valor unitario
 * y cantidad disponible. Mismo patrón que MaterialFormModal (un solo modal
 * para crear y editar, sin pantalla aparte).  Los datos se guardan en el
 * almacén temporal de src/constants/demo-packaging.ts; ver el TODO ahí para
 * la conexión futura con Laravel.
 */
export function PackagingFormModal({
  visible,
  onClose,
  packaging,
}: PackagingFormModalProps) {
  const isEditing = Boolean(packaging);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [stock, setStock] = useState("");

  // Cada vez que se abre el modal, precarga los datos del empaque (edición)
  // o limpia el formulario (creación).
  useEffect(() => {
    if (!visible) return;
    setName(packaging?.name ?? "");
    setDescription(packaging?.description ?? "");
    setUnitCost(packaging?.unitCost ?? "");
    setStock(packaging?.stock ?? "");
  }, [visible, packaging]);

  // TODO (backend Laravel): reemplazar esto por una llamada real usando el
  // cliente ya preparado en src/api/client.js, por ejemplo:
  //   import { createPackaging } from "@/api/client";
  //   await createPackaging({ ...datosQueDefinaLaravel });
  // Falta también validar que el valor y la cantidad no sean negativos.
  const save = () => {
    const payload = { name, description, unitCost, stock };
    if (isEditing && packaging) {
      updatePackaging(packaging.id, payload);
    } else {
      addPackaging(payload);
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
            {isEditing ? "Editar empaque" : "Nuevo empaque"}
          </Text>

          <ScrollView keyboardShouldPersistTaps="handled">
            <Text className="mb-1 font-bold text-brand-background">
              Nombre del empaque
            </Text>
            <TextField
              value={name}
              onChangeText={setName}
              placeholder="Ej. Tulita"
              className="mb-3"
              autoCorrect={false}
              {...FIELD_PROPS}
            />

            <Text className="mb-1 font-bold text-brand-background">
              Descripción del empaque
            </Text>
            <TextField
              value={description}
              onChangeText={setDescription}
              placeholder="Breve descripción del empaque"
              className="mb-3"
              autoCorrect={false}
              {...FIELD_PROPS}
            />

            <View className="flex-row gap-3">
              <View style={{ flex: 1 }}>
                <Text className="mb-1 font-bold text-brand-background">
                  Valor unitario
                </Text>
                <TextField
                  value={unitCost}
                  onChangeText={setUnitCost}
                  keyboardType="numeric"
                  placeholder="0"
                  className="mb-3"
                  {...FIELD_PROPS}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text className="mb-1 font-bold text-brand-background">
                  Cantidad disponible
                </Text>
                <TextField
                  value={stock}
                  onChangeText={setStock}
                  keyboardType="numeric"
                  placeholder="0"
                  className="mb-3"
                  {...FIELD_PROPS}
                />
              </View>
            </View>
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
