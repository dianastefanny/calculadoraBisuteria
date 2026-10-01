import { Text } from "react-native";

import { Card } from "@/components/card";
import { MUTED_TEXT } from "@/constants/app-theme";

export type EmptyStateProps = {
  message: string;
  className?: string;
};

/**
 * Tarjeta con un mensaje gris centrado para cuando una lista no tiene nada
 * que mostrar — ya sea porque el usuario no ha creado nada todavía, o
 * porque una búsqueda no encontró resultados. Se usa en Materiales,
 * Empaques, Diseños e Historial.
 */
export function EmptyState({ message, className = "mb-3" }: EmptyStateProps) {
  return (
    <Card className={className}>
      <Text className={`text-center ${MUTED_TEXT}`}>{message}</Text>
    </Card>
  );
}
