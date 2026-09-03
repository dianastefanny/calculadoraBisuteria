import { Redirect } from "expo-router";

/**
 * Esta pantalla no se ve nunca: es la dirección "raíz" de la app (la primera
 * que se abre) y su único trabajo es mandar automáticamente al usuario a la
 * pantalla de inicio de sesión.
 */
export default function Index() {
  return <Redirect href="/login" />;
}
