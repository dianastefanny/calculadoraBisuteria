import { useEffect, useState } from "react";

// -----------------------------------------------------------------------
// Almacén temporal de diseños, compartido entre disenos.tsx (la lista) y
// DesignFormModal (crear/editar), mientras no existe el backend de Laravel.
// Mismo patrón de "suscripción" que demo-materials.ts / demo-packaging.ts.
//
// TODO (backend Laravel): cuando el backend esté listo, reemplazar
// getDesigns/addDesign/updateDesign por llamadas reales usando el cliente ya
// preparado en src/api/client.js (fetchDesigns, createDesign, etc.) y quitar
// este almacenamiento en memoria.
// -----------------------------------------------------------------------

// Un diseño guarda qué material usa (materialId) y cuánto de ese material
// (quantity); el nombre/unidad/costo real del material se busca en
// demo-materials.ts a partir de ese id, no se duplica aquí.
export type DesignMaterial = {
  materialId: string;
  quantity: string;
};

export type Design = {
  id: string;
  name: string;
  description: string;
  materials: DesignMaterial[];
};

let designs: Design[] = [];

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function getDesigns() {
  return designs;
}

export function addDesign(design: Omit<Design, "id">) {
  designs = [...designs, { ...design, id: Date.now().toString() }];
  notify();
}

export function updateDesign(id: string, design: Omit<Design, "id">) {
  designs = designs.map((existing) =>
    existing.id === id ? { ...design, id } : existing,
  );
  notify();
}

export function deleteDesign(id: string) {
  designs = designs.filter((existing) => existing.id !== id);
  notify();
}

/** Lee la lista de diseños y hace que el componente se vuelva a renderizar cuando cambie (crear/editar). */
export function useDesigns() {
  const [, forceRender] = useState(0);

  useEffect(() => {
    const listener = () => forceRender((n) => n + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return designs;
}
