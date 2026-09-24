import { Tabs } from "expo-router";

/**
 * Layout de las 7 pantallas posteriores al inicio de sesión. Usa el
 * navegador de pestañas nativo de Expo Router (en vez del <Stack> +
 * router.replace de antes) para que cada pantalla se monte una sola vez y
 * quede viva en memoria: cambiar de pestaña ya no destruye ni recrea nada,
 * así que no hay pantalla en blanco ni recarga cada vez.
 *
 * La barra de pestañas nativa queda oculta (tabBar={() => null}) porque
 * cada pantalla sigue dibujando su propia barra con el mismo aspecto de
 * siempre, vía TabScreen -> BottomNav — visualmente no cambia nada.
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={() => null}
    >
      <Tabs.Screen name="materiales" />
      <Tabs.Screen name="empaques" />
      <Tabs.Screen name="disenos" />
      <Tabs.Screen name="inicio" />
      <Tabs.Screen name="calculos" />
      <Tabs.Screen name="historial" />
      <Tabs.Screen name="configuraciones" />
    </Tabs>
  );
}
