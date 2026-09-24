import { useColorScheme } from "nativewind";

import AppColorsRaw from "./app-colors.js";

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

// -----------------------------------------------------------------------
// Modo oscuro/claro: NO son colores nuevos, son los mismos 8 oficiales de
// AppColors reorganizados en 3 "roles" que cambian de superficie según el
// tema activo (ver el porqué en el plan: pantallas y modales ya usaban
// exactamente este mismo patrón "lienzo + tinta", cada uno con su lienzo
// fijo; esto solo hace que el lienzo sea el mismo en toda la app y
// dependa del tema en vez de estar fijo por componente).
//
//   canvas   = fondo de pantallas y de superficies "elevadas" (modales,
//              FormError). Oscuro: background. Claro: white.
//   ink      = texto/ícono principal sobre ese canvas. Es el color opuesto
//              al canvas (oscuro: white, claro: background).
//   mutedInk = texto/ícono secundario (subtítulos, ayudas, lápiz/basura).
//              Oscuro: softText (gris). Claro: background al 55%
//              (backgroundMuted, ya existía para los modales blancos).
//
// Verde, turquesa, verde claro, rojo, amarillo, el degradado del botón y
// el tinte turquesa de Card/AppHeader/badges NO cambian entre temas — ya
// se ven bien sobre fondo claro u oscuro, así que se siguen usando tal
// cual vía AppColors.* en cualquier archivo.
// -----------------------------------------------------------------------

// Clases de Tailwind ya armadas con su par "base + dark:variante", para no
// repetir la combinación en cada archivo que necesite el canvas/ink/mutedInk.
export const CANVAS_BG = "bg-white dark:bg-brand-background";
export const INK_TEXT = "text-brand-background dark:text-white";
export const MUTED_TEXT = "text-brand-background/55 dark:text-brand-soft-text";
// Caja sutil de un campo dentro del canvas (fondo/borde).
export const FIELD_TINT_BG = "bg-brand-background/[0.08] dark:bg-white/10";
export const FIELD_TINT_BORDER = "border-brand-background/20 dark:border-white/20";

/**
 * Para los lugares donde el color no se puede dar por className (por
 * ejemplo el `color` de un ícono de Ionicons o `placeholderTextColor`):
 * devuelve los mismos 3 roles de arriba ya resueltos al valor que le toca
 * según el tema activo, más el resto de AppColors sin cambios.
 *
 * Ejemplo: <Ionicons name="trash" color={useThemeColors().mutedInk} />
 */
export function useThemeColors() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return {
    ...AppColors,
    canvas: isDark ? AppColors.background : AppColors.white,
    ink: isDark ? AppColors.white : AppColors.background,
    mutedInk: isDark ? AppColors.softText : AppColors.backgroundMuted,
  };
}

/**
 * Props listas para pasarle a TextField dentro de un canvas (modales de
 * crear/editar, campos claros de Cálculos): la misma caja sutil
 * (FIELD_TINT_BORDER/FIELD_TINT_BG) con el color de texto/placeholder que
 * le toca según el tema. Antes este mismo objeto estaba copiado igual en
 * EditFieldModal, MaterialFormModal, PackagingFormModal y DesignFormModal.
 *
 * Ejemplo: <TextField value={x} onChangeText={setX} {...useFieldTintProps()} />
 */
export function useFieldTintProps() {
  const theme = useThemeColors();

  return {
    inputClassName: `${FIELD_TINT_BORDER} ${FIELD_TINT_BG}`,
    inputStyle: { color: theme.ink },
    placeholderColor: theme.mutedInk,
  };
}
