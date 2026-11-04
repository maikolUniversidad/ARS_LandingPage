/**
 * Piezas comunes a los proveedores de LLM del asistente (Claude, GPT, DeepSeek):
 * el contrato de un "turno" y el error que permite pasar al siguiente proveedor.
 */
import type { CodigoError, DocumentoAdjunto, EventoStream, PeticionChat } from "../tipos";

export const MAX_VUELTAS = 5;

export type Emitir = (e: EventoStream) => void;

export type Turno = {
  peticion: PeticionChat;
  enviar: Emitir;
  signal: AbortSignal;
  modelo: string;
  /** Marca el fin de una vuelta con herramientas: el siguiente texto irá en párrafo aparte. */
  separar: () => void;
};

/**
 * Error de un proveedor. `reintentable` = vale la pena probar con el siguiente
 * (caída, límite, clave inválida, formato no soportado), siempre que aún no se
 * haya enviado nada al navegador.
 */
export class ErrorProveedor extends Error {
  constructor(
    public codigo: CodigoError,
    mensaje: string,
    public reintentable = true,
  ) {
    super(mensaje);
  }
}

export const fmtSeg = (t: number) => `${t.toFixed(1)} s`;
export const mmss = (t: number) => `${String(Math.floor(t / 60)).padStart(2, "0")}:${(t % 60).toFixed(1).padStart(4, "0")}`;

export const encabezadoVideo = (d: DocumentoAdjunto) =>
  `<video nombre="${d.nombre.replace(/"/g, "'")}" duracion="${d.duracion ? fmtSeg(d.duracion) : "desconocida"}" fotogramas="${d.fotogramas?.length ?? 0}">Fotogramas muestreados en orden cronológico; cada uno va precedido por su etiqueta de tiempo.`;

export const textoComoDocumento = (d: DocumentoAdjunto) =>
  `<documento nombre="${d.nombre.replace(/"/g, "'")}">\n${d.datos}\n</documento>`;

export const listaAdjuntos = (p: PeticionChat) =>
  p.documentos.length ? `<documentos_adjuntos>${p.documentos.map((d) => d.nombre).join(", ")}</documentos_adjuntos>` : "";

export const tienePdf = (p: PeticionChat) => p.documentos.some((d) => d.codificacion === "base64" && d.tipo === "application/pdf");
