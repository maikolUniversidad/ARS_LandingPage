/**
 * Contrato del Planificador de video analítica con IA.
 *
 * Tres capas:
 *  1. `PeticionPlan`  — lo que el cliente cuenta (texto libre + atajos).
 *  2. `PlanVision`    — la propuesta: zonas, cámaras y analíticas (la arma la IA
 *                       o el motor de reglas; siempre pasa por `sanearPlan`).
 *  3. `EscenaPlan`    — la misma propuesta ya resuelta en metros (posición de
 *                       cada zona, de cada cámara y hacia dónde mira). Es lo que
 *                       recibe la maqueta 3D (public/analiticas-3d/plan.html)
 *                       por postMessage; la geometría NUNCA la inventa la IA.
 */

export const TIPOS_SITIO = [
  "tienda",
  "supermercado",
  "bodega",
  "oficina",
  "parqueadero",
  "planta",
  "colegio",
  "restaurante",
  "conjunto",
  "otro",
] as const;
export type TipoSitio = (typeof TIPOS_SITIO)[number];

export const TIPOS_ZONA = [
  "acceso",
  "ventas",
  "cajas",
  "bodega",
  "parqueadero",
  "oficina",
  "recepcion",
  "produccion",
  "pasillo",
  "comedor",
  "perimetro",
] as const;
export type TipoZona = (typeof TIPOS_ZONA)[number];

export const TAMANOS = ["pequena", "mediana", "grande"] as const;
export type Tamano = (typeof TAMANOS)[number];

export const PRIORIDADES = ["seguridad", "ventas", "operacion", "inventario", "personal"] as const;
export type Prioridad = (typeof PRIORIDADES)[number];

export type PeticionPlan = {
  /** Lo que el cliente cuenta con sus palabras. */
  descripcion: string;
  tipoSitio?: TipoSitio;
  tamano?: Tamano;
  prioridades?: Prioridad[];
  /** Cámaras que ya tiene instaladas (si las sabe). */
  camarasExistentes?: number;
};

export type ZonaPlan = {
  id: string;
  nombre: string;
  tipo: TipoZona;
  tamano: Tamano;
  /** Por qué esta zona importa para lo que pidió el cliente. */
  motivo: string;
};

export type CamaraPlan = {
  id: string;
  /** id de la zona donde va. */
  zona: string;
  /** ids del catálogo (src/data/analiticas). La primera es la principal. */
  analiticas: string[];
  /** Qué mira y para qué, en una frase. */
  proposito: string;
};

export type AnaliticaPlan = {
  id: string;
  /** Por qué se recomienda para este cliente. */
  motivo: string;
  prioridad: "alta" | "media";
};

export type PlanVision = {
  titulo: string;
  resumen: string;
  tipoSitio: TipoSitio;
  zonas: ZonaPlan[];
  camaras: CamaraPlan[];
  analiticas: AnaliticaPlan[];
  /** Supuestos y siguientes pasos, frases cortas. */
  notas: string[];
  /** Cámaras que se reutilizan del circuito existente (≤ camaras.length). */
  reutilizadas: number;
  fuente: "ia" | "reglas";
};

/* ------------------------- Escena resuelta (metros) ------------------------ */

export type Vec3 = [number, number, number];

export type ZonaEscena = ZonaPlan & {
  /** Centro de la zona en el piso (x, z) y tamaño (ancho en x, fondo en z). */
  x: number;
  z: number;
  w: number;
  d: number;
  /** Lado por donde se entra a la zona: n (−z), s (+z), e (+x), o (−x). */
  puerta: "n" | "s" | "e" | "o";
  /** true si es exterior (sin muros ni techo). */
  exterior: boolean;
};

export type CamaraEscena = CamaraPlan & {
  /** Etiqueta corta visible: "CAM 01". */
  etiqueta: string;
  pos: Vec3;
  mira: Vec3;
  fov: number;
  /** Alcance del cono en metros. */
  alcance: number;
  /** Color del cono según la familia de la analítica principal. */
  color: number;
};

export type EscenaPlan = {
  version: 1;
  /** Tamaño total del piso. */
  piso: { w: number; d: number };
  zonas: ZonaEscena[];
  camaras: CamaraEscena[];
  /** Nombre de cada analítica usada (para rótulos dentro del 3D). */
  nombres: Record<string, string>;
};

/* ------------------------- Protocolo con el iframe ------------------------- */
// padre → iframe  {tipo:"vigias-plan", escena: EscenaPlan, cam?: number, vista?: "maqueta"|"cctv"}
// padre → iframe  {tipo:"vigias-plan-cam", cam: number}          cambia la cámara activa (−1 = recorrido)
// padre → iframe  {tipo:"vigias-plan-vista", vista: "maqueta"|"cctv"}
// iframe → padre  {tipo:"vigias-plan", listo?:true, montado?:true, cam?:number, evento?:{cam:number, analitica:string, texto:string, nivel:"detecta"|"alerta"|"ok"}, error?:string}
export const MSG_PLAN = "vigias-plan" as const;
