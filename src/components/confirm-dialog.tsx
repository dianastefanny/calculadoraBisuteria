import { Modal, Pressable, Text, View } from "react-native";

import { CANVAS_BG, INK_TEXT, MUTED_TEXT } from "@/constants/app-theme";

export type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  // Por defecto muestra "Cancelar". Pasar null (no solo omitirlo) lo
  // convierte en un simple aviso de un solo botón — útil para mostrar un
  // error importante que el usuario deba confirmar que leyó, en vez de una
  // pregunta con dos opciones.
  cancelLabel?: string | null;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
};

/**
 * Ventana emergente centrada, usada tanto para preguntar "¿estás seguro?"
 * antes de algo importante (pasando cancelLabel) como para mostrar un aviso
 * de un solo botón (sin cancelLabel) — por ejemplo, que no se pudo marcar
 * una pieza como vendida por falta de stock. A diferencia de FormError (que
 * se muestra arriba de la pantalla y puede quedar fuera de la vista si el
 * usuario está desplazado hacia abajo en una lista larga), este aviso
 * siempre aparece centrado, sin importar en qué parte de la lista se esté.
 *
 * Se usa en vez de la alerta nativa del sistema (Alert.alert) porque esa
 * alerta NO funciona en la versión web de la app; este componente sí
 * funciona igual en celular y en navegador.
 *
 * Cómo se controla: la pantalla que lo usa guarda en su propio estado si el
 * diálogo debe estar visible o no (visible={true/false}), y decide qué pasa
 * al tocar cada botón con onConfirm/onCancel.
 *
 * "destructive" pinta el botón de confirmar en rojo, para acciones que no
 * se pueden deshacer o que conviene remarcar (como cerrar sesión).
 */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const closeOnBackdrop = onCancel ?? onConfirm;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={closeOnBackdrop}
    >
      {/* Fondo oscuro semitransparente: tocarlo fuera de la tarjeta cierra igual que el botón de cancelar (o el único botón, si no hay cancelar). */}
      <Pressable
        onPress={closeOnBackdrop}
        className="flex-1 items-center justify-center bg-black/50 p-6"
      >
        <Pressable
          className={`w-full max-w-sm rounded-2xl p-5 shadow-md shadow-black/20 ${CANVAS_BG}`}
        >
          <Text className={`text-lg font-extrabold ${INK_TEXT}`}>
            {title}
          </Text>
          <Text className={`mt-2 ${MUTED_TEXT}`}>{message}</Text>

          <View className="mt-5 flex-row justify-end gap-4">
            {cancelLabel && (
              <Pressable onPress={onCancel} hitSlop={8}>
                <Text className={`font-bold ${MUTED_TEXT}`}>
                  {cancelLabel}
                </Text>
              </Pressable>
            )}
            <Pressable onPress={onConfirm} hitSlop={8}>
              <Text
                className={`font-bold ${destructive ? "text-brand-error" : "text-brand-green"}`}
              >
                {confirmLabel}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
