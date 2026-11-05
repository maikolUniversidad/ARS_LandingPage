/**
 * Focos de la escena 3D de la Academia ARS (capacitación de vigilantes en VR).
 *
 * Cada foco es una «estación» de la escena: la cámara vuela de una a otra cuando
 * cambia el prop `foco` de <EscenaAcademia>.
 */

export type FocoAcademia = "portal" | "dotacion" | "poligono" | "garita" | "porteria" | "plataforma";

export const FOCOS_ACADEMIA: readonly FocoAcademia[] = ["portal", "dotacion", "poligono", "garita", "porteria", "plataforma"];

/** Descripción accesible de lo que muestra cada foco (aria-label del contenedor). */
export const DESCRIPCION_FOCO: Record<FocoAcademia, string> = {
  portal:
    "Portal de entrada a la Academia ARS: un remolino verde de energía que gira y late; a través de él se ve el patio de formación con cadetes trotando y el instructor Óscar.",
  dotacion:
    "Maniquí del vigilante en el aula-vestier: la dotación se ensambla pieza por pieza (uniforme, gorra, credencial, radio, linterna, pito, bastón, libreta y celular).",
  poligono:
    "Polígono de tiro de 25 metros con semáforo y blanco de papel: un revólver .38 de entrenamiento abre el tambor, gira y cierra para verificar que está vacío, con el cañón siempre hacia la zona segura y el dedo fuera del gatillo.",
  garita:
    "Garita de un conjunto residencial de noche, con reja, talanquera, citófono y radio; Edgar espera al otro lado de la reja.",
  porteria:
    "Portería de un conjunto con mostrador y tableta ARS; en la fila esperan un residente, un domiciliario con una caja, un adulto mayor y una visita, junto a los paquetes recibidos.",
  plataforma:
    "Gafa de realidad virtual de la que salen pulsos de luz hacia la plataforma web ARS, donde se actualizan la hoja de vida y el certificado con código QR.",
};

/** Piezas de la dotación (foco «dotacion»), en el orden en que se ensamblan. */
export const PIEZAS_DOTACION = [
  { id: "uniforme", texto: "Uniforme" },
  { id: "gorra", texto: "Gorra" },
  { id: "credencial", texto: "Credencial" },
  { id: "radio", texto: "Radio" },
  { id: "linterna", texto: "Linterna" },
  { id: "pito", texto: "Pito" },
  { id: "baston", texto: "Bastón" },
  { id: "libreta", texto: "Libreta" },
  { id: "celular", texto: "Celular" },
] as const;

export type PiezaDotacion = (typeof PIEZAS_DOTACION)[number]["id"];

export const esFocoAcademia = (v: unknown): v is FocoAcademia =>
  typeof v === "string" && (FOCOS_ACADEMIA as readonly string[]).includes(v);
