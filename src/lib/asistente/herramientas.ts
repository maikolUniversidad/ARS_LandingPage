/**
 * Herramientas (tool use) del asistente. Se usan en el servidor para Claude y
 * sus nombres/parámetros se repiten en el agente de voz de ElevenLabs como
 * "client tools", así que ambos cerebros mueven la web igual.
 *
 * Las acciones de navegación se ejecutan en el navegador: el servidor valida
 * la llamada, emite un evento `accion` en el stream y le responde a Claude que
 * la acción quedó hecha.
 *
 * Las definiciones son JSON Schema plano y neutral al proveedor (Anthropic,
 * DeepSeek por su endpoint compatible y OpenAI con `comoFuncionesOpenAI()`).
 * `ejecutarHerramienta` es síncrona (buscar_conocimiento usa palabras clave);
 * `ejecutarHerramientaAsync` además hace la búsqueda semántica con
 * embeddings de OpenAI. Ver `docs/asistente-plataformas.md`.
 */
import { analiticas, familias } from "@/data/analiticas";
import { RUTAS_SITIO, buscarAnalitica } from "@/data/asistente";
import { AREAS, areaPorId, buscarModulos, moduloPorId, type Area, type Modulo } from "@/data/servicios";
import { FOCOS_ESCENA } from "@/components/servicios/escenas/contrato";
import type { FuenteTrozo } from "@/data/asistente/tipos";
import { features } from "@/data/integral-security";
import { HERRAMIENTAS_BLOQUES, ejecutarBloque, evidenciaDe } from "./bloques";
import { buscarConocimiento, buscarPorPalabras, type ModoBusqueda, type ResultadoBusqueda } from "./busqueda";
import {
  CLAVES_PERFIL,
  type Accion,
  type ClavePerfil,
  type EtapaVisita,
  type NivelOperacion,
  type Tarjeta,
  type TarjetaComparacion,
  type TarjetaEstimacion,
  type TarjetaHallazgos,
  type TarjetaResumenVisita,
} from "./tipos";

export const RUTAS_VALIDAS = RUTAS_SITIO.map((r) => r.ruta);
export const AREAS_VALIDAS = AREAS.map((a) => a.id);

const porId = new Map(analiticas.map((a) => [a.id, a]));
const nombreFamilia = new Map(familias.map((f) => [f.id, f.nombre]));

/** Definición de herramienta neutral al proveedor (JSON Schema plano). */
export type DefinicionHerramienta = {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
    additionalProperties?: boolean;
  };
};

// ─────────────────────────── Catálogos de las herramientas de proyecto ───────────────────────────

const SECTORES = [
  "retail",
  "logistica",
  "industrial",
  "residencial",
  "educacion",
  "salud",
  "corporativo",
  "transporte",
  "empresa_seguridad",
  "otro",
] as const;
type Sector = (typeof SECTORES)[number];

const ETIQUETA_SECTOR: Record<Sector, string> = {
  retail: "Retail / tiendas",
  logistica: "Logística / bodegas",
  industrial: "Industrial / planta",
  residencial: "Conjunto residencial",
  educacion: "Educación / campus",
  salud: "Salud",
  corporativo: "Corporativo / oficinas",
  transporte: "Transporte / movilidad",
  empresa_seguridad: "Empresa de seguridad (multi-cliente)",
  otro: "Otro sector",
};

/** Analíticas de partida por sector si los objetivos no alcanzan (de la base de conocimiento). */
const BASE_SECTOR: Record<Sector, string[]> = {
  retail: ["calor", "conteo"],
  logistica: ["placas", "epp"],
  industrial: ["epp", "intrusion"],
  residencial: ["intrusion", "acceso"],
  educacion: ["acceso", "merodeo"],
  salud: ["caidas", "acceso"],
  corporativo: ["blancas", "acceso"],
  transporte: ["aglomeracion", "abandono"],
  empresa_seguridad: ["guardian", "intrusion"],
  otro: ["intrusion", "conteo"],
};

type DefObjetivo = { etiqueta: string; analiticas: string[]; lite: string[]; indicadores: string[] };

/** Objetivo → analíticas (ids reales del catálogo), alternativa lite e indicadores de reportes de ARS. */
const OBJETIVOS: Record<string, DefObjetivo> = {
  perdidas_hurto: {
    etiqueta: "Pérdidas y hurto",
    analiticas: ["hurto", "ocultaProd", "trazabilidad", "autopago", "activos"],
    lite: ["trazabilidad", "autopago"],
    indicadores: ["Alertas por tipo y por sede", "Riesgos recurrentes"],
  },
  filas_aforo: {
    etiqueta: "Filas y aforo",
    analiticas: ["filas", "aforo", "conteo", "permanencia"],
    lite: ["conteo"],
    indicadores: ["Visitas por hora y pico del día", "Tiempo de respuesta"],
  },
  perimetro_intrusion: {
    etiqueta: "Perímetro e intrusión",
    analiticas: ["intrusion", "merodeo", "acceso", "cruce"],
    lite: ["zonaCiega", "intrusion"],
    indicadores: ["Eventos por cámara", "Tiempo de respuesta"],
  },
  epp_sst: {
    etiqueta: "EPP y seguridad laboral",
    analiticas: ["epp", "caidas", "pasillos", "derrames"],
    lite: ["pasillos"],
    indicadores: ["No conformidades de EPP para auditoría SST", "Eventos por cámara"],
  },
  control_guardas: {
    etiqueta: "Control de guardas, turnos y rondas",
    analiticas: ["guardian", "staff"],
    lite: [],
    indicadores: ["Cumplimiento de turnos", "Rondas completadas y fallidas", "Actividad por guarda"],
  },
  reportes: {
    etiqueta: "Reportes y trazabilidad",
    analiticas: [],
    lite: [],
    indicadores: ["Novedades por sede", "Evidencia generada", "Reportes por periodo"],
  },
  accesos_vehiculos: {
    etiqueta: "Accesos y vehículos",
    analiticas: ["placas", "blancas", "negras", "acceso"],
    lite: ["placas"],
    indicadores: ["Eventos por cámara", "Alertas por tipo"],
  },
  inventario_gondola: {
    etiqueta: "Inventario y góndola",
    analiticas: ["huecos", "exhibicion", "vencido", "racks", "bodega", "canastillas"],
    lite: ["huecos", "vencido", "canastillas"],
    indicadores: ["Alertas por tipo y por sede", "Riesgos recurrentes"],
  },
  emergencias: {
    etiqueta: "Emergencias y riesgos críticos",
    analiticas: ["fuego", "armas", "peleas", "aglomeracion", "abandono", "caidas"],
    lite: [],
    indicadores: ["Tiempo de respuesta", "Alertas por tipo"],
  },
  comercial_marketing: {
    etiqueta: "Analítica comercial de tienda",
    analiticas: ["calor", "conteo", "permanencia", "comprador", "demografia"],
    lite: ["conteo"],
    indicadores: ["Visitas por hora y pico del día", "Permanencia por zona"],
  },
};
const OBJETIVOS_IDS = Object.keys(OBJETIVOS);

