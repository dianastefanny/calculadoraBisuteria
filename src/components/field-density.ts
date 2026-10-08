import { createContext, useContext } from "react";

// Densidad de los campos (TextField y SelectField):
// - "normal": tamaño de siempre (inicio de sesión, registro, Cálculos...).
// - "compact": más bajos, para que las ventanas de formulario con muchos
//   campos quepan en la pantalla del celular.
// FormModal la pone en "compact" para todo lo que tenga adentro, así
// cualquier formulario nuevo queda compacto sin tener que acordarse.
export type FieldDensity = "normal" | "compact";

export const FieldDensityContext = createContext<FieldDensity>("normal");

/** true si el campo debe verse compacto (por la prop o por estar en un FormModal). */
export function useCompactField(compactProp?: boolean) {
  const density = useContext(FieldDensityContext);
  return compactProp ?? density === "compact";
}
