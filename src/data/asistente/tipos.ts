import type { FamiliaId } from "@/data/analiticas";

export type DocumentoKB = {
  id: string;
  titulo: string;
  orden: number;
  rutas: string[];
  contenido: string;
};

export type AnclaSitio = { id: string; descripcion: string };

export type RutaSitio = {
  ruta: string;
  titulo: string;
  descripcion: string;
  anclas: AnclaSitio[];
};

export type ResultadoAnalitica = {
  id: string;
  nombre: string;
  corta: string;
  familia: FamiliaId;
};

export type FuenteTrozo = "kb" | "analitica" | "funcionalidad" | "laboratorio" | "modelo";

/** Trozo del índice semántico (generado por generar.mjs). */
export type TrozoConocimiento = {
  id: string;
  fuente: FuenteTrozo;
  titulo: string;
  ruta: string;
  ancla?: string;
  texto: string;
  /** Hash del título + texto (para regenerar solo lo que cambió). */
  h: string;
  /** Embedding cuantizado a int8, en base64. Ausente si se generó sin clave. */
  v?: string;
};

export type IndiceConocimiento = {
  modelo: string;
  dimensiones: number;
  trozos: TrozoConocimiento[];
};
