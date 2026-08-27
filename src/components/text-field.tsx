import { useState } from "react";
import {
  Pressable,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

import { AppColors } from "@/constants/app-theme";

export type TextFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  className?: string;
  inputClassName?: string;
} & Omit<
  TextInputProps,
  "value" | "onChangeText" | "style" | "placeholderTextColor"
>;

export function TextField({
  label,
  value,
  onChangeText,
  error,
  placeholder,
  secureTextEntry = false,
  className = "",
  inputClassName = "",
  ...inputProps
}: TextFieldProps) {
  const [hidden, setHidden] = useState(secureTextEntry);
  const hasError = Boolean(error);

  return (
    <View className={`mb-4 ${className}`}>
      <Text className="mb-2 font-bold text-white">{label}</Text>
      <View className="relative justify-center">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={AppColors.placeholder}
          secureTextEntry={secureTextEntry && hidden}
          className={`rounded-[9px] border bg-brand-input p-[13px] pr-10 text-white ${
            hasError ? "border-brand-error" : "border-brand-input-border"
          } ${inputClassName}`}
          {...inputProps}
        />
        {secureTextEntry && (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            className="absolute right-3"
            hitSlop={8}
          >
            <Text className="text-white">{hidden ? "Mostrar" : "Ocultar"}</Text>
          </Pressable>
        )}
      </View>
      {hasError && <Text className="mt-1 text-brand-error">{error}</Text>}
    </View>
  );
}
