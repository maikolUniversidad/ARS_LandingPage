/**
 * Focos de la escena 3D de /academia. Contrato compartido con la escena Three.js
 * (`EscenaAcademia.tsx`): cada sección de la página pide uno de estos puntos de vista.
 */
export type FocoAcademia = "portal" | "dotacion" | "poligono" | "garita" | "porteria" | "plataforma";

/** Etiqueta legible de cada foco (para el marco provisional y los textos alternativos). */
export const ETIQUETAS_FOCO: Record<FocoAcademia, string> = {
  portal: "El portal de la Academia",
  dotacion: "Aula-vestier · dotación",
  poligono: "Polígono de entrenamiento",
  garita: "La garita · uso de la fuerza",
  porteria: "La portería · un turno",
  plataforma: "De la gafa a la plataforma ARS",
};
