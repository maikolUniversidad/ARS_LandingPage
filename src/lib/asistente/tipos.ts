/**
 * Tipos compartidos entre el cliente (widget) y el servidor (route handlers)
 * del asistente de ARS. Sin dependencias de React ni del SDK de Anthropic.
 */

export type Idioma = "es" | "en";

/** Lo que el asistente sabe de dónde está la persona en el sitio. */
export type ContextoPagina = {
  ruta: string;
  /** Hash sin `#` (p. ej. el id de la analítica abierta en /vision). */
  ancla: string;
  tituloDocumento: string;
  /** Sección más visible en pantalla (id + encabezado), si se detectó. */
  seccion: { id: string; titulo: string } | null;
  /** Analítica abierta en el visor de /vision, si aplica. */
  analitica: { id: string; nombre: string } | null;
  /**
   * En /servicios/<area>: el área y el módulo más visible (secciones con
   * `data-modulo`). El servidor completa los nombres desde el catálogo.
   */
  servicio?: ContextoServicio | null;
  idioma: Idioma;
  /** Lo que la persona contó de sí misma (memoria persistente en su navegador). */
  perfil?: Partial<Record<ClavePerfil, string>>;
  /** Recorrido reciente por el sitio, del más antiguo al más nuevo. */
  recorrido?: PasoRecorrido[];
  /** Resumen de mensajes antiguos que ya no viajan completos. */
  resumenPrevio?: string;
};

export type ContextoServicio = {
  area: string;
  /** Id del módulo más visible (o por el que la persona preguntó). */
  modulo?: string;
  /** Encabezado visible del módulo (solo informativo). */
  titulo?: string;
  /** true si la persona pulsó «Pregúntale a Ars sobre esto» en ese módulo. */
  pregunta?: boolean;
};

export const CLAVES_PERFIL = [
  "nombre",
  "empresa",
  "cargo",
  "sector",
  "tamano",
  "pais_ciudad",
  "sedes",
  "camaras",
  "necesidad",
  "interes",
] as const;
export type ClavePerfil = (typeof CLAVES_PERFIL)[number];

export type PasoRecorrido = { ruta: string; ancla: string; titulo: string; haceSeg: number };

export type Cita = { documento: string; texto: string; pagina?: number };

/** Acciones que el asistente ejecuta en el navegador. */
export type Accion =
  | { tipo: "ir_a"; ruta: string; ancla?: string }
  | { tipo: "mostrar_analitica"; id: string }
  | { tipo: "abrir_contacto"; motivo?: string }
  | { tipo: "resaltar"; ancla: string; nota?: string }
  | { tipo: "recordar"; clave: ClavePerfil; valor: string }
  | { tipo: "olvidar"; clave: ClavePerfil | "todo" }
  | { tipo: "analizar_video"; id: string }
  /** Lleva a /servicios/<area>#<modulo>, vuela la escena 3D al foco y resalta el módulo. */
  | { tipo: "mostrar_servicio"; area: string; modulo?: string; foco?: string };

/** Tarjetas enriquecidas que acompañan a un mensaje del asistente. */
export type Tarjeta =
  | {
      tipo: "analitica";
      id: string;
      nombre: string;
      corta: string;
      familia: string;
      /** Evidencia (video en bucle o imagen) del catálogo; se rotula «Ejemplo de evidencia». */
      evidencia?: EvidenciaTarjeta;
    }
  | {
      tipo: "enlace";
      ruta: string;
      ancla?: string;
      titulo: string;
      descripcion?: string;
      /** true si Ars ya movió la página hasta ahí (bloque «Te llevo a…» con rastro). */
      navegado?: boolean;
    }
  | { tipo: "contacto"; motivo?: string }
  | { tipo: "sugerencias"; opciones: string[] }
  | {
      tipo: "servicio";
      area: string;
      /** Nombre del área (para el rótulo). */
      nombreArea: string;
      modulo: string;
      nombre: string;
      frase: string;
      estado: "vivo" | "piloto" | "proximamente" | "hoja-de-ruta";
      notaEstado?: string;
      /** Color de acento del área (hex). */
      color: string;
      foco?: string;
      /** Primera captura del módulo, si existe. */
      imagen?: { src: string; alt: string };
    }
  | TarjetaEstimacion
  | TarjetaComparacion
  | TarjetaResumenVisita
  | TarjetaHallazgos
  | TarjetaGaleria
  | TarjetaGrafico
  | TarjetaPasos
  | TarjetaAntesDespues;

