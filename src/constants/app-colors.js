// Aquí viven todos los colores de la marca "Cuenta Cuentas" en un solo lugar.
// Si algún día cambia el color de la app, se cambia aquí y se actualiza en
// toda la aplicación automáticamente (pantallas y estilos de Tailwind).
//
// Este archivo lo usan dos sitios distintos, por eso está en formato simple
// (no TypeScript): 1) tailwind.config.js lo lee para crear las clases de
// color (como "bg-brand-background"), y 2) app-theme.ts lo vuelve a exportar
// para que las pantallas lo usen directamente como AppColors.background, etc.
module.exports = {
  background: '#087BB9', // Azul de fondo de toda la app.
  navy: '#0B3350', // Azul oscuro para círculos numerados y acentos oscuros sobre fondos claros.
  turquoise: '#54F0D4', // Turquesa: título "CUENTA CUENTAS", enlaces, acentos.
  green: '#36D777', // Verde: parte del degradado de los botones principales.
  white: '#FFFFFF',
  softText: '#D6FFFF', // Blanco suave para subtítulos y textos secundarios.
  input: 'rgba(70, 219, 224, 0.27)', // Fondo semitransparente de los campos de texto.
  inputBorder: 'rgba(194, 255, 250, 0.28)', // Borde de los campos de texto.
  error: '#8C3B25', // Color para bordes/texto de error en los campos.
  placeholder: '#A8F5F0', // Color del texto de ejemplo dentro de los campos vacíos.
};
