import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppColors } from "@/constants/app-theme";

export type TabKey = "cotizar" | "insumos" | "empaques" | "historial" | "perfil";

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
  { key: "cotizar", label: "Cotizar", icon: "calculator-outline", route: "/cotizar" },
  { key: "insumos", label: "Insumos", icon: "cube-outline", route: "/insumos" },
  { key: "empaques", label: "Empaques", icon: "gift-outline", route: "/empaques" },
  { key: "historial", label: "Historial", icon: "time-outline", route: "/historial", badge: 5 },
  { key: "perfil", label: "Perfil", icon: "person-outline", route: "/perfil" },
];

/**
 * Barra de navegación inferior, compartida por las 5 pestañas posteriores al
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
                color={isActive ? AppColors.background : "#9CA3AF"}
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
                  : "font-medium text-gray-400"
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
