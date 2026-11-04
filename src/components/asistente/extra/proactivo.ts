/**
 * Sugerencia proactiva del asistente (lógica pura, sin React).
 *
 * Pautas (ver docs/asistente-plataformas.md): esperar al menos ~30 s de
 * lectura, un solo aviso por sesión, texto específico de la página, nunca
 * repetirlo si se cerró y no mostrarlo a quien ya conversó con Ars.
 */
export type SugerenciaProactiva = {
  /** Texto de la burbuja. */
  texto: string;
  /** Mensaje que se envía al asistente si la persona la acepta. */
  mensaje: string;
};

export const ESPERA_PROACTIVA_MS = 30_000;
export const CLAVE_SESION_PROACTIVA = "ars-asistente-proactivo-v1";

type Idioma = "es" | "en";

const TEXTOS: Record<string, Record<Idioma, SugerenciaProactiva>> = {
  "/": {
    es: { texto: "¿Buscas algo concreto? Cuéntame tu caso y te llevo a lo que te sirve.", mensaje: "¿Qué me recomiendas ver según mi caso?" },
    en: { texto: "Looking for something specific? Tell me your case and I'll take you there.", mensaje: "What should I look at for my case?" },
  },
  "/plataforma": {
    es: { texto: "¿Te armo en un minuto un alcance orientativo para tu operación?", mensaje: "Quiero un alcance orientativo para mi operación" },
    en: { texto: "Want an indicative scope for your operation in a minute?", mensaje: "I'd like an indicative scope for my operation" },
  },
  "/vision": {
    es: { texto: "¿No sabes por cuál empezar? Dime tu sector y te recomiendo tres.", mensaje: "Recomiéndame analíticas para mi sector" },
    en: { texto: "Not sure where to start? Tell me your industry and I'll suggest three.", mensaje: "Recommend analytics for my industry" },
  },
  "/laboratorio": {
    es: { texto: "¿Quieres que mire una foto o un video de tus cámaras y te diga qué detectaría ARS?", mensaje: "Quiero que analices una foto o un video de mis cámaras" },
    en: { texto: "Want me to look at a photo or clip from your cameras and tell you what ARS would detect?", mensaje: "I'd like you to analyze a photo or video from my cameras" },
  },
  "/proyectos": {
    es: { texto: "¿Te cuento cómo trabaja ARS en tu sector?", mensaje: "¿Cómo trabaja ARS en mi sector?" },
    en: { texto: "Want to know how ARS works in your industry?", mensaje: "How does ARS work in my industry?" },
  },
};

/**
 * Sugerencia para la ruta actual, o null si no corresponde mostrar ninguna.
 * `ancla` es el hash sin `#` (en /vision, el id de la analítica abierta).
 */
export function sugerenciaProactiva(ruta: string, ancla: string, idioma: Idioma): SugerenciaProactiva | null {
  const r = ruta.replace(/\/+$/, "") || "/";
  if (r === "/vision" && ancla && !["visor", "indice", "cierre"].includes(ancla)) {
    return idioma === "en"
      ? { texto: "Want me to compare this analytic with similar ones?", mensaje: `Compare the "${ancla}" analytic with similar ones` }
      : { texto: "¿Te comparo esta analítica con otras parecidas?", mensaje: `Compara la analítica «${ancla}» con otras parecidas` };
  }
  return TEXTOS[r]?.[idioma] ?? null;
}

/** true si ya se mostró o se cerró en esta sesión, o si la persona ya conversó con Ars. */
export function proactivoBloqueado(): boolean {
  try {
    if (sessionStorage.getItem(CLAVE_SESION_PROACTIVA)) return true;
    const historial = localStorage.getItem("ars-asistente-v1");
    return Boolean(historial && historial.length > 20);
  } catch {
    return true;
  }
}

export function marcarProactivo(estado: "mostrado" | "cerrado" | "aceptado"): void {
  try {
    sessionStorage.setItem(CLAVE_SESION_PROACTIVA, estado);
  } catch {
    /* almacenamiento bloqueado: no se vuelve a mostrar en este render igualmente */
  }
}
