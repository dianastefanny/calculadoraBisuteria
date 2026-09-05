import { useEffect, useState } from "react";

// -----------------------------------------------------------------------
// Moneda seleccionada globalmente (selector "COP$/USD$/EUR€" del encabezado),
// compartida por toda la app con el mismo patrón de suscripción que
// demo-materials.ts, para que cualquier pantalla que muestre un precio use
// siempre la moneda activa.
//
// TODO (backend Laravel): sincronizar la moneda seleccionada con la
// preferencia real del usuario en el servidor. Importante: como todavía no
// hay tasas de cambio reales, esto solo cambia el símbolo/código que se
// muestra junto a los montos — NO convierte los números (eso requiere tasas
// de cambio reales que debe entregar el backend).
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
  const [, forceRender] = useState(0);

  useEffect(() => {
    const listener = () => forceRender((n) => n + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return getCurrentCurrencyOption();
}
