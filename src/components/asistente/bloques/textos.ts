import { useTextosAsistente } from "@/lib/asistente/i18n";

const ES = {
  llevame: "Llévame",
  verEn3d: "Ver en 3D",
  evidencia: "Ejemplo de evidencia",
  generadoIa: "Generado con IA",
  estimado: "Estimado",
  supuestos: "Supuestos",
  fuente: "Fuente",
  paso: "Paso",
  ir: "Ir",
  visto: "Visto",
  antes: "Antes",
  conArs: "Con ARS",
  teLlevo: "Te llevo a",
  teLleve: "Te llevé a",
  volver: "Volver ahí",
  rastro: "Rastro",
  galeria: "Galería",
  anterior: "Anterior",
  siguiente: "Siguiente",
  pausar: "Pausar video",
  reproducir: "Reproducir video",
  estasEn: "Estás en",
  grafico: "Gráfico",
  total: "Total",
  orientativo: "Cifras orientativas, no son una promesa.",
};

const EN: typeof ES = {
  llevame: "Take me",
  verEn3d: "See in 3D",
  evidencia: "Evidence example",
  generadoIa: "AI-generated",
  estimado: "Estimate",
  supuestos: "Assumptions",
  fuente: "Source",
  paso: "Step",
  ir: "Go",
  visto: "Seen",
  antes: "Before",
  conArs: "With ARS",
  teLlevo: "Taking you to",
  teLleve: "Took you to",
  volver: "Go back there",
  rastro: "Trail",
  galeria: "Gallery",
  anterior: "Previous",
  siguiente: "Next",
  pausar: "Pause video",
  reproducir: "Play video",
  estasEn: "You're at",
  grafico: "Chart",
  total: "Total",
  orientativo: "Indicative figures, not a promise.",
};

export type TextosBloques = typeof ES;

export function useTextosBloques(): TextosBloques {
  const { idioma } = useTextosAsistente();
  return idioma === "en" ? EN : ES;
}
