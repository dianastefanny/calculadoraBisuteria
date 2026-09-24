import Ionicons from "@expo/vector-icons/Ionicons";
import { useState, type ReactNode } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

import {
  CANVAS_BG,
  FIELD_TINT_BG,
  FIELD_TINT_BORDER,
  INK_TEXT,
  MUTED_TEXT,
  useThemeColors,
} from "@/constants/app-theme";

export type SelectFieldOption = {
  id: string;
  label: string;
  sublabel?: string;
};

export type SelectFieldProps = {
  label?: string;
  value: string | null;
  placeholder: string;
  options: SelectFieldOption[];
  onSelect: (id: string) => void;
  className?: string;
  // Reemplaza el recuadro por defecto por un disparador propio (por ejemplo,
  // el botón degradado de Button); recibe "open" para abrir el mismo modal
  // de opciones que usa el recuadro por defecto.
  trigger?: (open: () => void) => ReactNode;
};

/**
 * Campo de "seleccionar de una lista": al tocarlo se abre una ventana
 * pequeña (Modal) con las opciones; al elegir una, se cierra sola. Se usa en
 * vez de desplegar la lista dentro del mismo formulario (eso lo estiraba).
 *
 * Ejemplo: <SelectField label="Categoría" value={categoryId} placeholder="Seleccionar..." options={[{id:"1", label:"Piedras"}]} onSelect={setCategoryId} />
 */
export function SelectField({
  label,
  value,
  placeholder,
  options,
  onSelect,
  className = "",
  trigger,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.id === value);
  const theme = useThemeColors();

  return (
    <View className={className}>
      {trigger ? (
        trigger(() => setOpen(true))
      ) : (
        <>
          {label && <Text className={`mb-1 font-bold ${INK_TEXT}`}>{label}</Text>}
          <Pressable
            onPress={() => setOpen(true)}
            className={`flex-row items-center justify-between rounded-[9px] border p-[13px] ${FIELD_TINT_BORDER} ${FIELD_TINT_BG}`}
          >
            <Text
              className={selected ? INK_TEXT : MUTED_TEXT}
              numberOfLines={1}
            >
              {selected ? selected.label : placeholder}
            </Text>
            <Ionicons name="chevron-down" size={16} color={theme.mutedInk} />
          </Pressable>
        </>
      )}

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          onPress={() => setOpen(false)}
          className="flex-1 items-center justify-center bg-black/50 p-6"
        >
          <Pressable
            className={`w-full max-w-xs rounded-2xl p-4 shadow-md shadow-black/20 ${CANVAS_BG}`}
          >
            {label && (
              <Text className={`mb-3 text-center font-extrabold ${INK_TEXT}`}>
                {label}
              </Text>
            )}
            <ScrollView style={{ maxHeight: 320 }}>
              {options.map((option) => (
                <Pressable
                  key={option.id}
                  onPress={() => {
                    onSelect(option.id);
                    setOpen(false);
                  }}
                  className={`rounded-[9px] p-3 ${
                    option.id === value ? "bg-brand-input" : ""
                  }`}
                >
                  <Text className={`font-bold ${INK_TEXT}`}>
                    {option.label}
                  </Text>
                  {option.sublabel && (
                    <Text className={`text-sm ${MUTED_TEXT}`}>
                      {option.sublabel}
                    </Text>
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
