import { cssInterop } from "nativewind";
import type { ReactNode } from "react";
import { ScrollView } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

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

export function SafeScreen({
  children,
  scroll = false,
  edges = ["top", "bottom"],
  className = "",
  contentContainerClassName = "",
}: SafeScreenProps) {
  if (scroll) {
    return (
      <SafeAreaView edges={edges} className={`flex-1 bg-brand-background ${className}`}>
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
      className={`flex-1 bg-brand-background px-7 pb-8 pt-6 ${className}`}
    >
      {children}
    </SafeAreaView>
  );
}
