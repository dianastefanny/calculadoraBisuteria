import { router } from "expo-router";
import { useState } from "react";
import { Text } from "react-native";

import { Button } from "@/components/button";
import { FormError } from "@/components/form-error";
import { LinkText } from "@/components/link-text";
import { SafeScreen } from "@/components/safe-screen";
import { TextField } from "@/components/text-field";

// Reglas de validación del formulario de registro.
const NAME_REGEX = /^[A-Za-zÁÉÍÓÚÜáéíóúüÑñ\s]+$/;
const PHONE_REGEX = /^[0-9+\-\s()]{7,15}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Mínimo 8 caracteres, con al menos una mayúscula, una minúscula, un número
// y un carácter especial (el texto de ayuda debajo del campo explica esto mismo al usuario).
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,}$/;

/**
 * Pantalla de registro de nuevos usuarios. Por ahora no envía nada a un
 * servidor real (todavía no existe Laravel conectado): valida los datos en
 * el propio celular y, si están correctos, simula que la cuenta se creó y
 * regresa al login.
 */
export default function Register() {
  // Lo que el usuario va escribiendo en cada campo del formulario.
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  // Teléfono es opcional, por eso no entra en la validación de campos obligatorios.
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  // Mensaje de error a mostrar arriba del formulario (null = sin error).
  const [error, setError] = useState<string | null>(null);

  // Se ejecuta al tocar el botón "Crear cuenta".
  const submit = () => {
    // Paso 1: todos los campos son obligatorios, excepto el teléfono.
    if (!name.trim() || !lastName.trim() || !email.trim() || !password || !confirm) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    // Paso 2: el nombre y el apellido solo pueden tener letras, espacios, tildes y ñ.
    if (!NAME_REGEX.test(name.trim()) || !NAME_REGEX.test(lastName.trim())) {
      setError("El nombre y el apellido solo pueden contener letras y espacios.");
      return;
    }

    // Paso 3: si se escribió un teléfono, debe tener un formato válido.
    if (phone.trim() && !PHONE_REGEX.test(phone.trim())) {
      setError("Ingresa un número de teléfono válido.");
      return;
    }

    // Paso 4: el correo debe tener un formato válido (algo@algo.algo).
    if (!EMAIL_REGEX.test(email.trim())) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }

    // Paso 5: la contraseña debe cumplir los requisitos de seguridad
    // (el texto de ayuda debajo del campo se los explica al usuario).
    if (!PASSWORD_REGEX.test(password)) {
      setError("La contraseña no cumple los requisitos indicados abajo.");
      return;
    }

    // Paso 6: las dos contraseñas escritas deben ser iguales.
    if (password !== confirm) {
      setError("Las contraseñas ingresadas no coinciden.");
      return;
    }

    setError(null);

    // TODO (backend Laravel): cuando el endpoint de registro esté definido,
    // reemplazar esta simulación por una llamada real usando el cliente ya
    // preparado en src/api/client.js, por ejemplo:
    //   import api from "@/api/client";
    //   await api.post("/RUTA_QUE_DEFINA_LARAVEL", { ...datosQueDefinaLaravel });
    // Por ahora se sigue simulando el éxito y regresando al login.
    router.replace({
      pathname: "/login",
      params: { notice: "Cuenta creada correctamente. Ingresa para continuar." },
    });
  };

  return (
    <SafeScreen scroll>
      <Text className="text-[30px] font-extrabold text-white">Registro</Text>
      <Text className="mb-6 mt-2 text-brand-green">
        Regístrate para comenzar a utilizar Cuenta Cuentas
      </Text>

      <FormError message={error} />

      <TextField
        label="Nombre completo"
        value={name}
        onChangeText={setName}
        placeholder="Tu nombre"
        icon="person-outline"
      />

      <TextField
        label="Apellido"
        value={lastName}
        onChangeText={setLastName}
        placeholder="Tu apellido"
        icon="person-outline"
      />

      <TextField
        label="Teléfono (opcional)"
        value={phone}
        onChangeText={setPhone}
        placeholder="Ej. 3001234567"
        keyboardType="phone-pad"
        icon="call-outline"
      />

      <TextField
        label="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        placeholder="ejemplo@correo.com"
        autoCapitalize="none"
        keyboardType="email-address"
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
      <Text className="-mt-3 mb-4 text-xs text-brand-soft-text">
        La contraseña debe tener mínimo 8 caracteres, con al menos una
        mayúscula, una minúscula, un número y un carácter especial.
      </Text>

      <TextField
        label="Confirmar contraseña"
        value={confirm}
        onChangeText={setConfirm}
        placeholder="Repite tu contraseña"
        secureTextEntry
        icon="lock-closed-outline"
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
