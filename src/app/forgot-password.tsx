import { router } from "expo-router";
import { useState } from "react";
import { Text } from "react-native";

import { Button } from "@/components/button";
import { FormError } from "@/components/form-error";
import { LinkText } from "@/components/link-text";
import { SafeScreen } from "@/components/safe-screen";
import { TextField } from "@/components/text-field";
import { DEMO_EMAIL, DEMO_NAME } from "@/constants/demo-auth";

/**
 * Recuperación de contraseña, en dos pasos dentro de la misma pantalla:
 *
 * Paso 1 — Buscar cuenta: el usuario escribe su correo y se verifica si
 * existe (por ahora, comparándolo con el correo de prueba DEMO_EMAIL).
 *
 * Paso 2 — Nueva contraseña: si la cuenta existe, se muestran los campos
 * para escribir y confirmar la nueva contraseña. Al guardar, se regresa al
 * login con un aviso de que ya puede entrar con la contraseña nueva.
 *
 * "found" (encontrada) es la variable que decide en cuál de los dos pasos
 * está la pantalla en cada momento.
 */
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [found, setFound] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Paso 1: se ejecuta al tocar "Buscar cuenta".
  const search = () => {
    if (!email.trim()) {
      setError("Ingresa tu correo electrónico.");
      return;
    }

    // Compara con el correo de prueba porque todavía no hay backend real
    // donde consultar si la cuenta existe de verdad.
    //
    // TODO (backend Laravel): reemplazar esta comparación por una llamada real
    // usando el cliente ya preparado en src/api/client.js, por ejemplo:
    //   import { findAccountByEmail } from "@/api/client";
    //   const data = await findAccountByEmail({ ...datosQueDefinaLaravel });
    if (email.trim().toLowerCase() !== DEMO_EMAIL) {
      setError("No encontramos ninguna cuenta con ese correo.");
      return;
    }

    setError(null);
    setFound(true); // Avanza al paso 2 (nueva contraseña).
  };

  // Paso 2: se ejecuta al tocar "Guardar Nueva Contraseña".
  const save = () => {
    if (!newPassword || !confirmPassword) {
      setError("Completa los dos campos de contraseña.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas ingresadas no coinciden.");
      return;
    }

    // Todavía no se guarda en un servidor real: solo regresa al login
    // mostrando el aviso de que ya puede iniciar sesión con la contraseña nueva.
    //
    // TODO (backend Laravel): reemplazar esta simulación por una llamada real
    // usando el cliente ya preparado en src/api/client.js, por ejemplo:
    //   import { resetPassword } from "@/api/client";
    //   await resetPassword({ ...datosQueDefinaLaravel });
    router.replace({
      pathname: "/login",
      params: { notice: "Ingresa ahora con tu nueva contraseña" },
    });
  };

  return (
    <SafeScreen scroll>
      <Text className="text-[29px] font-extrabold text-white">
        Recuperar contraseña
      </Text>
      <Text className="mb-7 mt-2 text-brand-soft-text">
        {found
          ? "Define una nueva contraseña para tu cuenta."
          : "Ingresa tu correo y verificaremos tu cuenta."}
      </Text>

      <FormError message={error} />
      {found && !error && (
        <FormError
          variant="success"
          message={`¡Cuenta encontrada! ${DEMO_NAME}. Ingresa tu nueva contraseña a continuación`}
        />
      )}

      {/* Una vez encontrada la cuenta, el correo queda fijo (editable={!found}) para que no se pueda cambiar en este paso. */}
      <TextField
        label="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        placeholder="ejemplo@correo.com"
        autoCapitalize="none"
        icon="mail-outline"
        editable={!found}
      />

      {found && (
        <>
          <TextField
            label="Nueva contraseña"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Introduce la contraseña aquí"
            secureTextEntry
            icon="lock-closed-outline"
          />
          <TextField
            label="Confirmar nueva contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Introduce la contraseña aquí"
            secureTextEntry
            icon="lock-closed-outline"
          />
        </>
      )}

      {/* El botón cambia según el paso en el que esté la pantalla. */}
      {found ? (
        <Button
          label="Guardar Nueva Contraseña"
          icon="shield-checkmark-outline"
          onPress={save}
          className="mt-1"
        />
      ) : (
        <Button label="Buscar cuenta" onPress={search} className="mt-1" />
      )}

      <LinkText
        label="¿Recordaste tu contraseña?"
        actionLabel="Inicia sesión"
        onPress={() => router.back()}
        className="mt-5"
      />
    </SafeScreen>
  );
}
