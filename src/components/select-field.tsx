import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

import { AppColors } from "@/constants/app-theme";

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
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.id === value);

  return (
    <View className={className}>
      {label && <Text className="mb-1 font-bold text-brand-background">{label}</Text>}
      <Pressable
        onPress={() => setOpen(true)}
        className="flex-row items-center justify-between rounded-[9px] border border-brand-background/20 bg-brand-background/[0.08] p-[13px]"
      >
        <Text
          className={selected ? "text-brand-background" : "text-brand-background/55"}
          numberOfLines={1}
        >
          {selected ? selected.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={16} color={AppColors.backgroundMuted} />
      </Pressable>

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
          <Pressable className="w-full max-w-xs rounded-2xl bg-white p-4 shadow-md shadow-black/20">
            {label && (
              <Text className="mb-3 text-center font-extrabold text-brand-background">
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
                  <Text className="font-bold text-brand-background">
                    {option.label}
                  </Text>
                  {option.sublabel && (
                    <Text className="text-xs text-brand-background/55">
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
