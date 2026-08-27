import { Text, View } from "react-native";

export type FormErrorProps = {
  message?: string | null;
  variant?: "error" | "success";
  className?: string;
};

const VARIANT = {
  error: { icon: "⚠", iconClassName: "text-orange-500" },
  success: { icon: "✓", iconClassName: "text-brand-green" },
} as const;

/** Banner de mensajes de formulario (error/éxito): tarjeta blanca con ícono, reutilizable en cualquier pantalla. */
export function FormError({
  message,
  variant = "error",
  className = "",
}: FormErrorProps) {
  if (!message) return null;

  const { icon, iconClassName } = VARIANT[variant];

  return (
    <View
      className={`mb-4 flex-row items-center gap-3 rounded-xl bg-white p-3 shadow-md shadow-black/20 ${className}`}
    >
      <Text className={`text-lg font-bold ${iconClassName}`}>{icon}</Text>
      <Text className="flex-1 text-gray-700">{message}</Text>
    </View>
  );
}
