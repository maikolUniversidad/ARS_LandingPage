import type { Escenario } from "./tipos";

/**
 * Imágenes de marca por escenario (generadas con IA, rotuladas como ilustración).
 * Archivos en public/images/propuesta/<escenario>-<tipo>.jpg (1600×900, ~200 KB).
 *  - portada: la operación del cliente vista de noche, con la capa digital de ARS.
 *  - central: su central de monitoreo con el mapa vivo.
 *  - campo:   el vigilante con la app en el puesto.
 */
export type TipoImagen = "portada" | "central" | "campo";

export const imagenPropuesta = (escenario: Escenario, tipo: TipoImagen) =>
  `/images/propuesta/${escenario}-${tipo}.jpg`;
