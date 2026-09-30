import Ionicons from "@expo/vector-icons/Ionicons";
import * as Sharing from "expo-sharing";
import { useCallback, useEffect, useRef, useState } from "react";
import { Platform, Pressable, Share, Switch, Text, View } from "react-native";
import { captureRef } from "react-native-view-shot";

import { calculatePieceCost, fetchDesigns, fetchPackagings, getErrorMessage, getUnitLabel } from "@/api/client";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { type ApiDesign } from "@/components/design-form-modal";
import { FormError } from "@/components/form-error";
import { type ApiPackaging } from "@/components/packaging-form-modal";
import { QuoteShareCard } from "@/components/quote-share-card";
import { SelectField } from "@/components/select-field";
import { TabScreen } from "@/components/tab-screen";
import { TextField } from "@/components/text-field";
import {
  AppColors,
  INK_TEXT,
  MUTED_TEXT,
  useFieldTintProps,
} from "@/constants/app-theme";
import { formatAmount, useCurrency, type CurrencyOption } from "@/constants/currency-store";

type SectionProps = {
  step: number;
  title: string;
  right?: React.ReactNode;
  className?: string;
  circleClassName?: string;
  circleTextClassName?: string;
  children: React.ReactNode;
};

/** Encabezado numerado (círculo + título) que reaparece en cada sección del cotizador. */
function Section({
  step,
  title,
  right,
  className = "",
  circleClassName = "bg-brand-green",
  circleTextClassName = "text-white",
  children,
}: SectionProps) {
  return (
    <View className={`mb-6 ${className}`}>
      <View className="mb-3 flex-row items-center gap-2">
        <View
          className={`h-6 w-6 items-center justify-center rounded-full ${circleClassName}`}
        >
          <Text className={`text-xs font-extrabold ${circleTextClassName}`}>
            {step}
          </Text>
        </View>
        <Text className={`flex-1 text-base font-extrabold ${INK_TEXT}`}>
          {title}
        </Text>
        {right}
      </View>
      {children}
    </View>
  );
}

// Forma del resultado que devuelve el backend al calcular la pieza: el
// desglose de todos los costos que se suman para dar el costo final, el
// costo total y el margen de ganancia real aplicado. Todos los valores los
// calcula el backend, el frontend no inventa ninguno.
type FinalCalculationResult = {
  materialsCost: number;
  packagingCost: number;
  laborCost: number;
  indirectCostsTotal: number;
  legalBenefitsCost: number;
  totalCost: number;
  // Porcentaje de ganancia, ej. 35 = 35%.
  profitMargin: number;
  // Precio sugerido de venta: costo total repartido para que el margen de
  // ganancia sea exactamente ese porcentaje sobre el precio final (no sobre
  // el costo). Es el único valor de este resultado que cambia con el margen.
  salePrice: number;
  // Cuántas piezas se cotizaron de una vez (pedidos grandes). Materiales y
  // mano de obra ya vienen multiplicados por esta cantidad; el empaque no
  // (se asume uno solo para todo el pedido, no uno por pieza).
  quantity: number;
  // Descuento aplicado sobre el precio de venta, si se usó (null si no).
  discountPercentage: number | null;
  // Precio final ya con el descuento aplicado (igual a salePrice si no hubo descuento).
  finalPrice: number;
  // Fecha hasta la que esta cotización es válida (5 días desde el cálculo,
  // mismo criterio que ya usa Historial para "Vigente"/"Vencida").
  validUntil: string;
  // Fecha y hora exactas en que se hizo este cálculo (created_at del backend).
  createdAt: string;
};

// Convierte segundos totales en "HH", "MM", "SS" con dos dígitos cada uno.
function splitElapsedTime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  return { hours: pad(hours), minutes: pad(minutes), seconds: pad(seconds) };
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
  // valid_until es una fecha de calendario pura (el backend la manda como
  // medianoche UTC, ej. "2026-09-28T00:00:00Z"); forzar timeZone: "UTC" evita
  // que un dispositivo en una zona horaria detrás de UTC (como Colombia) la
  // muestre como el día anterior.
  return new Date(value).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatDesignMaterialsSummary(design: ApiDesign) {
  return design.materials
    .map((item) => {
      const unit = item.materialUnit ? ` ${getUnitLabel(item.materialUnit)}` : "";
      return `${item.materialName || "Material eliminado"} (${item.quantity}${unit})`;
    })
    .join(", ");
}

