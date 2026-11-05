import type { Locale } from "@/lib/i18n/dictionaries";

const ES = {
  reel: {
    etiqueta: "La plataforma en movimiento",
    titulo: "Pantallas reales, trabajando",
    bajada:
      "Clips grabados en la plataforma y recorridos por capturas reales. Toque cualquiera para verlo en grande.",
    clip: "Clip real",
    secuencia: "Captura real",
    abrir: "Ver en grande",
    cerrar: "Cerrar",
    cuadro: "Pantalla",
    de: "de",
    reducido: "Movimiento reducido: se muestran imágenes fijas.",
    verArea: "Ver el área",
  },
  recorrido: {
    etiqueta: "Recorrido por la plataforma",
    titulo: "Once áreas, una sola plataforma",
    bajada:
      "Elija un área y vea sus pantallas reales. Use las flechas del teclado para recorrerlas.",
    areas: "Áreas de la plataforma",
    modulos: "Módulos destacados",
    verArea: "Ver el área",
    piloto: "En piloto",
    pausado: "Recorrido en pausa",
    auto: "Avance automático",
    reanudar: "Reanudar",
    pausar: "Pausar",
    pantalla: "Pantalla",
    telefono: "En el celular",
    arte: "Ilustración del área",
  },
};

type Textos = typeof ES;

const EN: Textos = {
  reel: {
    etiqueta: "The platform in motion",
    titulo: "Real screens, at work",
    bajada: "Clips recorded on the platform and walkthroughs of real screenshots. Tap any of them to see it large.",
    clip: "Real clip",
    secuencia: "Real screenshot",
    abrir: "View large",
    cerrar: "Close",
    cuadro: "Screen",
    de: "of",
    reducido: "Reduced motion: still images are shown.",
    verArea: "See the area",
  },
  recorrido: {
    etiqueta: "Platform tour",
    titulo: "Eleven areas, one platform",
    bajada: "Pick an area and see its real screens. Use the arrow keys to move through them.",
    areas: "Platform areas",
    modulos: "Featured modules",
    verArea: "See the area",
    piloto: "In pilot",
    pausado: "Tour paused",
    auto: "Auto-advance",
    reanudar: "Resume",
    pausar: "Pause",
    pantalla: "Screen",
    telefono: "On the phone",
    arte: "Area illustration",
  },
};

export function textos(locale: Locale): Textos {
  return locale === "en" ? EN : ES;
}
