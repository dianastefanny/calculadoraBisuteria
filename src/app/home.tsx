import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text } from "react-native";

import { Card } from "@/components/card";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { SafeScreen } from "@/components/safe-screen";
import { ScreenHeader } from "@/components/screen-header";

/**
 * Menú principal: la pantalla que ve el usuario justo después de iniciar
 * sesión. Muestra las tarjetas de los módulos de la app (por ahora solo
 * Inventario está activo; Diseños y Calculadora están marcados como
 * "Próximamente") y el botón para cerrar sesión.
 */
export default function Home() {
  // Controla si el diálogo de "¿seguro que deseas cerrar sesión?" está visible.
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  // Abre la pantalla de inventario al tocar su tarjeta.
  const openInventory = () => router.push("/inventory");

  // Se ejecuta solo si el usuario confirma el cierre de sesión en el diálogo.
  //
  // TODO (backend Laravel): cuando exista sesión real, reemplazar esto por
  // una llamada al cliente ya preparado en src/api/client.js, por ejemplo:
  //   import { logoutUser } from "@/api/client";
  //   await logoutUser(); // ya deja preparado el borrado del token guardado
  const confirmLogout = () => {
    setConfirmingLogout(false);
    router.replace("/login");
  };

  return (
    <SafeScreen>
      {/* TODO (backend Laravel): "Ana" es un valor de ejemplo; reemplazar por el nombre del usuario que devuelva loginUser() cuando exista sesión real. */}
      <ScreenHeader
        title="Hola, Ana."
        rightIcon="log-out-outline"
        onRightPress={() => setConfirmingLogout(true)}
      />
      <Text className="mb-6 text-brand-soft-text">
        ¿Qué deseas gestionar hoy?
      </Text>

      {/* Tarjeta de Inventario: es la única funcional por ahora, por eso es la única dentro de un Pressable. */}
      <Pressable onPress={openInventory}>
        <Card className="mb-3">
          <Text className="text-lg font-extrabold text-white">
            Inventario
          </Text>
          <Text className="mt-1 text-brand-soft-text">
            Materiales y existencias
          </Text>
          <Text className="mt-3 text-xs font-extrabold text-brand-turquoise">
            Disponible
          </Text>
        </Card>
      </Pressable>

      {/* Módulos todavía no implementados: se muestran pero no hacen nada al tocarlos. */}
      <Card className="mb-3">
        <Text className="text-lg font-extrabold text-white">Diseños</Text>
        <Text className="mt-1 text-brand-soft-text">Próximamente</Text>
      </Card>

      <Card>
        <Text className="text-lg font-extrabold text-white">Calculadora</Text>
        <Text className="mt-1 text-brand-soft-text">Próximamente</Text>
      </Card>

      {/* Solo se ve cuando confirmingLogout es true (al tocar el ícono de salir). */}
      <ConfirmDialog
        visible={confirmingLogout}
        title="Cerrar sesión"
        message="¿Seguro que deseas cerrar sesión?"
        confirmLabel="Cerrar sesión"
        destructive
        onConfirm={confirmLogout}
        onCancel={() => setConfirmingLogout(false)}
      />
    </SafeScreen>
  );
}
