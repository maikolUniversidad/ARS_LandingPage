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
