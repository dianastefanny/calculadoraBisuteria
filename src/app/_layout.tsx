import "@/global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import { useEffect } from "react";

import { AppColors } from "@/constants/app-theme";

/**
 * Punto de entrada de toda la app. Aquí se declaran todas las pantallas que
 * existen (cada una es un archivo dentro de src/app) y cómo se comportan al
 * pasar de una a otra. En este caso: sin la barra de título de siempre
 * (headerShown: false, porque cada pantalla arma su propio encabezado) y con
 * una transición suave tipo "fundido" (animation: "fade") en vez de deslizar.
 */
export default function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();

  // La app siempre abre en modo oscuro por defecto (el diseño principal de
  // la marca), sin importar el tema del sistema del celular; desde
  // Configuraciones se puede cambiar a modo claro para esa sesión.
  //
  // Solo una vez al montar (deps vacías): si "setColorScheme" entrara en la
  // lista de dependencias, este efecto se repetiría cada vez que cambia de
  // referencia (por ejemplo, justo al apagar el modo oscuro desde
  // Configuraciones) y volvería a forzar el modo oscuro de inmediato.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setColorScheme("dark");
  }, []);

  return (
    <>
      {/* Íconos de la barra de estado del celular (hora, batería): claros
          sobre fondo oscuro, oscuros sobre fondo claro. */}
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
          // El contenedor nativo de cada pantalla no tiene color de fondo
          // propio (solo lo pinta el contenido de React/NativeWind, vía
          // CANVAS_BG); sin esto, la transición "fade" deja ver un
          // parpadeo blanco del sistema entre pantalla y pantalla.
          contentStyle: {
            backgroundColor:
              colorScheme === "dark" ? AppColors.background : AppColors.white,
          },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
