import { router } from "expo-router";
import { Text } from "react-native";

import { Card } from "@/components/card";
import { SafeScreen } from "@/components/safe-screen";
import { ScreenHeader } from "@/components/screen-header";

/**
 * Pantalla de Inventario: por ahora muestra un material de ejemplo escrito
 * directamente en el código. Cuando el backend de Laravel esté listo, esta
 * lista se reemplaza por los materiales reales que devuelva el servidor.
 */
export default function Inventory() {
  // TODO (backend Laravel): reemplazar el material de ejemplo de abajo por
  // datos reales usando el cliente ya preparado en src/api/client.js, por ejemplo:
  //   import { fetchMaterials } from "@/api/client";
  //   const [materials, setMaterials] = useState([]);
  //   useEffect(() => { fetchMaterials().then(setMaterials); }, []);
  return (
    <SafeScreen>
      {/* La flecha de "volver" regresa siempre a la pantalla anterior (el menú principal). */}
      <ScreenHeader title="Inventario" onBack={() => router.back()} />

      <Card>
        <Text className="text-[17px] font-extrabold text-white">
          Mostacilla plateada 4 mm
        </Text>
        <Text className="mt-1 text-brand-soft-text">
          500 g · $25 por gramo
        </Text>
      </Card>
    </SafeScreen>
  );
}