/** Sectores para los que la base de conocimiento recomienda cada analítica (fila «Ideal para»). */
const SECTORES_ANALITICA: Record<string, string[]> = (() => {
  const grupos: [string, string[]][] = [
    ["retail", ["calor", "conteo", "permanencia", "filas", "huecos", "hurto", "autopago", "trazabilidad", "aforo", "ocultaProd", "comprador", "demografia", "exhibicion", "vencido", "fleje", "apertura", "cierre"]],
    ["industria y logística", ["epp", "intrusion", "placas", "racks", "pasillos", "bodega", "fuego", "derrames", "canastillas", "caidas", "activos", "destruccion"]],
    ["perímetro y seguridad física", ["intrusion", "merodeo", "acceso", "negras", "armas", "blancas2", "abandono", "peleas", "rostro", "zonaCiega", "cruce"]],
    ["campus y residencial", ["acceso", "merodeo", "cruce", "intrusion", "placas", "blancas", "aglomeracion", "puertas"]],
    ["control de puestos y personal", ["guardian", "staff", "seguimiento", "blancas"]],
  ];
  const out: Record<string, string[]> = {};
  for (const [sector, ids] of grupos) for (const id of ids) (out[id] ??= []).push(sector);
  return out;
})();

const FUNCIONALIDADES = features.es;
const FUNCIONALIDADES_IDS = FUNCIONALIDADES.map((f) => f.id);
const tituloFuncionalidad = new Map(FUNCIONALIDADES.map((f) => [f.id, f.title]));

const PLAZOS = ["inmediato", "1-3 meses", "3-6 meses", "sin definir"] as const;
const PASOS = ["demo", "cotizacion", "llamada", "informacion"] as const;
const ETIQUETA_PASO: Record<(typeof PASOS)[number], string> = {
  demo: "Demo guiada",
  cotizacion: "Cotización",
  llamada: "Llamada con un asesor",
  informacion: "Más información por correo",
};
const ETIQUETA_ETAPA: Record<EtapaVisita, string> = {
  explorando: "Explorando opciones",
  evaluando: "Evaluando una solución",
  listo: "Listo para avanzar",
};
const ETIQUETA_NIVEL: Record<NivelOperacion, string> = {
  pequena: "Operación pequeña",
  mediana: "Operación mediana",
  grande: "Operación grande / multisede",
};
const FUENTES: FuenteTrozo[] = ["kb", "analitica", "funcionalidad", "laboratorio", "modelo"];

