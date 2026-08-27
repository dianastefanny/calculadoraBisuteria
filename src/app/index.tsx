import { Redirect } from 'expo-router';

/** Ruta técnica que dirige al usuario al inicio de sesión. */
export default function Index() {
  return <Redirect href="/login" />;
}
