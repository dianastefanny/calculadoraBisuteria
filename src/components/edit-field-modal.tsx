import { useEffect, useState } from "react";
import { Text, View } from "react-native";

import { FormError } from "@/components/form-error";
import { FormModal } from "@/components/form-modal";
import { TextField, type TextFieldProps } from "@/components/text-field";
import { MUTED_TEXT, useFieldTintProps } from "@/constants/app-theme";

export type EditFieldModalField = Pick<
  TextFieldProps,
  "icon" | "keyboardType" | "autoCapitalize" | "secureTextEntry"
> & {
  key: string;
  // Opcional: se omite cuando el título del modal ya deja claro qué campo es
  // (evita repetir casi el mismo texto dos veces seguidas).
  label?: string;
  value: string;
  placeholder?: string;
  // Texto de ayuda debajo de este campo en particular (ej. los requisitos
  // de la nueva contraseña).
  helperText?: string;
};

export type EditFieldModalProps = {
  visible: boolean;
  title: string;
  fields: EditFieldModalField[];
  saveLabel?: string;
  // Devuelve un mensaje de error, o null si los valores son válidos.
  validate?: (values: Record<string, string>) => string | null;
  onSave: (values: Record<string, string>) => void;
  onClose: () => void;
};

/**
 * Modal para editar uno o varios campos relacionados a la vez (por ejemplo,
 * nombre + apellido juntos, o contraseña actual + nueva + confirmar): se
 * abre con los valores actuales, valida al guardar y solo entonces llama a
 * onSave con todos los valores. Usa FormModal, igual que todos los
 * formularios de la app.
 */
export function EditFieldModal({
  visible,
  title,
  fields,
  saveLabel = "Guardar",
  validate,
  onSave,
  onClose,
}: EditFieldModalProps) {
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const fieldProps = useFieldTintProps();

  // Cada vez que se abre el modal, precarga los valores actuales de sus
  // campos. No depende de "fields" (cambia de referencia en cada render)
  // para no borrar lo que el usuario va escribiendo mientras está abierto.
  useEffect(() => {
    if (!visible) return;
    const initial: Record<string, string> = {};
    fields.forEach((field) => {
      initial[field.key] = field.value;
    });
    setDraft(initial);
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const save = () => {
    const validationError = validate?.(draft) ?? null;
    if (validationError) {
      setError(validationError);
      return;
    }
    onSave(draft);
    onClose();
  };

  return (
    <FormModal
      visible={visible}
      onClose={onClose}
      title={title}
      submitLabel={saveLabel}
      onSubmit={save}
    >
      <FormError message={error} />

      {fields.map((field) => (
        <View key={field.key}>
          <TextField
            label={field.label}
            value={draft[field.key] ?? ""}
            onChangeText={(text) =>
              setDraft((current) => ({ ...current, [field.key]: text }))
            }
            placeholder={field.placeholder}
            icon={field.icon}
            keyboardType={field.keyboardType}
            autoCapitalize={field.autoCapitalize}
            secureTextEntry={field.secureTextEntry}
            autoCorrect={false}
            {...fieldProps}
          />
          {field.helperText && (
            <Text className={`-mt-3 mb-4 text-sm ${MUTED_TEXT}`}>
              {field.helperText}
            </Text>
          )}
        </View>
      ))}
    </FormModal>
  );
}
