import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { cssInterop } from "nativewind";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  type PressableProps,
} from "react-native";

import { AppColors } from "@/constants/app-theme";

// LinearGradient es un componente de terceros; NativeWind no le añade soporte
// de `className` automáticamente como sí hace con View/Text/Pressable.
cssInterop(LinearGradient, { className: "style" });

export type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "light";
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
} & Omit<PressableProps, "onPress" | "style" | "children" | "disabled">;

/**
 * Botón principal reutilizable de la app, con tres estilos:
 * - "primary" (por defecto): degradado turquesa a verde, para la acción
 *   principal de la pantalla (ej. "Iniciar sesión", "Crear cuenta").
 * - "secondary": verde sólido, para acciones secundarias.
 * - "light": fondo blanco con texto azul oscuro e ícono verde, para botones
 *   sobre fondos claros (ej. tarjetas ya aclaradas dentro del cotizador).
 *
 * También soporta:
 * - icon: muestra un ícono a la izquierda del texto (ej. un candado).
 * - loading: muestra una ruedita girando en vez del texto, útil mientras
 *   se espera la respuesta de una petición al servidor.
 * - disabled: apaga el botón (más transparente) para que no se pueda tocar.
 */
export function Button({
  label,
  onPress,
  variant = "primary",
  icon,
  loading = false,
  disabled = false,
  className = "",
  ...pressableProps
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const isLight = variant === "light";
  const content = loading ? (
    <ActivityIndicator color={isLight ? AppColors.background : AppColors.white} />
  ) : (
    <View className="flex-row items-center justify-center gap-2">
      {icon && (
        <Ionicons
          name={icon}
          size={18}
          color={isLight ? AppColors.green : AppColors.white}
        />
      )}
      <Text
        className={`text-center font-extrabold ${isLight ? "text-brand-background" : "text-white"}`}
      >
        {label}
      </Text>
    </View>
  );

  if (isLight) {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        className={`rounded-2xl bg-white p-4 ${isDisabled ? "opacity-60" : ""} ${className}`}
        {...pressableProps}
      >
        {content}
      </Pressable>
    );
  }

  if (variant === "secondary") {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        className={`rounded-[9px] bg-brand-green p-4 ${isDisabled ? "opacity-60" : ""} ${className}`}
        {...pressableProps}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`overflow-hidden rounded-[9px] ${isDisabled ? "opacity-60" : ""} ${className}`}
      {...pressableProps}
    >
      <LinearGradient
        colors={[AppColors.turquoise, AppColors.green]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="rounded-[9px] p-4"
      >
        {content}
      </LinearGradient>
    </Pressable>
  );
}
