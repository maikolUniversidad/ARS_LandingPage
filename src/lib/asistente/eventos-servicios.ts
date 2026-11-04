/**
 * Contrato de eventos de `window` entre el asistente «Ars» y las páginas de
 * /servicios. Las páginas definen constantes idénticas en
 * `src/components/servicios/eventos.ts` (el integrador las unificará).
 */

/** Asistente → página: desplázate al módulo y vuela la escena 3D a su foco. */
export const EVENTO_FOCO_SERVICIO = "ars:foco-servicio";
export type DetalleFocoServicio = { modulo?: string; foco?: string };

/** Página → asistente: «Pregúntale a Ars sobre esto» (abre el panel y envía el texto). */
export const EVENTO_PREGUNTAR = "ars:preguntar";
export type DetallePreguntar = { texto: string; modulo?: string };

/** Asistente → sitio: Ars empezó o dejó de hablar (la música ambiente se atenúa). */
export const EVENTO_VOZ_ACTIVA = "ars:voz-activa";
export type DetalleVozActiva = { activa: boolean };
