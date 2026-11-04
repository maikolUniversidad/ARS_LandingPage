/**
 * Contrato del «Arquitecto IA de plataforma» (/plataforma, sección #arquitecto-ia).
 *
 *  1. `PeticionArquitecto` — lo que el visitante cuenta de su operación.
 *  2. `PropuestaPlataforma` — la plataforma a la medida: dolores → módulos,
 *     fases e indicadores cualitativos. La arma la IA o el motor de reglas y
 *     SIEMPRE pasa por `sanearPropuesta`, que descarta ids que no existan en
 *     el catálogo real (`@/data/servicios`).
 */

/** Lo que más le importa al visitante (chips del formulario). */
export const PRIORIDADES_OP = [
  "turnos",
  "puesto",
  "sala-control",
  "comunicacion",
  "video",
  "nomina",
  "documentos",
  "finanzas",
  "formacion",
] as const;
export type PrioridadOp = (typeof PRIORIDADES_OP)[number];

/** Tamaño de la operación por número de personas en campo. */
export const TAMANOS_OP = ["pequena", "mediana", "grande", "muy-grande"] as const;
export type TamanoOp = (typeof TAMANOS_OP)[number];

export const IDIOMAS = ["es", "en"] as const;
export type Idioma = (typeof IDIOMAS)[number];

export type PeticionArquitecto = {
  /** La operación contada con sus palabras. */
  descripcion: string;
  prioridades?: PrioridadOp[];
  tamano?: TamanoOp;
  /** Idioma en el que la IA redacta la propuesta (las reglas escriben en español). */
  idioma?: Idioma;
};

export type DolorPropuesta = {
  dolor: string;
  /** ids reales del catálogo que lo resuelven. */
  moduloIds: string[];
};

export type ModuloPropuesta = {
  id: string;
  por_que: string;
  prioridad: "alta" | "media";
};

export type FasePropuesta = {
  nombre: string;
  /** Duración estimada de la fase, en semanas (orientativa). */
  semanas: number;
  moduloIds: string[];
  resultado: string;
};

/** Indicador cualitativo: cómo se trabaja antes y después (sin cifras ni precios). */
export type IndicadorPropuesta = {
  nombre: string;
  antes: string;
  despues: string;
};

export type PropuestaPlataforma = {
  titulo: string;
  /** 2–3 frases. */
  diagnostico: string;
  dolores: DolorPropuesta[];
  modulos: ModuloPropuesta[];
  fases: FasePropuesta[];
  indicadores: IndicadorPropuesta[];
  siguientePaso: string;
  fuente: "ia" | "reglas";
};

export type RespuestaArquitecto =
  | { ok: true; propuesta: PropuestaPlataforma; aviso?: string }
  | { ok: false; mensaje: string };

export const LIMITES_ARQUITECTO = {
  descripcion: 1500,
  dolores: 6,
  modulos: 12,
  modulosPorDolor: 4,
  fases: 4,
  indicadores: 6,
} as const;
