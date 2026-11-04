import type { PaisId } from "@/data/proyectos";

/** Tipos y medidas del mapa, compartidos entre el servidor (geometria.ts) y el cliente. */
export const MAPA_W = 600;
export const MAPA_H = 760;

export type PaisMapa = { nombre: string; pais: PaisId | null; d: string };
export type PuntoMapa = { id: string; x: number; y: number };
export type GeometriaMapa = {
  paises: PaisMapa[];
  ciudades: PuntoMapa[];
  etiquetas: { pais: PaisId; x: number; y: number }[];
};
