import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

import {
  createCostType,
  createIndirectCost,
  fetchCostTypes,
  getErrorMessage,
  updateIndirectCost,
} from "@/api/client";
import { Button } from "@/components/button";
import {
  EditFieldModal,
  type EditFieldModalField,
} from "@/components/edit-field-modal";
import { FormError } from "@/components/form-error";
import { SelectField } from "@/components/select-field";
import { TextField } from "@/components/text-field";
import {
  CANVAS_BG,
  INK_TEXT,
  MUTED_TEXT,
  useFieldTintProps,
} from "@/constants/app-theme";

// Opción especial del selector de tipo de costo que abre el mini-formulario
// de "crear tipo nuevo" en vez de seleccionarla directamente.
const NEW_COST_TYPE_ID = "__new__";

// Forma del costo indirecto tal como lo devuelve client.js (mapIndirectCostFromApi).
export type ApiIndirectCost = {
  id: string;
  costTypeId: string;
  costTypeName: string;
  name: string;
  monthlyAmount: string;
};

export type IndirectCostFormModalProps = {
  visible: boolean;
  onClose: () => void;
  // Si se pasa un costo indirecto, el modal lo edita; si no, crea uno nuevo.
  indirectCost?: ApiIndirectCost | null;
  // Se llama después de crear/editar con éxito, para recargar la lista.
  onSaved: () => void;
};

/**
 * Modal para crear o editar un costo indirecto: tipo de costo, nombre y
 * valor mensual — conectado al backend real
 * (GET/POST/PUT /indirect-costs, GET/POST /cost-types). El usuario puede
 * crear sus propios tipos de costo al vuelo desde el mismo selector (no hay
 * tipos por defecto).
 */
export function IndirectCostFormModal({
  visible,
  onClose,
  indirectCost,
  onSaved,
}: IndirectCostFormModalProps) {
  const isEditing = Boolean(indirectCost);
  const fieldProps = useFieldTintProps();

  const [costTypes, setCostTypes] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [costTypeId, setCostTypeId] = useState("");
  const [name, setName] = useState("");
  const [monthlyAmount, setMonthlyAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Mini-formulario para crear un tipo de costo nuevo desde el mismo selector.
  const [creatingCostType, setCreatingCostType] = useState(false);
  const newCostTypeField: EditFieldModalField[] = [
    {
      key: "name",
      label: "Nombre del tipo de costo",
      value: "",
      placeholder: "Ej. Arriendo",
    },
  ];

  useEffect(() => {
    if (!visible) return;
    setError(null);
    setCostTypeId(indirectCost?.costTypeId ?? "");
    setName(indirectCost?.name ?? "");
    setMonthlyAmount(indirectCost?.monthlyAmount ?? "");

    fetchCostTypes()
      .then(setCostTypes)
      .catch((err) => setError(getErrorMessage(err)));
  }, [visible, indirectCost]);

  const costTypeOptions = [
    { id: NEW_COST_TYPE_ID, label: "+ Crear nuevo tipo de costo..." },
    ...costTypes.map((costType) => ({
      id: costType.id,
      label: costType.name,
    })),
  ];

  const handleSelectCostType = (id: string) => {
    if (id === NEW_COST_TYPE_ID) {
      setCreatingCostType(true);
      return;
    }
    setCostTypeId(id);
  };

  const saveCostType = async (values: Record<string, string>) => {
    try {
      const created = await createCostType({ name: values.name.trim() });
      setCostTypes((current) => [...current, created]);
      setCostTypeId(created.id);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const save = async () => {
    if (!costTypeId || !name.trim() || !monthlyAmount) {
      setError("Completa el tipo de costo, el nombre y el valor mensual.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const payload = { costTypeId, name: name.trim(), monthlyAmount };
      if (isEditing && indirectCost) {
        await updateIndirectCost(indirectCost.id, payload);
      } else {
        await createIndirectCost(payload);
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
            {isEditing ? "Editar costo indirecto" : "Nuevo costo indirecto"}
          </Text>

          <ScrollView keyboardShouldPersistTaps="handled">
            <FormError message={error} />

            <SelectField
              label="Tipo de costo"
              value={costTypeId || null}
              placeholder="Seleccionar tipo de costo..."
              options={costTypeOptions}
              onSelect={handleSelectCostType}
              className="mb-3"
            />

            <Text className={`mb-1 font-bold ${INK_TEXT}`}>Nombre</Text>
            <TextField
              value={name}
              onChangeText={setName}
              placeholder="Ej. Arriendo local"
              className="mb-3"
              autoCorrect={false}
              {...fieldProps}
            />

            <Text className={`mb-1 font-bold ${INK_TEXT}`}>
              Valor mensual
            </Text>
            <TextField
              value={monthlyAmount}
              onChangeText={setMonthlyAmount}
              keyboardType="numeric"
              placeholder="0"
              className="mb-3"
              {...fieldProps}
            />
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

      <EditFieldModal
        visible={creatingCostType}
        title="Nuevo tipo de costo"
        fields={newCostTypeField}
        validate={(v) => (!v.name.trim() ? "Ingresa un nombre." : null)}
        onSave={saveCostType}
        onClose={() => setCreatingCostType(false)}
      />
    </Modal>
  );
}