/** Video o imagen de evidencia de una analítica (rutas del catálogo, nunca de la IA). */
export type EvidenciaTarjeta = {
  video?: string;
  poster?: string;
  imagen?: string;
  /** Procedencia declarada por el equipo. */
  chapa: string;
  /** Clip generado con IA: se rotula «Generado con IA». */
  ia?: boolean;
};

/* ───────────── Bloques ricos (protocolo v2, ver docs/ASISTENTE.md) ───────────── */

/** Galería de capturas reales, clips o evidencias (herramienta mostrar_galeria). */
export type TarjetaGaleria = {
  tipo: "galeria";
  titulo: string;
  items: {
    medio: "imagen" | "video";
    src: string;
    poster?: string;
    alt: string;
    pie: string;
    /** Rótulos obligatorios («Ejemplo de evidencia», «Generado con IA»). */
    rotulos?: string[];
    /** A dónde lleva el elemento al tocar «Llévame». */
    accion?: Accion;
  }[];
};

/** Gráfico SVG animado con datos que entrega la IA (herramienta mostrar_grafico). */
export type TarjetaGrafico = {
  tipo: "grafico";
  forma: "barras" | "linea" | "donut";
  titulo: string;
  /** Unidad de los valores («h/mes», «%», «alertas»). */
  unidad?: string;
  datos: { etiqueta: string; valor: number }[];
  /** true → se rotula «Estimado» y se muestran los supuestos. */
  estimado: boolean;
  supuestos?: string[];
  fuente?: string;
};

/** Guía paso a paso: cada paso puede llevar a una parte del sitio (herramienta mostrar_pasos). */
export type TarjetaPasos = {
  tipo: "pasos";
  titulo: string;
  pasos: { titulo: string; detalle?: string; destino?: Accion; destinoTexto?: string }[];
};

/** Comparación antes / después de ARS (herramienta comparar_antes_despues). */
export type TarjetaAntesDespues = {
  tipo: "antes_despues";
  titulo: string;
  filas: { aspecto: string; antes: string; despues: string }[];
  nota?: string;
  estimado?: boolean;
};

/** Tamaño orientativo de la operación (no es un plan comercial). */
export type NivelOperacion = "pequena" | "mediana" | "grande";

/** Alcance orientativo de un proyecto (herramienta estimar_proyecto). Sin precios. */
export type TarjetaEstimacion = {
  tipo: "estimacion";
  nivel: NivelOperacion;
  titulo: string;
  resumen: string;
  /** Unidades que el equipo comercial usaría para cotizar (sedes, cámaras con IA…). */
  unidades: { concepto: string; cantidad: string }[];
  /** Funcionalidades de la plataforma (ids de `@/data/integral-security`; se muestran en /plataforma#recorrido). */
  modulos: { id: string; titulo: string }[];
  analiticas: { id: string; nombre: string; motivo: string }[];
  etapas: string[];
  /** Indicadores con los que se mediría el resultado (de los reportes de ARS). */
  indicadores: string[];
  supuestos: string[];
  aviso: string;
};

/** Comparación lado a lado de 2 a 4 analíticas (herramienta comparar_analiticas). */
export type TarjetaComparacion = {
  tipo: "comparacion";
  titulo: string;
  columnas: { id: string; nombre: string; familia: string }[];
  /** Una fila por criterio; `valores` en el mismo orden que `columnas`. */
  filas: { criterio: string; valores: string[] }[];
  /** Recomendación breve si hay perfil o necesidad declarada. */
  nota?: string;
};

/** Etapa del visitante en su decisión (calificación ligera del lead). */
export type EtapaVisita = "explorando" | "evaluando" | "listo";

/** Resumen de la visita para el equipo comercial (herramienta resumen_visita). */
export type TarjetaResumenVisita = {
  tipo: "resumen_visita";
  titulo: string;
  campos: { etiqueta: string; valor: string }[];
  etapa: EtapaVisita;
  siguientePaso: string;
  /** Texto que se prellena en el formulario de contacto (el visitante lo revisa y envía). */
  motivo: string;
};

