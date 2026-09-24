import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppHeader } from "@/components/app-header";
import { BottomNav, type TabKey } from "@/components/bottom-nav";
import { CANVAS_BG } from "@/constants/app-theme";

export type TabScreenProps = {
  active: TabKey;
  children: ReactNode;
  scroll?: boolean;
};

/**
 * Estructura compartida por las 6 pantallas posteriores al inicio de sesión:
 * encabezado de marca (AppHeader), contenido propio de cada pantalla y la
 * barra de navegación inferior (BottomNav) con la pestaña activa resaltada.
 *
 * Ejemplo: <TabScreen active="materiales"><Text>Contenido</Text></TabScreen>
 */
export function TabScreen({ active, children, scroll = true }: TabScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className={`flex-1 ${CANVAS_BG}`}>
      {/* El fondo claro de AppHeader se extiende también detrás de la barra
          de estado (hora, wifi, batería) para que no quede una franja azul
          oscura separada arriba del encabezado. */}
      <View style={{ paddingTop: insets.top }} className="bg-brand-input">
        <AppHeader />
      </View>
      {scroll ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="px-7 pb-6"
        >
          {children}
        </ScrollView>
      ) : (
        <View className="flex-1 px-7">{children}</View>
      )}
      <BottomNav active={active} />
    </View>
  );
}
