import { router } from "expo-router";
import { useState } from "react";
import { Text } from "react-native";

import { Button } from "@/components/button";
import { FormError } from "@/components/form-error";
import { LinkText } from "@/components/link-text";
import { SafeScreen } from "@/components/safe-screen";
import { TextField } from "@/components/text-field";
import { DEMO_EMAIL, DEMO_NAME } from "@/constants/demo-auth";

type Step = "email" | "code" | "reset";

/**
 * Recuperación de contraseña, en tres pasos dentro de la misma pantalla:
 *
 * Paso 1 — Buscar cuenta: el usuario escribe su correo y se verifica si
 * existe (por ahora, comparándolo con el correo de prueba DEMO_EMAIL).
 *
 * Paso 2 — Verificar código: se simula el envío de un código al correo
 * (DEMO_RECOVERY_CODE) y el usuario debe introducirlo para continuar.
 *
 * Paso 3 — Nueva contraseña: si el código es correcto, se muestran los
 * campos para escribir y confirmar la nueva contraseña. Al guardar, se
 * regresa al login con un aviso de que ya puede entrar con la contraseña
 * nueva.
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
    //   // El backend es quien debe enviar el código real al correo.
    if (email.trim().toLowerCase() !== DEMO_EMAIL) {
      setError("No encontramos ninguna cuenta con ese correo.");
      return;
    }

    setError(null);
    setStep("code"); // Avanza al paso 2 (verificar código).
  };

  // Paso 2: se ejecuta al tocar "Verificar código".
  const verifyCode = () => {
    if (!code.trim()) {
      setError("Ingresa el código que enviamos a tu correo.");
      return;
    }

    // Todavía no hay backend real que genere, envíe y verifique el código, así
    // que por ahora solo se valida que se haya escrito algo.
    //
    // TODO (backend Laravel): reemplazar esta validación por una llamada real
    // usando el cliente ya preparado en src/api/client.js, por ejemplo:
    //   import { verifyRecoveryCode } from "@/api/client";
    //   const data = await verifyRecoveryCode({ ...datosQueDefinaLaravel });
    //   // Si el código no es correcto, el backend debe indicarlo aquí.

    setError(null);
    setStep("reset"); // Avanza al paso 3 (nueva contraseña).
  };

  // Paso 3: se ejecuta al tocar "Guardar Nueva Contraseña".
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

  const titles: Record<Step, string> = {
    email: "Recuperar contraseña",
    code: "Verificar código",
    reset: "Nueva contraseña",
  };

  const subtitles: Record<Step, string> = {
    email: "Ingresa tu correo y verificaremos tu cuenta.",
    code: "Ingresa el código de 6 dígitos que enviamos a tu correo.",
    reset: "Define una nueva contraseña para tu cuenta.",
  };

  return (
    <SafeScreen scroll>
      <Text className="text-[29px] font-extrabold text-white">
        {titles[step]}
      </Text>
      <Text className="mb-7 mt-2 text-brand-green">{subtitles[step]}</Text>

      <FormError message={error} />
      {step === "code" && !error && (
        <FormError
          variant="success"
          message={`¡Cuenta encontrada! ${DEMO_NAME}. Revisa tu correo e ingresa el código a continuación.`}
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
        <Button label="Buscar cuenta" onPress={search} className="mt-1" />
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
