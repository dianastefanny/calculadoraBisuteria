import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

import {
  createMaterial,
  fetchCategories,
  getErrorMessage,
  MATERIAL_UNIT_OPTIONS,
  updateMaterial,
} from "@/api/client";
import { Button } from "@/components/button";
import { FormError } from "@/components/form-error";
import { SelectField } from "@/components/select-field";
import { TextField } from "@/components/text-field";
import {
  CANVAS_BG,
  INK_TEXT,
  MUTED_TEXT,
  useFieldTintProps,
} from "@/constants/app-theme";

// Forma del material tal como lo devuelve src/api/client.js (mapMaterialFromApi).
export type ApiMaterial = {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  unit: string;
  unitCost: string;
  stock: string;
};

export type MaterialFormModalProps = {
  visible: boolean;
  onClose: () => void;
  // Si se pasa un material, el modal edita ese material; si no, crea uno nuevo.
  material?: ApiMaterial | null;
  // Se llama después de crear/editar con éxito, para que la pantalla
  // recargue la lista de materiales desde el backend.
  onSaved: () => void;
};

const UNIT_OPTIONS = MATERIAL_UNIT_OPTIONS.map((option) => ({
  id: option.value,
  label: option.label,
}));

/**
 * Modal para crear o editar un material: categoría, nombre, unidad de
 * medida, costo unitario y stock/cantidad — conectado al backend real
 * (GET/POST/PUT /materials, GET /material-categories).
 * Un solo modal para crear y editar (sin material = crear, con material =
 * editar), sin pantalla aparte para cada caso.
 */
export function MaterialFormModal({
  visible,
  onClose,
  material,
  onSaved,
}: MaterialFormModalProps) {
  const isEditing = Boolean(material);
  const fieldProps = useFieldTintProps();

  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [stock, setStock] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Cada vez que se abre el modal, carga las categorías del usuario y
  // precarga los datos del material (edición) o limpia el formulario (creación).
  useEffect(() => {
    if (!visible) return;
    setError(null);
    setCategoryId(material?.categoryId ?? "");
    setName(material?.name ?? "");
    setUnit(material?.unit ?? "");
    setUnitCost(material?.unitCost ?? "");
    setStock(material?.stock ?? "");

    fetchCategories()
      .then(setCategories)
      .catch((err) => setError(getErrorMessage(err)));
  }, [visible, material]);

  const categoryOptions = categories.map((category) => ({
    id: category.id,
    label: category.name,
  }));

  const save = async () => {
    if (!categoryId || !name.trim() || !unit || !unitCost) {
      setError("Completa categoría, nombre, unidad y costo unitario.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const payload = { categoryId, name: name.trim(), unit, unitCost, stock };
      if (isEditing && material) {
        await updateMaterial(material.id, payload);
      } else {
        await createMaterial(payload);
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
            {isEditing ? "Editar material" : "Nuevo material"}
          </Text>

          <ScrollView keyboardShouldPersistTaps="handled">
            <FormError message={error} />

            <SelectField
              label="Categoría"
              value={categoryId || null}
              placeholder="Seleccionar categoría..."
              options={categoryOptions}
              onSelect={setCategoryId}
              className="mb-3"
            />

            <Text className={`mb-1 font-bold ${INK_TEXT}`}>
              Nombre del material
            </Text>
            <TextField
              value={name}
              onChangeText={setName}
              placeholder="Ej. Mostacilla plateada 4 mm"
              className="mb-3"
              autoCorrect={false}
              {...fieldProps}
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
                <Text className={`mb-1 font-bold ${INK_TEXT}`}>
                  Costo unitario
                </Text>
                <TextField
                  value={unitCost}
                  onChangeText={setUnitCost}
                  keyboardType="numeric"
                  placeholder="0"
                  className="mb-3"
                  {...fieldProps}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text className={`mb-1 font-bold ${INK_TEXT}`}>
                  Stock / Cantidad
                </Text>
                <TextField
                  value={stock}
                  onChangeText={setStock}
                  keyboardType="numeric"
                  placeholder="0"
                  className="mb-3"
                  {...fieldProps}
                />
              </View>
            </View>
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
