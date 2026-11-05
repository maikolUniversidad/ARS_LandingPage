/**
 * Contrato del módulo «Propuesta ARS» (cierre de la home, #contacto).
 *
 * Flujo: la persona cuenta quién es, cómo opera, qué aplicaciones usa y cómo
 * tiene sus datos → la IA hace 2–3 preguntas de seguimiento según el contexto →
 * arma una `Propuesta` (línea de trabajo, qué suple ARS, integración, reportes)
 * que se muestra animada → PDF descargable + envío a un asesor comercial.
 *
 * Piezas (solo comparten estos tipos):
 *  - Servidor / IA: `src/lib/propuesta/servidor.ts` + rutas `/api/propuesta/*`.
 *  - PDF y envío:   `src/components/propuesta/pdf/*` + `/api/propuesta/enviar`.
 *  - Experiencia:   `src/components/propuesta/*` (UI animada, cliente).
 *
 * Áreas y módulos se referencian por id del catálogo (src/data/servicios).
 * Nada de lo prohibido en src/lib/asistente/prompt.ts (sin lectura de placas,
 * armas, EPP, térmicas, fuego ni SLA; robótica «en desarrollo»; RADIAN piloto).
 */
import type { AreaId } from "@/data/diagnostico/tipos";

export type { AreaId };

/* ───────────── Entrada: las respuestas ───────────── */

export type RangoVigilantes = "1-50" | "51-200" | "201-1000" | "1000+";

export type Respuestas = {
  // Quién eres
  nombre: string;
  cargo: string;
  empresa: string;
  ciudad: string;
  // Tu operación
  vigilantes: RangoVigilantes | "";
  /** Número aproximado de sedes/puestos. */
  sedes: string;
  /** Servicios que prestan: "Vigilancia física", "Escoltas", "Medios tecnológicos", "Monitoreo remoto"... */
  servicios: string[];
  /** ¿Tienen central de monitoreo propia? */
  central: "si" | "no" | "en-proyecto" | "";
  // Aplicaciones y datos
  /** Apps que usan hoy: "Excel", "WhatsApp", "Radio análoga", "ERP", "Software de nómina", "App de rondas", "VMS / grabadores"... */
  aplicaciones: string[];
  /** Nombre del ERP / software contable si lo dijeron (texto libre). */
  erp: string;
  /** Dónde viven sus datos: "Papel", "Excel suelto", "Nube (Drive/OneDrive)", "Servidor propio", "Dentro del ERP"... */
  datos: string[];
  /** ¿Qué integraciones les importan? texto libre. */
  integraciones: string;
  // Dolores, reportes y metas
  dolores: string[];
  /** Reportes que hoy les piden o necesitan, y para quién. */
  reportes: string[];
  /** Plazo deseado: "Este mes", "Este trimestre", "Este año", "Explorando". */
  plazo: string;
  /** Texto libre adicional. */
  notas: string;
  // Contacto
  email: string;
  telefono: string;
  /** Autorización de tratamiento de datos (Ley 1581 de 2012). */
  autoriza: boolean;
};

/** Pregunta de seguimiento generada por la IA según lo que ya respondieron. */
export type PreguntaSeguimiento = {
  id: string;
  pregunta: string;
  /** Por qué la hace (se muestra pequeño: «Para saber si…»). */
  porQue: string;
  /** Opciones sugeridas (chips); la persona también puede escribir. */
  opciones: string[];
};

export type RespuestaSeguimiento = { id: string; pregunta: string; respuesta: string };

/* ───────────── Salida: la propuesta ───────────── */

export type ModuloPropuesto = {
  area: AreaId;
  /** id de módulo del catálogo. */
  modulo: string;
  /** Por qué para ESTA empresa (1 frase, en sus palabras). */
  porQue: string;
};

export type FaseTrabajo = {
  nombre: string; // "Fase 1 · Arranque en campo"
  duracion: string; // "4 a 6 semanas (estimado)"
  objetivo: string;
  entregables: string[];
  modulos: string[]; // ids de módulo
};

/** Un nodo del mapa de integración: sus sistemas ↔ ARS. */
export type Integracion = {
  /** Sistema o fuente que ya tienen ("Software contable", "Excel de turnos", "Grabadores de la sede"). */
  sistema: string;
  /** Cómo se conecta: "Se integra", "Se migra", "Convive", "Se reemplaza". */
  modo: "integra" | "migra" | "convive" | "reemplaza" | "centraliza";
  /** Qué viaja y en qué sentido (1 frase). */
  detalle: string;
};

export type ReporteEntregable = {
  nombre: string; // "Informe mensual al cliente"
  para: string; // "Cliente final", "Gerencia", "Supervigilancia", "Coordinadores"
  frecuencia: string; // "Diario", "Semanal", "Mensual", "En tiempo real"
  contenido: string; // qué trae
};

