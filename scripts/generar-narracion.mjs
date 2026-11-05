#!/usr/bin/env node
/**
 * Genera con ElevenLabs los MP3 de narración de Ars que falten.
 *
 *   node --env-file=.env.local scripts/generar-narracion.mjs arquitectura/
 *   node --env-file=.env.local scripts/generar-narracion.mjs arquitectura/voz --forzar
 *
 * El argumento es un prefijo de id (vacío = todos). Solo crea los clips que no
 * existen en public/audio/narracion/<id>.mp3, salvo con --forzar.
 * Requiere ELEVENLABS_API_KEY; la voz es la de Ars (VOZ_ARS del contrato).
 */
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const importar = (ruta) => import(pathToFileURL(join(raiz, ruta)).href);
// Node 24 importa TypeScript directamente (type stripping). Se leen los
// guiones-*.ts uno a uno porque el index usa imports sin extensión.
const carpeta = "src/data/narracion";
const GUIONES = {};
for (const f of readdirSync(join(raiz, carpeta)).filter((n) => /^guiones-.*\.ts$/.test(n))) {
  try {
    for (const v of Object.values(await importar(`${carpeta}/${f}`))) Object.assign(GUIONES, v);
  } catch {
    console.warn(`(se omite ${f}: depende de alias del proyecto)`);
  }
}
const { VOZ_ARS } = await importar("src/lib/narracion/contrato.ts");

const clave = process.env.ELEVENLABS_API_KEY;
if (!clave) {
  console.error("Falta ELEVENLABS_API_KEY (use --env-file=.env.local).");
  process.exit(1);
}
const args = process.argv.slice(2);
const forzar = args.includes("--forzar");
const prefijo = args.find((a) => !a.startsWith("--")) ?? "";
const modelo = process.env.ELEVENLABS_NARRACION_MODEL || "eleven_multilingual_v2";

const ids = Object.keys(GUIONES).filter((id) => id.startsWith(prefijo));
let hechos = 0;
for (const id of ids) {
  const destino = join(raiz, "public/audio/narracion", `${id}.mp3`);
  if (existsSync(destino) && !forzar) continue;
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOZ_ARS}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": clave, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({
      text: GUIONES[id],
      model_id: modelo,
      language_code: modelo.includes("multilingual_v2") ? undefined : "es",
      voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.2, use_speaker_boost: true },
    }),
  });
  if (!r.ok) {
    console.error(`✗ ${id}: ${r.status} ${(await r.text()).slice(0, 300)}`);
    process.exitCode = 1;
    continue;
  }
  mkdirSync(dirname(destino), { recursive: true });
  writeFileSync(destino, Buffer.from(await r.arrayBuffer()));
  hechos++;
  console.log(`✓ ${id}`);
}
console.log(`${hechos} clip(s) generados de ${ids.length} con el prefijo «${prefijo || "(todos)"}».`);
