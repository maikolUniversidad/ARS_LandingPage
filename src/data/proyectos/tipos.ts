/**
 * Contrato de datos de /proyectos.
 *
 * Un proyecto es una forma concreta de usar la plataforma: un tipo de cliente,
 * en una ciudad, con un conjunto de módulos REALES del catálogo de servicios
 * (`src/data/servicios`). Las áreas se derivan de esos módulos, así que la
 * página nunca promete algo que no esté en el catálogo.
 *
 * Reglas de contenido (ver `src/data/asistente/conocimiento/25-servicios-ars.md`,
 * «Guía de lo que no se promete»):
 *  - No se nombran clientes ni se dan cifras (sedes, vigilantes, cámaras,
 *    disponibilidad) sin respaldo. Mientras no estén confirmadas, cada ficha
 *    lleva `verificado: false` y la página lo dice.
 *  - Nada de placas, armas, EPP, térmica ni fuego/humo como funcionalidad.
 */

/** Estado público del proyecto (mismo lenguaje que el home: En operación / Piloto / En desarrollo). */
export type EstadoProyecto = "operacion" | "piloto" | "desarrollo";

export type PaisId = "CO" | "PE";

export type Ciudad = {
  id: string;
  nombre: string;
  region: string;
  pais: PaisId;
  lat: number;
  lng: number;
};

export type SectorId =
  | "educacion"
  | "sector-publico"
  | "energia"
  | "transporte"
  | "eventos"
  | "corporativo"
  | "seguridad-privada"
  | "laboratorio";

export type Proyecto = {
  /** kebab-case, único. Se usa como ancla: /proyectos#<id>. */
  id: string;
  /** Titular corto de la ficha. */
  titulo: string;
  /** Tipo de cliente, sin nombre propio (p. ej. «Universidad privada»). */
  cliente: string;
  sector: SectorId;
  ciudadId: string;
  /**
   * Línea de laboratorio (aún no está en el catálogo). Si existe, el proyecto
   * queda «En desarrollo» sin importar el estado de sus módulos.
   */
  laboratorio?: "robotica";
  /** Una frase: qué se logra. */
  resumen: string;
  /** El problema de partida, 1–2 frases. */
  reto: string;
  /** Cómo se resolvió con ARS, 2–3 frases. */
  solucion: string;
  /** ids de módulos de `src/data/servicios` (el primero con captura da la portada). */
  modulos: string[];
  /** Resultados cualitativos (sin cifras mientras no estén confirmadas). */
  resultados: string[];
  /** Escala descrita en palabras («Varias sedes en una ciudad»). */
  escala: string;
  /** false = caso de referencia aún sin confirmar con el cliente. */
  verificado: boolean;
};
