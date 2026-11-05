/**
 * Contrato de eventos de `window` entre el asistente «Ars» y las páginas de
 * /servicios. La definición única vive en `src/components/servicios/eventos.ts`.
 */
export {
  EVENTO_FOCO_SERVICIO,
  EVENTO_PREGUNTAR,
  EVENTO_VOZ_ACTIVA,
  EVENTO_CONVERSACION,
  EVENTO_TERMINAR_CONVERSACION,
  type DetalleConversacion,
  type DetalleFocoServicio,
  type DetallePreguntar,
  type DetalleVozActiva,
} from "@/components/servicios/eventos";
