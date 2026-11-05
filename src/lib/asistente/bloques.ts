/**
 * Bloques ricos del asistente (protocolo v2): galería, gráfico, pasos y
 * antes/después. Son herramientas como las demás: la IA las llama con datos
 * mínimos (ids del catálogo, números, textos cortos) y el servidor arma la
 * tarjeta con rutas reales del sitio. La IA nunca entrega URLs de medios.
 *
 * Viajan por el mismo evento `tarjeta` del stream NDJSON, así que un cliente
 * antiguo simplemente las ignora (retrocompatible). Ver `docs/ASISTENTE.md`.
 */
import { analiticas } from "@/data/analiticas";
import { RUTAS_SITIO } from "@/data/asistente";
import { AREAS, areaPorId, moduloPorId } from "@/data/servicios";
import type { DefinicionHerramienta } from "./herramientas";
import type {
  Accion,
  EvidenciaTarjeta,
  TarjetaAntesDespues,
  TarjetaGaleria,
  TarjetaGrafico,
  TarjetaPasos,
} from "./tipos";

const porId = new Map(analiticas.map((a) => [a.id, a]));
const RUTAS = RUTAS_SITIO.map((r) => r.ruta);

type Resultado = { resultado: string; esError: boolean; acciones: Accion[]; tarjetas: TarjetaGaleria[] | TarjetaGrafico[] | TarjetaPasos[] | TarjetaAntesDespues[] };

const obj = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
const str = (v: unknown, max = 300): string | undefined =>
  typeof v === "string" && v.trim() ? v.trim().replace(/\s+/g, " ").slice(0, max) : undefined;
const lista = (v: unknown, n: number): unknown[] => (Array.isArray(v) ? v.slice(0, n) : []);
const error = (resultado: string): Resultado => ({ resultado, esError: true, acciones: [], tarjetas: [] });

export const ROTULO_EVIDENCIA = "Ejemplo de evidencia";
export const ROTULO_IA = "Generado con IA";

/** Evidencia pública de una analítica (rutas del catálogo). */
export function evidenciaDe(id: string): EvidenciaTarjeta | undefined {
  const v = porId.get(id)?.video;
  if (!v || (!v.src && !v.img)) return undefined;
  return { video: v.src, poster: v.poster, imagen: v.img, chapa: v.chapa, ia: v.ia || undefined };
}

/* ───────────── Definiciones (van AL FINAL de HERRAMIENTAS: no invalidan la caché) ───────────── */

const DESTINO = {
  type: "object",
  description:
    "A dónde lleva el paso. Usa SOLO una forma: {modulo} (id de módulo de servicios), {area}, {analitica} (id de analítica), {ruta, ancla?} (página del sitio) o {ancla} (sección de la página actual).",
  properties: {
    ruta: { type: "string", enum: RUTAS },
    ancla: { type: "string" },
    area: { type: "string", enum: AREAS.map((a) => a.id) },
    modulo: { type: "string" },
    analitica: { type: "string" },
  },
  additionalProperties: false,
} as const;