/** Hallazgos de una foto o un video del visitante y las analíticas que se dispararían. */
export type TarjetaHallazgos = {
  tipo: "hallazgos";
  fuente: string;
  items: {
    observacion: string;
    analiticaId: string;
    analitica: string;
    prioridad: "alta" | "media" | "baja";
    /** Momento del video (p. ej. "00:04") o zona de la imagen. */
    momento?: string;
  }[];
};

export type AdjuntoMeta = { nombre: string; tipo: string; bytes: number };

export type MensajeChat = {
  id: string;
  rol: "user" | "assistant";
  texto: string;
  tarjetas?: Tarjeta[];
  adjuntos?: AdjuntoMeta[];
  /** Fragmentos citados de los documentos adjuntos. */
  citas?: Cita[];
  /** Mensaje dictado por voz (se muestra con un icono). */
  porVoz?: boolean;
  /** true si el mensaje terminó con error (se muestra distinto). */
  error?: boolean;
  ts: number;
};

/** Documento listo para enviar al servidor (no se guarda en el servidor). */
export type DocumentoAdjunto = {
  id: string;
  nombre: string;
  /** MIME final: application/pdf, image/jpeg|png|webp|gif, text/plain o video/fotogramas. */
  tipo: string;
  /** Bytes originales del archivo (para mostrar y para el límite). */
  bytes: number;
  /** base64 (pdf/imagen) o texto plano (text/*). */
  datos: string;
  codificacion: "base64" | "texto" | "fotogramas";
  /** Video: fotogramas JPEG (base64) muestreados en el navegador, con su segundo. */
  fotogramas?: { t: number; datos: string }[];
  /** Video: duración total en segundos. */
  duracion?: number;
};

/** Cuerpo del POST /api/asistente/chat. */
export type PeticionChat = {
  mensajes: { rol: "user" | "assistant"; texto: string }[];
  contexto: ContextoPagina;
  documentos: DocumentoAdjunto[];
  /** "voz" pide respuestas más cortas y sin Markdown (se van a leer en voz alta). */
  modo: "texto" | "voz";
};

/** Eventos NDJSON que devuelve el stream del chat. */
export type EventoStream =
  | { t: "texto"; d: string }
  | { t: "accion"; accion: Accion }
  | { t: "tarjeta"; tarjeta: Tarjeta }
  | { t: "cita"; cita: Cita }
  | { t: "fin"; motivo: string }
  | { t: "error"; codigo: CodigoError; mensaje: string };

export type CodigoError =
  | "sin_clave"
  | "limite"
  | "muy_grande"
  | "invalido"
  | "rechazo"
  | "proveedor";

/** Respuesta de GET /api/asistente/estado. */
export type EstadoServicios = {
  chat: boolean;
  modelo: string;
  voz: {
    /** ElevenLabs TTS disponible (clave + voz). */
    tts: boolean;
    /** ElevenLabs STT disponible (clave). */
    stt: boolean;
    /** Agente conversacional de ElevenLabs en tiempo real (clave + agente). */
    agente: boolean;
  };
};

/** Límites compartidos (Vercel Functions: 4.5 MB por request). */
export const LIMITES = {
  /** Tope del cuerpo del POST de chat (deja margen bajo 4.5 MB). */
  cuerpoBytes: 4_300_000,
  /** Suma de bytes originales de los documentos adjuntos activos. */
  documentosBytes: 3_000_000,
  documentosMax: 4,
  /** Texto plano: se recorta a este número de caracteres. */
  textoCaracteres: 120_000,
  /** Historial que se envía al modelo. */
  historialMensajes: 30,
  mensajeCaracteres: 6_000,
  /** Lado mayor de las imágenes tras redimensionar en el cliente. */
  imagenLado: 1568,
  /** Audio para transcribir (STT). */
  audioBytes: 4_000_000,
  ttsCaracteres: 2_500,
  /** Video: fotogramas por clip y lado mayor de cada uno. */
  fotogramasMax: 12,
  fotogramaLado: 768,
  /** Video local que se puede muestrear (no se sube: solo sus fotogramas). */
  videoBytes: 400_000_000,
} as const;

export const TIPOS_IMAGEN = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
