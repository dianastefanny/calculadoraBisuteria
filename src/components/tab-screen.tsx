import { useState, type ReactNode } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppHeader } from "@/components/app-header";
import { BottomNav, type TabKey } from "@/components/bottom-nav";
import { AppColors, CANVAS_BG } from "@/constants/app-theme";

export type TabScreenProps = {
  active: TabKey;
  children: ReactNode;
  scroll?: boolean;
  // Si se pasa, al deslizar la pantalla hacia abajo desde arriba aparece la
  // ruedita de carga y se llama a esta función ("deslizar para actualizar").
  onRefresh?: () => Promise<void> | void;
};

/**
 * Estructura compartida por las 6 pantallas posteriores al inicio de sesión:
 * encabezado de marca (AppHeader), contenido propio de cada pantalla y la
 * barra de navegación inferior (BottomNav) con la pestaña activa resaltada.
 *
 * Ejemplo: <TabScreen active="materiales"><Text>Contenido</Text></TabScreen>
 */
export function TabScreen({
  active,
  children,
  scroll = true,
  onRefresh,
}: TabScreenProps) {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

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
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[AppColors.turquoise, AppColors.green]}
                tintColor={AppColors.turquoise}
              />
            ) : undefined
          }
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
