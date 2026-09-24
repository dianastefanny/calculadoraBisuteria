import { useEffect, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";

import { Button } from "@/components/button";
import { FormError } from "@/components/form-error";
import { TextField, type TextFieldProps } from "@/components/text-field";
import {
  CANVAS_BG,
  INK_TEXT,
  MUTED_TEXT,
  useFieldTintProps,
} from "@/constants/app-theme";

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
 * onSave con todos los valores. Mismo estilo de modal blanco que ya usan
 * MaterialFormModal/PackagingFormModal/DesignFormModal.
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
            {title}
          </Text>

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

          <View className="mt-2 flex-row items-center justify-end gap-4">
            <Pressable onPress={onClose} hitSlop={8}>
              <Text className={`font-bold ${MUTED_TEXT}`}>
                Cancelar
              </Text>
            </Pressable>
            <Button label={saveLabel} onPress={save} className="px-6 py-3" />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
