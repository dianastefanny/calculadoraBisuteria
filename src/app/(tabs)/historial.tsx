import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect } from "expo-router";
import * as Sharing from "expo-sharing";
import { useCallback, useEffect, useRef, useState } from "react";
import { Platform, Pressable, Share, Text, View } from "react-native";
import { captureRef } from "react-native-view-shot";

import {
  deleteHistoryEntry as deleteHistoryEntryApi,
  fetchHistory,
  getErrorMessage,
  markCalculationSold,
} from "@/api/client";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { FormError } from "@/components/form-error";
import { QuoteShareCard } from "@/components/quote-share-card";
import { TabScreen } from "@/components/tab-screen";
import { AppColors, INK_TEXT, MUTED_TEXT, useThemeColors } from "@/constants/app-theme";
import { formatAmount, useCurrency } from "@/constants/currency-store";

export type HistoryEntry = {
  id: string;
  pieceName: string;
  materialNames: string[];
  materialsCost: number;
  packagingCost: number;
  laborCost: number;
  indirectCostsTotal: number;
  legalBenefitsCost: number;
  totalCost: number;
  profitMargin: number;
  salePrice: number;
  // Cuántas piezas se cotizaron de una vez (pedidos grandes).
  quantity: number;
  // Descuento aplicado sobre el precio de venta, si se usó (null si no).
  discountPercentage: number | null;
  // Precio final ya con el descuento aplicado (igual a salePrice si no hubo descuento).
  finalPrice: number;
  // true si ya se confirmó la venta de esta pieza — en ese momento se
  // descontó el stock de materiales y empaque, y no se puede volver a
  // marcar como vendida ni descontar dos veces.
  isSold: boolean;
  // Fecha hasta la que la cotización es válida (5 días desde que se
  // calculó). El registro en sí sigue en el historial hasta los 30 días,
  // el backend lo borra solo después de eso.
  validUntil: string;
  // Fecha y hora exactas en que se hizo el cálculo (created_at del backend).
  createdAt: string;
};

// Compara solo el día de calendario (no la hora exacta): valid_until viene
// del backend como una fecha pura en UTC (ej. "2026-09-28T00:00:00Z"), así
// que se compara su parte de fecha (los primeros 10 caracteres, "2026-09-28")
// contra el día de hoy en la zona horaria del dispositivo. Comparar
// timestamps completos hacía que la cotización pasara a "Vencida" varias
// horas antes de medianoche en zonas horarias detrás de UTC (como Colombia).
function isQuoteExpired(validUntil: string) {
  const validDateOnly = validUntil.slice(0, 10);
  const now = new Date();
  const todayLocalDateOnly = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  return todayLocalDateOnly > validDateOnly;
}

