/**
 * Contrato compartido de la narración de Ars + música de fondo.
 *
 * - Guiones: cada clip tiene un id estable (p. ej. "home/fisica"). Su texto vive
 *   en `src/data/narracion/guiones-*.ts` y su audio en
 *   `public/audio/narracion/<id>.mp3` (ruta = id tal cual, con subcarpetas).
 * - Música: camas loopables y efectos en `public/audio/musica/<nombre>.mp3`.
 *
 * Voz: «Sofía – Confianza & Calidez» (ElevenLabs b2htR0pMe28pYwCY9gnP), la misma de Ars.
 */

export const VOZ_ARS = "b2htR0pMe28pYwCY9gnP";

/** Capítulos de la home (mismo orden que CHAPTERS en components/home/story.ts). */
export const IDS_HOME = [
  "home/hero",
  "home/fisica",
  "home/vision",
  "home/iot",
  "home/robotica",
  "home/central",
  "home/traza",
  "home/escala",
  "home/recap",
  "home/contacto",
] as const;

/** Secciones de /plataforma, en orden. */
export const IDS_PLATAFORMA = [
  "plataforma/hero",
  "plataforma/en-movimiento",
  "plataforma/recorrido",
  "plataforma/arquitecto-ia",
  "plataforma/ciclo",
  "plataforma/pilares",
  "plataforma/antes-despues",
  "plataforma/cierre",
] as const;

/** Secciones del hub /servicios, en orden. */
export const IDS_SERVICIOS_HUB = [
  "servicios/hero",
  "servicios/dia",
  "servicios/areas",
  "servicios/por-que",
  "servicios/buscar",
  "servicios/canales",
  "servicios/cierre",
] as const;

/** Secciones de /vision (analíticas de video), en orden. */
export const IDS_VISION = [
  "vision/hero",
  "vision/visor",
  "vision/planificador",
  "vision/indice",
  "vision/cierre",
] as const;

/** Secciones de /laboratorio, en orden. */
export const IDS_LABORATORIO = [
  "laboratorio/hero",
  "laboratorio/modelos",
  "laboratorio/demo",
  "laboratorio/cierre",
] as const;

/** Secciones de /arquitectura, en orden. */
export const IDS_ARQUITECTURA = [
  "arquitectura/hero",
  "arquitectura/diagrama",
  "arquitectura/sigue-un-dato",
  "arquitectura/interoperabilidad",
  "arquitectura/voz",
  "arquitectura/por-que-erp",
  "arquitectura/cierre",
] as const;

/** /proyectos: la portada y el mapa (pantalla fija, sin scroll). */
export const IDS_PROYECTOS = ["proyectos/intro", "proyectos/mapa"] as const;

/**
 * «Propuesta ARS» (cierre de la home): Ars acompaña el paso a paso. No van por
 * scroll: los dispara ExperienciaPropuesta al cambiar de fase.
 */
export const IDS_PROPUESTA = [
  "propuesta/entrevista",
  "propuesta/seguimiento",
  "propuesta/armando",
  "propuesta/lista",
  "propuesta/enviada",
] as const;

/** Frases puente al retomar el recorrido tras una conversación con Ars. */
export const IDS_PUENTE = ["puente/1", "puente/2", "puente/3"] as const;

/** Introducción de un área de /servicios/[area]. */
export const idIntroArea = (areaId: string) => `servicios/${areaId}/intro`;
/** Capítulo de un módulo dentro de /servicios/[area]. */
export const idModulo = (areaId: string, moduloId: string) => `servicios/${areaId}/${moduloId}`;
/** Paso del recorrido automático de /plataforma (uno por área del catálogo). */
export const idRecorridoArea = (areaId: string) => `plataforma/recorrido/${areaId}`;

export const urlNarracion = (id: string) => `/audio/narracion/${id}.mp3`;

/** Pistas de música (camas loopables) y efectos cortos. */
export const MUSICA = {
  /** Cama principal de la home: electrónica atmosférica, 90 BPM aprox., loop. */
  home: "/audio/musica/home.mp3",
  /** Capa de pulso/percusión de la misma pieza, entra en la traza y la escala. */
  homePulso: "/audio/musica/home-pulso.mp3",
  /** Cama de /plataforma. */
  plataforma: "/audio/musica/plataforma.mp3",
  /** Efecto de transición entre capítulos (barrido suave). */
  transicion: "/audio/musica/sfx-transicion.mp3",
  /** Ping tonal cuando se enciende una capa / un evento de la traza. */
  ping: "/audio/musica/sfx-ping.mp3",
  /** Cierre resolutivo (evento cerrado / CTA final). */
  cierre: "/audio/musica/sfx-cierre.mp3",
} as const;
