import { LinearGradient } from "expo-linear-gradient";
import { forwardRef, useCallback, useEffect, useRef } from "react";
import { Image, Text, View } from "react-native";

import { AppColors } from "@/constants/app-theme";

// Máximo que se espera a que cargue la foto antes de capturar la tarjeta: si
// el internet está lento, se comparte igual (sin foto) en vez de quedarse
// colgado.
const IMAGE_WAIT_TIMEOUT_MS = 5000;

/**
 * La tarjeta se captura como imagen, así que la foto del diseño (que viene
 * del servidor) tiene que estar cargada antes de la captura; si no, saldría
 * un hueco vacío. La tarjeta avisa con onImageSettled cuando la foto terminó
 * de cargar (o falló), y la pantalla que comparte llama a
 * waitForImage(url) antes de captureRef.
 */
export function useQuoteImageReady() {
  const settledUrlRef = useRef<string | null>(null);
  const waitersRef = useRef<(() => void)[]>([]);

  // La tarjeta lo llama al montarse o al cambiar de foto: aunque sea la
  // misma URL de antes (ej. compartir dos veces la misma entrada del
  // historial), es una imagen nueva que todavía no se ha pintado.
  const onImagePending = useCallback(() => {
    settledUrlRef.current = null;
  }, []);

  const onImageSettled = useCallback((url: string) => {
    settledUrlRef.current = url;
    waitersRef.current.splice(0).forEach((resolve) => resolve());
  }, []);

  const waitForImage = useCallback((url: string | null | undefined) => {
    if (!url || settledUrlRef.current === url) return Promise.resolve();
    return new Promise<void>((resolve) => {
      const timer = setTimeout(resolve, IMAGE_WAIT_TIMEOUT_MS);
      waitersRef.current.push(() => {
        clearTimeout(timer);
        // Un instante extra para que la foto ya cargada alcance a pintarse.
        setTimeout(resolve, 100);
      });
    });
  }, []);

  return { onImagePending, onImageSettled, waitForImage };
}

export type QuoteShareCardProps = {
  pieceName: string;
  // Foto del diseño (opcional); si no hay, la tarjeta se ve como antes.
  imageUrl?: string | null;
  onImagePending?: () => void;
  onImageSettled?: (url: string) => void;
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
 * historial.tsx. Muestra la foto del diseño (si tiene), el nombre de la
 * pieza, los materiales usados (solo el nombre, nunca su costo individual)
 * y el precio de venta sugerido —
 * nunca el costo interno ni el desglose de costos, mismo criterio que el
 * resto de la app: lo que se comparte es lo que se le cobraría al cliente,
 * no cuánto cuesta producirlo.
 */
export const QuoteShareCard = forwardRef<View, QuoteShareCardProps>(
  function QuoteShareCard(
    {
      pieceName,
      imageUrl,
      onImagePending,
      onImageSettled,
      materialNames,
      salePrice,
      currencySymbol,
      calculatedAt,
      validUntil,
    },
    ref,
  ) {
    // Los efectos del hijo corren antes que los de la pantalla, así que esto
    // ya se marcó como pendiente cuando la pantalla llama a waitForImage.
    useEffect(() => {
      if (imageUrl) onImagePending?.();
    }, [imageUrl, onImagePending]);

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
            {/* Image de react-native (no expo-image), igual que el logo:
                es la que react-native-view-shot captura sin problemas.
                - fadeDuration={0}: en Android la foto aparece con un fundido
                  de 300 ms; si se captura a mitad del fundido sale
                  semitransparente sobre el degradado (opaca y verdosa).
                - resizeMethod="scale": evita que Android la decodifique en
                  menor resolución para ahorrar memoria (se veía borrosa).
                - 160 px centrada y no a todo el ancho, para que la tarjeta
                  no quede casi del alto de la pantalla. */}
            {!!imageUrl && (
              <Image
                source={{ uri: imageUrl }}
                style={{
                  width: 160,
                  height: 160,
                  alignSelf: "center",
                  borderRadius: 14,
                  marginBottom: 16,
                }}
                resizeMode="cover"
                resizeMethod="scale"
                fadeDuration={0}
                onLoad={() => onImageSettled?.(imageUrl)}
                onError={() => onImageSettled?.(imageUrl)}
              />
            )}
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
