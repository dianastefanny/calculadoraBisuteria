import { Text } from "react-native";

import { MUTED_TEXT } from "@/constants/app-theme";

export type LinkTextProps = {
  label: string;
  actionLabel: string;
  onPress: () => void;
  className?: string;
};

/**
 * Frase con un enlace al final, como "¿No tienes cuenta? Regístrate".
 * "label" es el texto normal y "actionLabel" es la parte que se puede tocar
 * (se ve resaltada y ejecuta onPress al presionarla).
 */
export function LinkText({
  label,
  actionLabel,
  onPress,
  className = "",
}: LinkTextProps) {
  return (
    <Text className={`text-center ${MUTED_TEXT} ${className}`}>
      {label}{" "}
      <Text
        onPress={onPress}
        className="font-bold text-brand-turquoise underline"
      >
        {actionLabel}
      </Text>
    </Text>
  );
}
