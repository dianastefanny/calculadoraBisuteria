import { useSyncExternalStore } from "react";

// -----------------------------------------------------------------------
// Moneda seleccionada globalmente (selector "COP$/USD$/EUR€" del encabezado),
// compartida por toda la app mediante un store externo (useSyncExternalStore),
// para que cualquier pantalla que muestre un precio use siempre la moneda
// activa y se actualice al instante, sin esperar a remontarse.
//
// La moneda elegida se guarda en la cuenta del usuario (configuration.currency
// en el backend, ver AppHeader) y se restaura al iniciar sesión (ver
// login.tsx) — mismo mecanismo que el tema claro/oscuro.
//
// Importante: como todavía no hay tasas de cambio reales, esto solo cambia el
// símbolo/código que se muestra junto a los montos — NO convierte los
// números (eso requeriría tasas de cambio reales que debe entregar el
// backend).
// -----------------------------------------------------------------------

export type CurrencyCode = "COP" | "USD" | "EUR";

export type CurrencyOption = {
  code: CurrencyCode;
  symbol: string;
  trigger: string;
  label: string;
};

export const CURRENCY_OPTIONS: CurrencyOption[] = [
  { code: "COP", symbol: "COP $", trigger: "COP$", label: "PESOS (COP)" },
  { code: "USD", symbol: "US$", trigger: "USD$", label: "DÓLAR (USD)" },
  { code: "EUR", symbol: "€", trigger: "EUR€", label: "EURO (€)" },
];

let currency: CurrencyCode = "COP";
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getCurrentCurrencyOption() {
  return (
    CURRENCY_OPTIONS.find((option) => option.code === currency) ??
    CURRENCY_OPTIONS[0]
  );
}

export function setCurrency(code: CurrencyCode) {
  currency = code;
  notify();
}

/** Lee la moneda activa y hace que el componente se vuelva a renderizar cuando cambie. */
export function useCurrency() {
  return useSyncExternalStore(subscribe, getCurrentCurrencyOption);
}

const LOCALE_BY_CURRENCY: Record<CurrencyCode, string> = {
  COP: "es-CO",
  USD: "en-US",
  EUR: "es-ES",
};

/**
 * Formatea un monto con separador de miles al estilo de la moneda activa
 * (ej. 2500 → "2.500" en pesos colombianos). Los pesos no muestran
 * decimales (no se usan centavos en la práctica); dólares y euros sí
 * muestran los 2 decimales habituales.
 */
export function formatAmount(
  value: number | string,
  currencyCode: CurrencyCode = "COP",
): string {
  const amount = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(amount)) return String(value);

  const decimals = currencyCode === "COP" ? 0 : 2;

  return new Intl.NumberFormat(LOCALE_BY_CURRENCY[currencyCode], {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}
