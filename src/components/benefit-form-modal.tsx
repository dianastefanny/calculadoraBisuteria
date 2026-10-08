import { useEffect, useState } from "react";
import { Text } from "react-native";

import {
  createBenefit,
  createBenefitType,
  fetchBenefitTypes,
  getErrorMessage,
  updateBenefit,
} from "@/api/client";
import {
  EditFieldModal,
  type EditFieldModalField,
} from "@/components/edit-field-modal";
import { FormError } from "@/components/form-error";
import { FormModal } from "@/components/form-modal";
import { SelectField } from "@/components/select-field";
import { TextField } from "@/components/text-field";
import { INK_TEXT, useFieldTintProps } from "@/constants/app-theme";
import { parseNumberInput } from "@/constants/number-input";

// Opción especial del selector de tipo de prestación que abre el
// mini-formulario de "crear tipo nuevo" en vez de seleccionarla directamente.
const NEW_BENEFIT_TYPE_ID = "__new__";

// Forma de la prestación tal como la devuelve client.js (mapBenefitFromApi).
export type ApiBenefit = {
  id: string;
  benefitTypeId: string;
  benefitTypeName: string;
  name: string;
  percentage: string;
};

export type BenefitFormModalProps = {
  visible: boolean;
  onClose: () => void;
  // Si se pasa una prestación, el modal la edita; si no, crea una nueva.
  benefit?: ApiBenefit | null;
  // Se llama después de crear/editar con éxito, para recargar la lista.
  onSaved: () => void;
};

/**
 * Modal para crear o editar una prestación legal: tipo de prestación,
 * nombre y porcentaje — conectado al backend real
 * (GET/POST/PUT /benefits, GET/POST /benefit-types). El usuario puede
 * crear sus propios tipos de prestación al vuelo desde el mismo selector,
 * igual que con los costos indirectos.
 */
export function BenefitFormModal({
  visible,
  onClose,
  benefit,
  onSaved,
}: BenefitFormModalProps) {
  const isEditing = Boolean(benefit);
  const fieldProps = useFieldTintProps();

  const [benefitTypes, setBenefitTypes] = useState<
    { id: string; name: string }[]
  >([]);
  const [benefitTypeId, setBenefitTypeId] = useState("");
  const [name, setName] = useState("");
  const [percentage, setPercentage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Mini-formulario para crear un tipo de prestación nuevo desde el mismo selector.
  const [creatingBenefitType, setCreatingBenefitType] = useState(false);
  const newBenefitTypeField: EditFieldModalField[] = [
    {
      key: "name",
      label: "Nombre del tipo de prestación",
      value: "",
      placeholder: "Ej. ARL",
    },
  ];

  useEffect(() => {
    if (!visible) return;
    setError(null);
    setBenefitTypeId(benefit?.benefitTypeId ?? "");
    setName(benefit?.name ?? "");
    setPercentage(benefit?.percentage ?? "");

    fetchBenefitTypes()
      .then(setBenefitTypes)
      .catch((err) => setError(getErrorMessage(err)));
  }, [visible, benefit]);

  const benefitTypeOptions = [
    { id: NEW_BENEFIT_TYPE_ID, label: "+ Crear nuevo tipo de prestación..." },
    ...benefitTypes.map((benefitType) => ({
      id: benefitType.id,
      label: benefitType.name,
    })),
  ];

  const handleSelectBenefitType = (id: string) => {
    if (id === NEW_BENEFIT_TYPE_ID) {
      setCreatingBenefitType(true);
      return;
    }
    setBenefitTypeId(id);
  };

  const saveBenefitType = async (values: Record<string, string>) => {
    try {
      const created = await createBenefitType({ name: values.name.trim() });
      setBenefitTypes((current) => [...current, created]);
      setBenefitTypeId(created.id);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const save = async () => {
    if (!benefitTypeId || !name.trim() || !percentage) {
      setError("Completa el tipo de prestación, el nombre y el porcentaje.");
      return;
    }

    const value = parseNumberInput(percentage);
    if (value === null || value > 100) {
      setError("Ingresa un porcentaje válido entre 0 y 100.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const payload = { benefitTypeId, name: name.trim(), percentage };
      if (isEditing && benefit) {
        await updateBenefit(benefit.id, payload);
      } else {
        await createBenefit(payload);
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
      title={isEditing ? "Editar prestación" : "Nueva prestación"}
      submitLabel={isEditing ? "Guardar cambios" : "Crear"}
      onSubmit={save}
      submitting={submitting}
      after={
        <EditFieldModal
          visible={creatingBenefitType}
          title="Nuevo tipo de prestación"
          fields={newBenefitTypeField}
          validate={(v) => (!v.name.trim() ? "Ingresa un nombre." : null)}
          onSave={saveBenefitType}
          onClose={() => setCreatingBenefitType(false)}
        />
      }
    >
      <FormError message={error} />

      <SelectField
        label="Tipo de prestación"
        value={benefitTypeId || null}
        placeholder="Seleccionar tipo de prestación..."
        options={benefitTypeOptions}
        onSelect={handleSelectBenefitType}
        className="mb-3"
      />

      <Text className={`mb-1 font-bold ${INK_TEXT}`}>Nombre</Text>
      <TextField
        value={name}
        onChangeText={setName}
        placeholder="Ej. ARL"
        className="mb-3"
        autoCorrect={false}
        {...fieldProps}
      />

      <Text className={`mb-1 font-bold ${INK_TEXT}`}>
        Porcentaje (%)
      </Text>
      <TextField
        value={percentage}
        onChangeText={setPercentage}
        keyboardType="numeric"
        placeholder="0"
        className="mb-3"
        {...fieldProps}
      />
    </FormModal>
  );
}
