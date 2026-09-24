import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { INK_TEXT, MUTED_TEXT, useThemeColors } from "@/constants/app-theme";

// Fondo de la barra: blanco en modo claro (ya resalta con la sombra); en
// modo oscuro usa el mismo tinte turquesa que AppHeader (bg-brand-input),
// para que no se pierda contra el azul de fondo de la pantalla.
const NAV_BG = "bg-white dark:bg-brand-input";

export type TabKey =
  | "inicio"
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
};

const TABS: TabDef[] = [
  { key: "materiales", label: "Materiales", icon: "cube-outline", route: "/materiales" },
  { key: "empaques", label: "Empaques", icon: "gift-outline", route: "/empaques" },
  { key: "disenos", label: "Diseños", icon: "sparkles-outline", route: "/disenos" },
  { key: "inicio", label: "Inicio", icon: "home-outline", route: "/inicio" },
  { key: "calculos", label: "Cálculos", icon: "calculator-outline", route: "/calculos" },
  { key: "historial", label: "Historial", icon: "time-outline", route: "/historial" },
  { key: "configuraciones", label: "Configuraciones", icon: "settings-outline", route: "/configuraciones" },
];

/**
 * Barra de navegación inferior, compartida por las 6 pestañas posteriores al
 * inicio de sesión (dibujada por cada pantalla vía TabScreen; la barra
 * nativa del <Tabs> de (tabs)/_layout.tsx queda oculta). Usa
 * router.navigate para cambiar de pestaña — a diferencia de router.replace,
 * no destruye la pantalla de destino: dentro de un navegador de pestañas,
 * cada una queda montada una sola vez y solo se le cambia la visibilidad.
 */
export function BottomNav({ active }: BottomNavProps) {
  const insets = useSafeAreaInsets();
  const theme = useThemeColors();

  return (
    <View
      style={{ paddingBottom: insets.bottom || 10 }}
      className={`flex-row rounded-t-3xl pt-2 shadow-md shadow-black/20 ${NAV_BG}`}
    >
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Pressable
            key={tab.key}
            onPress={() => !isActive && router.navigate(tab.route)}
            className="flex-1 items-center gap-1 py-1"
            hitSlop={4}
          >
            <Ionicons
              name={tab.icon}
              size={22}
              color={isActive ? theme.ink : theme.mutedInk}
            />
            <Text
              className={`text-[11px] ${
                isActive ? `font-extrabold ${INK_TEXT}` : `font-medium ${MUTED_TEXT}`
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
