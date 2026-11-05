/**
 * Contrato de eventos de ventana entre las páginas de /servicios y el asistente «Ars».
 *
 *  - EVENTO_FOCO_SERVICIO: el asistente pide mostrar un módulo (scroll suave) y/o
 *    un foco de la escena 3D. Lo escucha la página /servicios/[area].
 *  - EVENTO_PREGUNTAR: la página pide al asistente que explique un módulo
 *    (botón «Pregúntale a Ars sobre esto»). Lo escucha el asistente.
 *  - EVENTO_VOZ_ACTIVA: el asistente avisa que está hablando; el sonido de
 *    ambiente baja el volumen mientras `activa` sea true.
 *  - EVENTO_CONVERSACION: el asistente avisa que hay una conversación por voz
 *    en curso (`activa: true`) o que terminó (`activa: false`). La narración se
 *    pausa mientras dura y, al terminar, retoma con una frase puente.
 *  - EVENTO_TERMINAR_CONVERSACION: alguien (p. ej. el panel de narración) pide
 *    al asistente cortar la conversación por voz y volver al recorrido.
 */

export const EVENTO_FOCO_SERVICIO = "ars:foco-servicio";
export const EVENTO_PREGUNTAR = "ars:preguntar";
export const EVENTO_VOZ_ACTIVA = "ars:voz-activa";
export const EVENTO_CONVERSACION = "ars:conversacion";
export const EVENTO_TERMINAR_CONVERSACION = "ars:terminar-conversacion";

export type DetalleFocoServicio = {
  /** id del módulo (kebab-case, único en el catálogo). */
  modulo?: string;
  /** Clave de FOCOS_ESCENA de la escena del área. */
  foco?: string;
};

export type DetallePreguntar = {
  texto: string;
  modulo?: string;
};

export type DetalleVozActiva = {
  activa: boolean;
};

export type DetalleConversacion = {
  activa: boolean;
  /** Quién la abrió: "narracion" cuando vino del botón «Preguntarle a Ars». */
  origen?: "narracion" | "asistente";
};

declare global {
  interface WindowEventMap {
    "ars:foco-servicio": CustomEvent<DetalleFocoServicio>;
    "ars:preguntar": CustomEvent<DetallePreguntar>;
    "ars:voz-activa": CustomEvent<DetalleVozActiva>;
    "ars:conversacion": CustomEvent<DetalleConversacion>;
    "ars:terminar-conversacion": CustomEvent<Record<string, never>>;
  }
}

export function pedirFocoServicio(detalle: DetalleFocoServicio) {
  window.dispatchEvent(new CustomEvent(EVENTO_FOCO_SERVICIO, { detail: detalle }));
}

export function preguntarAArs(detalle: DetallePreguntar) {
  window.dispatchEvent(new CustomEvent(EVENTO_PREGUNTAR, { detail: detalle }));
}

export function avisarVozActiva(activa: boolean) {
  window.dispatchEvent(new CustomEvent(EVENTO_VOZ_ACTIVA, { detail: { activa } }));
}

export function avisarConversacion(detalle: DetalleConversacion) {
  window.dispatchEvent(new CustomEvent(EVENTO_CONVERSACION, { detail: detalle }));
}

export function terminarConversacion() {
  window.dispatchEvent(new CustomEvent(EVENTO_TERMINAR_CONVERSACION, { detail: {} }));
}
