import { Text } from "react-native";

import { Card } from "@/components/card";
import { TabScreen } from "@/components/tab-screen";

// TODO (backend Laravel): reemplazar por los empaques guardados reales del
// usuario usando el cliente ya preparado en src/api/client.js.
export const DEMO_PACKAGING_OPTIONS = [
  { id: "1", name: "Tulita", cost: "+2.000$" },
  { id: "2", name: "Caja Regalo Joyería", cost: "+2.500$" },
];

/**
 * Pestaña Empaques: clases de empaque guardadas por el usuario, usadas al
 * cotizar una pieza. No se proporcionó una imagen de referencia dedicada
 * para esta pantalla, así que mantiene la misma estructura visual usada en
 * la sección de empaques del cotizador.
 */
export default function Empaques() {
  return (
    <TabScreen active="empaques">
      <Text className="mb-1 text-xl font-extrabold text-white">Empaques</Text>
      <Text className="mb-6 text-brand-soft-text">
        Tus clases de empaque y presentación guardadas
      </Text>

      {DEMO_PACKAGING_OPTIONS.map((option) => (
        <Card key={option.id} className="mb-3">
          <Text className="text-[17px] font-extrabold text-white">
            {option.name}
          </Text>
          <Text className="mt-1 text-brand-turquoise">{option.cost}</Text>
        </Card>
      ))}
    </TabScreen>
  );
}
