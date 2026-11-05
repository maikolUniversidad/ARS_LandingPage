/**
 * Datos del reel «En movimiento» y del recorrido por áreas.
 *
 * Todo sale del catálogo real (@/data/servicios): clips, capturas con su tamaño y pie,
 * colores y letras de cada área. Aquí solo se elige QUÉ mostrar y se marca, en cada
 * captura, la zona que el cursor simulado resalta (en % del ancho y alto de la imagen).
 *
 * Guía de «lo que no se promete»: los títulos y descripciones de las tarjetas solo
 * describen lo que se ve en la captura o el clip; nada de placas, armas, EPP, térmica,
 * fuego ni SLA; lo simulado se dice simulado.
 */
import { AREAS, type Area, type Captura, type Clip, type Modulo } from "@/data/servicios";

export type Bilingue = { es: string; en: string };

/** Zona resaltada y punto de clic, en % de la captura. */
export type Foco = { x: number; y: number; w: number; h: number; cx: number; cy: number };

export type Cuadro = { captura: Captura; foco: Foco };

export type Tamano = "grande" | "ancho" | "alto" | "normal";

export type ItemReel =
  | { id: string; tipo: "clip"; area: Area; tamano: Tamano; titulo: Bilingue; descripcion: Bilingue; clip: Clip }
  | { id: string; tipo: "secuencia"; area: Area; tamano: Tamano; titulo: Bilingue; descripcion: Bilingue; cuadros: Cuadro[] };

const capturas = new Map<string, { area: Area; captura: Captura }>();
const clips = new Map<string, { area: Area; modulo: Modulo; clip: Clip }>();
for (const area of AREAS)
  for (const modulo of area.modulos) {
    for (const captura of modulo.capturas) capturas.set(captura.src, { area, captura });
    if (modulo.clip) clips.set(modulo.clip.mp4, { area, modulo, clip: modulo.clip });
  }

const cuadro = (archivo: string, foco: Foco): Cuadro | null => {
  const c = capturas.get(`/servicios/capturas/${archivo}.jpg`);
  return c ? { captura: c.captura, foco } : null;
};

const f = (x: number, y: number, w: number, h: number, cx: number, cy: number): Foco => ({ x, y, w, h, cx, cy });

function itemClip(nombre: string, tamano: Tamano, titulo: Bilingue, descripcion: Bilingue): ItemReel | null {
  const c = clips.get(`/servicios/clips/${nombre}.mp4`);
  if (!c) return null;
  return { id: nombre, tipo: "clip", area: c.area, tamano, titulo, descripcion, clip: c.clip };
}

function itemSecuencia(
  id: string,
  areaId: string,
  tamano: Tamano,
  titulo: Bilingue,
  descripcion: Bilingue,
  lista: (Cuadro | null)[]
): ItemReel | null {
  const area = AREAS.find((a) => a.id === areaId);
  const cuadros = lista.filter((c): c is Cuadro => c !== null);
  if (!area || cuadros.length === 0) return null;
  return { id, tipo: "secuencia", area, tamano, titulo, descripcion, cuadros };
}

/**
 * Orden pensado para el bento de 4 columnas con `grid-flow-dense`:
 * 24 celdas exactas (6 filas) en escritorio y 12 filas de 2 en tableta.
 */
