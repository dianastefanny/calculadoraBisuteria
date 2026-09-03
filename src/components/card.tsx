import type { ReactNode } from "react";
import { View } from "react-native";

export type CardProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Tarjeta con fondo y bordes redondeados, usada para envolver contenido
 * dentro de las pantallas (por ejemplo, cada opción del menú principal o
 * cada material del inventario). Solo da el "marco" visual; lo que se
 * muestra adentro lo decide quien la usa (children).
 */
export function Card({ children, className = "" }: CardProps) {
  return (
    <View
      className={`rounded-2xl border border-brand-input-border bg-brand-input p-[18px] ${className}`}
    >
      {children}
    </View>
  );
}
