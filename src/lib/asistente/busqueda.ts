/**
 * Búsqueda en la base de conocimiento del asistente (RAG), solo en servidor.
 *
 * - El índice (`src/data/asistente/indice.generated.ts`) se arma al generar la
 *   base: trozos de los .md + el detalle de analíticas, funcionalidades,
 *   laboratorio y Vision Lab, cada uno con su embedding precalculado de
 *   OpenAI `text-embedding-3-small` (512 dims, int8).
 * - En cada búsqueda solo se embebe la CONSULTA del visitante (texto corto),
 *   con OPENAI_API_KEY, desde el servidor. No se envían ni se guardan
 *   documentos del visitante, y la consulta no se registra.
 * - Resultado híbrido: ranking semántico + BM25 por palabras, combinados con
 *   una suma ponderada de puntajes normalizados. Sin clave, si OpenAI falla o tarda, o si el índice
 *   no tiene vectores, se usa solo BM25 (la búsqueda por palabras de siempre).
 */
import { INDICE } from "@/data/asistente/indice.generated";
import type { FuenteTrozo, TrozoConocimiento } from "@/data/asistente/tipos";

export type ModoBusqueda = "hibrida" | "palabras";

export type ResultadoBusqueda = {
  id: string;
  fuente: FuenteTrozo;
  titulo: string;
  ruta: string;
  ancla?: string;
  texto: string;
};

export type OpcionesBusqueda = {
  limite?: number;
  fuentes?: FuenteTrozo[];
  /** Fuerza el modo por palabras (pruebas o sin red). */
  soloPalabras?: boolean;
  /** Inyectable en pruebas; por defecto `fetch` global. */
  fetchImpl?: typeof fetch;
  /** Clave de OpenAI; por defecto `process.env.OPENAI_API_KEY`. */
  claveOpenAI?: string;
};

const URL_EMBEDDINGS = "https://api.openai.com/v1/embeddings";
const TIEMPO_MAX_MS = 3500;
const MAX_CONSULTA = 300;
const PESO_SEMANTICO = 1;
const PESO_PALABRAS = 0.3;

// ─────────────────────────── Palabras (BM25) ───────────────────────────

const VACIAS = new Set(
  (
    "del las los una uno unos unas por para con sin que como cual cuales sus mis hay esta este esto estos estas ese esa eso " +
    "son ser tiene tienen puede pueden muy mas pero entre sobre desde hasta cuando donde quien cada todo toda todos todas " +
    "the and for with what how does are can you your from have this that ars"
  ).split(" "),
);

const normalizar = (s: string): string =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Raíz tosca para español: quita plurales y deja como máximo 6 letras. */
const raiz = (t: string): string => t.replace(/(es|s)$/, "").slice(0, 6);

const tokens = (s: string): string[] =>
  normalizar(s)
    .split(" ")
    .filter((t) => t.length > 2 && !VACIAS.has(t))
    .map(raiz);

type Doc = { trozo: TrozoConocimiento; tf: Map<string, number>; largo: number };

let docs: Doc[] | null = null;
let df: Map<string, number> = new Map();
let largoMedio = 1;

function prepararPalabras(): Doc[] {
  if (docs) return docs;
  docs = INDICE.trozos.map((trozo) => {
    // El título pesa doble: suele nombrar la analítica o la funcionalidad.
    const ts = [...tokens(trozo.titulo), ...tokens(trozo.titulo), ...tokens(trozo.texto)];
    const tf = new Map<string, number>();
    for (const t of ts) tf.set(t, (tf.get(t) ?? 0) + 1);
    return { trozo, tf, largo: ts.length };
  });
  df = new Map();
  for (const d of docs) for (const t of d.tf.keys()) df.set(t, (df.get(t) ?? 0) + 1);
  largoMedio = docs.reduce((n, d) => n + d.largo, 0) / Math.max(1, docs.length);
  return docs;
}

function rankingPalabras(consulta: string, candidatos: Set<string>): { id: string; puntos: number }[] {
  const ds = prepararPalabras();
  const q = [...new Set(tokens(consulta))];
  if (!q.length) return [];
  const N = ds.length;
  const k1 = 1.2;
  const b = 0.75;
  const out: { id: string; puntos: number }[] = [];
  for (const d of ds) {
    if (!candidatos.has(d.trozo.id)) continue;
    let puntos = 0;
    for (const t of q) {
      const f = d.tf.get(t);
      if (!f) continue;
      const n = df.get(t) ?? 0;
      const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
      puntos += (idf * f * (k1 + 1)) / (f + k1 * (1 - b + (b * d.largo) / largoMedio));
    }
    if (puntos > 0) out.push({ id: d.trozo.id, puntos });
  }
  return out.sort((x, y) => y.puntos - x.puntos);
}

// ─────────────────────────── Semántica ───────────────────────────

let vectores: Map<string, Float32Array> | null = null;

function decodificar(b64: string): Float32Array {
  const bytes = Buffer.from(b64, "base64");
  const q = new Int8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const v = new Float32Array(q.length);
  let norma = 0;
  for (let i = 0; i < q.length; i++) norma += q[i] * q[i];
  norma = Math.sqrt(norma) || 1;
  for (let i = 0; i < q.length; i++) v[i] = q[i] / norma;
  return v;
}

function prepararVectores(): Map<string, Float32Array> {
  if (!vectores) {
    vectores = new Map();
    for (const t of INDICE.trozos) if (t.v) vectores.set(t.id, decodificar(t.v));
  }
  return vectores;
}

/** true si el índice trae embeddings (se generó con OPENAI_API_KEY). */
export function indiceTieneVectores(): boolean {
  return prepararVectores().size > 0;
}

