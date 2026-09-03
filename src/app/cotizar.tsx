import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { DEMO_PACKAGING_OPTIONS } from "@/app/empaques";
import { DEMO_MATERIALS } from "@/app/insumos";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { TabScreen } from "@/components/tab-screen";
import { TextField } from "@/components/text-field";
import { AppColors } from "@/constants/app-theme";

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
        <Text className="flex-1 text-base font-extrabold text-white">
          {title}
        </Text>
        {right}
      </View>
      {children}
    </View>
  );
}

// Convierte segundos totales en "HH", "MM", "SS" con dos dígitos cada uno.
function splitElapsedTime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  return { hours: pad(hours), minutes: pad(minutes), seconds: pad(seconds) };
}

/**
 * Pantalla principal después de iniciar sesión: cotizador de piezas de
 * bisutería ("Crear nueva pieza"). Por ahora solo implementa la estructura
 * visual descrita en las imágenes de referencia (nombre, materiales,
 * empaques, cronómetro y costo/precio); el cálculo real y el guardado se
 * conectarán más adelante al backend de Laravel.
 */
export default function Cotizar() {
  const [pieceName, setPieceName] = useState("");
  const [multiSelectOpen, setMultiSelectOpen] = useState(false);
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<string[]>([]);
  const [individualMaterialId, setIndividualMaterialId] = useState<
    string | null
  >(null);
  const [individualMenuOpen, setIndividualMenuOpen] = useState(false);
  const [selectedMaterialQty, setSelectedMaterialQty] = useState("");
  const [selectedPackagingId, setSelectedPackagingId] = useState<string | null>(
    null,
  );
  const [extraMinutes, setExtraMinutes] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [sumarAlCosto, setSumarAlCosto] = useState(false);

  // Cronómetro real: cuenta segundos mientras isRunning es true.
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setElapsedSeconds((seconds) => seconds + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const time = splitElapsedTime(elapsedSeconds);

  const toggleTimer = () => setIsRunning((running) => !running);

  const resetTimer = () => {
    setIsRunning(false);
    setElapsedSeconds(0);
  };

  const toggleMultiSelect = () => setMultiSelectOpen((open) => !open);

  const toggleMaterialSelected = (id: string) => {
    setSelectedMaterialIds((ids) =>
      ids.includes(id)
        ? ids.filter((existingId) => existingId !== id)
        : [...ids, id],
    );
  };

  const individualMaterial = DEMO_MATERIALS.find(
    (material) => material.id === individualMaterialId,
  );

  const selectIndividualMaterial = (id: string) => {
    setIndividualMaterialId(id);
    setIndividualMenuOpen(false);
  };

  const addExtraMinutes = () => {
    const minutesToAdd = parseInt(extraMinutes, 10);
    if (Number.isFinite(minutesToAdd) && minutesToAdd > 0) {
      setElapsedSeconds((seconds) => seconds + minutesToAdd * 60);
    }
    setExtraMinutes("");
  };

  return (
    <TabScreen active="cotizar">
      <View className="mb-6 flex-row items-center gap-2">
        <Ionicons name="calculator-outline" size={26} color={AppColors.green} />
        <View className="flex-1">
          <Text className="text-xl font-extrabold text-white">
            Crear nueva pieza
          </Text>
          <Text className="text-brand-green">
            Calcula el costo de materiales y el precio sugerido de venta
          </Text>
        </View>
      </View>

      {/* 1. Nombre de la pieza */}
      <Card className="mb-6 bg-white/20">
        <Section
          step={1}
          title="Nombre de la pieza"
          className="mb-0"
          circleClassName="bg-brand-navy"
          circleTextClassName="text-sm text-brand-green"
        >
          <Text className="mb-3 text-brand-soft-text">
            Nombre de la pieza de bisutería
          </Text>
          <TextField
            value={pieceName}
            onChangeText={setPieceName}
            placeholder="Ej: Aretes Mandala..."
            inputClassName="border-gray-200 bg-white text-gray-800"
            placeholderColor="#9CA3AF"
          />
        </Section>
      </Card>

      {/* 2. Materiales / Componentes */}
      <Card className="mb-6 bg-white/20">
        <Section
          step={2}
          title="Materiales / Componentes"
          className="mb-0"
          circleClassName="bg-brand-navy"
          circleTextClassName="text-sm text-brand-green"
          right={
            <Button
              label="Crear Nuevo Material"
              icon="add"
              variant="light"
              onPress={() => {}}
              className="px-3 py-2"
            />
          }
        >
          {/* TODO (backend Laravel): abrir selector múltiple con los
              materiales reales del usuario (fetchMaterials en src/api/client.js). */}
          <Card className="mb-3 bg-white/20">
            <Pressable
              onPress={toggleMultiSelect}
              className="flex-row items-start gap-3"
            >
              <Ionicons
                name={multiSelectOpen ? "checkbox" : "checkbox-outline"}
                size={22}
                color={AppColors.green}
              />
              <View className="flex-1">
                <Text className="text-[15px] font-extrabold text-brand-background">
                  Seleccionar varios materiales a la vez
                </Text>
                <Text className="mt-1 text-gray-500">
                  Añade múltiples insumos y asigna cantidades juntas
                </Text>
              </View>
              <View className="rounded-full bg-brand-input px-3 py-1">
                <Text className="text-xs font-extrabold text-brand-green">
                  {selectedMaterialIds.length} agregados
                </Text>
              </View>
            </Pressable>

            {multiSelectOpen && (
              <View className="mt-3 gap-2">
                {/* TODO (backend Laravel): reemplazar DEMO_MATERIALS por los
                    materiales reales del usuario (fetchMaterials en src/api/client.js). */}
                {DEMO_MATERIALS.map((material) => {
                  const isSelected = selectedMaterialIds.includes(material.id);
                  return (
                    <Pressable
                      key={material.id}
                      onPress={() => toggleMaterialSelected(material.id)}
                      className="flex-row items-center gap-3 rounded-[9px] border border-gray-200 bg-white p-3"
                    >
                      <Ionicons
                        name={isSelected ? "checkbox" : "checkbox-outline"}
                        size={20}
                        color={AppColors.green}
                      />
                      <View className="flex-1">
                        <Text className="font-bold text-brand-background">
                          {material.name}
                        </Text>
                        <Text className="text-xs text-gray-500">
                          {material.detail}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </Card>

          <View className="mb-3 flex-row items-center justify-center gap-2">
            <Ionicons
              name="arrow-forward"
              size={12}
              color={AppColors.softText}
            />
            <Text className="text-center text-xs text-brand-soft-text">
              O agregar de a uno individualmente
            </Text>
            <Ionicons name="arrow-back" size={12} color={AppColors.softText} />
          </View>

          {/* TODO (backend Laravel): reemplazar por un selector real con la
              lista de materiales del usuario (fetchMaterials). */}
          <Card className="mb-3 bg-white/20">
            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text className="mb-2 font-bold text-brand-background">
                  Seleccionar material
                </Text>
                <Pressable
                  onPress={() => setIndividualMenuOpen((open) => !open)}
                  className="flex-row items-center justify-between rounded-[9px] border border-gray-200 bg-white p-[13px]"
                >
                  <Text
                    className={
                      individualMaterial ? "text-gray-800" : "text-gray-400"
                    }
                    numberOfLines={1}
                  >
                    {individualMaterial
                      ? individualMaterial.name
                      : "Seleccionar..."}
                  </Text>
                  <Ionicons
                    name={individualMenuOpen ? "chevron-up" : "chevron-down"}
                    size={16}
                    color="#9CA3AF"
                  />
                </Pressable>

                {individualMenuOpen && (
                  <View className="mt-2 gap-2">
                    {/* TODO (backend Laravel): reemplazar DEMO_MATERIALS por
                        los materiales reales del usuario (fetchMaterials). */}
                    {DEMO_MATERIALS.map((material) => (
                      <Pressable
                        key={material.id}
                        onPress={() => selectIndividualMaterial(material.id)}
                        className="rounded-[9px] border border-gray-200 bg-white p-3"
                      >
                        <Text className="font-bold text-brand-background">
                          {material.name}
                        </Text>
                        <Text className="text-xs text-gray-500">
                          {material.detail}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text className="mb-2 font-bold text-brand-background">
                  Cantidad a usar en esta pieza
                </Text>
                <TextField
                  value={selectedMaterialQty}
                  onChangeText={setSelectedMaterialQty}
                  keyboardType="numeric"
                  placeholder="0"
                  inputClassName="border-gray-200 bg-white text-gray-800"
                  placeholderColor="#9CA3AF"
                  className="mb-0"
                />
              </View>
            </View>
            <Button
              label="Agregar"
              icon="add"
              variant="light"
              onPress={() => {}}
              className="mt-3 self-end px-4 py-3"
            />
          </Card>

          <Card className="mt-3">
            <Text className="text-center text-brand-soft-text">
              Aún no has agregado materiales a esta pieza. Haz clic en
              &quot;Seleccionar Varios Materiales&quot; o elige arriba.
            </Text>
          </Card>
        </Section>
      </Card>

      {/* Empaques y Presentación */}
      <Section step={3} title="Empaques y Presentación">
        {/* TODO (backend Laravel): navegar a la pantalla de Empaques real
            (o abrir selector) usando los datos que devuelva el backend. */}
        <Button
          label="Clases de Empaques"
          icon="gift-outline"
          variant="secondary"
          onPress={() => {}}
          className="mb-3"
        />
        <Text className="mb-3 text-brand-soft-text">
          Selecciona tus clases de empaque o ingresa un costo estimado por pieza
        </Text>

        <Text className="mb-2 font-bold text-white">
          Tus Clases de Empaque Guardadas:
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {DEMO_PACKAGING_OPTIONS.map((option) => {
            const isSelected = option.id === selectedPackagingId;
            return (
              <Pressable
                key={option.id}
                onPress={() =>
                  setSelectedPackagingId(isSelected ? null : option.id)
                }
              >
                <Card
                  className={`px-4 py-3 ${isSelected ? "border-brand-turquoise" : ""}`}
                >
                  <View className="flex-row items-center gap-1">
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={14}
                        color={AppColors.turquoise}
                      />
                    )}
                    <Text className="font-extrabold text-white">
                      {option.name}
                    </Text>
                  </View>
                  <Text className="text-brand-turquoise">{option.cost}</Text>
                </Card>
              </Pressable>
            );
          })}
        </View>
      </Section>

      {/* 4. Tiempo de Elaboración (Cronómetro) */}
      <Section
        step={4}
        title="Tiempo de Elaboración (Cronómetro)"
        right={
          <View className="rounded-full border border-brand-input-border bg-brand-input px-2 py-1">
            <Text className="text-[10px] font-bold text-white">
              COP$ mano de obra
            </Text>
          </View>
        }
      >
        <Text className="mb-3 text-brand-soft-text">
          Cronometra el tiempo exacto que tardas en ensamblar esta pieza para
          valorar tu mano de obra
        </Text>

        <Card className="mb-3 items-center">
          <View className="mb-4 flex-row gap-6">
            {[
              { label: "HORAS", value: time.hours },
              { label: "MINUTOS", value: time.minutes },
              { label: "SEGUNDOS", value: time.seconds },
            ].map((unit) => (
              <View key={unit.label} className="items-center">
                <Text className="text-2xl font-extrabold text-white">
                  {unit.value}
                </Text>
                <Text className="text-[10px] text-brand-soft-text">
                  {unit.label}
                </Text>
              </View>
            ))}
          </View>
          <View className="w-full flex-row gap-3">
            <Button
              label={isRunning ? "Pausar" : "Iniciar Tiempo"}
              icon={isRunning ? "pause" : "play"}
              onPress={toggleTimer}
              className="flex-1"
            />
            <Button
              label="Reset"
              variant="secondary"
              onPress={resetTimer}
              className="flex-1"
            />
          </View>
        </Card>

        <View className="mb-3 flex-row items-end gap-3">
          <TextField
            label="Añadir minutos (ej: 15)"
            value={extraMinutes}
            onChangeText={setExtraMinutes}
            keyboardType="numeric"
            placeholder="0"
            className="mb-0 flex-1"
          />
          <Button
            label="+ Agregar"
            variant="secondary"
            onPress={addExtraMinutes}
          />
        </View>

        <TextField
          label="Costo por Hora de Trabajo ($/Hora)"
          value={hourlyRate}
          onChangeText={setHourlyRate}
          keyboardType="numeric"
          placeholder="0"
          className="mb-2"
        />
        <Pressable
          onPress={() => setSumarAlCosto((value) => !value)}
          className="flex-row items-center gap-2"
          hitSlop={4}
        >
          <Ionicons
            name={sumarAlCosto ? "checkbox" : "checkbox-outline"}
            size={20}
            color={AppColors.turquoise}
          />
          <Text className="text-white">Sumar al costo</Text>
        </Pressable>
      </Section>

      {/* 5. Costo de Producción y Precio de Venta */}
      <Section
        step={5}
        title="Costo de Producción y Precio de Venta"
        className="mb-2"
      >
        {/* TODO (backend Laravel): reemplazar por el cálculo real cuando
            existan materiales, empaque y tiempo cargados. */}
        <Card className="flex-row items-center gap-3">
          <Ionicons name="information-circle" size={22} color="#F97316" />
          <Text className="flex-1 text-brand-soft-text">
            Agrega materiales, empaque o cronometra tiempo para habilitar el
            cálculo.
          </Text>
        </Card>
      </Section>
    </TabScreen>
  );
}
