import { useEffect, useState } from "react";

// -----------------------------------------------------------------------
// Almacén temporal de materiales, compartido entre materiales.tsx (la lista),
// MaterialFormModal (crear/editar) y cotizar.tsx (selectores de materiales),
// mientras no existe el backend de Laravel. Es una lista en memoria (se
// reinicia al recargar la app) con un mini sistema de "suscripción" para que
// las pantallas se actualicen solas cuando se agrega o edita un material,
// sin depender de props ni de volver a navegar.
//
// TODO (backend Laravel): cuando el backend esté listo, reemplazar
// getMaterials/addMaterial/updateMaterial por llamadas reales usando el
// cliente ya preparado en src/api/client.js (fetchMaterials, createMaterial,
// etc.) y quitar este almacenamiento en memoria.
// -----------------------------------------------------------------------

// Campos según la tabla "materiales" real de la base de datos: categoría
// (de la tabla "categoria_material"), descripción, nombre, unidad de medida,
// costo unitario y stock/cantidad. La tabla también tiene un campo "estado",
// pero ese lo pone el sistema por defecto según si hay stock o no (ver
// getMaterialStatus más abajo) — no se pide en el formulario.
export type Material = {
  id: string;
  category: string;
  description: string;
  name: string;
  unit: string;
  unitCost: string;
  stock: string;
};

// Opciones por defecto de unidad de medida.
export const MATERIAL_UNITS = [
  "Gramo",
  "Metro",
  "Centímetro",
  "Milimetro",
  "Unidad",
  "Par",
  "Hebra",
  "Rollo",
];

let materials: Material[] = [
  {
    id: "1",
    category: "cuentas-abalorios",
    description: "Mostacilla plateada brillante de 4 mm",
    name: "Mostacilla plateada",
    unit: "Gramo",
    unitCost: "25",
    stock: "500",
  },
];

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function getMaterials() {
  return materials;
}

export function addMaterial(material: Omit<Material, "id">) {
  materials = [...materials, { ...material, id: Date.now().toString() }];
  notify();
}

export function updateMaterial(id: string, material: Omit<Material, "id">) {
  materials = materials.map((existing) =>
    existing.id === id ? { ...material, id } : existing,
  );
  notify();
}

export function deleteMaterial(id: string) {
  materials = materials.filter((existing) => existing.id !== id);
  notify();
}

/**
 * Texto corto para mostrar en las tarjetas/listas: "500 Gramo · $25 c/u".
 * `currencySymbol` viene de la moneda activa (src/constants/currency-store.ts):
 * solo cambia el símbolo que se muestra, no convierte el monto (no hay tasas
 * de cambio reales todavía).
 */
export function formatMaterialDetail(
  material: Material,
  currencySymbol: string,
) {
  return `${material.stock} ${material.unit} · ${currencySymbol}${material.unitCost} c/u`;
}

/**
 * Estado del material: "Agotado" cuando el stock llega a 0 (o no es un
 * número válido), "Disponible" en cualquier otro caso. Es el mismo criterio
 * que va a aplicar el sistema por defecto en el backend, así que no es un
 * campo que el usuario llene a mano.
 */
export function getMaterialStatus(
  material: Material,
): "Disponible" | "Agotado" {
  const stockNumber = Number(material.stock);
  return Number.isFinite(stockNumber) && stockNumber > 0
    ? "Disponible"
    : "Agotado";
}

/** Lee la lista de materiales y hace que el componente se vuelva a renderizar cuando cambie (crear/editar). */
export function useMaterials() {
  const [, forceRender] = useState(0);

  useEffect(() => {
    const listener = () => forceRender((n) => n + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return materials;
}
