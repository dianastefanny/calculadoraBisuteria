import { Text } from "react-native";

import { Card } from "@/components/card";
import { TabScreen } from "@/components/tab-screen";

/**
 * Pestaña Historial: piezas cotizadas anteriormente. No se proporcionó una
 * imagen de referencia dedicada para esta pantalla; por ahora solo muestra
 * la estructura visual base a la espera del backend de Laravel.
 */
export default function Historial() {
  // TODO (backend Laravel): reemplazar por el historial real de piezas
  // cotizadas usando el cliente ya preparado en src/api/client.js, por ejemplo:
  //   import { fetchQuoteHistory } from "@/api/client";
  //   const [quotes, setQuotes] = useState([]);
  //   useEffect(() => { fetchQuoteHistory().then(setQuotes); }, []);
  return (
    <TabScreen active="historial">
      <Text className="mb-1 text-xl font-extrabold text-white">Historial</Text>
      <Text className="mb-6 text-brand-green">
        Piezas que has cotizado anteriormente
      </Text>

      <Card>
        <Text className="text-center text-brand-soft-text">
          Aún no has cotizado ninguna pieza.
        </Text>
      </Card>
    </TabScreen>
  );
}
