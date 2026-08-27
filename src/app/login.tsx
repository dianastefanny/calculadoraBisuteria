import { router } from "expo-router";
import { useState } from "react";
import { Text } from "react-native";

import { BrandHeader } from "@/components/brand-header";
import { Button } from "@/components/button";
import { FormError } from "@/components/form-error";
import { LinkText } from "@/components/link-text";
import { SafeScreen } from "@/components/safe-screen";
import { TextField } from "@/components/text-field";

const DEMO_EMAIL = "usuario@cuentacuentas.com";
const DEMO_PASSWORD = "123456";

/** Pantalla de inicio de sesión; luego conectará las credenciales con Laravel. */
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (!email.trim() || !password) {
      setError("Por favor, ingresa tu correo electrónico y contraseña.");
      return;
    }

    if (
      email.trim().toLowerCase() === DEMO_EMAIL &&
      password === DEMO_PASSWORD
    ) {
      setError(null);
      router.replace("/home");
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

      <FormError message={error} />

      <TextField
        label="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        placeholder="ejemplo@correo.com"
        autoCapitalize="none"
      />
      <TextField
        label="Contraseña"
        value={password}
        onChangeText={setPassword}
        placeholder="Introduce tu contraseña"
        secureTextEntry
      />

      <Button label="Iniciar sesión →" onPress={submit} />

      <Text
        onPress={() => router.push("/forgot-password")}
        className="mt-4 text-center font-bold text-brand-turquoise underline"
      >
        ¿Olvidaste tu contraseña?
      </Text>
      <LinkText
        label="¿No tienes cuenta?"
        actionLabel="Regístrate"
        onPress={() => router.push("/register")}
        className="mt-3"
      />
    </SafeScreen>
  );
}
