import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { AppColors } from "@/constants/app-theme";

export type AppHeaderProps = {
  className?: string;
};

type CurrencyCode = "COP" | "USD" | "EUR";

// TODO (backend Laravel): sincronizar la moneda seleccionada con la
// preferencia real del usuario en el servidor.
const CURRENCY_OPTIONS: {
  code: CurrencyCode;
  trigger: string;
  label: string;
}[] = [
  { code: "COP", trigger: "COP$", label: "PESOS (COP)" },
  { code: "USD", trigger: "USD$", label: "DÓLAR (USD)" },
  { code: "EUR", trigger: "EUR€", label: "EURO (€)" },
];

/**
 * Encabezado compartido por todas las pantallas posteriores al inicio de
 * sesión (Cotizar, Insumos, Empaques, Historial, Perfil): logo pequeño,
 * selector de moneda y botón para cerrar sesión (con su propio diálogo de
 * confirmación, igual al que usaba home.tsx).
 */
export function AppHeader({ className = "" }: AppHeaderProps) {
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [currency, setCurrency] = useState<CurrencyCode>("COP");
  const [currencyMenuOpen, setCurrencyMenuOpen] = useState(false);
  // Posición del menú de moneda, calculada a partir del botón real (ver
  // openCurrencyMenu) para que el menú aparezca siempre justo debajo de él,
  // sin depender de posicionamiento "absolute" anidado.
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const currencyTriggerRef = useRef<View>(null);

  const currentCurrency =
    CURRENCY_OPTIONS.find((option) => option.code === currency) ??
    CURRENCY_OPTIONS[0];

  const openCurrencyMenu = () => {
    currencyTriggerRef.current?.measureInWindow((x, y, width, height) => {
      setMenuPosition({
        top: y + height + 8,
        right: Dimensions.get("window").width - (x + width),
      });
      setCurrencyMenuOpen(true);
    });
  };

  // TODO (backend Laravel): cuando exista sesión real, reemplazar esto por
  // una llamada al cliente ya preparado en src/api/client.js, por ejemplo:
  //   import { logoutUser } from "@/api/client";
  //   await logoutUser(); // ya deja preparado el borrado del token guardado
  const confirmLogout = () => {
    setConfirmingLogout(false);
    router.replace("/login");
  };

  return (
    <View
      className={`flex-row items-center justify-between rounded-b-3xl bg-brand-input px-7 pb-5 pt-5 shadow-md shadow-black/10 ${className}`}
    >
      <View className="items-center">
        <Image
          source={require("@/assets/images/logo-cc.png")}
          style={{ width: 70, height: 70 }}
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
            className="w-40 overflow-hidden rounded-2xl bg-white py-1 shadow-md shadow-black/20"
          >
            {CURRENCY_OPTIONS.map((option) => (
              <Pressable
                key={option.code}
                onPress={() => {
                  setCurrency(option.code);
                  setCurrencyMenuOpen(false);
                }}
                className={`px-4 py-3 ${
                  option.code === currency ? "bg-brand-input" : ""
                }`}
              >
                <Text className="text-xs font-bold text-brand-background">
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
