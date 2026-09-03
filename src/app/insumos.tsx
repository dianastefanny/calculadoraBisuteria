import { router } from "expo-router";
import { Text } from "react-native";

import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { TabScreen } from "@/components/tab-screen";

// TODO (backend Laravel): reemplazar por los materiales guardados reales del
// usuario usando el cliente ya preparado en src/api/client.js, por ejemplo:
//   import { fetchMaterials } from "@/api/client";
export const DEMO_MATERIALS = [
  {
    id: "1",
    name: "Mostacilla plateada 4 mm",
    detail: "500 g · $25 por gramo",
  },
];

/**
 * Pestaña Insumos: lista los materiales del usuario (antes vivía en
 * inventory.tsx). Por ahora muestra un material de ejemplo; cuando el
 * backend de Laravel esté listo, esta lista se reemplaza por los materiales
 * reales que devuelva el servidor.
 */
export default function Insumos() {
  // TODO (backend Laravel): reemplazar DEMO_MATERIALS por datos reales, por
  // ejemplo:
  //   const [materials, setMaterials] = useState([]);
  //   useEffect(() => { fetchMaterials().then(setMaterials); }, []);
  return (
    <TabScreen active="insumos">
      <Text className="mb-1 text-xl font-extrabold text-white">Insumos</Text>
      <Text className="mb-6 text-brand-soft-text">
        Materiales y existencias disponibles para tus piezas
      </Text>

      {DEMO_MATERIALS.map((material) => (
        <Card key={material.id} className="mb-3">
          <Text className="text-[17px] font-extrabold text-white">
            {material.name}
          </Text>
          <Text className="mt-1 text-brand-soft-text">{material.detail}</Text>
        </Card>
      ))}

      <Button
        label="+ Nuevo material"
        variant="secondary"
        onPress={() => router.push("/material-form")}
      />
    </TabScreen>
  );
}
