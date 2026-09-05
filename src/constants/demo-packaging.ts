import { useEffect, useState } from "react";

// -----------------------------------------------------------------------
// Almacén temporal de empaques, compartido entre empaques.tsx (la lista),
// PackagingFormModal (crear/editar) y calculos.tsx (selector de empaques),
// mientras no existe el backend de Laravel. Mismo patrón de "suscripción"
// que src/constants/demo-materials.ts.
//
// TODO (backend Laravel): cuando el backend esté listo, reemplazar
// getPackagingOptions/addPackaging/updatePackaging por llamadas reales
// usando el cliente ya preparado en src/api/client.js (fetchPackagingOptions,
// createPackaging, etc.) y quitar este almacenamiento en memoria.
// -----------------------------------------------------------------------

export type Packaging = {
  id: string;
  name: string;
  description: string;
  unitCost: string;
  stock: string;
};

let packagingOptions: Packaging[] = [
  {
    id: "1",
    name: "Tulita",
    description: "Bolsita de tul para presentar piezas pequeñas",
    unitCost: "2000",
    stock: "50",
  },
  {
    id: "2",
    name: "Caja Regalo Joyería",
    description: "Caja rígida con interior acolchado",
    unitCost: "2500",
    stock: "0",
  },
];

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function getPackagingOptions() {
  return packagingOptions;
}

export function addPackaging(packaging: Omit<Packaging, "id">) {
  packagingOptions = [
    ...packagingOptions,
    { ...packaging, id: Date.now().toString() },
  ];
  notify();
}

export function updatePackaging(id: string, packaging: Omit<Packaging, "id">) {
  packagingOptions = packagingOptions.map((existing) =>
    existing.id === id ? { ...packaging, id } : existing,
  );
  notify();
}

export function deletePackaging(id: string) {
  packagingOptions = packagingOptions.filter((existing) => existing.id !== id);
  notify();
}

/**
 * Texto corto para mostrar en las tarjetas/listas: "50 disponibles · $2000
 * c/u". `currencySymbol` viene de la moneda activa
 * (src/constants/currency-store.ts): solo cambia el símbolo, no convierte
 * el monto.
 */
export function formatPackagingDetail(
  packaging: Packaging,
  currencySymbol: string,
) {
  return `${packaging.stock} disponibles · ${currencySymbol}${packaging.unitCost} c/u`;
}

/**
 * Estado del empaque: "Agotado" cuando el stock llega a 0 (o no es un
 * número válido), "Disponible" en cualquier otro caso. Igual criterio que
 * getMaterialStatus en demo-materials.ts — no es un campo que el usuario
 * llene a mano, se calcula solo.
 */
export function getPackagingStatus(
  packaging: Packaging,
): "Disponible" | "Agotado" {
  const stockNumber = Number(packaging.stock);
  return Number.isFinite(stockNumber) && stockNumber > 0
    ? "Disponible"
    : "Agotado";
}

/** Lee la lista de empaques y hace que el componente se vuelva a renderizar cuando cambie (crear/editar). */
export function usePackagingOptions() {
  const [, forceRender] = useState(0);

  useEffect(() => {
    const listener = () => forceRender((n) => n + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return packagingOptions;
}
