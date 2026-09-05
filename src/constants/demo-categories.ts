// Categorías de material (tabla "categoria_material" en la base de datos).
// Antes vivían (con otros nombres de ejemplo) en la antigua pantalla
// categories.tsx; se centralizan aquí para no repetirlas en dos lugares.
//
// TODO (backend Laravel): reemplazar por las categorías reales que devuelva
// el servidor, usando el cliente ya preparado en src/api/client.js, por
// ejemplo:
//   import { fetchCategories } from "@/api/client";

export type MaterialCategory = {
  id: string;
  name: string;
  description: string;
};

export const DEMO_CATEGORIES: MaterialCategory[] = [
  {
    id: "cuentas-abalorios",
    name: "Cuentas y abalorios",
    description: "Mostacillas, chaquiras, perlas, cristales, cuentas.",
  },
  {
    id: "piedras",
    name: "Piedras",
    description: "Piedras naturales, sintéticas, semipreciosas.",
  },
  {
    id: "dijes-colgantes",
    name: "Dijes y colgantes",
    description: "Charms, figuras y decoraciones.",
  },
  {
    id: "herrajes-accesorios",
    name: "Herrajes y accesorios",
    description: "Argollas, cierres, ganchos, separadores, terminales.",
  },
  {
    id: "cadenas",
    name: "Cadenas",
    description: "Cadenas para collares, pulseras y otros accesorios.",
  },
  {
    id: "hilos-cordones",
    name: "Hilos y cordones",
    description: "Hilo elástico, nailon, cordón, hilo encerado.",
  },
  {
    id: "alambres",
    name: "Alambres",
    description: "Alambre para bisutería y elaboración de estructuras.",
  },
  {
    id: "componentes-aretes",
    name: "Componentes para aretes",
    description: "Bases, ganchos y topes.",
  },
  {
    id: "otros-materiales",
    name: "Otros materiales",
    description: "Materiales que no encajen en las categorías anteriores.",
  },
];

export function getCategoryName(id: string) {
  return DEMO_CATEGORIES.find((category) => category.id === id)?.name ?? id;
}
