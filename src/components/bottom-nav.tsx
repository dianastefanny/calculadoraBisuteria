import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppColors } from "@/constants/app-theme";

export type TabKey =
  | "materiales"
  | "empaques"
  | "disenos"
  | "calculos"
  | "historial"
  | "configuraciones";

export type BottomNavProps = {
  active: TabKey;
};

type TabDef = {
  key: TabKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: `/${TabKey}`;
  // TODO (backend Laravel): "badge" es un valor de ejemplo (Historial);
  // reemplazar por el conteo real que devuelva el servidor.
  badge?: number;
};

const TABS: TabDef[] = [
  { key: "materiales", label: "Materiales", icon: "cube-outline", route: "/materiales" },
  { key: "empaques", label: "Empaques", icon: "gift-outline", route: "/empaques" },
  { key: "disenos", label: "Diseños", icon: "sparkles-outline", route: "/disenos" },
  { key: "calculos", label: "Cálculos", icon: "calculator-outline", route: "/calculos" },
  { key: "historial", label: "Historial", icon: "time-outline", route: "/historial", badge: 5 },
  { key: "configuraciones", label: "Configuraciones", icon: "settings-outline", route: "/configuraciones" },
];

/**
 * Barra de navegación inferior, compartida por las 6 pestañas posteriores al
 * inicio de sesión. Se usa con router.replace (no push) para no acumular
 * pantallas en el historial al cambiar de pestaña.
 */
export function BottomNav({ active }: BottomNavProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingBottom: insets.bottom || 10 }}
      className="flex-row rounded-t-3xl bg-white pt-2 shadow-md shadow-black/20"
    >
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Pressable
            key={tab.key}
            onPress={() => !isActive && router.replace(tab.route)}
            className="flex-1 items-center gap-1 py-1"
            hitSlop={4}
          >
            <View>
              <Ionicons
                name={tab.icon}
                size={22}
                color={isActive ? AppColors.background : AppColors.backgroundMuted}
              />
              {tab.badge != null && (
                <View className="absolute -right-2 -top-1 h-4 w-4 items-center justify-center rounded-full bg-brand-green">
                  <Text className="text-[9px] font-extrabold text-white">
                    {tab.badge}
                  </Text>
                </View>
              )}
            </View>
            <Text
              className={`text-[11px] ${
                isActive
                  ? "font-extrabold text-brand-background"
                  : "font-medium text-brand-background/55"
              }`}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
