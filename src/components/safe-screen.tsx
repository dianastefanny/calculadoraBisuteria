import { cssInterop } from "nativewind";
import type { ReactNode } from "react";
import { ScrollView } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

import { CANVAS_BG } from "@/constants/app-theme";

// SafeAreaView de react-native-safe-area-context es un componente de terceros;
// NativeWind no le añade soporte de `className` automáticamente (a diferencia
// del SafeAreaView deprecado de react-native core).
cssInterop(SafeAreaView, { className: "style" });

export type SafeScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  edges?: Edge[];
  className?: string;
  contentContainerClassName?: string;
};

/**
 * Envoltorio que debe usar TODA pantalla nueva de la app. Se encarga de:
 * 1) Pintar el fondo azul de la marca y dejar el espacio correcto para que
 *    el contenido no quede tapado por la barra de estado, el notch del
 *    celular ni los botones de navegación del sistema.
 * 2) Opcionalmente (con scroll={true}) permitir que la pantalla se pueda
 *    desplazar hacia abajo cuando el contenido no cabe completo, como los
 *    formularios largos de registro.
 *
 * Ejemplo de uso: <SafeScreen><Text>Contenido de la pantalla</Text></SafeScreen>
 */
export function SafeScreen({
  children,
  scroll = false,
  edges = ["top", "bottom"],
  className = "",
  contentContainerClassName = "",
}: SafeScreenProps) {
  if (scroll) {
    return (
      <SafeAreaView edges={edges} className={`flex-1 ${CANVAS_BG} ${className}`}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerClassName={`px-7 pb-8 pt-6 ${contentContainerClassName}`}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={edges}
      className={`flex-1 ${CANVAS_BG} px-7 pb-8 pt-6 ${className}`}
    >
      {children}
    </SafeAreaView>
  );
}
