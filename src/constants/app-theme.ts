import AppColorsRaw from './app-colors.js';

/**
 * Paleta única de Cuenta Cuentas. Los valores viven en app-colors.js (CommonJS)
 * porque tailwind.config.js también los consume vía require(); este archivo
 * solo re-exporta con el nombre que ya usan las pantallas.
 */
export const AppColors = AppColorsRaw;
