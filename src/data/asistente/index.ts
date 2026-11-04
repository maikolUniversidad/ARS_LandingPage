/**
 * Base de conocimiento del asistente de IA del sitio.
 *
 * Uso solo en servidor (route handlers / server actions). Los documentos viven
 * en `conocimiento/*.md` y se compilan a `conocimiento.generated.ts` con
 * `node src/data/asistente/generar.mjs` (sin `fs` en runtime).
 *
 * `construirBaseConocimiento()` es determinista: mismo texto en cada llamada,
 * para que el bloque del system prompt sea cacheable.
 */
import { analiticas, familias } from "@/data/analiticas";
import { AREAS, type EstadoModulo } from "@/data/servicios";
import { FOCOS_ESCENA } from "@/components/servicios/escenas/contrato";
import { DOCUMENTOS } from "./conocimiento.generated";
import type { DocumentoKB, ResultadoAnalitica, RutaSitio } from "./tipos";

export type { AnclaSitio, DocumentoKB, ResultadoAnalitica, RutaSitio } from "./tipos";
export { DOCUMENTOS };

const ANALITICAS_ANCLAS = analiticas.map((a) => a.id).join(", ");

/** Anclas del hub /servicios (contrato con la página). */
const ANCLAS_HUB_SERVICIOS = [
  { id: "dia", descripcion: "Un día en ARS: el recorrido de una jornada por todas las áreas" },
  { id: "areas", descripcion: "Las áreas de servicio de ARS (una tarjeta por área)" },
  { id: "por-que", descripcion: "Por qué ARS: pilares transversales" },
  { id: "buscar", descripcion: "Buscador de servicios y módulos" },
  { id: "cierre", descripcion: "Solicitar demo / hablar con un asesor" },
];

/** /servicios y una ruta por área (anclas = ids de módulo), generadas desde el catálogo. */
const RUTAS_SERVICIOS: RutaSitio[] = [
  {
    ruta: "/servicios",
    titulo: "Servicios · El sistema operativo de una empresa de seguridad",
    descripcion: `Catálogo completo de ARS: ${AREAS.length} áreas y ${AREAS.reduce((n, a) => n + a.modulos.length, 0)} módulos. Cada área tiene su página /servicios/<área> con escena 3D y un ancla por módulo.`,
    anclas: ANCLAS_HUB_SERVICIOS,
  },
  ...AREAS.map((a) => ({
    ruta: `/servicios/${a.id}`,
    titulo: `${a.nombre} · Servicios ARS`,
    descripcion: `${a.frase}. ${a.descripcion}`,
    anclas: a.modulos.map((m) => ({ id: m.id, descripcion: m.nombre })),
  })),
];

