import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import {
  Pressable,
  Text,
  TextInput,
  View,
  type TextStyle,
  type TextInputProps,
} from "react-native";

import { useCompactField } from "@/components/field-density";
import { INK_TEXT, useThemeColors } from "@/constants/app-theme";

export type TextFieldProps = {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  className?: string;
  inputClassName?: string;
  placeholderColor?: string;
  // Color de texto explícito (style, no className): algunos dispositivos no
  // aplican de forma confiable un "text-*" de inputClassName por encima del
  // "text-white" por defecto, dejando el texto invisible al escribir.
  inputStyle?: TextStyle;
  // Versión compacta (menos alto). Si no se indica, es compacta solo dentro
  // de un FormModal (ver field-density.ts).
  compact?: boolean;
} & Omit<
  TextInputProps,
  "value" | "onChangeText" | "style" | "placeholderTextColor"
>;

/**
 * Campo de texto reutilizable para todos los formularios de la app (correo,
 * contraseña, nombre, etc.). Incluye:
 * - Una etiqueta arriba (label) y, si algo está mal, un mensaje de error rojo abajo.
 * - Un ícono opcional a la izquierda (por ejemplo, un sobre para el correo).
 * - Si es un campo de contraseña (secureTextEntry), agrega automáticamente
 *   un ojito a la derecha para mostrar/ocultar lo que se escribió.
 *
 * Ejemplo: <TextField label="Correo" value={email} onChangeText={setEmail} icon="mail-outline" />
 */
export function TextField({
  label,
  value,
  onChangeText,
  error,
  placeholder,
  secureTextEntry = false,
  icon,
  className = "",
  inputClassName = "",
  placeholderColor,
  inputStyle,
  compact: compactProp,
  ...inputProps
}: TextFieldProps) {
  const compact = useCompactField(compactProp);
  // Mientras "hidden" sea true, la contraseña se ve como puntos; el ojito la cambia.
  const [hidden, setHidden] = useState(secureTextEntry);
  const hasError = Boolean(error);
  const theme = useThemeColors();

  return (
    <View className={`mb-4 ${className}`}>
      {label && <Text className={`mb-2 font-bold ${INK_TEXT}`}>{label}</Text>}
      <View className="relative justify-center">
        {icon && (
          <View className="absolute left-3 z-10">
            <Ionicons name={icon} size={18} color={theme.mutedInk} />
          </View>
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor ?? theme.mutedInk}
          secureTextEntry={secureTextEntry && hidden}
          style={inputStyle ?? { color: theme.ink }}
          className={`rounded-[9px] border bg-brand-input ${compact ? "px-3 py-2" : "p-[13px]"} ${
            icon ? "pl-10" : ""
          } ${secureTextEntry ? "pr-10" : ""} ${
            hasError ? "border-brand-error" : "border-brand-input-border"
          } ${inputClassName}`}
          {...inputProps}
        />
        {secureTextEntry && (
          // Botón del ojito: alterna entre mostrar y ocultar la contraseña escrita.
          <Pressable
            onPress={() => setHidden((h) => !h)}
            className="absolute right-3"
            hitSlop={8}
          >
            <Ionicons
              name={hidden ? "eye-outline" : "eye-off-outline"}
              size={18}
              color={theme.mutedInk}
            />
          </Pressable>
        )}
      </View>
      {hasError && <Text className="mt-1 text-brand-error">{error}</Text>}
    </View>
  );
}
