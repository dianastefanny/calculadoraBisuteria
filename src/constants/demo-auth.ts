// Credenciales de "usuario de prueba" que usa toda la app MIENTRAS todavía no
// existe conexión real con el backend de Laravel. Se usan para simular que
// alguien ya tiene una cuenta creada, tanto al iniciar sesión como al
// recuperar la contraseña.
//
// IMPORTANTE: cuando se conecte la API de Laravel, este archivo (y las
// validaciones que lo usan en login.tsx y forgot-password.tsx) se debe
// reemplazar por la verificación real contra el servidor.
export const DEMO_EMAIL = "usuario@cuentacuentas.com";
export const DEMO_PASSWORD = "Ana123+";
export const DEMO_NAME = "Usuario Demo"; // Nombre que se muestra al "encontrar" la cuenta demo.
