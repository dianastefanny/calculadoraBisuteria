import { router } from "expo-router";
import { useState } from "react";
import { Text } from "react-native";

import { Button } from "@/components/button";
import { FormError } from "@/components/form-error";
import { LinkText } from "@/components/link-text";
import { SafeScreen } from "@/components/safe-screen";
import { TextField } from "@/components/text-field";

/** Solicita la recuperación sin revelar si un correo existe en el sistema. */
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const submit = () => {
    if (email.trim()) setSent(true);
  };

  return (
    <SafeScreen scroll>
      <Text className="text-[29px] font-extrabold text-white">
        Recuperar contraseña
      </Text>
      <Text className="mb-7 mt-2 text-brand-soft-text">
        Ingresa tu correo y te enviaremos las instrucciones.
      </Text>

      <FormError
        variant="success"
        message={
          sent
            ? "Si existe una cuenta con este correo, recibirás las instrucciones."
            : null
        }
      />

      <TextField
        label="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        placeholder="ejemplo@correo.com"
        autoCapitalize="none"
      />

      <Button label="Enviar instrucciones" onPress={submit} className="mt-1" />

      <LinkText
        label="¿Recordaste tu contraseña?"
        actionLabel="Inicia sesión"
        onPress={() => router.back()}
        className="mt-5"
      />
    </SafeScreen>
  );
}