function formatCalculatedAt(createdAt: string) {
  return new Date(createdAt).toLocaleString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatValidUntil(value: string) {
  // timeZone: "UTC" evita que un dispositivo detrás de UTC (como Colombia)
  // muestre esta fecha como el día anterior (ver isQuoteExpired arriba).
  return new Date(value).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Pestaña Historial: cálculos de piezas ya realizados, conectada al backend
 * real (GET/DELETE /calculations — cada cálculo ya trae el diseño, los
 * materiales usados y el desglose completo de costos). Cada tarjeta muestra
 * el nombre, si la cotización sigue vigente (5 días) y el mismo desglose
 * que aparece justo al calcular en Cálculos. El backend borra
 * automáticamente los registros con más de 30 días.
 *
 * "Compartir" solo comparte el nombre, los materiales usados (sin su costo
 * individual) y el costo total — nunca el margen ni el desglose interno de
 * costos. "Eliminar" pide confirmación con ConfirmDialog, mismo patrón que
 * Materiales/Empaques/Diseños.
 */
export default function Historial() {
  const currency = useCurrency();
  const theme = useThemeColors();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  // Ids de las tarjetas con el desglose de costos abierto — colapsado por
  // defecto para no ocupar tanto espacio en la lista.
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<HistoryEntry | null>(
    null,
  );
  const [markingSoldEntry, setMarkingSoldEntry] =
    useState<HistoryEntry | null>(null);
  // Entrada que se está compartiendo ahora mismo: se renderiza oculta en
  // QuoteShareCard (más abajo) para poder capturarla como imagen.
  const [sharingEntry, setSharingEntry] = useState<HistoryEntry | null>(null);
  const shareCardRef = useRef<View>(null);
  // Solo la primera carga muestra "Cargando historial...". Las siguientes
  // (cada vez que se vuelve a esta pestaña, ver useFocusEffect abajo) se
  // actualizan en silencio: la lista vieja se queda visible hasta que llega
  // la nueva, sin parpadeo.
  const hasLoadedOnce = useRef(false);

  const loadHistory = useCallback(async () => {
    if (!hasLoadedOnce.current) setLoading(true);
    try {
      setHistory(await fetchHistory());
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      hasLoadedOnce.current = true;
      setLoading(false);
    }
  }, []);

  // useFocusEffect (no useEffect) porque las 7 pestañas quedan montadas en
  // memoria (Tabs de Expo Router): un useEffect normal solo se dispara la
  // primera vez que abres Historial, y ya no vuelve a llamarse aunque
  // hagas un cálculo nuevo y regreses aquí. Con useFocusEffect, se vuelve
  // a cargar cada vez que esta pestaña recibe el foco.
  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory]),
  );

  const confirmDelete = async () => {
    if (deletingEntry) {
      try {
        await deleteHistoryEntryApi(deletingEntry.id);
        await loadHistory();
      } catch (err) {
        setError(getErrorMessage(err));
      }
    }
    setDeletingEntry(null);
  };

  const confirmMarkSold = async () => {
    if (markingSoldEntry) {
      try {
        await markCalculationSold(markingSoldEntry.id);
        await loadHistory();
      } catch (err) {
        setError(getErrorMessage(err));
      }
    }
    setMarkingSoldEntry(null);
  };

  const toggleExpanded = (id: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // En Web, comparte texto plano directo dentro del propio onPress: la Web
  // Share API exige que Share.share se llame de forma síncrona dentro del
  // gesto del usuario, y pasar por sharingEntry + useEffect (para esperar a
  // que QuoteShareCard se renderice) ya rompe eso. En iOS/Android sí vale la
  // pena esperar: pone la entrada en sharingEntry para que el useEffect de
  // abajo la capture como imagen una vez renderizada.
  const buildShareText = (entry: HistoryEntry) => {
    const materialsLine =
      entry.materialNames.length > 0
        ? `\nMateriales: ${entry.materialNames.join(", ")}`
        : "";
    return `${entry.pieceName} — Precio de venta: ${currency.symbol}${formatAmount(entry.finalPrice, currency.code)}${materialsLine}`;
  };

  const shareEntry = (entry: HistoryEntry) => {
    if (Platform.OS === "web") {
      Share.share({ message: buildShareText(entry) });
      return;
    }
    setSharingEntry(entry);
  };

  useEffect(() => {
    if (!sharingEntry) return;

    const shareText = buildShareText(sharingEntry);

    (async () => {
      try {
        const canShareImage =
          (await Sharing.isAvailableAsync()) && shareCardRef.current;
        if (canShareImage) {
          const uri = await captureRef(shareCardRef, {
            format: "png",
            quality: 1,
          });
          await Sharing.shareAsync(uri, {
            mimeType: "image/png",
            dialogTitle: "Compartir cotización",
          });
          return;
        }
      } catch {
        // Si falla la captura/compartir como imagen, sigue con el texto plano.
      } finally {
        setSharingEntry(null);
      }
      Share.share({ message: shareText });
    })();
  }, [sharingEntry, currency.symbol]);

  return (
    <TabScreen active="historial">
      <View className="mb-6 flex-row items-center gap-2">
        <Ionicons name="time-outline" size={26} color={AppColors.green} />
        <View className="flex-1">
          <Text className={`text-xl font-extrabold ${INK_TEXT}`}>
            Historial
          </Text>
          <Text className="text-brand-green">
            Piezas que has cotizado anteriormente
          </Text>
        </View>
      </View>

      <FormError message={error} />

      {loading && (
        <Text className={`mb-3 text-center ${MUTED_TEXT}`}>Cargando historial...</Text>
      )}

      {!loading && history.length === 0 && !error && (
        <Card className="mb-3">
          <Text className={`text-center ${MUTED_TEXT}`}>
            Aún no has cotizado ninguna pieza.
          </Text>
        </Card>
      )}

      {history.map((entry) => {
        const expired = isQuoteExpired(entry.validUntil);
        return (
        <Card key={entry.id} className="mb-3">
          <View className="flex-row items-start justify-between gap-2">
            <Text className={`flex-1 text-[17px] font-extrabold ${INK_TEXT}`}>
              {entry.pieceName}
            </Text>
            <View
              className={`rounded-full px-2 py-1 ${
                expired ? "bg-brand-error" : "bg-brand-green"
              }`}
            >
              <Text className="text-[10px] font-extrabold text-white">
                {expired ? "Vencida" : "Vigente"}
              </Text>
            </View>
            <Pressable
              onPress={() => shareEntry(entry)}
              hitSlop={8}
              className="ml-1"
            >
              <Ionicons
                name="share-social-outline"
                size={16}
                color={theme.mutedInk}
              />
            </Pressable>
            <Pressable
              onPress={() => setDeletingEntry(entry)}
              hitSlop={8}
              className="ml-2"
            >
              <Ionicons name="trash" size={16} color={theme.mutedInk} />
            </Pressable>
          </View>
          <Text className={`text-xs ${MUTED_TEXT}`}>
            Calculado el {formatCalculatedAt(entry.createdAt)}
          </Text>
          {entry.materialNames.length > 0 && (
            <Text className={`mt-1 text-sm ${MUTED_TEXT}`}>
              {entry.materialNames.join(", ")}
            </Text>
          )}

          <Text className="mt-2 text-lg font-extrabold text-brand-turquoise">
            Precio de venta: {currency.symbol}
            {formatAmount(entry.finalPrice, currency.code)}
          </Text>

          <Pressable
            onPress={() => toggleExpanded(entry.id)}
            className="mt-1 flex-row items-center gap-1 self-start"
            hitSlop={4}
          >
            <Text className="text-sm font-bold text-brand-turquoise">
              {expandedIds.has(entry.id)
                ? "Ocultar desglose"
                : "Ver desglose de costos"}
            </Text>
            <Ionicons
              name={
                expandedIds.has(entry.id) ? "chevron-up" : "chevron-down"
              }
              size={14}
              color={AppColors.turquoise}
            />
          </Pressable>

          {expandedIds.has(entry.id) && (
            <View className="mt-2 gap-0.5">
              {entry.quantity > 1 && (
                <Text className={INK_TEXT}>
                  Cantidad de piezas: {entry.quantity}
                </Text>
              )}
              <Text className={INK_TEXT}>
                Costo de materiales: {currency.symbol}
                {formatAmount(entry.materialsCost, currency.code)}
              </Text>
              <Text className={INK_TEXT}>
                Costo del empaque: {currency.symbol}
                {formatAmount(entry.packagingCost, currency.code)}
              </Text>
              <Text className={INK_TEXT}>
                Costo de mano de obra: {currency.symbol}
                {formatAmount(entry.laborCost, currency.code)}
              </Text>
              <Text className={INK_TEXT}>
                Costos indirectos: {currency.symbol}
                {formatAmount(entry.indirectCostsTotal, currency.code)}
              </Text>
              <Text className={INK_TEXT}>
                Prestaciones legales: {currency.symbol}
                {formatAmount(entry.legalBenefitsCost, currency.code)}
              </Text>
              <Text className="font-extrabold text-brand-turquoise">
                Costo total: {currency.symbol}
                {formatAmount(entry.totalCost, currency.code)}
              </Text>
              <Text className="font-extrabold text-brand-green">
                Margen de ganancia: {entry.profitMargin}%
              </Text>
              {entry.discountPercentage != null && (
                <Text className={INK_TEXT}>
                  Precio de venta sin descuento: {currency.symbol}
                  {formatAmount(entry.salePrice, currency.code)} (
                  {entry.discountPercentage}% de descuento)
                </Text>
              )}
            </View>
          )}

          {entry.isSold ? (
            <View className="mt-3 flex-row items-center gap-1 self-start rounded-full bg-brand-green px-3 py-1">
              <Ionicons name="checkmark-circle" size={14} color={AppColors.white} />
              <Text className="text-xs font-extrabold text-white">Vendida</Text>
            </View>
          ) : (
            <Button
              label="Marcar como vendida"
              icon="checkmark-done-outline"
              variant="secondary"
              onPress={() => setMarkingSoldEntry(entry)}
              className="mt-3 self-start px-4 py-2"
            />
          )}
        </Card>
        );
      })}

      <ConfirmDialog
        visible={Boolean(deletingEntry)}
        title="Eliminar del historial"
        message={`¿Seguro que deseas eliminar "${deletingEntry?.pieceName}" del historial? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setDeletingEntry(null)}
      />

      <ConfirmDialog
        visible={Boolean(markingSoldEntry)}
        title="Marcar como vendida"
        message={`¿Confirmas que ya vendiste "${markingSoldEntry?.pieceName}"? Se descontará del stock los materiales y el empaque que usaste, y no se puede deshacer.`}
        confirmLabel="Marcar como vendida"
        onConfirm={confirmMarkSold}
        onCancel={() => setMarkingSoldEntry(null)}
      />

      {/* Tarjeta con el estilo de la marca, renderizada fuera de pantalla:
          solo existe para que el useEffect de arriba la capture como
          imagen al compartir. */}
      {sharingEntry && (
        <View
          pointerEvents="none"
          style={{ position: "absolute", top: -9999, left: 0 }}
        >
          <QuoteShareCard
            ref={shareCardRef}
            pieceName={sharingEntry.pieceName}
            materialNames={sharingEntry.materialNames}
            salePrice={formatAmount(sharingEntry.finalPrice, currency.code)}
            currencySymbol={currency.symbol}
            calculatedAt={formatCalculatedAt(sharingEntry.createdAt)}
            validUntil={formatValidUntil(sharingEntry.validUntil)}
          />
        </View>
      )}
    </TabScreen>
  );
}
