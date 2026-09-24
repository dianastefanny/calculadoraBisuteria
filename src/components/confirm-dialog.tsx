import { Modal, Pressable, Text, View } from "react-native";

import { CANVAS_BG, INK_TEXT, MUTED_TEXT } from "@/constants/app-theme";

export type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Ventana emergente que le pregunta al usuario "¿estás seguro?" antes de
 * hacer algo importante (por ejemplo, cerrar sesión). Se usa en vez de la
 * alerta nativa del sistema (Alert.alert) porque esa alerta NO funciona en
 * la versión web de la app; este componente sí funciona igual en celular y
 * en navegador.
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
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      {/* Fondo oscuro semitransparente: tocarlo fuera de la tarjeta cancela igual que el botón "Cancelar". */}
      <Pressable
        onPress={onCancel}
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
            <Pressable onPress={onCancel} hitSlop={8}>
              <Text className={`font-bold ${MUTED_TEXT}`}>{cancelLabel}</Text>
            </Pressable>
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
