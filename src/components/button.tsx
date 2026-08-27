import { LinearGradient } from "expo-linear-gradient";
import { cssInterop } from "nativewind";
import {
  ActivityIndicator,
  Pressable,
  Text,
  type PressableProps,
} from "react-native";

import { AppColors } from "@/constants/app-theme";

// LinearGradient es un componente de terceros; NativeWind no le añade soporte
// de `className` automáticamente como sí hace con View/Text/Pressable.
cssInterop(LinearGradient, { className: "style" });

export type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  loading?: boolean;
  disabled?: boolean;
  className?: string;
} & Omit<PressableProps, "onPress" | "style" | "children" | "disabled">;

export function Button({
  label,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  className = "",
  ...pressableProps
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const content = loading ? (
    <ActivityIndicator color="#fff" />
  ) : (
    <Text className="text-center font-extrabold text-white">{label}</Text>
  );

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
        className="p-4"
      >
        {content}
      </LinearGradient>
    </Pressable>
  );
}
