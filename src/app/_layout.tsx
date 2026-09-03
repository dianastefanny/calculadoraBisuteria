import "@/global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

/**
 * Punto de entrada de toda la app. Aquí se declaran todas las pantallas que
 * existen (cada una es un archivo dentro de src/app) y cómo se comportan al
 * pasar de una a otra. En este caso: sin la barra de título de siempre
 * (headerShown: false, porque cada pantalla arma su propio encabezado) y con
 * una transición suave tipo "fundido" (animation: "fade") en vez de deslizar.
 */
export default function RootLayout() {
  return (
    <>
      {/* Íconos de la barra de estado del celular (hora, batería) en color claro, porque el fondo de la app es oscuro. */}
      <StatusBar style="light" />

      <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="home" />
        <Stack.Screen name="inventory" />
        <Stack.Screen name="material-form" />
        <Stack.Screen name="categories" />
        <Stack.Screen name="cotizar" />
        <Stack.Screen name="insumos" />
        <Stack.Screen name="empaques" />
        <Stack.Screen name="historial" />
        <Stack.Screen name="perfil" />
      </Stack>
    </>
  );
}
