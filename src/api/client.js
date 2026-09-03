// -----------------------------------------------------------------------
// Este archivo va a ser el "conector" entre la app y el backend de Laravel.
// Todavía está desactivado (todo comentado) porque el backend no está listo.
// Cuando esté disponible, se descomenta este código y se cambia
// "TU_IP_LOCAL" por la dirección real del servidor.
//
// Una vez activo, cualquier pantalla podrá hacer peticiones así:
//   import api from '@/api/client';
//   api.get('/materiales');
// -----------------------------------------------------------------------

// import axios from "axios";
// import * as SecureStore from "expo-secure-store";

// Crea un "cliente" de peticiones ya configurado con la dirección del servidor,
// para no tener que escribirla completa cada vez que se llama a la API.
// const api = axios.create({
//   baseURL: "http://TU_IP_LOCAL:8000/api", // ej: 192.168.1.10
// });

// Antes de enviar CUALQUIER petición, esto agrega automáticamente el token
// de sesión guardado (si existe) para que el servidor sepa quién es el usuario.
// api.interceptors.request.use(async (config) => {
//   const token = await SecureStore.getItemAsync("auth_token");
//   if (token) config.headers.Authorization = Bearer ${token};
//   return config;
// });

// export default api;

// -----------------------------------------------------------------------
// A partir de aquí, ejemplos de las funciones que cada pantalla va a poder
// importar y usar cuando el backend confirme sus endpoints y campos reales.
// Ninguna está activa todavía: son la "estructura preparada" para no tener
// que rehacer las pantallas más adelante, solo descomentar y ajustar la
// ruta/los campos exactos que defina Laravel.
// -----------------------------------------------------------------------

// ---- Autenticación (usadas por login.tsx, register.tsx, forgot-password.tsx, home.tsx) ----

// export async function loginUser(payload) {
//   const { data } = await api.post("/RUTA_QUE_DEFINA_LARAVEL", payload);
//   // El backend debe indicar cómo devuelve el token; guardarlo así habilita
//   // que el interceptor de arriba lo agregue automáticamente a cada petición.
//   // await SecureStore.setItemAsync("auth_token", data.token);
//   return data;
// }

// export async function registerUser(payload) {
//   const { data } = await api.post("/RUTA_QUE_DEFINA_LARAVEL", payload);
//   return data;
// }

// export async function findAccountByEmail(payload) {
//   // Paso 1 de "Recuperar contraseña": confirmar si existe una cuenta con ese correo.
//   const { data } = await api.post("/RUTA_QUE_DEFINA_LARAVEL", payload);
//   return data;
// }

// export async function resetPassword(payload) {
//   // Paso 2 de "Recuperar contraseña": guardar la nueva contraseña.
//   const { data } = await api.post("/RUTA_QUE_DEFINA_LARAVEL", payload);
//   return data;
// }

// export async function logoutUser() {
//   // TODO: si Laravel necesita invalidar el token en el servidor, agregar
//   // aquí la petición correspondiente antes de borrarlo localmente.
//   await SecureStore.deleteItemAsync("auth_token");
// }

// ---- Inventario (usadas por inventory.tsx y material-form.tsx) ----

// export async function fetchMaterials() {
//   const { data } = await api.get("/RUTA_QUE_DEFINA_LARAVEL");
//   return data;
// }

// export async function createMaterial(payload) {
//   const { data } = await api.post("/RUTA_QUE_DEFINA_LARAVEL", payload);
//   return data;
// }

// ---- Categorías (usadas por categories.tsx) ----

// export async function fetchCategories() {
//   const { data } = await api.get("/RUTA_QUE_DEFINA_LARAVEL");
//   return data;
// }

// export async function createCategory(payload) {
//   const { data } = await api.post("/RUTA_QUE_DEFINA_LARAVEL", payload);
//   return data;
// }
