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
  idioma: Idioma;
};

/** Acciones que el asistente ejecuta en el navegador. */
export type Accion =
  | { tipo: "ir_a"; ruta: string; ancla?: string }
  | { tipo: "mostrar_analitica"; id: string }
  | { tipo: "abrir_contacto"; motivo?: string }
  | { tipo: "resaltar"; ancla: string; nota?: string };

/** Tarjetas enriquecidas que acompañan a un mensaje del asistente. */
export type Tarjeta =
  | { tipo: "analitica"; id: string; nombre: string; corta: string; familia: string }
  | { tipo: "enlace"; ruta: string; ancla?: string; titulo: string; descripcion?: string }
  | { tipo: "contacto"; motivo?: string };

export type AdjuntoMeta = { nombre: string; tipo: string; bytes: number };

export type MensajeChat = {
  id: string;
  rol: "user" | "assistant";
  texto: string;
  tarjetas?: Tarjeta[];
  adjuntos?: AdjuntoMeta[];
  /** true si el mensaje terminó con error (se muestra distinto). */
  error?: boolean;
  ts: number;
};

/** Documento listo para enviar al servidor (no se guarda en el servidor). */
export type DocumentoAdjunto = {
  id: string;
  nombre: string;
  /** MIME final: application/pdf, image/jpeg|png|webp|gif o text/plain. */
  tipo: string;
  /** Bytes originales del archivo (para mostrar y para el límite). */
  bytes: number;
  /** base64 (pdf/imagen) o texto plano (text/*). */
  datos: string;
  codificacion: "base64" | "texto";
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
} as const;

export const TIPOS_IMAGEN = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
