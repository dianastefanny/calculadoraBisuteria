import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, View } from "react-native";

import { AppColors } from "@/constants/app-theme";

export type FormErrorProps = {
  message?: string | null;
  variant?: "error" | "success";
  className?: string;
};

// Cada variante define su propio ícono y color, para no repetir esa lógica
// dentro del componente cada vez que se dibuja.
const VARIANT = {
  error: { icon: "warning" as const, color: "#F97316" },
  success: { icon: "checkmark-circle" as const, color: AppColors.green },
};

/**
 * Tarjeta blanca que muestra un aviso al usuario dentro de un formulario
 * (por ejemplo, "correo o contraseña incorrectos" o "cuenta creada con éxito").
 * Reemplaza a las alertas del sistema operativo (que no funcionan en la
 * versión web de la app) y se usa igual en login, registro y recuperar
 * contraseña.
 *
 * Si "message" está vacío no muestra nada (return null), así que se puede
 * dejar siempre en la pantalla y solo aparece cuando hay algo que avisar.
 */
export function FormError({
  message,
  variant = "error",
  className = "",
}: FormErrorProps) {
  if (!message) return null;

  const { icon, color } = VARIANT[variant];

  return (
    <View
      className={`mb-4 flex-row items-center gap-3 rounded-xl bg-white p-3 shadow-md shadow-black/20 ${className}`}
    >
      <Ionicons name={icon} size={22} color={color} />
      <Text className="flex-1 text-gray-700">{message}</Text>
    </View>
  );
}