export const HERRAMIENTAS_BLOQUES: DefinicionHerramienta[] = [
  {
    name: "mostrar_galeria",
    description:
      "Muestra una galería visual en el chat con capturas reales y clips de módulos de servicios y/o videos de evidencia de analíticas. Úsala cuando «mostrar» ayude más que explicar (p. ej. «¿cómo se ve?», «muéstrame las rondas»), junto a mostrar_servicio. Solo ids del catálogo: el servidor pone las imágenes.",
    input_schema: {
      type: "object",
      properties: {
        titulo: { type: "string", description: "Título corto de la galería." },
        servicios: { type: "array", items: { type: "string" }, description: "Ids de módulos (sus capturas y clip)." },
        analiticas: { type: "array", items: { type: "string" }, description: "Ids de analíticas con evidencia." },
      },
      required: ["titulo"],
      additionalProperties: false,
    },
  },
  {
    name: "mostrar_grafico",
    description:
      "Dibuja un gráfico animado (barras, línea o donut) en el chat. Úsalo para cifras que se entienden mejor viéndolas: horas ahorradas, antes vs. después, distribución de alertas. Si los números NO salen tal cual de la base de conocimiento, son estimados: estimado=true y en supuestos explica de dónde salen (p. ej. con los datos que dio la persona). Nunca inventes cifras de clientes ni las presentes como garantizadas.",
    input_schema: {
      type: "object",
      properties: {
        forma: { type: "string", enum: ["barras", "linea", "donut"] },
        titulo: { type: "string" },
        unidad: { type: "string", description: "Unidad de los valores, p. ej. 'h/mes' o '%'." },
        datos: {
          type: "array",
          items: {
            type: "object",
            properties: { etiqueta: { type: "string" }, valor: { type: "number" } },
            required: ["etiqueta", "valor"],
            additionalProperties: false,
          },
          description: "2 a 8 puntos.",
        },
        estimado: { type: "boolean", description: "true si son cifras estimadas o ilustrativas." },
        supuestos: { type: "array", items: { type: "string" }, description: "1 a 4 supuestos del cálculo." },
        fuente: { type: "string", description: "Fuente si la cifra viene de la base de conocimiento." },
      },
      required: ["forma", "titulo", "datos", "estimado"],
      additionalProperties: false,
    },
  },
  {
    name: "mostrar_pasos",
    description:
      "Muestra una guía numerada (2 a 6 pasos). Cada paso puede tener un destino: al tocarlo, la página se mueve ahí, lo resalta y hace scroll suave. Úsala para «cómo funciona X», recorridos y «por dónde empiezo».",
    input_schema: {
      type: "object",
      properties: {
        titulo: { type: "string" },
        pasos: {
          type: "array",
          items: {
            type: "object",
            properties: {
              titulo: { type: "string", description: "Máx. 70 caracteres." },
              detalle: { type: "string", description: "Una frase (máx. 180 caracteres)." },
              destino: DESTINO,
            },
            required: ["titulo"],
            additionalProperties: false,
          },
        },
      },
      required: ["titulo", "pasos"],
      additionalProperties: false,
    },
  },
  {
    name: "comparar_antes_despues",
    description:
      "Muestra una comparación «antes de ARS / con ARS» por aspectos (2 a 6 filas). Úsala cuando la persona pregunte qué cambia, cuánto ahorra o por qué ARS. Solo beneficios que respalde la base de conocimiento; si hay cifras estimadas, estimado=true.",
    input_schema: {
      type: "object",
      properties: {
        titulo: { type: "string" },
        filas: {
          type: "array",
          items: {
            type: "object",
            properties: { aspecto: { type: "string" }, antes: { type: "string" }, despues: { type: "string" } },
            required: ["aspecto", "antes", "despues"],
            additionalProperties: false,
          },
        },
        nota: { type: "string" },
        estimado: { type: "boolean" },
      },
      required: ["titulo", "filas"],
      additionalProperties: false,
    },
  },
];

export const NOMBRES_BLOQUES = new Set(HERRAMIENTAS_BLOQUES.map((h) => h.name));

/* ───────────── Ejecución ───────────── */

function galeria(e: Record<string, unknown>): Resultado {
  const items: TarjetaGaleria["items"] = [];
  for (const id of lista(e.servicios, 4)) {
    const m = typeof id === "string" ? moduloPorId(id) : undefined;
    if (!m) continue;
    const accion: Accion = { tipo: "mostrar_servicio", area: m.area.id, modulo: m.modulo.id, foco: m.modulo.foco };
    if (m.modulo.clip) {
      items.push({ medio: "video", src: m.modulo.clip.mp4, poster: m.modulo.clip.poster, alt: m.modulo.clip.titulo, pie: m.modulo.clip.titulo, accion });
    }
    for (const c of m.modulo.capturas.slice(0, 3)) items.push({ medio: "imagen", src: c.src, alt: c.alt, pie: c.pie, accion });
  }
  for (const id of lista(e.analiticas, 4)) {
    const a = typeof id === "string" ? porId.get(id) : undefined;
    const ev = a ? evidenciaDe(a.id) : undefined;
    if (!a || !ev) continue;
    const rotulos = [ROTULO_EVIDENCIA, ...(ev.ia ? [ROTULO_IA] : [])];
    const accion: Accion = { tipo: "mostrar_analitica", id: a.id };
    if (ev.video) items.push({ medio: "video", src: ev.video, poster: ev.poster, alt: a.nombre, pie: a.nombre, rotulos, accion });
    else if (ev.imagen) items.push({ medio: "imagen", src: ev.imagen, alt: a.nombre, pie: a.nombre, rotulos, accion });
  }
  if (!items.length) return error("Ningún id tenía capturas, clips o evidencia. Revisa los ids (buscar_servicios / buscar_analiticas).");
  const final = items.slice(0, 8);
  return {
    resultado: `Galería con ${final.length} elementos mostrada (${final.filter((x) => x.medio === "video").length} videos).`,
    esError: false,
    acciones: [],
    tarjetas: [{ tipo: "galeria", titulo: str(e.titulo, 80) ?? "Así se ve", items: final }],
  };
}

