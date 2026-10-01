import { TextField, type TextFieldProps } from "@/components/text-field";

export type SearchFieldProps = Omit<TextFieldProps, "icon" | "secureTextEntry">;

/**
 * Campo de búsqueda reutilizable: mismo estilo que TextField, pero ya con el
 * ícono de lupa y el placeholder puestos, para no repetirlo en cada pantalla
 * con lista (Materiales, Empaques, Diseños, Historial).
 */
export function SearchField({
  placeholder = "Buscar...",
  ...props
}: SearchFieldProps) {
  return (
    <TextField icon="search-outline" placeholder={placeholder} {...props} />
  );
}

// Quita tildes y pasa a minúsculas, para que buscar "aretes" encuentre
// igual "Aretes" o "arêtes".
function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

// true si "query" aparece dentro de "haystack", sin importar mayúsculas ni
// tildes. Con la búsqueda vacía, todo hace match (no filtra nada todavía).
export function matchesSearch(haystack: string, query: string) {
  if (!query.trim()) return true;
  return normalize(haystack).includes(normalize(query));
}
