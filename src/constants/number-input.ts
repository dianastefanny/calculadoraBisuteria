// -----------------------------------------------------------------------
// Lectura de números escritos por el usuario (costos, stock, salario,
// porcentajes, cantidades). Acepta las dos formas habituales de escribirlos:
//
//   "8.000"    → 8000     (punto como separador de miles, como en Colombia)
//   "8,000"    → 8000     (coma como separador de miles, como en EE. UU.)
//   "2,50"     → 2.5      (coma decimal)
//   "2.50"     → 2.5      (punto decimal)
//   "1.234,56" → 1234.56  (miles con punto y decimales con coma)
//   "1,234.56" → 1234.56  (miles con coma y decimales con punto)
//
// Regla para un solo separador: si deja exactamente 3 cifras después
// (y antes no hay un 0 solo), es de miles; si no, es decimal. Así "1.5" y
// "0.500" son decimales, pero "1.500" es mil quinientos.
//
// Sin esto, el backend recibía "8.000" como 8 (y guardaba un precio mil
// veces menor) y rechazaba "2,50" por no ser un número.
// -----------------------------------------------------------------------

const THOUSANDS_GROUPS = (sep: string) =>
  new RegExp(`^\\d{1,3}(\\${sep}\\d{3})+$`);

/** Devuelve el número escrito, o null si el texto no es un número válido. */
export function parseNumberInput(text: string | number | null | undefined): number | null {
  if (typeof text === "number") return Number.isFinite(text) ? text : null;
  if (text == null) return null;

  // Ignora espacios y símbolos de moneda que el usuario pueda escribir.
  const s = text.replace(/[\s$€]/g, "").replace(/^(COP|USD|US|EUR)/i, "");
  if (!s || !/^[\d.,]+$/.test(s) || !/\d/.test(s)) return null;

  const lastDot = s.lastIndexOf(".");
  const lastComma = s.lastIndexOf(",");
  let normalized: string;

  if (lastDot !== -1 && lastComma !== -1) {
    // Hay los dos: el último que aparece es el decimal.
    const decimalSep = lastDot > lastComma ? "." : ",";
    const thousandsSep = decimalSep === "." ? "," : ".";
    const [intPart, decPart, ...rest] = s.split(decimalSep);
    if (rest.length || !decPart || !/^\d+$/.test(decPart)) return null;
    if (!/^\d+$/.test(intPart) && !THOUSANDS_GROUPS(thousandsSep).test(intPart)) return null;
    normalized = `${intPart.split(thousandsSep).join("")}.${decPart}`;
  } else if (lastDot !== -1 || lastComma !== -1) {
    const sep = lastDot !== -1 ? "." : ",";
    const parts = s.split(sep);
    if (parts.length > 2) {
      // Varias veces el mismo separador: solo puede ser de miles.
      if (!THOUSANDS_GROUPS(sep).test(s)) return null;
      normalized = parts.join("");
    } else {
      const [intPart, decPart] = parts;
      if (!intPart && !decPart) return null;
      const looksLikeThousands = THOUSANDS_GROUPS(sep).test(s) && intPart !== "0";
      normalized = looksLikeThousands
        ? `${intPart}${decPart}`
        : `${intPart || "0"}.${decPart || "0"}`;
    }
  } else {
    normalized = s;
  }

  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

/**
 * Valor listo para enviar al backend: el número ya interpretado. Si el texto
 * no es un número válido se envía tal cual, para que el backend responda con
 * su mensaje de validación en vez de guardar algo equivocado.
 */
export function toApiNumber(value: string | number | null | undefined) {
  if (value == null || value === "") return undefined;
  const parsed = parseNumberInput(value);
  return parsed ?? value;
}

/**
 * Valor del backend ("8000.00", "1.50") convertido en texto para un campo
 * del formulario, sin ceros de sobra ("8000", "1.5"). Como el backend guarda
 * máximo 2 decimales, el resultado nunca se confunde con miles al volver a
 * leerlo con parseNumberInput.
 */
export function toInputValue(value: string | number | null | undefined): string {
  if (value == null || value === "") return "";
  const n = Number(value);
  return Number.isFinite(n) ? String(n) : String(value);
}