/**
 * Ejemplo de analítica de video que aplica a su operación (id de `src/data/analiticas.ts`,
 * que trae video/póster de evidencia real). NUNCA: placas, armas (de fuego y blancas), fuego,
 * EPP ni térmicas — ver `ANALITICAS_PROHIBIDAS`.
 */
export type AnaliticaPropuesta = {
  id: string;
  /** Dónde la pondría en SU operación ("Portería de la sede norte", "Bodega 2"). */
  donde: string;
  /** Qué le resuelve (1 frase). */
  porQue: string;
};

/** Indicador numérico ESTIMADO para gráficos (hoy vs con ARS). Nunca dinero. */
export type Indicador = {
  nombre: string; // "Tiempo para confirmar quién llegó"
  unidad: string; // "minutos", "%", "horas al mes"
  hoy: number;
  conArs: number;
  /** true si un valor más alto es mejor (p. ej. % de rondas verificadas). */
  mejorEsMayor: boolean;
  /** De dónde sale la estimación (1 frase). */
  nota: string;
};

/** Escenario visual: elige la imagen de portada e ilustraciones (`src/data/propuesta/imagenes.ts`). */
export type Escenario = "residencial" | "corporativo" | "industrial" | "comercial" | "logistica" | "mixto";
export const ESCENARIOS: Escenario[] = ["residencial", "corporativo", "industrial", "comercial", "logistica", "mixto"];

/** Analíticas que la web no puede prometer (src/lib/asistente/prompt.ts). */
export const ANALITICAS_PROHIBIDAS = new Set(["placas", "armas", "blancas2", "fuego", "epp"]);

/**
 * Postura frente al ERP / sistemas administrativos. ARS ES un ERP completo (nómina,
 * contabilidad, facturación, CRM…) y además se adapta: si el cliente ya tiene su propio
 * sistema o tiene otros contratados, creamos los mecanismos para centralizar todo en
 * ARS o para que la información fluya entre sistemas, según los módulos contratados.
 */
export type EstrategiaErp = {
  modo: "ars-centraliza" | "fluye-con-su-sistema" | "mixto";
  /** Sus sistemas actuales tal como los nombró (genéricos, sin marcas: "Software contable", "Sistema de nómina"). */
  sistemas: string[];
  /** 2–3 frases: qué centraliza ARS, qué fluye y por qué mecanismo (agente interoperador, API, archivos programados). */
  explicacion: string;
};

export type Propuesta = {
  id: string; // corto, para referencia comercial: "ARS-2611-7K3Q"
  fecha: string; // ISO
  empresa: string;
  contacto: { nombre: string; cargo: string; email: string; telefono: string; ciudad: string };
  /** Lectura de su situación hoy (2–3 frases, cálido y concreto). */
  situacion: string;
  /** Titular de la propuesta (una línea). */
  titular: string;
  /** Lo que ARS suple (frases cortas, cada una conecta con algo que contaron). */
  arsSuple: string[];
  /** Lo que se queda como está mientras así lo decida (sistemas que conviven y con los que ARS se conecta). */
  seQueda: string[];
  modulos: ModuloPropuesto[];
  lineaDeTrabajo: FaseTrabajo[];
  integraciones: Integracion[];
  reportes: ReporteEntregable[];
  /** Cifras ilustrativas siempre marcadas como estimado. */
  impacto: { indicador: string; hoy: string; conArs: string }[];
  siguientesPasos: string[];
  /** 2–4 ejemplos de analíticas aplicadas a su operación (solo si tiene o tendrá cámaras). */
  analiticas?: AnaliticaPropuesta[];
  /** 3–5 indicadores estimados para graficar. */
  indicadores?: Indicador[];
  /** Cómo encaja ARS con su ERP y sistemas administrativos. */
  estrategiaErp?: EstrategiaErp;
  /** Escenario visual según su sector y servicios. */
  escenario?: Escenario;
  /** Aviso fijo: estimación preliminar, la confirma un asesor. */
  aviso: string;
};

/* ───────────── API ───────────── */

/** POST /api/propuesta/preguntas */
export type PeticionPreguntas = { respuestas: Partial<Respuestas> };
export type RespuestaPreguntas = { ok: true; preguntas: PreguntaSeguimiento[] } | { ok: false; mensaje: string };

/** POST /api/propuesta */
export type PeticionPropuesta = { respuestas: Respuestas; seguimiento: RespuestaSeguimiento[] };
export type RespuestaPropuesta = { ok: true; propuesta: Propuesta } | { ok: false; mensaje: string };

/** POST /api/propuesta/enviar — envía la propuesta (con PDF adjunto) a un asesor. */
export type PeticionEnvio = {
  propuesta: Propuesta;
  respuestas: Respuestas;
  seguimiento: RespuestaSeguimiento[];
  /** Vistas de la escena 3D (dataURL de imagen, máx. 3) para adjuntar al PDF. */
  capturas3d?: string[];
};
export type RespuestaEnvio = { ok: true } | { ok: false; mensaje: string };
