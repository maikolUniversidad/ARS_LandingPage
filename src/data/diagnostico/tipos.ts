/**
 * Contrato del «Diagnóstico ARS» (/diagnostico).
 *
 * Experiencia interactiva en 3 partes que comparten SOLO estos tipos:
 *  1. Entrevista con IA (src/components/diagnostico/entrevista/*, /api/diagnostico):
 *     pregunta por la empresa, muestra cosas mientras tanto y produce un `Diagnostico`.
 *  2. Historia 3D (src/components/diagnostico/historia/*): un campus 3D con las 10 áreas
 *     de ARS; narra los `capitulos` del diagnóstico (antes → después), vuela la cámara
 *     a cada área y enciende los servicios recomendados.
 *  3. Reporte (src/components/diagnostico/reporte/*): vista previa bonita + PDF descargable
 *     con portada, perfil, hallazgos, plan por fases, cifras antes/después y el
 *     «reporte de un día» que le llegaría al gerente.
 *
 * Las áreas y módulos se referencian por id del catálogo (src/data/servicios).
 * Las cifras son ESTIMACIONES ilustrativas (siempre con la etiqueta «estimado»).
 */

/** Ids de las 10 áreas del catálogo (src/data/servicios/catalogo.ts). */
export type AreaId =
  | "operacion-en-campo"
  | "centro-de-operaciones"
  | "comunicacion-y-emergencias"
  | "monitoreo-inteligente"
  | "realidad-virtual"
  | "gestion-humana"
  | "formacion"
  | "finanzas-y-erp"
  | "productividad-e-ia"
  | "gobierno-y-seguridad"
  | "infraestructura";

export const AREA_IDS: AreaId[] = [
  "operacion-en-campo",
  "centro-de-operaciones",
  "comunicacion-y-emergencias",
  "monitoreo-inteligente",
  "realidad-virtual",
  "gestion-humana",
  "formacion",
  "finanzas-y-erp",
  "productividad-e-ia",
  "gobierno-y-seguridad",
];

/* ───────────── Entrada: lo que cuenta la empresa ───────────── */

export type TamanoEmpresa = "1-50" | "51-200" | "201-1000" | "1000+";

export type PerfilEmpresa = {
  nombre: string;
  /** Sector principal: "Vigilancia privada", "Conjuntos residenciales", "Industria", ... */
  sector: string;
  ciudad?: string;
  tamano: TamanoEmpresa;
  /** Número aproximado de sedes / puestos. */
  sedes?: number;
  /** Dolores elegidos o escritos (texto libre corto). */
  dolores: string[];
  /** Herramientas actuales: "Excel", "WhatsApp", "Radio análoga", "ERP propio"... */
  herramientasActuales: string[];
  /** Lo que más le importa: "costos", "control", "clientes", "personal", "crecer"... */
  prioridades: string[];
  /** Notas libres de la conversación. */
  notas?: string;
  /* ── Detalle ampliado (todo opcional; lo llena la IA desde la charla o los adjuntos) ── */
  /** Número aproximado de personas en operación (guardas, operarios, empleados). */
  personal?: number;
  /** Servicios que presta hoy: "Vigilancia fija", "Escoltas", "Monitoreo"... */
  servicios?: string[];
  /** Incidentes o problemas recientes concretos (texto corto). */
  incidentes?: string[];
  /** Plazo deseado: "inmediato", "1-3 meses", "este año"... */
  plazo?: string;
  /** Rango de presupuesto mencionado (texto libre, opcional). */
  presupuesto?: string;
  /** Persona de contacto (para guardar el registro y que ARS le escriba). */
  contacto?: ContactoDiagnostico;
};

export type ContactoDiagnostico = {
  nombre?: string;
  cargo?: string;
  email?: string;
  telefono?: string;
};

/** Campos del perfil que el panel «Perfil en construcción» muestra y cuenta para el %. */
export const CAMPOS_PERFIL = [
  "nombre",
  "sector",
  "tamano",
  "sedes",
  "ciudad",
  "personal",
  "servicios",
  "dolores",
  "herramientasActuales",
  "prioridades",
  "incidentes",
  "plazo",
  "contacto",
] as const;
export type CampoPerfil = (typeof CAMPOS_PERFIL)[number];

/* ───────────── Adjuntos (fotos, video, documentos) ───────────── */

export type TipoAdjunto = "imagen" | "video" | "documento" | "audio";

/**
 * Resultado de POST /api/diagnostico/adjuntos (multipart: campo `archivo`,
 * opcional `perfil` JSON y, para video, varios campos `fotograma` con JPEG
 * extraídos en el navegador). La IA «entiende» el archivo y propone datos.
 */
