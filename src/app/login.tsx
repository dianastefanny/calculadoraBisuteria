import { router, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import { Text } from "react-native";

import { fetchConfiguration, getErrorMessage, loginUser } from "@/api/client";
import { BrandHeader } from "@/components/brand-header";
import { Button } from "@/components/button";
import { FormError } from "@/components/form-error";
import { LinkText } from "@/components/link-text";
import { SafeScreen } from "@/components/safe-screen";
import { TextField } from "@/components/text-field";
import { INK_TEXT } from "@/constants/app-theme";
import { setCurrency } from "@/constants/currency-store";

/**
 * Pantalla de inicio de sesión, conectada al backend de Laravel.
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
  const [submitting, setSubmitting] = useState(false);
  const { setColorScheme } = useColorScheme();

  // Se ejecuta al tocar el botón "Iniciar sesión" y valida el formulario.
  const submit = async () => {
    // Paso 1: no dejar enviar el formulario con campos vacíos.
    if (!email.trim() || !password) {
      setError("Por favor, ingresa tu correo electrónico y contraseña.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await loginUser({ email: email.trim(), password });

      // Aplica el modo claro/oscuro y la moneda que el usuario dejó
      // guardados en su cuenta la última vez. Si falla, no bloquea el
      // inicio de sesión — simplemente se queda con lo que ya estaba activo.
      try {
        const configuration = await fetchConfiguration();
        if (configuration.theme === "dark" || configuration.theme === "light") {
          setColorScheme(configuration.theme);
        }
        if (
          configuration.currency === "COP" ||
          configuration.currency === "USD" ||
          configuration.currency === "EUR"
        ) {
          setCurrency(configuration.currency);
        }
      } catch {
        // Ignorar: el tema y la moneda no son críticos para poder entrar a la app.
      }

      router.replace("/inicio");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeScreen scroll contentContainerClassName="flex-grow justify-center">
      <BrandHeader />
      <Text className={`text-2xl font-extrabold ${INK_TEXT}`}>
        Inicio de sesión
      </Text>
      <Text className="mb-6 mt-2 text-brand-green">
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

      <Button
        label="Iniciar sesión →"
        onPress={submit}
        loading={submitting}
      />

      <LinkText
        label="¿No tienes cuenta?"
        actionLabel="Regístrate"
        onPress={() => router.push("/register")}
        className="mt-4"
      />
    </SafeScreen>
  );
}
