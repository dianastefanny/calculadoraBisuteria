import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

import { Button } from "@/components/button";
import { SelectField } from "@/components/select-field";
import { TextField } from "@/components/text-field";
import { AppColors } from "@/constants/app-theme";
import { DEMO_CATEGORIES } from "@/constants/demo-categories";
import {
  addMaterial,
  MATERIAL_UNITS,
  updateMaterial,
  type Material,
} from "@/constants/demo-materials";

export type MaterialFormModalProps = {
  visible: boolean;
  onClose: () => void;
  // Si se pasa un material, el modal edita ese material; si no, crea uno nuevo.
  material?: Material | null;
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

const CATEGORY_OPTIONS = DEMO_CATEGORIES.map((category) => ({
  id: category.id,
  label: category.name,
  sublabel: category.description,
}));

const UNIT_OPTIONS = MATERIAL_UNITS.map((unit) => ({ id: unit, label: unit }));

/**
 * Modal para crear o editar un material: categoría, descripción, nombre,
 * unidad de medida, costo unitario y stock/cantidad — los mismos campos que
 * las tablas reales "materiales" y "categoria_material" de la base de datos
 * (el campo "estado" de "materiales" no va aquí porque el sistema lo calcula
 * solo según el stock, ver getMaterialStatus en demo-materials.ts).
 * Reemplaza a la antigua pantalla material-form.tsx (ya no existe, para no
 * tener dos formularios distintos cumpliendo la misma función). Los datos se
 * guardan en el almacén temporal de src/constants/demo-materials.ts; ver el
 * TODO ahí para la conexión futura con Laravel.
 */
export function MaterialFormModal({
  visible,
  onClose,
  material,
}: MaterialFormModalProps) {
  const isEditing = Boolean(material);

  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [stock, setStock] = useState("");

  // Cada vez que se abre el modal, precarga los datos del material (edición)
  // o limpia el formulario (creación).
  useEffect(() => {
    if (!visible) return;
    setCategory(material?.category ?? "");
    setDescription(material?.description ?? "");
    setName(material?.name ?? "");
    setUnit(material?.unit ?? "");
    setUnitCost(material?.unitCost ?? "");
    setStock(material?.stock ?? "");
  }, [visible, material]);

  // TODO (backend Laravel): reemplazar esto por una llamada real usando el
  // cliente ya preparado en src/api/client.js, por ejemplo:
  //   import { createMaterial } from "@/api/client";
  //   await createMaterial({ ...datosQueDefinaLaravel });
  // Falta también validar que el costo y el stock no sean negativos.
  const save = () => {
    const payload = { category, description, name, unit, unitCost, stock };
    if (isEditing && material) {
      updateMaterial(material.id, payload);
    } else {
      addMaterial(payload);
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
            {isEditing ? "Editar material" : "Nuevo material"}
          </Text>

          <ScrollView keyboardShouldPersistTaps="handled">
            <SelectField
              label="Categoría"
              value={category || null}
              placeholder="Seleccionar categoría..."
              options={CATEGORY_OPTIONS}
              onSelect={setCategory}
              className="mb-3"
            />

            <Text className="mb-1 font-bold text-brand-background">Descripción</Text>
            <TextField
              value={description}
              onChangeText={setDescription}
              placeholder="Breve descripción del material"
              className="mb-3"
              autoCorrect={false}
              {...FIELD_PROPS}
            />

            <Text className="mb-1 font-bold text-brand-background">
              Nombre del material
            </Text>
            <TextField
              value={name}
              onChangeText={setName}
              placeholder="Ej. Mostacilla plateada 4 mm"
              className="mb-3"
              autoCorrect={false}
              {...FIELD_PROPS}
            />

            <SelectField
              label="Unidad de medida"
              value={unit || null}
              placeholder="Seleccionar unidad..."
              options={UNIT_OPTIONS}
              onSelect={setUnit}
              className="mb-3"
            />

            <View className="flex-row gap-3">
              <View style={{ flex: 1 }}>
                <Text className="mb-1 font-bold text-brand-background">
                  Costo unitario
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
                  Stock / Cantidad
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
