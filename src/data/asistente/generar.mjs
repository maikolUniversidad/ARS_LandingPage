#!/usr/bin/env node
/**
 * Regenera `conocimiento.generated.ts` a partir de `conocimiento/*.md`.
 *
 * Uso: node src/data/asistente/generar.mjs
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
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

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
console.log(`conocimiento.generated.ts: ${docs.length} documentos`);