export const REEL: ItemReel[] = [
  itemClip(
    "clip-sala-de-control",
    "grande",
    { es: "La ciudad en un mapa vivo", en: "The city on a live map" },
    {
      es: "Toda la ciudad con sus sedes y vigilantes en turno: la cámara se acerca a un sector, abre capas y leyenda y vuelve a la vista general.",
      en: "The whole city with its sites and on-duty guards: the view zooms into a sector, opens layers and legend, and returns to the overview.",
    }
  ),
  itemSecuencia(
    "gif-vision",
    "monitoreo-inteligente",
    "ancho",
    { es: "De la alerta de IA a la evidencia", en: "From AI alert to evidence" },
    {
      es: "Muro de video con la cola de alertas, el centro de alarmas con la confianza de cada evento y la galería forense lista para exportar. Cada alerta la atiende una persona.",
      en: "Video wall with the alert queue, the alarm center with each event's confidence, and the forensic gallery ready to export. A person handles every alert.",
    },
    [
      cuadro("56-vision-centro-monitoreo", f(75.8, 30.5, 21.2, 12.2, 93.8, 40)),
      cuadro("59-vision-eventos", f(4.6, 46.4, 22.7, 20.2, 13.5, 54.4)),
      cuadro("61-vision-evidencias", f(75.3, 28.8, 22.7, 39, 86.5, 66.2)),
    ]
  ),
  itemSecuencia(
    "gif-campo",
    "operacion-en-campo",
    "normal",
    { es: "Rondas y portería", en: "Patrols and front desk" },
    {
      es: "La ruta de ronda en el mapa, el generador de QR por lote para cada punto y el registro de visitantes que ya vinieron.",
      en: "The patrol route on the map, the batch QR generator for each checkpoint, and check-in for returning visitors.",
    },
    [
      cuadro("11-rondas-rutas", f(42, 17, 14, 61, 53.5, 74.5)),
      cuadro("12-rondas-codigos-qr", f(82.8, 26.9, 11, 6.5, 88.7, 30.2)),
      cuadro("18-visitantes", f(47.6, 60.8, 13.7, 33, 53.3, 88.6)),
    ]
  ),
  itemClip(
    "clip-vision-muro-video",
    "normal",
    { es: "Muro de video con IA", en: "AI video wall" },
    {
      es: "El muro de cámaras en vivo, con el conteo de cámaras en línea y la cola de alertas de IA lista para atender.",
      en: "The live camera wall, with the count of cameras online and the AI alert queue ready to handle.",
    }
  ),
  itemSecuencia(
    "gif-documental",
    "gestion-humana",
    "alto",
    { es: "El archivo que se ordena solo", en: "The archive that sorts itself" },
    {
      es: "Se sueltan los documentos en la mesa de cargue, la IA los clasifica y la auditoría muestra, persona por persona, qué falta y qué vence.",
      en: "Drop documents on the upload desk, AI classifies them, and the audit shows, person by person, what is missing and what expires.",
    },
    [
      cuadro("82-docs-cargue-mesa", f(28.3, 17.4, 46.7, 37.4, 51.7, 47.8)),
      cuadro("81-docs-busqueda", f(4.8, 18.8, 46.8, 9.2, 14, 23.5)),
      cuadro("84-docs-auditoria-gh", f(20.4, 40.2, 15.2, 6.4, 25.5, 43.5)),
    ]
  ),
  itemClip(
    "clip-recorridos-supervisor",
    "grande",
    { es: "El turno de un supervisor, reproducido", en: "A supervisor's shift, replayed" },
    {
      es: "Del tablero de recorridos a la jornada de un supervisor: su turno nocturno se reproduce sobre el mapa, sede por sede, hasta que sale de su zona.",
      en: "From the patrol dashboard to a supervisor's day: their night shift replays on the map, site by site, until they leave their zone.",
    }
  ),
  itemClip(
    "clip-arbol-documental-3d",
    "normal",
    { es: "El archivo, como un árbol", en: "The archive, as a tree" },
    {
      es: "El árbol documental en 3D gira y se acerca a una rama: cada punto es un tipo de documento.",
      en: "The 3D document tree turns and zooms into a branch: each dot is a document type.",
    }
  ),
  itemSecuencia(
    "gif-comunicacion",
    "comunicacion-y-emergencias",
    "normal",
    { es: "Radio y alertas, con su desenlace", en: "Radio and alerts, with their outcome" },
    {
      es: "La consola de radio con transmisiones y grabación, y el historial de cada pánico y salida de zona con cómo terminó.",
      en: "The radio console with transmissions and recordings, and the history of every panic and zone exit with how it ended.",
    },
    [
      cuadro("47-consola-radio", f(13.5, 33.4, 75.6, 9.4, 70, 36.5)),
      cuadro("50-historial-alertas", f(16.2, 41, 70.2, 5.6, 84.5, 43.2)),
    ]
  ),
  itemSecuencia(
    "gif-centro",
    "centro-de-operaciones",
    "ancho",
    { es: "Zonas, coberturas y recorridos", en: "Zones, coverage and patrols" },
    {
      es: "Territorios con sus zonas de colores, la sala del coordinador con los turnos sin supervisor por atender y el tablero de recorridos de la semana.",
      en: "Territories with color-coded zones, the coordinator room with unsupervised shifts to handle, and the week's patrol dashboard.",
    },
    [
      cuadro("44-zonas", f(62.2, 22.4, 17.3, 13, 71, 24.7)),
      cuadro("41-sala-coordinador", f(75.5, 12.7, 17.3, 14, 83, 22.7)),
      cuadro("49-recorridos-gps", f(16, 58.3, 70.5, 14.2, 33.5, 62)),
    ]
  ),
  itemClip(
    "clip-sala-vr",
    "ancho",
    { es: "La Sala VR por dentro", en: "Inside the VR Room" },
    {
      es: "El vestíbulo 3D, la Central Viva rodeada de tableros de eventos, radio y sala de control, y el recorrido guiado por una sede. Datos simulados de demostración.",
      en: "The 3D lobby, the Live Hub surrounded by event, radio and control-room boards, and a guided site tour. Simulated demo data.",
    }
  ),
  itemSecuencia(
    "gif-formacion",
    "formacion",
    "ancho",
    { es: "Un curso, de borrador a certificado", en: "A course, from draft to certificate" },
    {
      es: "El editor de cursos con su lista para completar, las plantillas de certificado y el mapa de reglas que decide a quién llega cada curso.",
      en: "The course editor with its completion checklist, certificate templates, and the rule map that decides who gets each course.",
    },
    [
      cuadro("96-capacitacion-catalogo", f(11, 25.5, 14.4, 53.5, 24, 48.6)),
      cuadro("101-capacitacion-certificados", f(22.3, 36, 28.9, 15.8, 36.8, 45.5)),
      cuadro("100-capacitacion-mapa-reglas", f(14, 50.5, 56, 15, 63.6, 54)),
    ]
  ),
  itemSecuencia(
    "gif-gobierno",
    "gobierno-y-seguridad",
    "ancho",
    { es: "Gobierno sin programar", en: "Governance without code" },
    {
      es: "El buscador global, el menú de módulos que se administra desde la pantalla y la Torre de Control con quién está activo ahora.",
      en: "The global search, the module menu managed from the screen, and the Control Tower showing who is active right now.",
    },
    [
      cuadro("03-buscador-modulos", f(35.5, 17.6, 32.4, 9.2, 60, 21.5)),
      cuadro("157-config-modulos", f(7.4, 41.6, 90, 6.6, 88.3, 44.5)),
      cuadro("150-torre-consola-usuarios", f(69.4, 61, 17.8, 10.5, 78.4, 66)),
    ]
  ),
].filter((i): i is ItemReel => i !== null);

/** Áreas cuyo trabajo ocurre en el puesto, desde el teléfono: el recorrido suma un celular. */
export const AREAS_DE_CAMPO = new Set(["operacion-en-campo", "comunicacion-y-emergencias"]);

/** Todas las capturas de un área, en el orden del catálogo. */
export function capturasDeArea(area: Area): Captura[] {
  return area.modulos.flatMap((m) => m.capturas);
}

/** Hasta `n` módulos destacados: primero los que están vivos, luego los que están en piloto. */
export function modulosDestacados(area: Area, n = 4): Modulo[] {
  const vivos = area.modulos.filter((m) => m.estado === "vivo");
  const piloto = area.modulos.filter((m) => m.estado === "piloto");
  return [...vivos, ...piloto].slice(0, n);
}
