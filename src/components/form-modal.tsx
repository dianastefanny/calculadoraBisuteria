import type { ReactNode } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

import { Button } from "@/components/button";
import { FieldDensityContext } from "@/components/field-density";
import { CANVAS_BG, INK_TEXT, MUTED_TEXT } from "@/constants/app-theme";

export type FormModalProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  // Texto del botón principal (ej. "Crear", "Guardar cambios").
  submitLabel: string;
  onSubmit: () => void;
  submitting?: boolean;
  // Campos del formulario (se desplazan si no caben).
  children: ReactNode;
  // Otras ventanas que se abren desde este formulario (ej. "crear tipo
  // nuevo"); van dentro del mismo Modal para quedar por encima.
  after?: ReactNode;
};

/**
 * Ventana base de TODOS los formularios (material, empaque, diseño, costo
 * indirecto, prestación y los de editar un campo). Reúne en un solo lugar
 * las reglas para que ningún formulario se vea mal en un celular pequeño:
 *
 * - Altura máxima del 92 % de la pantalla: si los campos no caben, se
 *   desplazan por dentro y el título y los botones siguen visibles.
 * - El fondo oscuro es una capa aparte (tocarlo cierra el formulario); la
 *   tarjeta no va dentro de un Pressable, que le "robaba" el toque al
 *   ScrollView y hacía que la lista se trabara al desplazarla.
 * - Los TextField y SelectField de adentro se ven compactos
 *   automáticamente (FieldDensityContext).
 */
export function FormModal({
  visible,
  onClose,
  title,
  submitLabel,
  onSubmit,
  submitting = false,
  children,
  after,
}: FormModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center p-6">
        <Pressable onPress={onClose} className="absolute inset-0 bg-black/50" />
        <View
          className={`w-full max-w-sm rounded-2xl p-5 shadow-md shadow-black/20 ${CANVAS_BG}`}
          style={{ maxHeight: "92%" }}
        >
          <Text className={`mb-3 text-lg font-extrabold ${INK_TEXT}`}>{title}</Text>

          <FieldDensityContext.Provider value="compact">
            <ScrollView keyboardShouldPersistTaps="handled" style={{ flexShrink: 1 }}>
              {children}
            </ScrollView>
          </FieldDensityContext.Provider>

          <View className="mt-2 flex-row items-center justify-end gap-4">
            <Pressable onPress={onClose} hitSlop={8}>
              <Text className={`font-bold ${MUTED_TEXT}`}>Cancelar</Text>
            </Pressable>
            {/* "shrink": con un texto largo el botón se ajusta y no empuja
                "Cancelar" fuera de la tarjeta. */}
            <Button
              label={submitLabel}
              onPress={onSubmit}
              loading={submitting}
              className="shrink px-6 py-3"
            />
          </View>
        </View>
      </View>
      {after}
    </Modal>
  );
}