export type AdjuntoAnalizado = {
  id: string;
  nombre: string;
  tipo: TipoAdjunto;
  mime: string;
  bytes: number;
  /** Qué vio la IA (1–3 frases, segunda persona). */
  resumen: string;
  /** Observaciones útiles para el diagnóstico (riesgos, equipos, procesos). */
  hallazgos: string[];
  /** Datos del perfil que se pueden deducir del archivo. */
  cambios: Partial<PerfilEmpresa>;
  /** Áreas del catálogo relacionadas con lo que se vio. */
  areas: AreaId[];
};

export type RespuestaAdjunto = { ok: true; adjunto: AdjuntoAnalizado } | { ok: false; mensaje: string };

/** Lo que viaja en cada turno sobre los adjuntos (solo texto, sin el archivo). */
export type AdjuntoTurno = Pick<AdjuntoAnalizado, "id" | "nombre" | "tipo" | "resumen" | "hallazgos">;

/** Un turno de la entrevista (para enviar a la IA y mostrar en el reporte). */
export type TurnoEntrevista = { rol: "user" | "assistant"; texto: string };

/* ───────────── Salida: el diagnóstico ───────────── */

export type Prioridad = "alta" | "media" | "baja";

export type Hallazgo = {
  titulo: string;
  /** Qué pasa hoy (1–2 frases, en sus palabras). */
  hoy: string;
  /** Impacto en el negocio (1 frase). */
  impacto: string;
  areas: AreaId[];
};

export type Recomendacion = {
  areaId: AreaId;
  /** Ids de módulos del catálogo (moduloPorId). 1–4. */
  modulos: string[];
  prioridad: Prioridad;
  /** Por qué esta área para ESTA empresa (1–2 frases). */
  porque: string;
  /** Qué cambia en el día a día (1 frase concreta). */
  cambio: string;
};

export type Metrica = {
  /** "Tiempo de respuesta a incidentes" */
  nombre: string;
  unidad: string; // "min", "%", "h/mes", "COP/mes"...
  antes: number;
  despues: number;
  /** true si menos es mejor (tiempos, costos). */
  menosEsMejor: boolean;
  areaId: AreaId;
};

export type Fase = {
  nombre: string; // "Fase 1 · Control del campo"
  semanas: string; // "Semanas 1–4"
  areas: AreaId[];
  entregables: string[];
};

/** Capítulo de la historia 3D (se narra y la cámara vuela a `foco`). */
export type Capitulo = {
  titulo: string;
  /** Narración (2–4 frases, segunda persona, cálida). Se puede leer en voz alta. */
  narracion: string;
  /** "antes" muestra el caos (luces rojas, papeles), "despues" el orden (verde/acento). */
  momento: "antes" | "transicion" | "despues";
  /** Área en la que se centra la cámara; null = vista general del campus. */
  foco: AreaId | null;
  /** Áreas que se encienden en este capítulo. */
  activas: AreaId[];
};

/** Un ítem del «reporte que le llegaría» (resumen diario/semanal automático). */
export type ItemReporte = {
  etiqueta: string; // "Rondas cumplidas"
  valor: string; // "96 %"
  tendencia?: "sube" | "baja" | "igual";
  /** true si la tendencia es buena noticia. */
  bueno?: boolean;
};

export type ReporteDiario = {
  titulo: string; // "Resumen del martes · Seguridad Andina"
  hora: string; // "6:00 a. m."
  items: ItemReporte[];
  /** Alertas o eventos destacados (texto corto). */
  destacados: string[];
};

export type Diagnostico = {
  id: string;
  fecha: string; // ISO
  perfil: PerfilEmpresa;
  /** Titular del diagnóstico (1 frase). */
  titular: string;
  /** Resumen ejecutivo (3–5 frases). */
  resumen: string;
  /** 0–100: madurez digital estimada hoy y con ARS. */
  madurez: { hoy: number; conArs: number };
  hallazgos: Hallazgo[];
  recomendaciones: Recomendacion[];
  metricas: Metrica[];
  fases: Fase[];
  capitulos: Capitulo[];
  reporteDiario: ReporteDiario;
  /** Fuente: "ia" (Claude) o "demo" (simulado sin clave). */
  fuente: "ia" | "demo";
};

/* ───────────── API /api/diagnostico ───────────── */

export type PeticionDiagnostico = {
  perfil: PerfilEmpresa;
  conversacion: TurnoEntrevista[];
  /** Adjuntos analizados durante la entrevista (metadatos + lo que entendió la IA). */
  adjuntos?: AdjuntoTurno[];
};

/** Estado del guardado en el módulo de ARS (ver docs/BACKEND-REGISTROS.md). */
export type RegistroGuardado = { id: string; guardado: boolean };

export type RespuestaDiagnostico =
  | { ok: true; diagnostico: Diagnostico; registro?: RegistroGuardado }
  | { ok: false; mensaje: string };

/** Clave de sessionStorage donde la entrevista guarda el último diagnóstico. */
export const CLAVE_ALMACEN = "ars:diagnostico";