/** Caché en memoria de embeddings de consultas (las preguntas se repiten mucho). */
const cacheConsultas = new Map<string, Float32Array>();

async function embeberConsulta(consulta: string, clave: string, f: typeof fetch): Promise<Float32Array | null> {
  const k = normalizar(consulta);
  const enCache = cacheConsultas.get(k);
  if (enCache) return enCache;
  try {
    const r = await f(URL_EMBEDDINGS, {
      method: "POST",
      headers: { Authorization: `Bearer ${clave}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: INDICE.modelo, input: consulta, dimensions: INDICE.dimensiones }),
      signal: AbortSignal.timeout(TIEMPO_MAX_MS),
    });
    if (!r.ok) {
      console.warn(`[asistente] embeddings ${r.status}: se usa búsqueda por palabras`);
      return null;
    }
    const j = (await r.json()) as { data?: { embedding?: number[] }[] };
    const e = j.data?.[0]?.embedding;
    if (!Array.isArray(e) || e.length !== INDICE.dimensiones) return null;
    let norma = 0;
    for (const x of e) norma += x * x;
    norma = Math.sqrt(norma) || 1;
    const v = Float32Array.from(e, (x) => x / norma);
    if (cacheConsultas.size >= 300) cacheConsultas.delete(cacheConsultas.keys().next().value as string);
    cacheConsultas.set(k, v);
    return v;
  } catch {
    console.warn("[asistente] embeddings sin respuesta: se usa búsqueda por palabras");
    return null;
  }
}

function rankingSemantico(q: Float32Array, candidatos: Set<string>): { id: string; puntos: number }[] {
  const out: { id: string; puntos: number }[] = [];
  for (const [id, v] of prepararVectores()) {
    if (!candidatos.has(id)) continue;
    let s = 0;
    for (let i = 0; i < v.length; i++) s += v[i] * q[i];
    out.push({ id, puntos: s });
  }
  return out.sort((x, y) => y.puntos - x.puntos);
}

// ─────────────────────────── API ───────────────────────────

const porId = new Map(INDICE.trozos.map((t) => [t.id, t]));

const aResultado = (t: TrozoConocimiento): ResultadoBusqueda => ({
  id: t.id,
  fuente: t.fuente,
  titulo: t.titulo,
  ruta: t.ruta,
  ancla: t.ancla,
  texto: t.texto,
});

/** Búsqueda por palabras (BM25), síncrona. Respaldo sin clave. */
export function buscarPorPalabras(consulta: string, opciones: Pick<OpcionesBusqueda, "limite" | "fuentes"> = {}): ResultadoBusqueda[] {
  const limite = Math.min(Math.max(opciones.limite ?? 5, 1), 8);
  const candidatos = new Set(
    INDICE.trozos.filter((t) => !opciones.fuentes?.length || opciones.fuentes.includes(t.fuente)).map((t) => t.id),
  );
  return rankingPalabras(consulta.slice(0, MAX_CONSULTA), candidatos)
    .slice(0, limite)
    .map((r) => aResultado(porId.get(r.id) as TrozoConocimiento));
}

/**
 * Búsqueda híbrida (semántica + palabras). Nunca lanza: ante cualquier fallo
 * de OpenAI devuelve el resultado por palabras con `modo: "palabras"`.
 */
export async function buscarConocimiento(
  consulta: string,
  opciones: OpcionesBusqueda = {},
): Promise<{ modo: ModoBusqueda; resultados: ResultadoBusqueda[] }> {
  const q = consulta.trim().slice(0, MAX_CONSULTA);
  const limite = Math.min(Math.max(opciones.limite ?? 5, 1), 8);
  if (!q) return { modo: "palabras", resultados: [] };
  const clave = (opciones.claveOpenAI ?? process.env.OPENAI_API_KEY ?? "").trim();
  if (opciones.soloPalabras || !clave || !indiceTieneVectores()) {
    return { modo: "palabras", resultados: buscarPorPalabras(q, opciones) };
  }
  const vq = await embeberConsulta(q, clave, opciones.fetchImpl ?? fetch);
  if (!vq) return { modo: "palabras", resultados: buscarPorPalabras(q, opciones) };

  const candidatos = new Set(
    INDICE.trozos.filter((t) => !opciones.fuentes?.length || opciones.fuentes.includes(t.fuente)).map((t) => t.id),
  );
  const sem = rankingSemantico(vq, candidatos).slice(0, 30);
  const pal = rankingPalabras(q, candidatos).slice(0, 30);
  // Fusión por puntaje normalizado: la semántica manda (entiende paráfrasis e
  // inglés); BM25 suma un poco y rescata nombres exactos («LPR», «PTT»).
  // Con RRF puro, el ruido de BM25 en consultas coloquiales desplazaba al
  // mejor resultado semántico; los pesos se ajustaron con consultas de prueba.
  const fusion = new Map<string, number>();
  const sMax = sem[0]?.puntos ?? 0;
  const sMin = sem[sem.length - 1]?.puntos ?? 0;
  for (const r of sem) fusion.set(r.id, PESO_SEMANTICO * ((r.puntos - sMin) / (sMax - sMin || 1)));
  const pMax = pal[0]?.puntos || 1;
  for (const r of pal) fusion.set(r.id, (fusion.get(r.id) ?? 0) + PESO_PALABRAS * (r.puntos / pMax));
  const resultados = [...fusion.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limite)
    .map(([id]) => aResultado(porId.get(id) as TrozoConocimiento));
  return { modo: "hibrida", resultados };
}
