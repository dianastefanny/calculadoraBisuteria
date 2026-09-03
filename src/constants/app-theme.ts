import AppColorsRaw from './app-colors.js';

/**
 * Paleta única de colores de Cuenta Cuentas, lista para usar en cualquier
 * pantalla o componente como AppColors.background, AppColors.turquoise, etc.
 *
 * Los valores reales están en app-colors.js (no en este archivo) porque
 * tailwind.config.js también necesita leerlos para generar las clases de
 * color de Tailwind, y ese archivo de configuración no puede leer TypeScript.
 * Aquí solo se vuelven a exportar con el mismo nombre que ya usan las pantallas.
 */
export const AppColors = AppColorsRaw;
