#!/usr/bin/env node
/**
 * Regenera la base de conocimiento del asistente.
 *
 * Uso: node src/data/asistente/generar.mjs [--sin-embeddings]
 *
 * Genera dos archivos:
 * - `conocimiento.generated.ts`: los documentos de `conocimiento/*.md` (van
 *   completos al system prompt).
 * - `indice.generated.ts`: el índice de búsqueda semántica (RAG). Trocea los
 *   .md por secciones y añade el detalle que NO cabe en el prompt
 *   (descripción completa y fases de cada analítica, funcionalidades y casos
 *   de /plataforma, capacidades de /laboratorio y modelos de /vision-lab).
 *   Cada trozo lleva su embedding de OpenAI `text-embedding-3-small`
 *   (512 dimensiones, cuantizado a int8 y en base64). La clave se toma de
 *   OPENAI_API_KEY (entorno o `.env.local`) y solo se recalculan los trozos
 *   cuyo texto cambió. Sin clave, o con --sin-embeddings, el índice queda sin
 *   vectores y el servidor usa la búsqueda por palabras clave.
 *
 * Cada .md empieza con frontmatter:
 *   ---
 *   id: plataforma-erp
 *   titulo: Plataforma ARS y ERP operativo
 *   orden: 20
 *   rutas: ["/plataforma"]
 *   ---
 * Los documentos se ordenan por `orden` (y luego por `id`) para que la salida
 * sea determinista (importante para el prompt caching).
 */
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const DIR = dirname(fileURLToPath(import.meta.url));
const CARPETA = join(DIR, "conocimiento");
const SALIDA = join(DIR, "conocimiento.generated.ts");