export const RUTAS_SITIO: RutaSitio[] = [
  {
    ruta: "/",
    titulo: "Inicio",
    descripcion:
      "Recorrido 3D con scroll: las cinco capas de la seguridad (vigilancia física, visión con IA, IoT, robótica y central) unidas en una sola traza, y cierre con formulario de contacto.",
    anclas: [
      { id: "hero", descripcion: "Todas las capas de la seguridad. Una sola traza." },
      { id: "fisica", descripcion: "Capa 01 · Vigilancia física" },
      { id: "vision", descripcion: "Capa 02 · Visión con IA sobre las cámaras" },
      { id: "iot", descripcion: "Capa 03 · Sensores e IoT" },
      { id: "robotica", descripcion: "Capa 04 · Robótica (en desarrollo)" },
      { id: "central", descripcion: "Capa 05 · Central de operaciones y gerencia" },
      { id: "traza", descripcion: "Un evento recorre las cinco capas" },
      { id: "escala", descripcion: "Todas las sedes en la misma plataforma" },
      { id: "contacto", descripcion: "Formulario de contacto, WhatsApp y correo" },
    ],
  },
  {
    ruta: "/diagnostico",
    titulo: "Diagnóstico de tu empresa",
    descripcion:
      "Entrevista de 5 minutos con la IA de ARS: arma un diagnóstico por áreas, una historia 3D de la operación y un reporte descargable. /diagnostico?ejemplo=1 muestra un ejemplo.",
    anclas: [],
  },
  {
    ruta: "/arquitectura",
    titulo: "Arquitectura de soluciones ARS · La operación que se ve, el ERP que la sostiene",
    descripcion:
      "Vista corporativa completa: canales (web, Android, PWA, escritorio, gafas VR), capa operativa (campo, central, comunicación, monitoreo con IA e IoT, realidad virtual, laboratorio), núcleo de datos e IA y el ERP base propio de ARS (contratos, turnos, gestión humana y nómina, documental, formación, finanzas, facturas DIAN, CRM, gobierno multiempresa), con integraciones externas. Diagrama interactivo con estado real de cada módulo, recorridos «Sigue un dato» y comparación con herramientas sueltas.",
    anclas: [
      { id: "diagrama", descripcion: "Diagrama interactivo de la arquitectura por capas (vistas Operativa, Corporativa (ERP) e Integral)" },
      { id: "sigue-un-dato", descripcion: "Sigue un dato: recorridos de punta a punta (marcación → nómina → contabilidad; alerta de cámara → informe; contrato → mes facturado; factura de proveedor DIAN)" },
      { id: "por-que-erp", descripcion: "Por qué un ERP propio y tabla ARS frente a herramientas sueltas" },
      { id: "cierre", descripcion: "Solicitar demo / ver todos los servicios" },
    ],
  },
  {
    ruta: "/plataforma",
    titulo: "Plataforma · Seguridad integral",
    descripcion:
      "La plataforma ARS en movimiento: hero con capturas reales, clips de la plataforma, recorrido por los módulos de cada área, arquitecto con IA, ciclo operativo, pilares, antes/después, logos y demo.",
    anclas: [
      { id: "en-movimiento", descripcion: "La plataforma en movimiento: clips y recorridos con capturas reales" },
      { id: "recorrido", descripcion: "Recorrido por los módulos de cada área de campo" },
      { id: "arquitecto-ia", descripcion: "Arquitecto IA: arma la plataforma a la medida de la empresa" },
      { id: "pilares", descripcion: "Pilares de la plataforma" },
      { id: "cierre", descripcion: "Solicitar demo / hablar con un asesor" },
    ],
  },
  {
    ruta: "/vision",
    titulo: "Visión · Analíticas de video",
    descripcion: `Catálogo de ${analiticas.length} analíticas en ${familias.length} familias con simulación 3D y evidencia real. Cada analítica se abre con /vision#<id> (${ANALITICAS_ANCLAS}).`,
    anclas: [
      { id: "visor", descripcion: "Visor lámina por lámina: simulación 3D y prueba real" },
      { id: "indice", descripcion: "Índice de todas las analíticas por familia" },
      { id: "cierre", descripcion: "Contacto y descarga de la presentación (también selecciona la analítica «cierre»)" },
    ],
  },
  {
    ruta: "/proyectos",
    titulo: "Proyectos",
    descripcion:
      "Proyectos por sector y ciudad en Colombia y Perú: mapa, filtros por estado, país y área, y ficha por proyecto con los módulos que usa (enlace /proyectos#<id>).",
    anclas: [
      { id: "mapa", descripcion: "Mapa, filtros y tarjetas de proyectos" },
      { id: "como-empieza", descripcion: "Cómo empieza un proyecto: diagnóstico, piloto y operación" },
      { id: "cierre", descripcion: "Contacto para conversar sobre su operación" },
    ],
  },
  {
    ruta: "/laboratorio",
    titulo: "Laboratorio · Modelos de IA",
    descripcion:
      "Capacidades de IA con demo en vivo: ejemplo, cámara del visitante o video subido; corre en el navegador.",
    anclas: [{ id: "demo-stage", descripcion: "Escenario de la demo en vivo" }],
  },
  {
    ruta: "/vision-lab",
    titulo: "Vision Lab",
    descripcion:
      "Playground técnico: modelos, fuentes, reglas ROI/línea, eventos y JSON; IA real en el navegador o modo demo.",
    anclas: [],
  },
  ...RUTAS_SERVICIOS,
];

const ETIQUETA_ESTADO: Record<EstadoModulo, string> = {
  vivo: "vivo",
  piloto: "en piloto",
  proximamente: "próximamente",
  "hoja-de-ruta": "hoja de ruta",
};

const unaLinea = (t: string, max = 220) => {
  const limpio = t.replace(/\s+/g, " ").trim();
  return limpio.length > max ? `${limpio.slice(0, max - 1)}…` : limpio;
};

/**
 * Catálogo compacto de servicios (áreas + módulos) para el system prompt.
 * Determinista: depende solo de AREAS.
 */