/** Orden fijo: cambiar el orden invalida la caché de prompt. Las nuevas van al final. */
export const HERRAMIENTAS: DefinicionHerramienta[] = [
  {
    name: "ir_a",
    description:
      "Lleva a la persona a una página del sitio de ARS (y opcionalmente a una sección por su ancla). Úsala cuando pida ver, abrir o ir a algo, o cuando acompañarla a la sección correcta sea claramente útil. No la uses para analíticas de video: para eso está mostrar_analitica.",
    input_schema: {
      type: "object",
      properties: {
        ruta: { type: "string", enum: RUTAS_VALIDAS, description: "Ruta del sitio." },
        ancla: {
          type: "string",
          description: "Id de la sección dentro de la página (sin #), solo si existe en el mapa del sitio.",
        },
      },
      required: ["ruta"],
      additionalProperties: false,
    },
  },
  {
    name: "mostrar_analitica",
    description:
      "Abre una analítica de video concreta en el visor de /vision (simulación 3D + prueba real). Usa el id exacto del catálogo.",
    input_schema: {
      type: "object",
      properties: { id: { type: "string", description: "Id de la analítica, tal como aparece en el catálogo." } },
      required: ["id"],
      additionalProperties: false,
    },
  },
  {
    name: "abrir_contacto",
    description:
      "Muestra en el chat el formulario de contacto con el equipo comercial de ARS (demo, cotización, propuesta). Úsala cuando la persona quiera hablar con alguien, pedir una demo o precios.",
    input_schema: {
      type: "object",
      properties: {
        motivo: { type: "string", description: "Resumen breve de lo que la persona necesita, para prellenar el mensaje." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "resaltar",
    description:
      "Resalta y desplaza hasta una sección de la página ACTUAL (por su id) para señalarle algo a la persona sin cambiar de página.",
    input_schema: {
      type: "object",
      properties: {
        ancla: { type: "string", description: "Id de la sección en la página actual." },
        nota: { type: "string", description: "Texto corto opcional que acompaña el resaltado." },
      },
      required: ["ancla"],
      additionalProperties: false,
    },
  },
  {
    name: "recomendar",
    description:
      "Muestra tarjetas con enlaces (analíticas, módulos de servicio y/o páginas) debajo de tu respuesta SIN navegar. Úsala para sugerir 1 a 4 lugares relevantes.",
    input_schema: {
      type: "object",
      properties: {
        analiticas: { type: "array", items: { type: "string" }, description: "Ids de analíticas a sugerir." },
        servicios: {
          type: "array",
          items: { type: "string" },
          description: "Ids de módulos del catálogo de servicios (p. ej. 'vision-artificial'). Cada tarjeta lleva a su área y lo muestra en 3D.",
        },
        paginas: {
          type: "array",
          items: {
            type: "object",
            properties: {
              ruta: { type: "string", enum: RUTAS_VALIDAS },
              ancla: { type: "string" },
            },
            required: ["ruta"],
            additionalProperties: false,
          },
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: "recordar",
    description:
      "Guarda un dato que la persona contó de sí misma o de su empresa para personalizar el resto de la visita (queda solo en su navegador). Úsala en cuanto lo diga, sin anunciarlo. Nunca guardes datos sensibles (documentos de identidad, contraseñas, datos financieros o de salud).",
    input_schema: {
      type: "object",
      properties: {
        clave: { type: "string", enum: [...CLAVES_PERFIL], description: "Qué dato es." },
        valor: { type: "string", description: "El dato, breve (p. ej. 'retail', 'mediana · 3 sedes', '40 cámaras')." },
      },
      required: ["clave", "valor"],
      additionalProperties: false,
    },
  },
  {
    name: "olvidar",
    description: "Borra un dato guardado con recordar (o todos con clave 'todo') cuando la persona lo pida.",
    input_schema: {
      type: "object",
      properties: { clave: { type: "string", enum: [...CLAVES_PERFIL, "todo"] } },
      required: ["clave"],
      additionalProperties: false,
    },
  },
  {
    name: "analizar_video",
    description:
      "Extrae fotogramas del video (o imagen) de prueba real de una analítica de /vision y te los envía en el siguiente mensaje para que describas qué pasa, segundo a segundo. Úsala cuando pidan analizar, explicar o 'ver' el video real de una analítica. Solo funciona con analíticas marcadas [evidencia real].",
    input_schema: {
      type: "object",
      properties: { id: { type: "string", description: "Id de la analítica con evidencia real." } },
      required: ["id"],
      additionalProperties: false,
    },
  },
  {
    name: "sugerir",
    description:
      "Muestra 2 o 3 respuestas rápidas (botones) que la persona podría decir a continuación, en su idioma y en primera persona (p. ej. 'Muéstrame el video real', 'Tengo 3 sedes'). Úsala al final de casi todas tus respuestas, salvo en modo voz.",
    input_schema: {
      type: "object",
      properties: { opciones: { type: "array", items: { type: "string" }, description: "2 o 3 opciones de máx. 50 caracteres." } },
      required: ["opciones"],
      additionalProperties: false,
    },
  },
  {
    name: "buscar_analiticas",
    description:
      "Busca en el catálogo de analíticas de video por palabras clave (p. ej. 'casco', 'fila', 'placa'). Devuelve hasta 5 coincidencias con id, nombre y descripción corta.",
    input_schema: {
      type: "object",
      properties: { consulta: { type: "string" } },
      required: ["consulta"],
      additionalProperties: false,
    },
  },
  // ── Servicios (/servicios). Van al final para no invalidar la caché de las anteriores. ──
  {
    name: "mostrar_servicio",
    description:
      "MUESTRA un servicio de ARS: lleva a la persona a /servicios/<area> (y al módulo, si lo das), vuela la escena 3D del área a su foco y resalta el módulo. Úsala SIEMPRE que la persona pregunte por un servicio, área o módulo (p. ej. reconocimiento facial, nómina, edificio inteligente, ZKTeco, radio, rondas, centro de datos, dónde quedan los datos u on premise), y en cada paso de un recorrido guiado. Usa ids exactos del catálogo de servicios; si dudas, usa buscar_servicios.",
    input_schema: {
      type: "object",
      properties: {
        area: { type: "string", enum: AREAS_VALIDAS, description: "Id del área (slug de /servicios/<area>)." },
        modulo: { type: "string", description: "Id del módulo dentro del área (ancla de la sección)." },
        foco: {
          type: "string",
          description: "Clave de foco de la escena 3D del área, solo si quieres un encuadre distinto al del módulo.",
        },
      },
      required: ["area"],
      additionalProperties: false,
    },
  },
  {
    name: "buscar_servicios",
    description:
      "Busca en el catálogo de servicios de ARS (áreas y módulos) por palabras clave (p. ej. 'facial', 'nómina', 'pánico', 'ZKTeco'). Devuelve hasta 6 módulos con área, id, nombre, frase y estado.",
    input_schema: {
      type: "object",
      properties: { consulta: { type: "string" } },
      required: ["consulta"],
      additionalProperties: false,
    },
  },
  {
    name: "buscar_conocimiento",
    description:
      "Busca por significado (no solo por palabras) en la documentación de ARS: sitio, plataforma, funcionalidades y casos de uso, cada analítica con su descripción completa y cómo se activa, laboratorio y Vision Lab. Úsala antes de responder preguntas de DETALLE que la base de conocimiento del system prompt no cubra con precisión, o cuando dudes. Devuelve hasta 6 fragmentos con título, enlace y texto: responde con ellos y, si sirve, muestra la fuente con recomendar o mostrar_analitica (sin escribir el enlace). No la uses para saludos ni para lo que ya sabes con certeza.",
    input_schema: {
      type: "object",
      properties: {
        consulta: {
          type: "string",
          description: "La pregunta reformulada en español, completa y concreta (p. ej. 'cómo detecta EPP en bodegas sin cámaras nuevas').",
        },
        fuente: {
          type: "string",
          enum: ["todas", ...FUENTES],
          description: "Opcional: limita a un tipo de fuente (kb = documentos del sitio). Por defecto, todas.",
        },
      },
      required: ["consulta"],
      additionalProperties: false,
    },
  },
  {
    name: "estimar_proyecto",
    description:
      "Arma un ALCANCE ORIENTATIVO (no una cotización y sin precios): tamaño de la operación, funcionalidades de la plataforma y analíticas sugeridas, unidades con las que el equipo cotizaría, etapas e indicadores para medir el resultado. Se muestra como tarjeta. Úsala cuando pidan una estimación, presupuesto, propuesta, 'qué necesitaría' o 'por dónde empiezo' y ya sepas el sector, las sedes y al menos un objetivo (si falta algo, pregunta primero, una cosa a la vez).",
    input_schema: {
      type: "object",
      properties: {
        sector: { type: "string", enum: [...SECTORES], description: "Sector o tipo de instalación." },
        sedes: { type: "integer", minimum: 1, maximum: 1000, description: "Número aproximado de sedes o sitios." },
        camaras: { type: "integer", minimum: 0, maximum: 50000, description: "Cámaras instaladas en total (aprox.). 0 si no sabe." },
        vigilancia_fisica: { type: "boolean", description: "true si tiene guardas propios o contratados (turnos y rondas)." },
        objetivos: {
          type: "array",
          items: { type: "string", enum: OBJETIVOS_IDS },
          description: "1 a 4 problemas u objetivos principales.",
        },
        tiene_grabador: { type: "boolean", description: "Opcional: true si ya tiene NVR/DVR o VMS." },
      },
      required: ["sector", "sedes", "objetivos"],
      additionalProperties: false,
    },
  },
  {
    name: "comparar_analiticas",
    description:
      "Compara lado a lado 2 a 4 analíticas del catálogo (qué detecta, cómo funciona, cómo se activa, estado, prueba real y para qué sectores sirve) en una tabla. Úsala cuando pidan comparar, elegir entre analíticas o 'cuál me conviene'. Después di en 1 o 2 frases cuál recomiendas para su caso y por qué.",
    input_schema: {
      type: "object",
      properties: {
        ids: { type: "array", items: { type: "string" }, description: "2 a 4 ids exactos del catálogo." },
        conclusion: { type: "string", description: "Opcional: una frase con la recomendación para el caso de la persona (máx. 200 caracteres)." },
      },
      required: ["ids"],
      additionalProperties: false,
    },
  },
  {
    name: "resumen_visita",
    description:
      "Prepara el resumen de la visita para el equipo comercial (necesidad, perfil, intereses, plazo y siguiente paso) y abre el formulario de contacto con ese resumen ya escrito: la persona lo revisa, completa nombre y correo y lo envía ella misma. Úsala EN LUGAR de abrir_contacto cuando quiera una demo, una cotización o que la contacten y ya conozcas su necesidad. Usa solo lo que la persona dijo o vio en el sitio; nunca datos sensibles.",
    input_schema: {
      type: "object",
      properties: {
        necesidad: { type: "string", description: "Lo que necesita, en una o dos frases, con sus palabras." },
        sector: { type: "string" },
        empresa: { type: "string", description: "Solo si la persona la dijo." },
        cargo: { type: "string", description: "Solo si la persona lo dijo." },
        pais_ciudad: { type: "string" },
        sedes: { type: "integer", minimum: 1, maximum: 1000 },
        camaras: { type: "integer", minimum: 0, maximum: 50000 },
        analiticas: { type: "array", items: { type: "string" }, description: "Ids de analíticas que le interesaron." },
        funcionalidades: {
          type: "array",
          items: { type: "string", enum: FUNCIONALIDADES_IDS },
          description: "Funcionalidades de la plataforma que le interesaron.",
        },
        plazo: { type: "string", enum: [...PLAZOS] },
        siguiente_paso: { type: "string", enum: [...PASOS] },
        notas: { type: "string", description: "Opcional: algo más que el equipo deba saber (máx. 300 caracteres)." },
      },
      required: ["necesidad", "siguiente_paso"],
      additionalProperties: false,
    },
  },
  {
    name: "reportar_hallazgos",
    description:
      "Después de analizar una FOTO o un VIDEO que adjuntó la persona (o el video real de una analítica), muestra una tarjeta con lo que ARS detectaría: cada hallazgo con la analítica del catálogo que lo cubre, su prioridad y, en video, el segundo. Úsala una vez por análisis, además de tu explicación en texto. No describas rasgos ni identifiques a personas reales.",
    input_schema: {
      type: "object",
      properties: {
        fuente: { type: "string", description: "Qué se analizó (p. ej. 'Foto de la bodega', 'Video del parqueadero')." },
        hallazgos: {
          type: "array",
          items: {
            type: "object",
            properties: {
              observacion: { type: "string", description: "Lo que se ve (máx. 160 caracteres)." },
              analitica_id: { type: "string", description: "Id exacto de la analítica que lo detectaría." },
              prioridad: { type: "string", enum: ["alta", "media", "baja"] },
              momento: { type: "string", description: "Opcional: segundo del video (mm:ss) o zona de la imagen." },
            },
            required: ["observacion", "analitica_id", "prioridad"],
            additionalProperties: false,
          },
          description: "1 a 6 hallazgos, del más importante al menos.",
        },
      },
      required: ["fuente", "hallazgos"],
      additionalProperties: false,
    },
  },
  // ── Bloques ricos (galería, gráfico, pasos, antes/después). Al final: no invalidan la caché. ──
  ...HERRAMIENTAS_BLOQUES,
];

/** Las mismas herramientas en el formato de *function calling* de OpenAI (Chat Completions). */
export function comoFuncionesOpenAI() {
  return HERRAMIENTAS.map((h) => ({
    type: "function" as const,
    function: { name: h.name, description: h.description, parameters: h.input_schema },
  }));
}

export type ResultadoHerramienta = {
  /** Texto que vuelve a Claude como tool_result. */
  resultado: string;
  esError: boolean;
  acciones: Accion[];
  tarjetas: Tarjeta[];
};

const obj = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
const str = (v: unknown, max = 300): string | undefined =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined;

function anclaValida(ruta: string, ancla: string | undefined): string | undefined {
  if (!ancla) return undefined;
  const limpia = ancla.replace(/^#/, "");
  const r = RUTAS_SITIO.find((x) => x.ruta === ruta);
  return r?.anclas.some((a) => a.id === limpia) ? limpia : undefined;
}

function tarjetaAnalitica(id: string): Tarjeta | null {
  const a = porId.get(id);
  if (!a) return null;
  return {
    tipo: "analitica",
    id: a.id,
    nombre: a.nombre,
    corta: a.corta,
    familia: nombreFamilia.get(a.familia) ?? a.familia,
    evidencia: evidenciaDe(a.id),
  };
}

function tarjetaRuta(ruta: string, ancla?: string): Tarjeta | null {
  const r = RUTAS_SITIO.find((x) => x.ruta === ruta);
  if (!r) return null;
  const a = ancla ? r.anclas.find((x) => x.id === ancla) : undefined;
  // Textos de tarjeta para personas: sin notas técnicas del mapa del sitio.
  const limpio = (t: string) =>
    t
      .replace(/\([^)]*\)/g, "")
      .replace(/^\d+\s*·\s*/, "")
      .split(/[:—]/)[0]
      .trim();
  const resumen = (t: string) => {
    const frase = t.replace(/\([^)]*\)/g, "").split(/(?<=\.)\s/)[0].trim();
    return frase.length > 120 ? `${frase.slice(0, 117)}…` : frase;
  };
  return {
    tipo: "enlace",
    ruta,
    ancla,
    titulo: a ? limpio(a.descripcion) : r.titulo,
    descripcion: a ? r.titulo : resumen(r.descripcion),
  };
}

function tarjetaServicio(area: Area, modulo: Modulo): Tarjeta {
  const captura = modulo.capturas[0];
  return {
    tipo: "servicio",
    area: area.id,
    nombreArea: area.nombre,
    modulo: modulo.id,
    nombre: modulo.nombre,
    frase: modulo.frase,
    estado: modulo.estado,
    notaEstado: modulo.notaEstado,
    color: area.color,
    foco: modulo.foco,
    imagen: captura ? { src: captura.src, alt: captura.alt } : undefined,
  };
}

const ESTADO_TEXTO: Record<Modulo["estado"], string> = {
  vivo: "vivo",
  piloto: "en piloto",
  proximamente: "próximamente",
  "hoja-de-ruta": "hoja de ruta",
};

/** Resuelve área + módulo + foco de una llamada a mostrar_servicio (tolerante). */
export function resolverServicio(
  areaId: string | undefined,
  moduloId: string | undefined,
  focoPedido: string | undefined,
): { area: Area; modulo?: Modulo; foco?: string } | { error: string } {
  const delModulo = moduloId ? moduloPorId(moduloId) : undefined;
  if (moduloId && !delModulo) {
    const sug = buscarModulos(moduloId.replace(/-/g, " "), 3).map((x) => `${x.area.id}/${x.modulo.id}`);
    return { error: `No existe el módulo "${moduloId}".${sug.length ? ` Quizá: ${sug.join(", ")}` : ""}` };
  }
  // Si el módulo es de otra área, manda el módulo.
  const area = delModulo?.area ?? (areaId ? areaPorId(areaId) : undefined);
  if (!area) return { error: `Área inválida. Áreas válidas: ${AREAS_VALIDAS.join(", ")}` };
  const focos = FOCOS_ESCENA[area.escena] ?? {};
  const foco = focoPedido && focos[focoPedido] ? focoPedido : delModulo?.modulo.foco;
  return { area, modulo: delModulo?.modulo, foco: foco && focos[foco] ? foco : undefined };
}

const error = (resultado: string): ResultadoHerramienta => ({ resultado, esError: true, acciones: [], tarjetas: [] });

const strs = (v: unknown, max: number, n: number): string[] =>
  Array.isArray(v)
    ? [...new Set(v.map((x) => str(x, max)).filter((x): x is string => Boolean(x)))].slice(0, n)
    : [];
const entero = (v: unknown, min: number, max: number): number | undefined =>
  typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, Math.round(v))) : undefined;
const recortar = (s: string, max: number) => (s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s);
const de = <T extends string>(v: unknown, lista: readonly T[]): T | undefined =>
  typeof v === "string" && (lista as readonly string[]).includes(v) ? (v as T) : undefined;
/** Quita secuencias largas de dígitos (documentos, tarjetas, teléfonos) de lo que va al equipo. */
const sinDatosSensibles = (s: string) => s.replace(/\d[\d\s.-]{7,}\d/g, "[omitido]");

/** Analítica válida por id exacto, o la mejor coincidencia de la búsqueda. */
function resolverAnalitica(id: string) {
  return porId.get(id) ?? porId.get(buscarAnalitica(id)[0]?.id ?? "");
}

function estimarProyecto(e: Record<string, unknown>): ResultadoHerramienta {
  const sector = de(e.sector, SECTORES) ?? "otro";
  const sedes = entero(e.sedes, 1, 1000);
  if (!sedes) return error("Falta el número aproximado de sedes: pregúntalo antes de estimar.");
  const camaras = entero(e.camaras, 0, 50_000) ?? 0;
  const objetivos = strs(e.objetivos, 40, 4).filter((o) => o in OBJETIVOS);
  if (!objetivos.length) return error(`Faltan objetivos válidos. Opciones: ${OBJETIVOS_IDS.join(", ")}.`);
  const guardas = e.vigilancia_fisica === true || objetivos.includes("control_guardas") || sector === "empresa_seguridad";

  const nivel: NivelOperacion =
    sedes >= 10 || camaras >= 200 || (sector === "empresa_seguridad" && sedes >= 3)
      ? "grande"
      : sedes >= 2 || camaras >= 30
        ? "mediana"
        : "pequena";

  // Analíticas: por objetivo (en pequeña, primero las lite), máx. 6 sin repetir.
  const elegidas = new Map<string, string>();
  const porObjetivo = nivel === "pequena" ? 2 : 3;
  for (const o of objetivos) {
    const def = OBJETIVOS[o];
    const orden = nivel === "pequena" ? [...def.lite, ...def.analiticas] : def.analiticas;
    let n = 0;
    for (const id of orden) {
      if (n >= porObjetivo || elegidas.size >= 6) break;
      if (!porId.has(id) || elegidas.has(id)) continue;
      elegidas.set(id, def.etiqueta);
      n++;
    }
  }
  for (const id of BASE_SECTOR[sector]) {
    if (elegidas.size >= 2) break;
    if (porId.has(id) && !elegidas.has(id)) elegidas.set(id, `Base para ${ETIQUETA_SECTOR[sector].toLowerCase()}`);
  }

  // Funcionalidades de la plataforma, en el orden de /plataforma.
  const mods = new Set<string>(["alertas", "evidencia", "reportes"]);
  if (camaras > 0 || elegidas.size) mods.add("ia");
  if (guardas) ["turnos", "personal", "rondas", "tareas", "formularios", "pot"].forEach((m) => mods.add(m));
  if (guardas && nivel !== "pequena") ["mapa", "ptt"].forEach((m) => mods.add(m));
  if (nivel !== "pequena") mods.add("central");
  if (sedes > 1 || sector === "empresa_seguridad") mods.add("multisite");
  const modulos = FUNCIONALIDADES.filter((f) => mods.has(f.id)).map((f) => ({ id: f.id, titulo: f.title }));

  const porSede = camaras ? Math.max(1, Math.ceil(camaras / sedes)) : 0;
  const unidades: TarjetaEstimacion["unidades"] = [
    { concepto: "Sedes", cantidad: String(sedes) },
    { concepto: "Cámaras instaladas", cantidad: camaras ? `~${camaras}` : "Por levantar" },
    {
      concepto: "Cámaras sugeridas para el piloto",
      cantidad: porSede ? `${Math.min(porSede, 8)}${sedes > 1 ? " en 1 sede" : ""}` : "A definir en el levantamiento",
    },
    { concepto: "Analíticas a priorizar", cantidad: String(elegidas.size) },
  ];
  if (guardas) unidades.push({ concepto: "Puestos, turnos y rondas", cantidad: "A definir en el levantamiento" });
  if (e.tiene_grabador === true) unidades.push({ concepto: "Grabador (NVR/VMS)", cantidad: "Existente: se reutiliza" });
  if (e.tiene_grabador === false) unidades.push({ concepto: "Grabador (NVR/VMS)", cantidad: "No tiene: revisar en el levantamiento" });

  const etapas = [
    "Demo guiada sobre tus cámaras, sin compromiso.",
    `Levantamiento: cámaras, grabadores y red${guardas ? ", puestos y rondas" : ""}.`,
    sedes > 1 ? "Piloto en 1 sede con las analíticas priorizadas." : "Piloto con las analíticas priorizadas.",
    "Activación sobre la infraestructura existente (el sitio comunica menos de 48 h por sitio; el plazo real se confirma).",
    sedes > 1
      ? `Extensión a las ${sedes} sedes${nivel !== "pequena" ? " con central de monitoreo" : ""} y reportes por sede.`
      : "Ajuste de reglas por cámara y reportes periódicos.",
  ];
  const indicadores = [...new Set([...objetivos.flatMap((o) => OBJETIVOS[o].indicadores), "Tiempo de respuesta"])].slice(0, 5);
  const supuestos = [
    `${ETIQUETA_NIVEL[nivel]} (orientativo, por sedes y cámaras declaradas).`,
    guardas
      ? "Con vigilancia física: incluye la operación de turnos y rondas."
      : "Sin vigilancia física declarada: foco en analíticas, alertas y reportes.",
    "Sin reemplazar hardware: la compatibilidad de cada cámara se valida en la demo.",
    "Disponibilidad de cada analítica según su estado declarado en /vision.",
  ];

  const tarjeta: TarjetaEstimacion = {
    tipo: "estimacion",
    nivel,
    titulo: `Alcance orientativo · ${ETIQUETA_SECTOR[sector]}`,
    resumen: `${sedes} ${sedes === 1 ? "sede" : "sedes"}${camaras ? ` · ~${camaras} cámaras` : ""}. Foco: ${objetivos
      .map((o) => OBJETIVOS[o].etiqueta.toLowerCase())
      .join(", ")}.`,
    unidades,
    modulos,
    analiticas: [...elegidas].map(([id, motivo]) => ({ id, nombre: porId.get(id)?.nombre ?? id, motivo })),
    etapas,
    indicadores,
    supuestos,
    aviso: "Orientativo: no es una cotización ni un compromiso. Alcance, compatibilidad, plazos y costo los confirma el equipo comercial.",
  };
  return {
    resultado: `Tarjeta de alcance mostrada (${ETIQUETA_NIVEL[nivel]}). Funcionalidades: ${modulos
      .map((m) => m.id)
      .join(", ")}. Analíticas: ${[...elegidas.keys()].join(", ")}. Resume en 2 o 3 frases por qué encaja, recuerda que es orientativo y ofrece pasarlo al equipo (resumen_visita) para una cotización formal.`,
    esError: false,
    acciones: [],
    tarjetas: [tarjeta],
  };
}

function compararAnaliticas(e: Record<string, unknown>): ResultadoHerramienta {
  const pedidos = strs(e.ids, 80, 4);
  const elegidas = [...new Map(pedidos.map((id) => resolverAnalitica(id)).filter((a) => a).map((a) => [a!.id, a!])).values()];
  if (elegidas.length < 2) {
    return error(`Necesito al menos 2 ids válidos del catálogo. Recibí: ${pedidos.join(", ") || "ninguno"}. Usa buscar_analiticas si dudas.`);
  }
  const fila = (criterio: string, f: (a: (typeof elegidas)[number]) => string) => ({ criterio, valores: elegidas.map(f) });
  const tarjeta: TarjetaComparacion = {
    tipo: "comparacion",
    titulo: recortar(`Comparación: ${elegidas.map((a) => a.nombre).join(" vs. ")}`, 140),
    columnas: elegidas.map((a) => ({ id: a.id, nombre: a.nombre, familia: nombreFamilia.get(a.familia) ?? a.familia })),
    filas: [
      fila("Qué detecta", (a) => a.corta),
      fila("Cómo funciona", (a) => recortar(a.desc, 220)),
      fila("Cómo se activa", (a) => recortar(a.fases.map((f) => f.texto).join(" → "), 220)),
      fila("Estado", (a) => a.estado ?? "A confirmar con el equipo"),
      fila("Prueba real", (a) => (a.video ? `Sí · ${a.video.chapa}` : "Solo simulación 3D")),
      fila("Ideal para", (a) => SECTORES_ANALITICA[a.id]?.join(", ") ?? "Según el caso"),
    ],
    nota: str(e.conclusion, 200),
  };
  return {
    resultado: `Tabla mostrada. ${elegidas
      .map((a) => `${a.id}: ${a.corta} Estado: ${a.estado ?? "sin declarar"}. ${a.video ? "Con prueba real." : "Solo simulación."}`)
      .join(" | ")} Ahora recomienda en 1 o 2 frases cuál conviene para su caso.`,
    esError: false,
    acciones: [],
    tarjetas: [tarjeta],
  };
}

function resumenVisita(e: Record<string, unknown>): ResultadoHerramienta {
  const necesidad = str(e.necesidad, 400);
  if (!necesidad) return error("Falta la necesidad: pregúntale qué quiere resolver antes de preparar el resumen.");
  const paso = de(e.siguiente_paso, PASOS) ?? "informacion";
  const plazo = de(e.plazo, PLAZOS);
  const sedes = entero(e.sedes, 1, 1000);
  const camaras = entero(e.camaras, 0, 50_000);
  const analiticasInteres = strs(e.analiticas, 80, 6)
    .map((id) => porId.get(id))
    .filter((a) => a !== undefined);
  const funcs = strs(e.funcionalidades, 40, 6).filter((id) => tituloFuncionalidad.has(id));

  const avanza = paso === "demo" || paso === "cotizacion" || paso === "llamada";
  const etapa: EtapaVisita =
    avanza && (plazo === "inmediato" || plazo === "1-3 meses")
      ? "listo"
      : avanza || sedes || camaras || analiticasInteres.length || funcs.length
        ? "evaluando"
        : "explorando";

  const campos: TarjetaResumenVisita["campos"] = [];
  const poner = (etiqueta: string, valor: string | undefined) => {
    if (valor) campos.push({ etiqueta, valor: sinDatosSensibles(valor) });
  };
  poner("Necesidad", necesidad);
  poner("Sector", str(e.sector, 80));
  poner("Empresa", str(e.empresa, 120));
  poner("Cargo", str(e.cargo, 80));
  poner("País / ciudad", str(e.pais_ciudad, 80));
  poner("Tamaño", [sedes ? `${sedes} ${sedes === 1 ? "sede" : "sedes"}` : "", camaras !== undefined ? `~${camaras} cámaras` : ""].filter(Boolean).join(" · ") || undefined);
  poner("Analíticas de interés", analiticasInteres.map((a) => a.nombre).join(", ") || undefined);
  poner("Funcionalidades de interés", funcs.map((id) => tituloFuncionalidad.get(id)).join(", ") || undefined);
  poner("Plazo", plazo);
  poner("Notas", str(e.notas, 300));

  const motivo = recortar(
    [
      "Resumen de mi visita (preparado con el asistente Ars):",
      ...campos.map((c) => `- ${c.etiqueta}: ${c.valor}`),
      `- Siguiente paso: ${ETIQUETA_PASO[paso]}`,
      `- Etapa (estimada por el asistente): ${ETIQUETA_ETAPA[etapa]}`,
    ].join("\n"),
    1500,
  );
  const tarjeta: TarjetaResumenVisita = {
    tipo: "resumen_visita",
    titulo: "Resumen para el equipo de ARS",
    campos,
    etapa,
    siguientePaso: ETIQUETA_PASO[paso],
    motivo,
  };
  return {
    resultado:
      "Listo: el resumen está en pantalla y el formulario de contacto quedó abierto con ese texto. Pídele que lo revise, complete nombre y correo y lo envíe; no se envía nada sin que ella lo confirme.",
    esError: false,
    acciones: [{ tipo: "abrir_contacto", motivo }],
    tarjetas: [tarjeta, { tipo: "contacto", motivo }],
  };
}

function reportarHallazgos(e: Record<string, unknown>): ResultadoHerramienta {
  const lista = Array.isArray(e.hallazgos) ? e.hallazgos.slice(0, 6) : [];
  const descartados: string[] = [];
  const items: TarjetaHallazgos["items"] = [];
  for (const h of lista) {
    const o = obj(h);
    const observacion = str(o.observacion, 160);
    const id = str(o.analitica_id, 80);
    const a = id ? resolverAnalitica(id) : undefined;
    if (!observacion || !a) {
      descartados.push(id ?? "?");
      continue;
    }
    items.push({
      observacion,
      analiticaId: a.id,
      analitica: a.nombre,
      prioridad: de(o.prioridad, ["alta", "media", "baja"] as const) ?? "media",
      momento: str(o.momento, 24),
    });
  }
  if (!items.length) return error("Ningún hallazgo tenía observación y un id de analítica válido.");
  const peso = { alta: 0, media: 1, baja: 2 } as const;
  items.sort((x, y) => peso[x.prioridad] - peso[y.prioridad]);
  return {
    resultado: `Tarjeta con ${items.length} hallazgos mostrada.${descartados.length ? ` Descartados por id inválido: ${descartados.join(", ")}.` : ""}`,
    esError: false,
    acciones: [],
    tarjetas: [{ tipo: "hallazgos", fuente: str(e.fuente, 120) ?? "Contenido adjunto", items }],
  };
}

function formatoBusqueda(modo: ModoBusqueda, resultados: ResultadoBusqueda[]): ResultadoHerramienta {
  if (!resultados.length) {
    return {
      resultado: "Sin resultados en la documentación. Si no está en la base de conocimiento, dilo y ofrece hablar con el equipo.",
      esError: false,
      acciones: [],
      tarjetas: [],
    };
  }
  return {
    resultado: JSON.stringify({
      modo,
      resultados: resultados.map((r) => ({
        titulo: r.titulo,
        enlace: `${r.ruta}${r.ancla ? `#${r.ancla}` : ""}`,
        texto: recortar(r.texto, 900),
      })),
    }),
    esError: false,
    acciones: [],
    tarjetas: [],
  };
}

function entradaBusqueda(e: Record<string, unknown>) {
  const consulta = str(e.consulta, 300);
  const fuente = de(e.fuente, FUENTES);
  return { consulta, fuentes: fuente ? [fuente] : undefined, limite: 6 };
}

/** Valida y ejecuta (o traduce a acción de cliente) una llamada de herramienta. */
export function ejecutarHerramienta(nombre: string, entrada: unknown): ResultadoHerramienta {
  const e = obj(entrada);
  switch (nombre) {
    case "ir_a": {
      const ruta = str(e.ruta, 80);
      if (!ruta || !RUTAS_VALIDAS.includes(ruta)) return error(`Ruta inválida. Rutas válidas: ${RUTAS_VALIDAS.join(", ")}`);
      const ancla = anclaValida(ruta, str(e.ancla, 80));
      const base = tarjetaRuta(ruta, ancla);
      const t: Tarjeta | null = base && base.tipo === "enlace" ? { ...base, navegado: true } : base;
      return {
        resultado: `Listo: el navegador de la persona ya está en ${ruta}${ancla ? `#${ancla}` : ""}.`,
        esError: false,
        acciones: [{ tipo: "ir_a", ruta, ancla }],
        tarjetas: t ? [t] : [],
      };
    }
    case "mostrar_analitica": {
      const id = str(e.id, 80);
      const t = id ? tarjetaAnalitica(id) : null;
      if (!id || !t) {
        const sug = id ? buscarAnalitica(id).map((x) => x.id) : [];
        return error(`No existe la analítica "${id ?? ""}".${sug.length ? ` Quizá: ${sug.join(", ")}` : ""}`);
      }
      return {
        resultado: `Listo: el visor de /vision ya muestra «${porId.get(id)?.nombre}».`,
        esError: false,
        acciones: [{ tipo: "mostrar_analitica", id }],
        tarjetas: [t],
      };
    }
    case "abrir_contacto": {
      const motivo = str(e.motivo, 500);
      return {
        resultado: "Listo: el formulario de contacto está abierto en el chat. Invita a la persona a completarlo.",
        esError: false,
        acciones: [{ tipo: "abrir_contacto", motivo }],
        tarjetas: [{ tipo: "contacto", motivo }],
      };
    }
    case "resaltar": {
      const ancla = str(e.ancla, 80)?.replace(/^#/, "");
      if (!ancla) return error("Falta el ancla.");
      return {
        resultado: `Listo: la sección #${ancla} quedó resaltada (si existe en la página actual).`,
        esError: false,
        acciones: [{ tipo: "resaltar", ancla, nota: str(e.nota, 160) }],
        tarjetas: [],
      };
    }
    case "recomendar": {
      const tarjetas: Tarjeta[] = [];
      const ids = Array.isArray(e.analiticas) ? e.analiticas : [];
      for (const id of ids.slice(0, 4)) {
        const t = typeof id === "string" ? tarjetaAnalitica(id) : null;
        if (t) tarjetas.push(t);
      }
      const servicios = Array.isArray(e.servicios) ? e.servicios : [];
      for (const id of servicios.slice(0, 4)) {
        const m = typeof id === "string" ? moduloPorId(id) : undefined;
        if (m) tarjetas.push(tarjetaServicio(m.area, m.modulo));
      }
      const paginas = Array.isArray(e.paginas) ? e.paginas : [];
      for (const p of paginas.slice(0, 4)) {
        const po = obj(p);
        const ruta = str(po.ruta, 80);
        if (!ruta || !RUTAS_VALIDAS.includes(ruta)) continue;
        const t = tarjetaRuta(ruta, anclaValida(ruta, str(po.ancla, 80)));
        if (t) tarjetas.push(t);
      }
      if (!tarjetas.length) return error("Ningún id o ruta era válido.");
      return { resultado: `Mostradas ${tarjetas.length} tarjetas.`, esError: false, acciones: [], tarjetas: tarjetas.slice(0, 6) };
    }
    case "recordar": {
      const clave = str(e.clave, 40) as ClavePerfil | undefined;
      const valor = str(e.valor, 160);
      if (!clave || !(CLAVES_PERFIL as readonly string[]).includes(clave) || !valor) return error("Clave o valor inválido.");
      return { resultado: "Guardado.", esError: false, acciones: [{ tipo: "recordar", clave, valor }], tarjetas: [] };
    }
    case "olvidar": {
      const clave = str(e.clave, 40);
      if (!clave || (clave !== "todo" && !(CLAVES_PERFIL as readonly string[]).includes(clave))) return error("Clave inválida.");
      return { resultado: "Borrado.", esError: false, acciones: [{ tipo: "olvidar", clave: clave as ClavePerfil | "todo" }], tarjetas: [] };
    }
    case "analizar_video": {
      const id = str(e.id, 80);
      const a = id ? porId.get(id) : undefined;
      if (!a) return error(`No existe la analítica "${id ?? ""}".`);
      if (!a.video?.src && !a.video?.img) return error(`«${a.nombre}» no tiene video ni imagen real todavía; solo simulación 3D.`);
      const t = tarjetaAnalitica(a.id);
      return {
        resultado: `Listo: el navegador está extrayendo los fotogramas de la prueba real de «${a.nombre}» (${a.video.chapa}). Llegarán en el próximo mensaje: avisa en una frase que lo vas a analizar y espera.`,
        esError: false,
        acciones: [{ tipo: "mostrar_analitica", id: a.id }, { tipo: "analizar_video", id: a.id }],
        tarjetas: t ? [t] : [],
      };
    }
    case "sugerir": {
      const lista = Array.isArray(e.opciones) ? e.opciones : [];
      const opciones = lista
        .map((o) => str(o, 60))
        .filter((o): o is string => Boolean(o))
        .slice(0, 3);
      if (!opciones.length) return error("Sin opciones.");
      return { resultado: "Mostradas.", esError: false, acciones: [], tarjetas: [{ tipo: "sugerencias", opciones }] };
    }
    case "buscar_analiticas": {
      const q = str(e.consulta, 120);
      if (!q) return error("Falta la consulta.");
      const r = buscarAnalitica(q);
      return {
        resultado: r.length ? JSON.stringify(r) : "Sin coincidencias. Revisa el catálogo del system prompt.",
        esError: false,
        acciones: [],
        tarjetas: [],
      };
    }
    case "mostrar_servicio": {
      const r = resolverServicio(str(e.area, 80), str(e.modulo, 80)?.replace(/^#/, ""), str(e.foco, 60));
      if ("error" in r) return error(r.error);
      const { area, modulo, foco } = r;
      const focoTxt = foco ? (FOCOS_ESCENA[area.escena]?.[foco] ?? foco) : "vista general del área";
      return {
        resultado: modulo
          ? `Listo: la persona ya ve /servicios/${area.id}#${modulo.id} («${modulo.nombre}», estado: ${ESTADO_TEXTO[modulo.estado]}${modulo.notaEstado ? ` — ${modulo.notaEstado}` : ""}). La escena 3D «${area.escena}» está enfocada en: ${focoTxt}. Narra lo que muestra la escena y explica el módulo.`
          : `Listo: la persona ya ve /servicios/${area.id} («${area.nombre}»). La escena 3D «${area.escena}» muestra: ${focoTxt}.`,
        esError: false,
        acciones: [{ tipo: "mostrar_servicio", area: area.id, modulo: modulo?.id, foco }],
        tarjetas: modulo ? [tarjetaServicio(area, modulo)] : [],
      };
    }
    case "buscar_servicios": {
      const q = str(e.consulta, 120);
      if (!q) return error("Falta la consulta.");
      const r = buscarModulos(q, 6).map(({ area, modulo }) => ({
        area: area.id,
        id: modulo.id,
        nombre: modulo.nombre,
        frase: modulo.frase,
        estado: modulo.estado,
        ...(modulo.notaEstado ? { notaEstado: modulo.notaEstado } : {}),
      }));
      return {
        resultado: r.length ? JSON.stringify(r) : "Sin coincidencias. Revisa el catálogo de servicios del system prompt.",
        esError: false,
        acciones: [],
        tarjetas: [],
      };
    }
    case "buscar_conocimiento": {
      const { consulta, ...op } = entradaBusqueda(e);
      if (!consulta) return error("Falta la consulta.");
      return formatoBusqueda("palabras", buscarPorPalabras(consulta, op));
    }
    case "estimar_proyecto":
      return estimarProyecto(e);
    case "comparar_analiticas":
      return compararAnaliticas(e);
    case "resumen_visita":
      return resumenVisita(e);
    case "reportar_hallazgos":
      return reportarHallazgos(e);
    default:
      return ejecutarBloque(nombre, entrada) ?? error(`Herramienta desconocida: ${nombre}`);
  }
}

/**
 * Igual que `ejecutarHerramienta`, pero `buscar_conocimiento` usa la búsqueda
 * híbrida con embeddings (si hay OPENAI_API_KEY y el índice tiene vectores).
 * Recomendado en el bucle de herramientas del chat: `await ejecutarHerramientaAsync(...)`.
 */
export async function ejecutarHerramientaAsync(
  nombre: string,
  entrada: unknown,
  opciones: { claveOpenAI?: string; fetchImpl?: typeof fetch } = {},
): Promise<ResultadoHerramienta> {
  if (nombre !== "buscar_conocimiento") return ejecutarHerramienta(nombre, entrada);
  const { consulta, ...op } = entradaBusqueda(obj(entrada));
  if (!consulta) return error("Falta la consulta.");
  const { modo, resultados } = await buscarConocimiento(consulta, { ...op, ...opciones });
  return formatoBusqueda(modo, resultados);
}