function parsear(nombre, texto) {
  const limpio = texto.replace(/^﻿/, "").replace(/\r\n?/g, "\n");
  const m = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(limpio);
  if (!m) throw new Error(`${nombre}: falta el frontmatter (--- ... ---)`);
  const meta = {};
  for (const linea of m[1].split("\n")) {
    const l = linea.trim();
    if (!l || l.startsWith("#")) continue;
    const i = l.indexOf(":");
    if (i === -1) throw new Error(`${nombre}: línea de frontmatter inválida: ${l}`);
    meta[l.slice(0, i).trim()] = l.slice(i + 1).trim();
  }
  for (const campo of ["id", "titulo", "orden"]) {
    if (!meta[campo]) throw new Error(`${nombre}: falta el campo "${campo}"`);
  }
  const orden = Number(meta.orden);
  if (!Number.isFinite(orden)) throw new Error(`${nombre}: "orden" debe ser numérico`);
  let rutas = [];
  if (meta.rutas) {
    try {
      rutas = JSON.parse(meta.rutas);
    } catch {
      throw new Error(`${nombre}: "rutas" debe ser un arreglo JSON, p. ej. ["/vision"]`);
    }
    if (!Array.isArray(rutas) || rutas.some((r) => typeof r !== "string")) {
      throw new Error(`${nombre}: "rutas" debe ser un arreglo de strings`);
    }
  }
  const quitarComillas = (s) => s.replace(/^["'](.*)["']$/, "$1");
  return {
    id: quitarComillas(meta.id),
    titulo: quitarComillas(meta.titulo),
    orden,
    rutas,
    contenido: m[2].trim(),
  };
}

const plantilla = (s) => "`" + s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${") + "`";

const docs = readdirSync(CARPETA)
  .filter((f) => f.endsWith(".md"))
  .sort()
  .map((f) => parsear(f, readFileSync(join(CARPETA, f), "utf8")))
  .sort((a, b) => a.orden - b.orden || a.id.localeCompare(b.id));

const ids = new Set();
for (const d of docs) {
  if (ids.has(d.id)) throw new Error(`id duplicado: ${d.id}`);
  ids.add(d.id);
}

const cuerpo = docs
  .map(
    (d) =>
      `  {\n    id: ${JSON.stringify(d.id)},\n    titulo: ${JSON.stringify(d.titulo)},\n    orden: ${d.orden},\n    rutas: ${JSON.stringify(d.rutas)},\n    contenido: ${plantilla(d.contenido)},\n  },`,
  )
  .join("\n");

const salida = `// GENERADO por src/data/asistente/generar.mjs a partir de conocimiento/*.md.
// No editar a mano: edite los .md y ejecute \`node src/data/asistente/generar.mjs\`.
import type { DocumentoKB } from "./tipos";

export const DOCUMENTOS: DocumentoKB[] = [
${cuerpo}
];
`;

writeFileSync(SALIDA, salida, "utf8");
const totalPalabras = docs.reduce((n, d) => n + d.contenido.split(/\s+/).filter(Boolean).length, 0);
console.log(`conocimiento.generated.ts: ${docs.length} documentos, ~${totalPalabras} palabras`);

// ───────────────────────────── Índice semántico (RAG) ─────────────────────────────

const SALIDA_INDICE = join(DIR, "indice.generated.ts");
const RAIZ = join(DIR, "..", "..", "..");
const MODELO_EMB = "text-embedding-3-small";
const DIMENSIONES = 512;
const PALABRAS_TROZO = 170;

const palabras = (s) => s.split(/\s+/).filter(Boolean).length;
const hash = (s) => createHash("sha256").update(s).digest("hex").slice(0, 16);

/** Parte un texto en bloques de ~PALABRAS_TROZO palabras sin cortar párrafos ni preguntas. */
function partir(texto) {
  const bloques = texto
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);
  const out = [];
  let actual = "";
  for (const b of bloques) {
    if (actual && palabras(actual) + palabras(b) > PALABRAS_TROZO) {
      out.push(actual);
      actual = b;
    } else {
      actual = actual ? `${actual}\n\n${b}` : b;
    }
  }
  if (actual) out.push(actual);
  return out;
}

/** Trozos de un documento .md: uno por sección `## …` (o varios si es larga). */
function trozosDocumento(d) {
  const out = [];
  const secciones = d.contenido.split(/\n(?=## )/);
  for (const [i, sec] of secciones.entries()) {
    const m = /^## (.+)\n?([\s\S]*)$/.exec(sec.trim());
    const subtitulo = m ? m[1].trim() : "";
    const cuerpoSec = (m ? m[2] : sec).trim();
    if (!cuerpoSec) continue;
    for (const [j, parte] of partir(cuerpoSec).entries()) {
      out.push({
        id: `kb:${d.id}:${i}${j ? `.${j}` : ""}`,
        fuente: "kb",
        titulo: subtitulo ? `${d.titulo} › ${subtitulo}` : d.titulo,
        ruta: d.rutas[0] ?? "/",
        texto: parte,
      });
    }
  }
  return out;
}

/** Node 24 importa .ts sin dependencias (type stripping); los datos no tienen imports. */
async function cargarTs(rel) {
  return import(pathToFileURL(join(RAIZ, rel)).href);
}

async function trozosDatos() {
  const out = [];
  const { analiticas, familias } = await cargarTs("src/data/analiticas.ts");
  const fam = new Map(familias.map((f) => [f.id, f.nombre]));
  for (const a of analiticas) {
    const fases = a.fases.map((f) => `${f.t} s: ${f.texto}`).join("; ");
    const evidencia = a.video ? `Prueba real: sí (${a.video.chapa}).` : "Prueba real: todavía no; solo simulación 3D.";
    out.push({
      id: `analitica:${a.id}`,
      fuente: "analitica",
      titulo: `Analítica «${a.nombre}» (${fam.get(a.familia) ?? a.familia})`,
      ruta: "/vision",
      ancla: a.id,
      texto: `${a.corta} ${a.desc}\nCómo se activa: ${fases}.\nEstado declarado: ${
        a.estado ?? "sin estado declarado (disponibilidad a confirmar con el equipo comercial)"
      }. ${evidencia}\nEnlace: /vision#${a.id}`,
    });
  }
  const { features, featureGroups, useCases, flowSteps } = await cargarTs("src/data/integral-security.ts");
  for (const f of features.es) {
    const items = f.bulletGroups
      ? f.bulletGroups.map((g) => `${g.label}: ${g.items.join(", ")}`).join(". ")
      : f.bullets.join(", ");
    out.push({
      id: `funcionalidad:${f.id}`,
      fuente: "funcionalidad",
      titulo: `Funcionalidad ${f.letter} · ${f.title} (grupo ${featureGroups.es[f.group].label})`,
      ruta: "/plataforma",
      ancla: `feature-${f.id}`,
      texto: `${f.description}\nIncluye: ${items}.\nEnlace: /plataforma#feature-${f.id}`,
    });
  }
  for (const u of useCases.es) {
    out.push({
      id: `caso:${u.id}`,
      fuente: "funcionalidad",
      titulo: `Caso de uso: ${u.title} (${u.industry})`,
      ruta: "/plataforma",
      ancla: "casos",
      texto: `${u.bullets.join(", ")}.\nEnlace: /plataforma#casos`,
    });
  }
  out.push({
    id: "flujo:turno-reporte",
    fuente: "funcionalidad",
    titulo: "Flujo de integración: del turno al reporte",
    ruta: "/plataforma",
    texto: flowSteps.es.map((p, i) => `${i + 1}. ${p.title}: ${p.body}`).join("\n"),
  });
  const { aiCapabilities, categoryLabels } = await cargarTs("src/data/ai-capabilities.ts");
  for (const c of aiCapabilities) {
    out.push({
      id: `laboratorio:${c.id}`,
      fuente: "laboratorio",
      titulo: `Laboratorio · ${c.name} (${categoryLabels[c.category]})`,
      ruta: "/laboratorio",
      ancla: "demo-stage",
      texto: `${c.tagline}. ${c.description}\nUsos típicos: ${c.useCases.join(", ")}.\nSe prueba en vivo en /laboratorio (ejemplo, cámara propia o video subido; el video no sale del navegador). La métrica de la tarjeta es de presentación, no una garantía.`,
    });
  }
  const { visionModels, modelCategories } = await cargarTs("src/data/vision-models.ts");
  for (const m of visionModels) {
    out.push({
      id: `modelo:${m.id}`,
      fuente: "modelo",
      titulo: `Vision Lab · modelo ${m.name} (${modelCategories[m.category] ?? m.category})`,
      ruta: "/vision-lab",
      texto: `${m.shortDescription} ${m.whatItDemonstrates}${m.sensitive && m.warning ? `\nAviso: ${m.warning}` : ""}`,
    });
  }
  return out;
}

function claveOpenAI() {
  if (process.env.OPENAI_API_KEY?.trim()) return process.env.OPENAI_API_KEY.trim();
  for (const f of [".env.local", ".env"]) {
    const ruta = join(RAIZ, f);
    if (!existsSync(ruta)) continue;
    const m = /^\s*OPENAI_API_KEY\s*=\s*["']?([^"'\r\n]+)["']?\s*$/m.exec(readFileSync(ruta, "utf8"));
    if (m?.[1]?.trim()) return m[1].trim();
  }
  return "";
}

/** Vectores del índice anterior por hash de texto (para no recalcular lo que no cambió). */
function vectoresPrevios() {
  if (!existsSync(SALIDA_INDICE)) return new Map();
  const m = /\/\*JSON\*\/([\s\S]*)\/\*FIN\*\//.exec(readFileSync(SALIDA_INDICE, "utf8"));
  if (!m) return new Map();
  try {
    const previo = JSON.parse(m[1]);
    if (previo.modelo !== MODELO_EMB || previo.dimensiones !== DIMENSIONES) return new Map();
    return new Map(previo.trozos.filter((t) => t.v).map((t) => [t.h, t.v]));
  } catch {
    return new Map();
  }
}

/** Cuantiza a int8 (el coseno no depende de la escala del vector) y codifica en base64. */
function cuantizar(vector) {
  let max = 0;
  for (const x of vector) max = Math.max(max, Math.abs(x));
  const q = new Int8Array(vector.length);
  for (let i = 0; i < vector.length; i++) q[i] = Math.round((vector[i] / (max || 1)) * 127);
  return Buffer.from(q.buffer).toString("base64");
}

async function embeber(textos, clave) {
  const vectores = [];
  for (let i = 0; i < textos.length; i += 256) {
    const lote = textos.slice(i, i + 256);
    const r = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: { Authorization: `Bearer ${clave}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODELO_EMB, input: lote, dimensions: DIMENSIONES }),
    });
    if (!r.ok) throw new Error(`OpenAI embeddings ${r.status}: ${(await r.text()).slice(0, 300)}`);
    const j = await r.json();
    for (const d of j.data.sort((a, b) => a.index - b.index)) vectores.push(d.embedding);
  }
  return vectores;
}

const trozos = [...docs.flatMap(trozosDocumento), ...(await trozosDatos())].map((t) => ({
  ...t,
  h: hash(`${t.titulo}\n${t.texto}`),
}));
const sinEmbeddings = process.argv.includes("--sin-embeddings");
const previos = sinEmbeddings ? new Map() : vectoresPrevios();
const clave = sinEmbeddings ? "" : claveOpenAI();
let nuevos = 0;
if (clave) {
  const faltan = trozos.filter((t) => !previos.has(t.h));
  if (faltan.length) {
    const vectores = await embeber(
      faltan.map((t) => `${t.titulo}\n${t.texto}`),
      clave,
    );
    faltan.forEach((t, i) => previos.set(t.h, cuantizar(vectores[i])));
    nuevos = faltan.length;
  }
}
const finales = trozos.map((t) => (previos.has(t.h) ? { ...t, v: previos.get(t.h) } : t));
const conVectores = finales.filter((t) => t.v).length;
const indice = { modelo: MODELO_EMB, dimensiones: DIMENSIONES, trozos: finales };
writeFileSync(
  SALIDA_INDICE,
  `// GENERADO por src/data/asistente/generar.mjs (conocimiento/*.md + src/data/*.ts).
// No editar a mano: ejecute \`node src/data/asistente/generar.mjs\`.
// \`v\` = embedding ${MODELO_EMB} (${DIMENSIONES} dims) cuantizado a int8, en base64.
import type { IndiceConocimiento } from "./tipos";

export const INDICE: IndiceConocimiento = /*JSON*/${JSON.stringify(indice, null, 1)}/*FIN*/;
`,
  "utf8",
);
console.log(
  `indice.generated.ts: ${trozos.length} trozos, ${conVectores} con embedding (${nuevos} nuevos)${
    conVectores < trozos.length ? " · los que no tienen vector se buscan por palabras clave" : ""
  }`,
);
