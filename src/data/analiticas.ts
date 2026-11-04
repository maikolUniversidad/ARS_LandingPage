/**
 * Catálogo de analíticas de video del módulo de Visión (45 analíticas, 4 familias).
 *
 * Los datos viven en analiticas.generado.json, GENERADO desde las escenas 3D
 * (public/analiticas-3d/escenas.js, escenas2.js y los emparejamientos sync/*.js):
 * no editar a mano, correr `node scripts/generar-analiticas.cjs`.
 *
 * - `fases`: la secuencia que recorre la simulación 3D (segundo, estado, texto).
 *   Los segundos son los del video emparejado: el visor reproduce el video y
 *   la simulación sigue su reloj.
 * - `video`: el clip real (o generado con IA, rotulado) que la simulación reproduce.
 * - `estado`: madurez declarada por el equipo de Visión; se muestra tal cual.
 */

import datos from "./analiticas.generado.json" with { type: "json" };

export type EstadoSim = "vigila" | "detecta" | "alerta" | "ok";

export type FamiliaId = "comercial" | "operativo" | "prevencion" | "lite";

export type Familia = {
  id: FamiliaId;
  nombre: string;
  descripcion: string;
  /** Nombre del color en la presentación original (oro, azul, rojo, verde). */
  color: "oro" | "azul" | "rojo" | "verde";
};

export type Fase = { t: number; estado: EstadoSim; texto: string };

/** Zona o línea de la analítica dibujada sobre el video, con el mismo color y texto que en el 3D. */
export type Marca = {
  tipo: "zona" | "linea";
  /** Puntos normalizados (0–1) sobre el cuadro del video. */
  pts: [number, number][];
  color: EstadoSim | "oro";
  etiqueta?: string;
  /** Segundos del clip entre los que se muestra (por defecto, todo el clip). */
  desde?: number;
  hasta?: number;
};

export type Evidencia = {
  /** Video real (mp4). Ausente cuando la evidencia es una imagen. */
  src?: string;
  poster?: string;
  /** Imagen real en lugar de video. */
  img?: string;
  /** Procedencia de la evidencia, tal como la declara el equipo. */
  chapa: string;
  fuente?: string;
  autor?: string;
  url?: string;
  licencia?: string;
  /** Segundo del clip donde ocurre el hecho clave. */
  evento?: number;
  marcas?: Marca[];
  /** El clip se generó con IA (se rotula como tal). */
  ia?: boolean;
};

export type Analitica = {
  id: string;
  familia: FamiliaId;
  nombre: string;
  corta: string;
  desc: string;
  estado: string | null;
  /** Duración del ciclo de la simulación, en segundos. */
  dur: number;
  fases: Fase[];
  video: Evidencia | null;
};

type Datos = { familias: Familia[]; analiticas: Analitica[] };
const D = datos as unknown as Datos;

export const familias: Familia[] = D.familias;

export const analiticas: Analitica[] = D.analiticas;

export const ESTADO_LABEL: Record<EstadoSim, string> = {
  vigila: "Vigilando",
  detecta: "Detectando",
  alerta: "Alerta",
  ok: "Resuelto",
};

/** URL de la simulación 3D embebible de una analítica. */
export function simUrl(id: string, opts: { pip?: boolean; vista?: "cctv" | "maqueta" } = {}) {
  const q = new URLSearchParams({ id });
  if (opts.pip === false) q.set("pip", "0");
  if (opts.vista === "cctv") q.set("vista", "cctv");
  return `/analiticas-3d/sim.html?${q.toString()}`;
}

export const PRESENTACION_URL = "/analiticas-3d/index.html";
export const PPTX_URL = "/analiticas-3d/Portafolio-Analiticas-Vigias.pptx";