function grafico(e: Record<string, unknown>): Resultado {
  const forma = e.forma === "linea" || e.forma === "donut" ? e.forma : "barras";
  const datos = lista(e.datos, 8)
    .map((d) => {
      const o = obj(d);
      const valor = typeof o.valor === "number" && Number.isFinite(o.valor) ? Math.round(o.valor * 100) / 100 : NaN;
      const etiqueta = str(o.etiqueta, 32);
      return etiqueta && Number.isFinite(valor) && Math.abs(valor) < 1e9 ? { etiqueta, valor } : null;
    })
    .filter((d): d is { etiqueta: string; valor: number } => d !== null);
  if (datos.length < 2) return error("El gráfico necesita al menos 2 datos con etiqueta y valor numérico.");
  if (forma === "donut" && datos.some((d) => d.valor < 0)) return error("Un donut no admite valores negativos.");
  const fuente = str(e.fuente, 120);
  // Sin fuente declarada, siempre se rotula como estimado.
  const estimado = e.estimado !== false || !fuente;
  const supuestos = lista(e.supuestos, 4)
    .map((x) => str(x, 160))
    .filter((x): x is string => Boolean(x));
  return {
    resultado: `Gráfico de ${forma} mostrado${estimado ? " (rotulado como estimado)" : ""}. Explica en 1 o 2 frases qué muestra${estimado ? " y que es orientativo" : ""}.`,
    esError: false,
    acciones: [],
    tarjetas: [{ tipo: "grafico", forma, titulo: str(e.titulo, 90) ?? "Gráfico", unidad: str(e.unidad, 16), datos, estimado, supuestos: supuestos.length ? supuestos : undefined, fuente }],
  };
}

/** Traduce el destino de un paso a una acción válida del sitio (o nada). */
export function resolverDestino(v: unknown): { accion: Accion; texto: string } | undefined {
  const d = obj(v);
  const modulo = str(d.modulo, 80)?.replace(/^#/, "");
  if (modulo) {
    const m = moduloPorId(modulo);
    if (m) return { accion: { tipo: "mostrar_servicio", area: m.area.id, modulo: m.modulo.id, foco: m.modulo.foco }, texto: m.modulo.nombre };
  }
  const area = str(d.area, 80);
  const a = area ? areaPorId(area) : undefined;
  if (a) return { accion: { tipo: "mostrar_servicio", area: a.id }, texto: a.nombre };
  const analitica = str(d.analitica, 80);
  const an = analitica ? porId.get(analitica) : undefined;
  if (an) return { accion: { tipo: "mostrar_analitica", id: an.id }, texto: an.nombre };
  const ancla = str(d.ancla, 80)?.replace(/^#/, "");
  const ruta = str(d.ruta, 80);
  if (ruta && RUTAS.includes(ruta)) {
    const r = RUTAS_SITIO.find((x) => x.ruta === ruta);
    const ok = ancla && r?.anclas.some((x) => x.id === ancla) ? ancla : undefined;
    return { accion: { tipo: "ir_a", ruta, ancla: ok }, texto: r?.titulo.split("·")[0].trim() ?? ruta };
  }
  if (ancla) return { accion: { tipo: "resaltar", ancla }, texto: `#${ancla}` };
  return undefined;
}

function pasos(e: Record<string, unknown>): Resultado {
  const out: TarjetaPasos["pasos"] = [];
  for (const p of lista(e.pasos, 6)) {
    const o = obj(p);
    const titulo = str(o.titulo, 80);
    if (!titulo) continue;
    const dest = resolverDestino(o.destino);
    out.push({ titulo, detalle: str(o.detalle, 200), destino: dest?.accion, destinoTexto: dest?.texto });
  }
  if (out.length < 2) return error("La guía necesita al menos 2 pasos con título.");
  const con = out.filter((p) => p.destino).length;
  return {
    resultado: `Guía de ${out.length} pasos mostrada (${con} con destino tocable). Invita a tocar el primer paso.`,
    esError: false,
    acciones: [],
    tarjetas: [{ tipo: "pasos", titulo: str(e.titulo, 90) ?? "Paso a paso", pasos: out }],
  };
}

function antesDespues(e: Record<string, unknown>): Resultado {
  const filas = lista(e.filas, 6)
    .map((f) => {
      const o = obj(f);
      const aspecto = str(o.aspecto, 60);
      const antes = str(o.antes, 160);
      const despues = str(o.despues, 160);
      return aspecto && antes && despues ? { aspecto, antes, despues } : null;
    })
    .filter((f): f is { aspecto: string; antes: string; despues: string } => f !== null);
  if (filas.length < 2) return error("La comparación necesita al menos 2 filas completas.");
  return {
    resultado: `Comparación antes/después con ${filas.length} filas mostrada.`,
    esError: false,
    acciones: [],
    tarjetas: [{ tipo: "antes_despues", titulo: str(e.titulo, 90) ?? "Antes y con ARS", filas, nota: str(e.nota, 200), estimado: e.estimado === true || undefined }],
  };
}

/** Ejecuta una herramienta de bloques; `undefined` si el nombre no es de este módulo. */
export function ejecutarBloque(nombre: string, entrada: unknown): Resultado | undefined {
  const e = obj(entrada);
  switch (nombre) {
    case "mostrar_galeria":
      return galeria(e);
    case "mostrar_grafico":
      return grafico(e);
    case "mostrar_pasos":
      return pasos(e);
    case "comparar_antes_despues":
      return antesDespues(e);
    default:
      return undefined;
  }
}
