import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Text } from "react-native";

import { BrandHeader } from "@/components/brand-header";
import { Button } from "@/components/button";
import { FormError } from "@/components/form-error";
import { LinkText } from "@/components/link-text";
import { SafeScreen } from "@/components/safe-screen";
import { TextField } from "@/components/text-field";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/constants/demo-auth";

/**
 * Pantalla de inicio de sesión. Por ahora las credenciales se comparan
 * contra un usuario de prueba (DEMO_EMAIL/DEMO_PASSWORD) porque todavía no
 * hay conexión con el backend de Laravel; cuando exista, esta comparación se
 * reemplaza por una petición real al servidor.
 */
export default function Login() {
  // "notice" es un mensaje opcional que llega desde otra pantalla (por
  // ejemplo, desde "Recuperar contraseña" al terminar de cambiarla, o desde
  // "Registro" al crear la cuenta), para avisar aquí que todo salió bien.
  const { notice } = useLocalSearchParams<{ notice?: string }>();

  // Lo que el usuario va escribiendo en cada campo.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Mensaje de error a mostrar arriba del formulario (null = sin error).
  const [error, setError] = useState<string | null>(null);

  // Se ejecuta al tocar el botón "Iniciar sesión y valida el formulario".
  const submit = () => {
    // Paso 1: no dejar enviar el formulario con campos vacíos.
    if (!email.trim() || !password) {
      setError("Por favor, ingresa tu correo electrónico y contraseña.");
      return;
    }

    // Paso 2: comparar contra el usuario de prueba y avanzar al menú principal si coincide.
    //
    // TODO (backend Laravel): reemplazar esta comparación local por una
    // llamada real usando el cliente ya preparado en src/api/client.js, por ejemplo:
    //   import { loginUser } from "@/api/client";
    //   const data = await loginUser({ ...datosQueDefinaLaravel });
    //   // loginUser ya deja preparado el guardado del token con expo-secure-store.
    if (
      email.trim().toLowerCase() === DEMO_EMAIL &&
      password === DEMO_PASSWORD
    ) {
      setError(null);
      router.replace("/cotizar");
    } else {
      setError("El correo electrónico o la contraseña no son correctos.");
    }
  };

  return (
    <SafeScreen scroll contentContainerClassName="flex-grow justify-center">
      <BrandHeader />
      <Text className="text-2xl font-extrabold text-white">
        Inicio de sesión
      </Text>
      <Text className="mb-6 mt-2 text-brand-soft-text">
        Ingresa tus credenciales para continuar
      </Text>

      {/* Aviso de error de credenciales (si lo hay). */}
      <FormError message={error} />
      {/* Aviso de éxito que llega desde otra pantalla (solo si no hay un error más urgente que mostrar). */}
      {!error && <FormError variant="success" message={notice} />}

      <TextField
        label="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        placeholder="ejemplo@correo.com"
        autoCapitalize="none"
        icon="mail-outline"
      />
      <TextField
        label="Contraseña"
        value={password}
        onChangeText={setPassword}
        placeholder="Introduce tu contraseña"
        secureTextEntry
        icon="lock-closed-outline"
      />

      <Text
        onPress={() => router.push("/forgot-password")}
        className="mb-5 text-right font-bold text-brand-turquoise underline"
      >
        ¿Olvidaste tu contraseña?
      </Text>

      <Button label="Iniciar sesión →" onPress={submit} />

      <LinkText
        label="¿No tienes cuenta?"
        actionLabel="Regístrate"
        onPress={() => router.push("/register")}
        className="mt-4"
      />
    </SafeScreen>
  );
}
