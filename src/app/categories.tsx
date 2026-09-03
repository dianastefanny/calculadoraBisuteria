import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { AppColors } from "@/constants/app-theme";

/**
 * Pantalla de Categorías: permite crear categorías para organizar los
 * materiales del inventario (por ejemplo "Mostacillas", "Hilos"). Por ahora
 * la lista vive solo en la memoria del celular (se pierde al cerrar la app);
 * cuando exista el backend de Laravel, se guardará y leerá desde ahí.
 */
// TODO (backend Laravel): reemplazar la lista de ejemplo de abajo por datos
// reales usando el cliente ya preparado en src/api/client.js, por ejemplo:
//   import { fetchCategories } from "@/api/client";
//   const [categories, setCategories] = useState([]);
//   useEffect(() => { fetchCategories().then(setCategories); }, []);
export default function Categories() {
  // Texto que el usuario escribe para crear una categoría nueva.
  const [name, setName] = useState("");
  // Lista de categorías ya creadas, con algunas de ejemplo precargadas.
  const [categories, setCategories] = useState([
    "Mostacillas",
    "Hilos",
    "Empaques",
  ]);

  // Se ejecuta al tocar "Crear categoría": agrega el texto escrito a la
  // lista (si no está vacío) y limpia el campo para poder escribir otra.
  //
  // TODO (backend Laravel): además de agregarla localmente, llamar al cliente
  // ya preparado en src/api/client.js, por ejemplo:
  //   import { createCategory } from "@/api/client";
  //   await createCategory({ ...datosQueDefinaLaravel });
  const create = () => {
    if (name.trim()) {
      setCategories([...categories, name.trim()]);
      setName("");
    }
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Categorías</Text>
      <Text style={styles.subtitle}>Organiza los materiales de tu negocio.</Text>

      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Ej. Piedras"
        placeholderTextColor="#A8F5F0"
      />

      <Pressable style={styles.button} onPress={create}>
        <Text style={styles.buttonText}>Crear categoría</Text>
      </Pressable>

      {/* Dibuja una tarjeta por cada categoría que exista en la lista. */}
      {categories.map((category) => (
        <View key={category} style={styles.card}>
          <Text style={styles.cardText}>{category}</Text>
        </View>
      ))}
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
  title: { color: "#fff", fontSize: 29, fontWeight: "800" },
  subtitle: { color: AppColors.softText, marginTop: 7, marginBottom: 23 },
  input: {
    backgroundColor: AppColors.input,
    borderWidth: 1,
    borderColor: AppColors.inputBorder,
    borderRadius: 9,
    padding: 14,
    color: "#fff",
  },
  button: {
    backgroundColor: AppColors.green,
    borderRadius: 9,
    padding: 15,
    marginVertical: 15,
  },
  buttonText: { color: "#fff", fontWeight: "800", textAlign: "center" },
  card: {
    backgroundColor: AppColors.input,
    borderColor: AppColors.inputBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  cardText: { color: "#fff", fontWeight: "700" },
});