export function catalogoServicios(): string {
  const lineas: string[] = [
    "Formato por módulo: id · nombre · estado (nota) · foco 3D — frase. Resumen. Innovación. Funciones. Roles. Canales. Palabras clave.",
    "Para mostrarlo: mostrar_servicio { area, modulo } (lleva a /servicios/<área>#<módulo> y vuela la escena 3D a su foco).",
  ];
  for (const a of AREAS) {
    const focos = FOCOS_ESCENA[a.escena] ?? {};
    lineas.push(
      "",
      `## ${a.letra} · ${a.nombre} — área «${a.id}» (/servicios/${a.id}), escena 3D «${a.escena}»`,
      `${a.frase}. ${unaLinea(a.descripcion, 300)}`,
      `Esencia: ${unaLinea(a.esencia, 300)}`,
    );
    for (const m of a.modulos) {
      const estado = `${ETIQUETA_ESTADO[m.estado]}${m.notaEstado ? ` (${unaLinea(m.notaEstado, 120)})` : ""}`;
      const foco = focos[m.foco] ? `${m.foco} = ${focos[m.foco]}` : m.foco;
      const funciones = m.funciones
        .map((f) => `${f.titulo}${f.nuevo ? " [nuevo]" : ""}: ${unaLinea(f.detalle, 90)}`)
        .join("; ");
      const filas = [
        `- ${m.id} · ${m.nombre} · ${estado} · foco ${foco} — ${unaLinea(m.frase, 160)}`,
        `  Resumen: ${unaLinea(m.resumen, 280)}`,
        `  Innovación: ${unaLinea(m.innovacion, 240)}`,
        funciones ? `  Funciones: ${funciones}` : "",
        m.roles.length ? `  Roles: ${m.roles.join(", ")}` : "",
        m.canales.length ? `  Canales: ${m.canales.join(", ")}` : "",
        m.palabrasClave.length ? `  Palabras clave: ${m.palabrasClave.join(", ")}` : "",
      ];
      lineas.push(...filas.filter(Boolean));
    }
  }
  return lineas.join("\n");
}

/** Listado compacto de las analíticas, agrupado por familia. Determinista. */
export function catalogoAnaliticas(): string {
  const lineas: string[] = [
    `Formato: id · nombre · familia · estado · descripción corta. «[evidencia real]» = tiene video o imagen real procesada. Total: ${analiticas.length}.`,
  ];
  for (const f of familias) {
    const delGrupo = analiticas.filter((a) => a.familia === f.id);
    lineas.push("", `## ${f.nombre} (${f.id}, ${delGrupo.length}) — ${f.descripcion}`);
    for (const a of delGrupo) {
      const estado = a.estado ?? "sin estado declarado";
      const evidencia = a.video ? " [evidencia real]" : "";
      lineas.push(`- ${a.id} · ${a.nombre} · ${f.id} · ${estado} · ${a.corta}${evidencia}`);
    }
  }
  lineas.push(
    "",
    "Enlace de cada analítica: /vision#<id> (id exacto, sensible a mayúsculas; p. ej. /vision#ocultaProd, /vision#zonaCiega).",
  );
  return lineas.join("\n");
}

function documentoATexto(d: DocumentoKB): string {
  const rutas = d.rutas.length > 0 ? `\nRutas: ${d.rutas.join(", ")}` : "";
  return `# ${d.titulo}${rutas}\n\n${d.contenido}`;
}

let cache: string | null = null;

/** Todos los documentos + catálogo de analíticas, siempre en el mismo orden. */
export function construirBaseConocimiento(): string {
  if (cache === null) {
    const partes = DOCUMENTOS.map(documentoATexto);
    partes.push(`# Catálogo de analíticas de video (/vision)\n\n${catalogoAnaliticas()}`);
    partes.push(`# Catálogo de servicios de ARS (/servicios)\n\n${catalogoServicios()}`);
    cache = partes.join("\n\n---\n\n");
  }
  return cache;
}

const normalizar = (s: string): string =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const VACIAS = new Set([
  "del", "las", "los", "una", "uno", "unos", "unas", "por", "para", "con", "sin",
  "que", "como", "cual", "sus", "mis", "hay", "esta", "este", "camara", "camaras",
]);

/** Búsqueda simple (sin acentos) sobre id, nombre, corta y desc. Máx. 5 resultados. */
export function buscarAnalitica(q: string): ResultadoAnalitica[] {
  const consulta = normalizar(q);
  if (!consulta) return [];
  const terminos = consulta.split(" ").filter((t) => t.length > 2 && !VACIAS.has(t));
  if (terminos.length === 0) return [];

  const puntuadas = analiticas
    .map((a, indice) => {
      const id = normalizar(a.id);
      const nombre = normalizar(a.nombre);
      const corta = normalizar(a.corta);
      const desc = normalizar(a.desc);
      let puntos = 0;
      if (id === consulta || nombre === consulta) puntos += 20;
      if (nombre.includes(consulta)) puntos += 8;
      for (const t of terminos) {
        if (id.includes(t)) puntos += 5;
        if (nombre.includes(t)) puntos += 4;
        if (corta.includes(t)) puntos += 2;
        if (desc.includes(t)) puntos += 1;
      }
      return { a, indice, puntos };
    })
    .filter((x) => x.puntos > 0)
    .sort((x, y) => y.puntos - x.puntos || x.indice - y.indice)
    .slice(0, 5);

  return puntuadas.map(({ a }) => ({
    id: a.id,
    nombre: a.nombre,
    corta: a.corta,
    familia: a.familia,
  }));
}