function formatPackagingDetail(packaging: ApiPackaging, currency: CurrencyOption) {
  return `${packaging.stock} disponibles · ${currency.symbol}${formatAmount(packaging.unitCost, currency.code)} c/u`;
}

/**
 * Pantalla "Calculadora de costos": reúne diseño, empaque, tiempo de mano
 * de obra, y si se incluyen o no los costos indirectos y las prestaciones
 * legales ya configuradas en el backend, y al presionar "Calcular costo
 * final de la pieza" llama a POST /calculations. El cálculo real (desglose
 * de costos, costo total y margen de ganancia) lo hace el backend de
 * Laravel, no esta pantalla.
 */
export default function Calculos() {
  const currency = useCurrency();
  const fieldProps = useFieldTintProps();
  const shareCardRef = useRef<View>(null);

  const [designs, setDesigns] = useState<ApiDesign[]>([]);
  const [packagingOptions, setPackagingOptions] = useState<ApiPackaging[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  const [selectedDesignId, setSelectedDesignId] = useState<string | null>(null);
  const [selectedPackagingId, setSelectedPackagingId] = useState<string | null>(
    null,
  );
  // El tiempo de mano de obra se registra de una de estas dos formas
  // (nunca las dos a la vez): cronómetro o tiempo escrito a mano.
  const [timeEntryMode, setTimeEntryMode] = useState<"stopwatch" | "manual">(
    "stopwatch",
  );

  // Cronómetro real: cuenta segundos mientras isRunning es true.
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [stopwatchFinished, setStopwatchFinished] = useState(false);

  // Registro manual del tiempo (alternativa al cronómetro).
  const [manualHours, setManualHours] = useState("");
  const [manualMinutes, setManualMinutes] = useState("");

  // Cuántas piezas iguales se cotizan de una vez (pedidos grandes). El
  // tiempo y los materiales son "por pieza"; el backend los multiplica por
  // esta cantidad (el empaque no, se asume uno solo para todo el pedido).
  // Descuento es opcional, para esos mismos pedidos grandes.
  const [quantity, setQuantity] = useState("1");
  const [discountPercentage, setDiscountPercentage] = useState("");

  // Los costos indirectos y las prestaciones legales ya están configurados
  // por el usuario en el backend (catálogos mensuales); aquí solo se decide
  // si se incluyen o no en este cálculo puntual.
  const [includeIndirectCosts, setIncludeIndirectCosts] = useState(true);
  const [includeBenefits, setIncludeBenefits] = useState(true);

  // Resultado del cálculo final que devuelve el backend. null = todavía no
  // se ha calculado (no se inventa ningún valor aquí en el frontend).
  const [calculationResult, setCalculationResult] =
    useState<FinalCalculationResult | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState<string | null>(
    null,
  );


  const loadOptions = useCallback(async () => {
    setLoadingOptions(true);
    try {
      const [designsData, packagingsData] = await Promise.all([
        fetchDesigns(),
        fetchPackagings(),
      ]);
      setDesigns(designsData);
      setPackagingOptions(packagingsData);
      setOptionsError(null);
    } catch (err) {
      setOptionsError(getErrorMessage(err));
    } finally {
      setLoadingOptions(false);
    }
  }, []);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setElapsedSeconds((seconds) => seconds + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const time = splitElapsedTime(elapsedSeconds);

  const selectTimeEntryMode = (mode: "stopwatch" | "manual") => {
    setTimeEntryMode(mode);
    // Al cambiar de método no tiene sentido dejar el cronómetro corriendo
    // de fondo, así que se pausa (el tiempo ya contado no se pierde).
    if (mode === "manual") setIsRunning(false);
  };

  const startTimer = () => {
    setIsRunning(true);
    setStopwatchFinished(false);
  };

  const pauseTimer = () => setIsRunning(false);

  const finishTimer = () => {
    setIsRunning(false);
    setStopwatchFinished(true);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setStopwatchFinished(false);
    setElapsedSeconds(0);
  };

  const designOptions = designs.map((design) => ({
    id: design.id,
    label: design.name,
    sublabel: formatDesignMaterialsSummary(design),
  }));
  const selectedDesign = designs.find(
    (design) => design.id === selectedDesignId,
  );

  // Opción para poder volver a "sin empaque" desde el mismo modal, ya que
  // el empaque es opcional (no todas las piezas necesitan uno).
  const NO_PACKAGING_ID = "none";
  const packagingSelectOptions = [
    {
      id: NO_PACKAGING_ID,
      label: "Ninguno",
      sublabel: "Continuar sin empaque",
    },
    ...packagingOptions.map((option) => ({
      id: option.id,
      label: option.name,
      sublabel: formatPackagingDetail(option, currency),
    })),
  ];
  const selectedPackaging = packagingOptions.find(
    (option) => option.id === selectedPackagingId,
  );

  const manualTimeSeconds =
    (parseInt(manualHours, 10) || 0) * 3600 +
    (parseInt(manualMinutes, 10) || 0) * 60;

  // Tiempo de mano de obra que se usará para el cálculo, según el método
  // que el usuario haya elegido para registrarlo.
  const laborTimeSeconds =
    timeEntryMode === "stopwatch" ? elapsedSeconds : manualTimeSeconds;

  // Datos obligatorios para poder calcular: un diseño elegido (que ya trae
  // sus materiales) y algún tiempo de mano de obra registrado. Empaque,
  // costos indirectos y prestaciones son opcionales.
  const canCalculateFinalCost = Boolean(selectedDesign) && laborTimeSeconds > 0;

  // Comparte el nombre de la pieza, los materiales usados (solo el nombre,
  // nunca su costo individual) y el costo total — nunca el margen ni el
  // desglose interno de costos (mismo criterio que Historial).
  // En iOS/Android comparte una imagen con el estilo de la marca (capturada
  // de QuoteShareCard, renderizada oculta más abajo). En Web, comparte texto
  // plano directo y sin esperar nada antes: la Web Share API exige que
  // Share.share se llame de forma síncrona dentro del gesto del usuario, y
  // un "await" previo (para revisar si se puede compartir imagen) hace que
  // el navegador la rechace con "Must be handling a user gesture".
  const buildShareText = () => {
    if (!calculationResult || !selectedDesign) return "";
    const materialNames = selectedDesign.materials
      .map((item) => item.materialName)
      .filter(Boolean);
    const materialsLine =
      materialNames.length > 0 ? `\nMateriales: ${materialNames.join(", ")}` : "";
    return `${selectedDesign.name} — Precio de venta: ${currency.symbol}${formatAmount(calculationResult.finalPrice, currency.code)}${materialsLine}`;
  };

  const shareCalculation = async () => {
    if (!calculationResult || !selectedDesign) return;

    const shareText = buildShareText();

    if (Platform.OS === "web") {
      Share.share({ message: shareText });
      return;
    }

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
    }

    Share.share({ message: shareText });
  };

  const requestFinalCalculation = async () => {
    if (!canCalculateFinalCost || !selectedDesignId) return;

    setCalculationError(null);
    setCalculating(true);
    try {
      const result = await calculatePieceCost({
        designId: selectedDesignId,
        packagingId: selectedPackagingId,
        productionTimeMinutes: Math.max(1, Math.round(laborTimeSeconds / 60)),
        packagingQuantity: 1,
        quantity: Math.max(1, parseInt(quantity, 10) || 1),
        discountPercentage: discountPercentage
          ? Number(discountPercentage)
          : undefined,
        includeIndirectCosts,
        includeBenefits,
      });
      setCalculationResult(result);
    } catch (err) {
      setCalculationError(getErrorMessage(err));
    } finally {
      setCalculating(false);
    }
  };

  return (
    <TabScreen active="calculos">
      <View className="mb-6 flex-row items-center gap-2">
        <Ionicons name="calculator-outline" size={26} color={AppColors.green} />
        <View className="flex-1">
          <Text className={`text-xl font-extrabold ${INK_TEXT}`}>
            Calculadora de costos
          </Text>
          <Text className="text-brand-green">
            Calcula el costo de materiales y el precio sugerido de venta
          </Text>
        </View>
      </View>

      <FormError message={optionsError} />

      {loadingOptions && (
        <Text className={`mb-3 text-center ${MUTED_TEXT}`}>Cargando diseños y empaques...</Text>
      )}

      {/* 1. Seleccionar diseño */}
      <Card className="mb-6">
        <Section step={1} title="Seleccionar diseño" className="mb-0">
          <Text className={`mb-3 ${MUTED_TEXT}`}>
            Elige el diseño que quieres calcular
          </Text>

          <SelectField
            label="Diseño"
            value={selectedDesignId}
            placeholder="Escoger diseño..."
            options={designOptions}
            onSelect={setSelectedDesignId}
            trigger={(open) => (
              <Button
                label={selectedDesign ? selectedDesign.name : "Escoger diseño"}
                icon="sparkles-outline"
                onPress={() => {
                  if (designs.length > 0) open();
                }}
              />
            )}
          />

          {!loadingOptions && designs.length === 0 && (
            <Card className="mt-3">
              <Text className={`text-center ${MUTED_TEXT}`}>
                Aún no has creado ningún diseño. Ve a la pestaña Diseños para
                crear uno.
              </Text>
            </Card>
          )}

          {selectedDesign && selectedDesign.materials.length > 0 && (
            <Card className="mt-3">
              <Text className={`font-extrabold ${INK_TEXT}`}>
                {selectedDesign.name}
              </Text>
              <Text className={`mt-1 text-sm ${MUTED_TEXT}`}>
                {formatDesignMaterialsSummary(selectedDesign)}
              </Text>
            </Card>
          )}
        </Section>
      </Card>

      {/* 2. Empaques y Presentación */}
      <Card className="mb-6">
        <Section step={2} title="Empaques y Presentación" className="mb-0">
          <Text className={`mb-3 ${MUTED_TEXT}`}>
            Elige un empaque para esta pieza (opcional)
          </Text>

          <SelectField
            label="Empaque"
            value={selectedPackagingId ?? NO_PACKAGING_ID}
            placeholder="Escoger empaque (opcional)..."
            options={packagingSelectOptions}
            onSelect={(id) =>
              setSelectedPackagingId(id === NO_PACKAGING_ID ? null : id)
            }
            trigger={(open) => (
              <Button
                label={
                  selectedPackaging
                    ? selectedPackaging.name
                    : "Escoger empaque (opcional)"
                }
                icon="gift-outline"
                onPress={() => {
                  if (packagingOptions.length > 0) open();
                }}
              />
            )}
          />

          {!loadingOptions && packagingOptions.length === 0 && (
            <Card className="mt-3">
              <Text className={`text-center ${MUTED_TEXT}`}>
                Aún no has creado ningún empaque. Ve a la pestaña Empaques para
                crear uno.
              </Text>
            </Card>
          )}

          {selectedPackaging && (
            <Card className="mt-3">
              <Text className={`font-extrabold ${INK_TEXT}`}>
                {selectedPackaging.name}
              </Text>
              <Text className={`mt-1 text-sm ${MUTED_TEXT}`}>
                {formatPackagingDetail(selectedPackaging, currency)}
              </Text>
            </Card>
          )}
        </Section>
      </Card>

      {/* 3. Tiempo de mano de obra */}
      <Card className="mb-6">
        <Section step={3} title="Tiempo de mano de obra" className="mb-0">
          <Text className={`mb-3 ${MUTED_TEXT}`}>
            Registra el tiempo que te toma elaborar esta pieza: cronométralo
            mientras la haces, o escríbelo si ya lo conoces.
          </Text>

          <View className="mb-3 flex-row gap-3">
            {(
              [
                { key: "stopwatch", label: "Cronómetro" },
                { key: "manual", label: "Registro manual" },
              ] as const
            ).map((option) => {
              const isSelected = timeEntryMode === option.key;
              return (
                <Pressable
                  key={option.key}
                  onPress={() => selectTimeEntryMode(option.key)}
                  className="flex-1"
                >
                  <Card
                    className={`items-center px-3 py-3 ${isSelected ? "border-brand-turquoise" : ""}`}
                  >
                    <View className="flex-row items-center gap-1">
                      {isSelected && (
                        <Ionicons
                          name="checkmark-circle"
                          size={14}
                          color={AppColors.turquoise}
                        />
                      )}
                      <Text className={`font-extrabold ${INK_TEXT}`}>
                        {option.label}
                      </Text>
                    </View>
                  </Card>
                </Pressable>
              );
            })}
          </View>

          {timeEntryMode === "stopwatch" ? (
            <Card className="items-center">
              <View className="mb-4 flex-row gap-6">
                {[
                  { label: "HORAS", value: time.hours },
                  { label: "MINUTOS", value: time.minutes },
                  { label: "SEGUNDOS", value: time.seconds },
                ].map((unit) => (
                  <View key={unit.label} className="items-center">
                    <Text className={`text-2xl font-extrabold ${INK_TEXT}`}>
                      {unit.value}
                    </Text>
                    <Text className={`text-[10px] ${MUTED_TEXT}`}>
                      {unit.label}
                    </Text>
                  </View>
                ))}
              </View>
              <View className="w-full flex-row gap-3">
                <Button
                  label={isRunning ? "Pausar" : "Iniciar"}
                  icon={isRunning ? "pause" : "play"}
                  onPress={isRunning ? pauseTimer : startTimer}
                  disabled={stopwatchFinished}
                  className="flex-1"
                />
                <Button
                  label="Finalizar"
                  icon="checkmark-done"
                  onPress={finishTimer}
                  disabled={stopwatchFinished || elapsedSeconds === 0}
                  className="flex-1"
                />
              </View>
              <Button
                label="Reset"
                onPress={resetTimer}
                disabled={elapsedSeconds === 0 && !stopwatchFinished}
                className="mt-3 w-full"
              />
              {stopwatchFinished && (
                <Text className="mt-3 text-sm text-brand-turquoise">
                  Tiempo finalizado, listo para usarse en el cálculo.
                </Text>
              )}
            </Card>
          ) : (
            <Card>
              <Text className={`mb-3 ${MUTED_TEXT}`}>
                Escribe el tiempo estimado o el que ya conoces.
              </Text>
              <View className="flex-row gap-3">
                <TextField
                  label="Horas"
                  value={manualHours}
                  onChangeText={setManualHours}
                  keyboardType="numeric"
                  placeholder="0"
                  {...fieldProps}
                  className="mb-0 flex-1"
                />
                <TextField
                  label="Minutos"
                  value={manualMinutes}
                  onChangeText={setManualMinutes}
                  keyboardType="numeric"
                  placeholder="0"
                  {...fieldProps}
                  className="mb-0 flex-1"
                />
              </View>
            </Card>
          )}
        </Section>
      </Card>

      {/* 4. Costos indirectos */}
      <Card className="mb-6">
        <Section step={4} title="Costos indirectos" className="mb-0">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              <Text className={`font-bold ${INK_TEXT}`}>
                Incluir costos indirectos
              </Text>
              <Text className={`mt-1 text-sm ${MUTED_TEXT}`}>
                Suma automáticamente los costos indirectos mensuales que ya
                tienes configurados, prorrateados según tu producción mensual.
              </Text>
            </View>
            <Switch
              value={includeIndirectCosts}
              onValueChange={setIncludeIndirectCosts}
              trackColor={{ false: AppColors.softText, true: AppColors.green }}
              thumbColor={AppColors.white}
            />
          </View>
        </Section>
      </Card>

      {/* 5. Prestaciones legales */}
      <Card className="mb-6">
        <Section step={5} title="Prestaciones legales" className="mb-0">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              <Text className={`font-bold ${INK_TEXT}`}>
                Incluir prestaciones legales
              </Text>
              <Text className={`mt-1 text-sm ${MUTED_TEXT}`}>
                Suma automáticamente todas las prestaciones que ya tienes
                configuradas y activas (ARL, salud, pensión, etc.).
              </Text>
            </View>
            <Switch
              value={includeBenefits}
              onValueChange={setIncludeBenefits}
              trackColor={{ false: AppColors.softText, true: AppColors.green }}
              thumbColor={AppColors.white}
            />
          </View>
        </Section>
      </Card>

      {/* 6. Costo final de la pieza */}
      <Card className="mb-6">
        <Section step={6} title="Costo final de la pieza" className="mb-0">
          <FormError message={calculationError} />

          {!canCalculateFinalCost && (
            <Text className={`mb-3 text-sm ${MUTED_TEXT}`}>
              Selecciona un diseño y registra el tiempo de mano de obra
              (cronómetro o manual) para poder calcular. Si quieres, también
              puedes agregar un empaque, costos indirectos y prestaciones
              legales: son opcionales.
            </Text>
          )}

          <Text className={`mb-1 ${MUTED_TEXT}`}>
            ¿Te pidieron varias piezas iguales? Indica cuántas y, si quieres,
            un descuento por pedido grande.
          </Text>
          <View className="mb-3 flex-row gap-3">
            <TextField
              label="Cantidad de piezas"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              placeholder="1"
              {...fieldProps}
              className="mb-0 flex-1"
            />
            <TextField
              label="Descuento (%) opcional"
              value={discountPercentage}
              onChangeText={setDiscountPercentage}
              keyboardType="numeric"
              placeholder="0"
              {...fieldProps}
              className="mb-0 flex-1"
            />
          </View>

          <Button
            label="Calcular costo"
            icon="calculator-outline"
            onPress={requestFinalCalculation}
            disabled={!canCalculateFinalCost}
            loading={calculating}
          />

          <Card className="mt-4">
            {calculationResult === null ? (
              <Text className={`text-center ${MUTED_TEXT}`}>
                Aún no se ha calculado el costo de esta pieza.
              </Text>
            ) : (
              <View className="gap-1">
                <Text className={INK_TEXT}>
                  Costo de materiales: {currency.symbol}
                  {formatAmount(calculationResult.materialsCost, currency.code)}
                </Text>
                <Text className={INK_TEXT}>
                  Costo del empaque: {currency.symbol}
                  {formatAmount(calculationResult.packagingCost, currency.code)}
                </Text>
                <Text className={INK_TEXT}>
                  Costo de mano de obra: {currency.symbol}
                  {formatAmount(calculationResult.laborCost, currency.code)}
                </Text>
                <Text className={INK_TEXT}>
                  Costos indirectos: {currency.symbol}
                  {formatAmount(calculationResult.indirectCostsTotal, currency.code)}
                </Text>
                <Text className={INK_TEXT}>
                  Prestaciones legales: {currency.symbol}
                  {formatAmount(calculationResult.legalBenefitsCost, currency.code)}
                </Text>
                {calculationResult.quantity > 1 && (
                  <Text className={INK_TEXT}>
                    Cantidad de piezas: {calculationResult.quantity}
                  </Text>
                )}
                <Text className="mt-2 text-lg font-extrabold text-brand-turquoise">
                  Costo total: {currency.symbol}
                  {formatAmount(calculationResult.totalCost, currency.code)}
                </Text>
                <Text className="font-extrabold text-brand-green">
                  Margen de ganancia: {calculationResult.profitMargin}%
                </Text>
                <Text className="mt-1 text-lg font-extrabold text-brand-turquoise">
                  Precio de venta sugerido: {currency.symbol}
                  {formatAmount(calculationResult.salePrice, currency.code)}
                </Text>
                {calculationResult.discountPercentage != null && (
                  <>
                    <Text className="font-extrabold text-brand-green">
                      Descuento aplicado: {calculationResult.discountPercentage}%
                    </Text>
                    <Text className="text-lg font-extrabold text-brand-turquoise">
                      Precio final con descuento: {currency.symbol}
                      {formatAmount(calculationResult.finalPrice, currency.code)}
                    </Text>
                  </>
                )}
                <Button
                  label="Compartir cotización"
                  icon="share-social-outline"
                  variant="secondary"
                  onPress={shareCalculation}
                  className="mt-3"
                />
              </View>
            )}
          </Card>
        </Section>
      </Card>

      {/* Tarjeta con el estilo de la marca, renderizada fuera de pantalla:
          solo existe para que shareCalculation la capture como imagen al
          compartir (ver react-native-view-shot en package.json). */}
      {calculationResult && selectedDesign && (
        <View
          pointerEvents="none"
          style={{ position: "absolute", top: -9999, left: 0 }}
        >
          <QuoteShareCard
            ref={shareCardRef}
            pieceName={selectedDesign.name}
            materialNames={selectedDesign.materials
              .map((item) => item.materialName)
              .filter(Boolean)}
            salePrice={formatAmount(calculationResult.finalPrice, currency.code)}
            currencySymbol={currency.symbol}
            calculatedAt={formatCalculatedAt(calculationResult.createdAt)}
            validUntil={formatValidUntil(calculationResult.validUntil)}
          />
        </View>
      )}
    </TabScreen>
  );
}
