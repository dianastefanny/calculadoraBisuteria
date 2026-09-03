import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, View } from "react-native";

import { Card } from "@/components/card";
import { TabScreen } from "@/components/tab-screen";
import { DEMO_NAME, DEMO_EMAIL } from "@/constants/demo-auth";

/**
 * Pestaña Perfil: datos de la cuenta del usuario. No se proporcionó una
 * imagen de referencia dedicada para esta pantalla; por ahora solo muestra
 * la estructura visual base con los datos de la cuenta de prueba.
 */
export default function Perfil() {
  // TODO (backend Laravel): reemplazar DEMO_NAME/DEMO_EMAIL por los datos
  // reales del usuario autenticado usando el cliente ya preparado en
  // src/api/client.js, por ejemplo:
  //   import { fetchProfile } from "@/api/client";
  return (
    <TabScreen active="perfil">
      <Text className="mb-6 text-xl font-extrabold text-white">Perfil</Text>

      <Card className="flex-row items-center gap-4">
        <View className="h-14 w-14 items-center justify-center rounded-full bg-brand-green">
          <Ionicons name="person" size={26} color="#fff" />
        </View>
        <View className="flex-1">
          <Text className="text-[17px] font-extrabold text-white">
            {DEMO_NAME}
          </Text>
          <Text className="mt-1 text-brand-soft-text">{DEMO_EMAIL}</Text>
        </View>
      </Card>
    </TabScreen>
  );
}
