import { router } from "expo-router";
import { useState } from "react";
import { Text } from "react-native";

import {
  forgotPassword,
  getErrorMessage,
  resetPassword,
  verifyResetCode,
} from "@/api/client";
import { Button } from "@/components/button";
import { FormError } from "@/components/form-error";
import { LinkText } from "@/components/link-text";
import { SafeScreen } from "@/components/safe-screen";
import { TextField } from "@/components/text-field";
import { INK_TEXT } from "@/constants/app-theme";

type Step = "email" | "code" | "reset";

/**
 * Recuperación de contraseña, en tres pasos dentro de la misma pantalla:
 *
 * Paso 1 — Enviar código: el usuario escribe su correo. Por seguridad, el
 * backend nunca revela si la cuenta existe o no — solo envía el código si
 * existe, y siempre responde el mismo mensaje genérico.
 *
 * Paso 2 — Verificar código: valida el código de 6 dígitos enviado al
 * correo contra el backend.
 *
 * Paso 3 — Nueva contraseña: guarda la nueva contraseña usando el mismo
 * código ya verificado, y regresa al login.
 *
 * "step" decide en cuál de los tres pasos está la pantalla en cada momento.
 */
export default function ForgotPassword() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Paso 1: se ejecuta al tocar "Enviar código".
  const search = async () => {
    if (!email.trim()) {
      setError("Ingresa tu correo electrónico.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await forgotPassword({ email: email.trim() });
      setStep("code"); // Avanza al paso 2 (verificar código).
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  // Paso 2: se ejecuta al tocar "Verificar código".
  const verifyCode = async () => {
    if (!code.trim()) {
      setError("Ingresa el código que enviamos a tu correo.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await verifyResetCode({ email: email.trim(), code: code.trim() });
      setStep("reset"); // Avanza al paso 3 (nueva contraseña).
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  // Paso 3: se ejecuta al tocar "Guardar Nueva Contraseña".
  const save = async () => {
    if (!newPassword || !confirmPassword) {
      setError("Completa los dos campos de contraseña.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas ingresadas no coinciden.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await resetPassword({
        email: email.trim(),
        code: code.trim(),
        password: newPassword,
        confirmPassword,
      });
      router.replace({
        pathname: "/login",
        params: { notice: "Ingresa ahora con tu nueva contraseña" },
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const titles: Record<Step, string> = {
    email: "Recuperar contraseña",
    code: "Verificar código",
    reset: "Nueva contraseña",
  };

  const subtitles: Record<Step, string> = {
    email: "Ingresa tu correo y te enviaremos un código de verificación.",
    code: "Ingresa el código de 6 dígitos que enviamos a tu correo.",
    reset: "Define una nueva contraseña para tu cuenta.",
  };

  return (
    <SafeScreen scroll>
      <Text className={`text-[29px] font-extrabold ${INK_TEXT}`}>
        {titles[step]}
      </Text>
      <Text className="mb-7 mt-2 text-brand-green">{subtitles[step]}</Text>

      <FormError message={error} />
      {step === "code" && !error && (
        <FormError
          variant="success"
          message="Si el correo está registrado, te enviamos un código. Revisa tu bandeja de entrada e ingrésalo a continuación."
        />
      )}

      {/* Una vez que se avanza de paso, el correo queda fijo (editable solo en el paso 1). */}
      <TextField
        label="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        placeholder="ejemplo@correo.com"
        autoCapitalize="none"
        icon="mail-outline"
        editable={step === "email"}
      />

      {step === "email" && (
        <Button
          label="Enviar código"
          onPress={search}
          loading={submitting}
          className="mt-1"
        />
      )}

      {step === "code" && (
        <>
          <TextField
            label="Código de verificación"
            value={code}
            onChangeText={setCode}
            placeholder=""
            keyboardType="number-pad"
          />
          <Button
            label="Verificar código"
            icon="checkmark-circle-outline"
            onPress={verifyCode}
            loading={submitting}
            className="mt-1"
          />
        </>
      )}

      {step === "reset" && (
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
          <Button
            label="Guardar Nueva Contraseña"
            icon="shield-checkmark-outline"
            onPress={save}
            loading={submitting}
            className="mt-1"
          />
        </>
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
