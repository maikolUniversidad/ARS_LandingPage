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
