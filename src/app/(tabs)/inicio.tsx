import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { fetchStatistics, getErrorMessage } from "@/api/client";
import { type TabKey } from "@/components/bottom-nav";
import { Card } from "@/components/card";
import { FormError } from "@/components/form-error";
import { TabScreen } from "@/components/tab-screen";
import { AppColors, INK_TEXT, MUTED_TEXT, useThemeColors } from "@/constants/app-theme";

type Statistics = {
  totalMaterials: number;
  totalMaterialCategories: number;
  totalDesigns: number;
  totalPackagings: number;
  totalIndirectCosts: number;
  totalBenefits: number;
  totalCalculations: number;
  lastCalculationAt: string | null;
};

function formatLastCalculation(value: string | null) {
  if (!value) return "Aún no has calculado ninguna pieza.";
  return `Último cálculo: ${new Date(value).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })}`;
}

/**
 * Pestaña Inicio: primera pantalla después de iniciar sesión. Muestra un
 * resumen de cuántos materiales, empaques, diseños y cálculos tiene el
 * usuario, conectado al backend real (GET /statistics/summary). Cada
 * tarjeta es tocable y lleva directo a la pantalla correspondiente —
 * reemplaza los numeritos que antes aparecían junto al título de
 * Materiales/Empaques/Diseños/Historial.
 */
export default function Inicio() {
  const theme = useThemeColors();
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // "loading" arranca en true, así que solo la primera carga muestra
  // "Cargando..."; al deslizar para actualizar se recarga en silencio (ya
  // se ve la ruedita) sin que las tarjetas parpadeen.
  const loadStatistics = useCallback(async () => {
    try {
      setStats(await fetchStatistics());
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  const statCard = (
    icon: keyof typeof Ionicons.glyphMap,
    label: string,
    value: number,
    route: `/${TabKey}`,
  ) => (
    <Pressable onPress={() => router.navigate(route)} className="flex-1">
      <Card className="items-center py-5">
        <Ionicons name={icon} size={24} color={AppColors.green} />
        <Text className={`mt-2 text-2xl font-extrabold ${INK_TEXT}`}>
          {value}
        </Text>
        <Text className={`text-center text-sm ${MUTED_TEXT}`}>{label}</Text>
      </Card>
    </Pressable>
  );

  const settingsRow = (
    icon: keyof typeof Ionicons.glyphMap,
    label: string,
    value: number,
    isFirst: boolean,
  ) => (
    <Pressable
      onPress={() => router.navigate("/configuraciones")}
      className={`flex-row items-center justify-between py-3 ${
        isFirst ? "" : "border-t border-brand-input-border"
      }`}
    >
      <View className="flex-1 flex-row items-center gap-3">
        <Ionicons name={icon} size={20} color={AppColors.green} />
        <Text className={`font-bold ${INK_TEXT}`}>{label}</Text>
      </View>
      <View className="flex-row items-center gap-2">
        <Text className={`font-extrabold ${INK_TEXT}`}>{value}</Text>
        <Ionicons name="chevron-forward" size={18} color={theme.mutedInk} />
      </View>
    </Pressable>
  );

  return (
    <TabScreen active="inicio" onRefresh={loadStatistics}>
      <View className="mb-6 flex-row items-center gap-2">
        <Ionicons name="home-outline" size={26} color={AppColors.green} />
        <View className="flex-1">
          <Text className={`text-xl font-extrabold ${INK_TEXT}`}>Inicio</Text>
          <Text className="text-brand-green">
            Resumen de tu negocio en Cuenta Cuentas
          </Text>
        </View>
      </View>

      <FormError message={error} />

      {loading ? (
        <Text className={`mb-3 text-center ${MUTED_TEXT}`}>
          Cargando resumen...
        </Text>
      ) : (
        stats && (
          <>
            <View className="mb-3 flex-row gap-3">
              {statCard("cube-outline", "Materiales", stats.totalMaterials, "/materiales")}
              {statCard("gift-outline", "Empaques", stats.totalPackagings, "/empaques")}
            </View>
            <View className="mb-6 flex-row gap-3">
              {statCard("sparkles-outline", "Diseños", stats.totalDesigns, "/disenos")}
              {statCard("time-outline", "Cálculos realizados", stats.totalCalculations, "/historial")}
            </View>

            <Card className="mb-6">
              <Text className={`mb-2 text-[17px] font-extrabold ${INK_TEXT}`}>
                Costos y prestaciones
              </Text>
              {settingsRow("cash-outline", "Costos indirectos", stats.totalIndirectCosts, true)}
              {settingsRow("shield-checkmark-outline", "Prestaciones legales", stats.totalBenefits, false)}
            </Card>

            <Text className={`text-center text-sm ${MUTED_TEXT}`}>
              {formatLastCalculation(stats.lastCalculationAt)}
            </Text>
          </>
        )
      )}
    </TabScreen>
  );
}
