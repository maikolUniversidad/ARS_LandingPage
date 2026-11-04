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
import { DOCUMENTOS } from "./conocimiento.generated";
import type { DocumentoKB, ResultadoAnalitica, RutaSitio } from "./tipos";

export type { AnclaSitio, DocumentoKB, ResultadoAnalitica, RutaSitio } from "./tipos";
export { DOCUMENTOS };

const ANALITICAS_ANCLAS = analiticas.map((a) => a.id).join(", ");

export const RUTAS_SITIO: RutaSitio[] = [
  {
    ruta: "/",
    titulo: "Inicio",
    descripcion:
      "Narrativa de seguridad integral en 8 escenas con scroll y cierre con formulario de contacto y solicitud de demo.",
    anclas: [
      { id: "integral", descripcion: "01 · Seguridad integral conectada en tiempo real" },
      { id: "terreno", descripcion: "02 · Operación en campo" },
      { id: "monitoreo", descripcion: "03 · Central de monitoreo" },
      { id: "ia", descripcion: "04 · IA aplicada a la seguridad" },
      { id: "alertas", descripcion: "05 · Alertas con evidencia" },
      { id: "respuesta", descripcion: "06 · Respuesta coordinada" },
      { id: "control", descripcion: "07 · Clientes, sedes y zonas" },
      { id: "decisiones", descripcion: "08 · Reportes y confianza" },
      { id: "cierre", descripcion: "Solicitar demo y formulario de contacto" },
    ],
  },
  {
    ruta: "/plataforma",
    titulo: "Plataforma · Seguridad integral",
    descripcion:
      "Plataforma operativa: ciclo operativo, capturas, funcionalidades A–N, arquitectura, flujo, casos de uso, antes/después, testimonios, logos y demo.",
    anclas: [
      { id: "funcionalidades", descripcion: "Funcionalidades por grupo (cada una también en #feature-<id>)" },
      { id: "capturas", descripcion: "Capturas del producto" },
      { id: "casos", descripcion: "Casos de uso: residencial, campus, logística, empresa de seguridad" },
      { id: "cierre", descripcion: "Solicitar demo / hablar con un asesor" },
      { id: "feature-turnos", descripcion: "Control de turnos y programación" },
      { id: "feature-personal", descripcion: "Gestión de personal operativo" },
      { id: "feature-rondas", descripcion: "Rondas inteligentes" },
      { id: "feature-tareas", descripcion: "Rondas con tareas personalizadas" },
      { id: "feature-formularios", descripcion: "Formularios dinámicos" },
      { id: "feature-mapa", descripcion: "Seguimiento en mapa en tiempo real" },
      { id: "feature-ptt", descripcion: "PTT · Push To Talk" },
      { id: "feature-pot", descripcion: "POT · Acción operativa rápida" },
      { id: "feature-central", descripcion: "Central de monitoreo" },
      { id: "feature-ia", descripcion: "Cámaras e IA" },
      { id: "feature-alertas", descripcion: "Alertas inteligentes" },
      { id: "feature-evidencia", descripcion: "Evidencia y trazabilidad" },
      { id: "feature-reportes", descripcion: "Reportes e indicadores" },
      { id: "feature-multisite", descripcion: "Multi-cliente · multi-sede · multi-zona" },
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
      "Mapa interactivo de ciudades y proyectos en Colombia y Perú, con filtros y ficha por proyecto.",
    anclas: [],
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
];

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
