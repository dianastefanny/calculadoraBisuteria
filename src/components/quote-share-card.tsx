import { LinearGradient } from "expo-linear-gradient";
import { forwardRef } from "react";
import { Image, Text, View } from "react-native";

import { AppColors } from "@/constants/app-theme";

export type QuoteShareCardProps = {
  pieceName: string;
  // Solo los nombres de los materiales — nunca su costo individual.
  materialNames?: string[];
  // Precio de venta sugerido (costo total ya repartido con el margen de
  // ganancia), ya formateado con separador de miles (ver formatAmount en
  // currency-store.ts) — este componente no sabe qué moneda está activa.
  salePrice: string;
  currencySymbol: string;
  // Fecha y hora en que se calculó esta pieza (created_at del backend), y la
  // fecha hasta la que sigue siendo válida (valid_until = fecha de cálculo +
  // 5 días, el mismo dato que ya usa Historial para marcar
  // "Vigente"/"Vencida"). Ambas ya formateadas por la pantalla que use este
  // componente, y no cambian sin importar cuándo o cuántas veces se comparta.
  calculatedAt: string;
  validUntil: string;
};

/**
 * Tarjeta con el estilo de la marca (degradado turquesa → verde, logo),
 * pensada para renderizarse fuera de pantalla y capturarse como imagen con
 * react-native-view-shot al compartir una cotización desde calculos.tsx o
 * historial.tsx. Muestra el nombre de la pieza, los materiales usados (solo
 * el nombre, nunca su costo individual) y el precio de venta sugerido —
 * nunca el costo interno ni el desglose de costos, mismo criterio que el
 * resto de la app: lo que se comparte es lo que se le cobraría al cliente,
 * no cuánto cuesta producirlo.
 */
export const QuoteShareCard = forwardRef<View, QuoteShareCardProps>(
  function QuoteShareCard(
    { pieceName, materialNames, salePrice, currencySymbol, calculatedAt, validUntil },
    ref,
  ) {
    return (
      <View ref={ref} collapsable={false} style={{ width: 360 }}>
        <LinearGradient
          colors={[AppColors.turquoise, AppColors.green]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ padding: 28, borderRadius: 28 }}
        >
          <View style={{ alignItems: "center", marginBottom: 20 }}>
            <Image
              source={require("@/assets/images/logo-cc.png")}
              style={{ width: 72, height: 72 }}
              resizeMode="contain"
            />
            <Text
              style={{
                color: AppColors.white,
                fontWeight: "800",
                fontSize: 12,
                letterSpacing: 1.5,
                marginTop: 6,
              }}
            >
              CUENTA CUENTAS
            </Text>
          </View>

          <View
            style={{
              backgroundColor: "rgba(255,255,255,0.16)",
              borderRadius: 20,
              padding: 20,
            }}
          >
            <Text style={{ color: AppColors.white, fontSize: 13, opacity: 0.85 }}>
              Cotización
            </Text>
            <Text
              style={{
                color: AppColors.white,
                fontSize: 22,
                fontWeight: "800",
                marginTop: 2,
              }}
            >
              {pieceName}
            </Text>

            {materialNames && materialNames.length > 0 && (
              <View style={{ marginTop: 6 }}>
                {materialNames.map((name, index) => (
                  <Text
                    key={`${name}-${index}`}
                    style={{
                      color: AppColors.white,
                      fontSize: 13,
                      opacity: 0.9,
                    }}
                  >
                    • {name}
                  </Text>
                ))}
              </View>
            )}

            <Text
              style={{
                color: AppColors.white,
                fontSize: 12,
                opacity: 0.85,
                marginTop: 20,
              }}
            >
              Precio de venta
            </Text>
            <Text style={{ color: AppColors.white, fontSize: 34, fontWeight: "800" }}>
              {currencySymbol}
              {salePrice}
            </Text>

            <Text
              style={{
                color: AppColors.white,
                fontSize: 11,
                opacity: 0.75,
                marginTop: 16,
              }}
            >
              Calculado el {calculatedAt}
            </Text>
            <Text style={{ color: AppColors.white, fontSize: 11, opacity: 0.75 }}>
              Válida hasta el {validUntil}
            </Text>
          </View>
        </LinearGradient>
      </View>
    );
  },
);
