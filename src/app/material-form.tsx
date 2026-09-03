import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { AppColors } from "@/constants/app-theme";

/**
 * Formulario para registrar un material nuevo (nombre, costo y cantidad en
 * stock). Todavía no guarda nada de verdad: el botón "Guardar material" está
 * listo para conectarse a Laravel, pero por ahora no hace ninguna acción.
 */
export default function MaterialForm() {
  // Lo que el usuario va escribiendo en cada campo.
  const [name, setName] = useState("");
  const [cost, setCost] = useState("");
  const [stock, setStock] = useState("");

  // Se ejecutará al tocar "Guardar material". Queda vacía a propósito: falta
  // validar que el costo y el stock no sean números negativos.
  //
  // TODO (backend Laravel): reemplazar esto por una llamada real usando el
  // cliente ya preparado en src/api/client.js, por ejemplo:
  //   import { createMaterial } from "@/api/client";
  //   await createMaterial({ ...datosQueDefinaLaravel });
  const save = () => {};

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Nuevo material</Text>

      <Text style={styles.label}>Nombre</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Ej. Mostacilla plateada 4 mm"
        placeholderTextColor="#A8F5F0"
      />

      <Text style={styles.label}>Costo unitario</Text>
      <TextInput
        style={styles.input}
        value={cost}
        onChangeText={setCost}
        keyboardType="numeric"
        placeholder="0"
        placeholderTextColor="#A8F5F0"
      />

      <Text style={styles.label}>Stock actual</Text>
      <TextInput
        style={styles.input}
        value={stock}
        onChangeText={setStock}
        keyboardType="numeric"
        placeholder="0"
        placeholderTextColor="#A8F5F0"
      />

      <Pressable style={styles.button} onPress={save}>
        <Text style={styles.buttonText}>Guardar material</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AppColors.background,
    padding: 30,
    paddingTop: 75,
  },
  title: { color: "#fff", fontSize: 29, fontWeight: "800", marginBottom: 25 },
  label: { color: "#fff", fontWeight: "700", marginBottom: 7 },
  input: {
    backgroundColor: AppColors.input,
    borderWidth: 1,
    borderColor: AppColors.inputBorder,
    borderRadius: 9,
    padding: 14,
    color: "#fff",
    marginBottom: 15,
  },
  button: {
    backgroundColor: AppColors.green,
    borderRadius: 9,
    padding: 15,
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontWeight: "800", textAlign: "center" },
});
