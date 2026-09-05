// Aquí viven todos los colores de la marca "Cuenta Cuentas" en un solo lugar.
// Si algún día cambia el color de la app, se cambia aquí y se actualiza en
// toda la aplicación automáticamente (pantallas y estilos de Tailwind).
//
// Paleta oficial: son exactamente 8 colores (background, white, green,
// lightGreen, turquoise, softText/placeholder, error, warning). Varias
// claves de abajo comparten el mismo valor porque cumplen roles distintos
// en la guía de marca — no hay ningún color fuera de esos 8.
//
// Este archivo lo usan dos sitios distintos, por eso está en formato simple
// (no TypeScript): 1) tailwind.config.js lo lee para crear las clases de
// color (como "bg-brand-background"), y 2) app-theme.ts lo vuelve a exportar
// para que las pantallas lo usen directamente como AppColors.background, etc.
module.exports = {
  background: '#0D3B66', // Azul oscuro: fondo principal de toda la app; también texto/ícono oscuro sobre chips claros (moneda, "Salir", pestaña activa).
  turquoise: '#2CAFAB', // Turquesa: nombre "CUENTA CUENTAS", enlaces, acentos, 2do color del degradado del botón; también base del tinte de los campos de autenticación (ver "input"/"inputBorder").
  green: '#34B368', // Verde: texto descriptivo bajo títulos, íconos, badges, checkboxes, círculos numerados, 1er color del degradado del botón.
  lightGreen: '#D0FDD7', // Verde claro: únicamente el chip del selector de moneda y el chip "Salir".
  white: '#FFFFFF',
  softText: '#D9D9D9', // Gris oficial: subtítulos secundarios, textos de ayuda e íconos secundarios sobre fondo oscuro.
  input: 'rgba(44, 175, 171, 0.20)', // Fondo translúcido de los campos de texto, derivado del turquesa oficial.
  inputBorder: 'rgba(44, 175, 171, 0.40)', // Borde de los campos de texto, derivado del turquesa oficial.
  error: '#A91619', // Rojo oficial: bordes/texto de error de campo, pastilla "Agotado" y acciones destructivas.
  placeholder: '#D9D9D9', // Gris oficial: texto de ejemplo dentro de los campos vacíos (sobre fondo oscuro).
  warning: '#FDFD96', // Amarillo oficial: únicamente símbolos/íconos de alerta o advertencia.
  backgroundMuted: 'rgba(13, 59, 102, 0.55)', // Azul oscuro oficial al 55% de opacidad, para colores de ícono/placeholder en JS sobre superficies blancas.
};
