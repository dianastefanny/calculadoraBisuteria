import { router } from "expo-router";
import { useState } from "react";
import { Alert, Text } from "react-native";

import { Button } from "@/components/button";
import { FormError } from "@/components/form-error";
import { LinkText } from "@/components/link-text";
import { SafeScreen } from "@/components/safe-screen";
import { TextField } from "@/components/text-field";

/** Pantalla de registro de nuevos usuarios. */
export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (!name.trim() || !email.trim() || !password || !confirm) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    if (password !== confirm) {
      setError("Las contraseñas ingresadas no coinciden.");
      return;
    }

    if (!email.includes("@")) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }

    setError(null);

    // Registro temporal mientras se conecta la aplicación con Laravel.
    Alert.alert(
      "Registro exitoso",
      "La cuenta fue registrada correctamente.",
      [{ text: "Continuar", onPress: () => router.replace("/login") }],
    );
  };

  return (
    <SafeScreen scroll>
      <Text className="text-[30px] font-extrabold text-white">Registro</Text>
      <Text className="mb-6 mt-2 text-brand-soft-text">
        Regístrate para comenzar a utilizar Cuenta Cuentas
      </Text>

      <FormError message={error} />

      <TextField label="Nombre completo" value={name} onChangeText={setName} placeholder="Tu nombre" />

      <TextField
        label="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        placeholder="ejemplo@correo.com"
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextField
        label="Contraseña"
        value={password}
        onChangeText={setPassword}
        placeholder="Introduce tu contraseña"
        secureTextEntry
      />

      <TextField
        label="Confirmar contraseña"
        value={confirm}
        onChangeText={setConfirm}
        placeholder="Repite tu contraseña"
        secureTextEntry
      />

      <Button label="Crear cuenta" onPress={submit} className="mt-1" />

      <LinkText
        label="¿Ya tienes cuenta?"
        actionLabel="Inicia sesión"
        onPress={() => router.back()}
        className="mt-5"
      />
    </SafeScreen>
  );
}
