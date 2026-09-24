import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { Dimensions, Image, Modal, Pressable, Text, View } from "react-native";

import { logoutUser, updateConfiguration } from "@/api/client";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { AppColors, CANVAS_BG, INK_TEXT } from "@/constants/app-theme";
import {
  CURRENCY_OPTIONS,
  setCurrency,
  useCurrency,
} from "@/constants/currency-store";

export type AppHeaderProps = {
  className?: string;
};

/**
 * Encabezado compartido por todas las pantallas posteriores al inicio de
 * sesión (Materiales, Empaques, Diseños, Cálculos, Historial,
 * Configuraciones): logo pequeño, selector de moneda y botón para cerrar
 * sesión (con su propio diálogo de confirmación).
 */
export function AppHeader({ className = "" }: AppHeaderProps) {
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const currentCurrency = useCurrency();
  const [currencyMenuOpen, setCurrencyMenuOpen] = useState(false);
  // Posición del menú de moneda, calculada a partir del botón real (ver
  // openCurrencyMenu) para que el menú aparezca siempre justo debajo de él,
  // sin depender de posicionamiento "absolute" anidado.
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const currencyTriggerRef = useRef<View>(null);

  const openCurrencyMenu = () => {
    currencyTriggerRef.current?.measureInWindow((x, y, width, height) => {
      setMenuPosition({
        top: y + height + 8,
        right: Dimensions.get("window").width - (x + width),
      });
      setCurrencyMenuOpen(true);
    });
  };

  // Cambia la moneda al instante (sin esperar al servidor) y en paralelo la
  // guarda en la cuenta del usuario para la próxima vez que inicie sesión
  // (mismo patrón que el tema claro/oscuro en configuraciones.tsx). Si falla
  // el guardado remoto, la moneda ya cambió localmente y no bloquea al
  // usuario.
  const selectCurrency = (code: (typeof CURRENCY_OPTIONS)[number]["code"]) => {
    setCurrency(code);
    setCurrencyMenuOpen(false);
    updateConfiguration({ currency: code }).catch(() => {});
  };

  // Invalida el token en el backend y borra el guardado en este dispositivo
  // antes de volver a login (logoutUser no lanza error si el backend no
  // responde: el usuario igual debe poder salir localmente).
  const confirmLogout = async () => {
    setConfirmingLogout(false);
    await logoutUser();
    router.replace("/login");
  };

  return (
    <View
      className={`flex-row items-center justify-between rounded-b-3xl bg-brand-input px-7 pb-5 pt-5 shadow-md shadow-black/10 ${className}`}
    >
      <View className="items-center">
        <Image
          source={require("@/assets/images/logo-cc.png")}
          style={{ width: 90, height: 90 }}
          resizeMode="contain"
        />
        <Text className="text-[12px] font-extrabold tracking-wide text-brand-turquoise">
          CUENTA CUENTAS
        </Text>
      </View>

      <View className="flex-row items-center gap-2">
        <Pressable
          ref={currencyTriggerRef}
          onPress={openCurrencyMenu}
          className="flex-row items-center gap-1 rounded-2xl bg-white px-4 py-3"
        >
          <Text className="text-xs font-extrabold text-brand-background">
            {currentCurrency.trigger}
          </Text>
          <Ionicons
            name="chevron-down"
            size={14}
            color={AppColors.background}
          />
        </Pressable>

        <Pressable
          onPress={() => setConfirmingLogout(true)}
          className="flex-row items-center gap-1 rounded-2xl bg-white px-4 py-3"
        >
          <Ionicons
            name="log-out-outline"
            size={16}
            color={AppColors.background}
          />
          <Text className="text-xs font-extrabold text-brand-background">
            Salir
          </Text>
        </Pressable>
      </View>

      {/* Modal en vez de un menú "absolute" anidado: así se dibuja siempre
          por encima de todo (igual que ConfirmDialog) sin depender de z-index. */}
      <Modal
        visible={currencyMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCurrencyMenuOpen(false)}
      >
        <Pressable
          className="flex-1"
          onPress={() => setCurrencyMenuOpen(false)}
        >
          <View
            style={{
              position: "absolute",
              top: menuPosition.top,
              right: menuPosition.right,
            }}
            className={`w-40 overflow-hidden rounded-2xl py-1 shadow-md shadow-black/20 ${CANVAS_BG}`}
          >
            {CURRENCY_OPTIONS.map((option) => (
              <Pressable
                key={option.code}
                onPress={() => selectCurrency(option.code)}
                className={`px-4 py-3 ${
                  option.code === currentCurrency.code ? "bg-brand-input" : ""
                }`}
              >
                <Text className={`text-xs font-bold ${INK_TEXT}`}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      <ConfirmDialog
        visible={confirmingLogout}
        title="Cerrar sesión"
        message="¿Seguro que deseas cerrar sesión?"
        confirmLabel="Cerrar sesión"
        destructive
        onConfirm={confirmLogout}
        onCancel={() => setConfirmingLogout(false)}
      />
    </View>
  );
}
