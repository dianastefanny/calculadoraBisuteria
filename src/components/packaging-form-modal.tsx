import { useEffect, useState } from "react";
import { Text, View } from "react-native";

import {
  createPackaging,
  getErrorMessage,
  updatePackaging,
} from "@/api/client";
import { FormError } from "@/components/form-error";
import { FormModal } from "@/components/form-modal";
import { TextField } from "@/components/text-field";
import { INK_TEXT, useFieldTintProps } from "@/constants/app-theme";
import { parseNumberInput } from "@/constants/number-input";

// Forma del empaque tal como lo devuelve src/api/client.js (mapPackagingFromApi).
export type ApiPackaging = {
  id: string;
  name: string;
  unitCost: string;
  stock: string;
};

export type PackagingFormModalProps = {
  visible: boolean;
  onClose: () => void;
  // Si se pasa un empaque, el modal lo edita; si no, crea uno nuevo.
  packaging?: ApiPackaging | null;
  // Se llama después de crear/editar con éxito, para recargar la lista.
  onSaved: () => void;
};

/**
 * Modal para crear o editar un empaque: nombre, valor unitario y cantidad
 * disponible — conectado al backend real (GET/POST/PUT /packagings).
 * Mismo patrón que MaterialFormModal (un solo modal para crear y editar,
 * sin pantalla aparte).
 */
export function PackagingFormModal({
  visible,
  onClose,
  packaging,
  onSaved,
}: PackagingFormModalProps) {
  const isEditing = Boolean(packaging);
  const fieldProps = useFieldTintProps();

  const [name, setName] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [stock, setStock] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Cada vez que se abre el modal, precarga los datos del empaque (edición)
  // o limpia el formulario (creación).
  useEffect(() => {
    if (!visible) return;
    setError(null);
    setName(packaging?.name ?? "");
    setUnitCost(packaging?.unitCost ?? "");
    setStock(packaging?.stock ?? "");
  }, [visible, packaging]);

  const save = async () => {
    if (!name.trim() || !unitCost) {
      setError("Completa el nombre y el valor unitario.");
      return;
    }
    if (parseNumberInput(unitCost) === null) {
      setError("El valor unitario no es un número válido.");
      return;
    }
    if (stock.trim() && parseNumberInput(stock) === null) {
      setError("La cantidad disponible no es un número válido.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const payload = { name: name.trim(), unitCost, stock };
      if (isEditing && packaging) {
        await updatePackaging(packaging.id, payload);
      } else {
        await createPackaging(payload);
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
    <FormModal
      visible={visible}
      onClose={onClose}
      title={isEditing ? "Editar empaque" : "Nuevo empaque"}
      submitLabel={isEditing ? "Guardar cambios" : "Crear"}
      onSubmit={save}
      submitting={submitting}
    >
      <FormError message={error} />

      <Text className={`mb-1 font-bold ${INK_TEXT}`}>
        Nombre del empaque
      </Text>
      <TextField
        value={name}
        onChangeText={setName}
        placeholder="Ej. Tulita"
        className="mb-3"
        autoCorrect={false}
        {...fieldProps}
      />

      <View className="flex-row gap-3">
        <View style={{ flex: 1 }}>
          <Text className={`mb-1 font-bold ${INK_TEXT}`}>
            Valor unitario
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
            Cantidad disponible
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
    </FormModal>
  );
}
