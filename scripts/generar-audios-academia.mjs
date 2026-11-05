#!/usr/bin/env node
/**
 * Genera con ElevenLabs los audios de la Academia ARS y los deja normalizados:
 *  - narración de Ars  → public/audio/narracion/academia/<x>.mp3   (src/data/narracion/guiones-academia.ts)
 *  - voces personajes  → public/audio/academia/personajes/<id>.mp3 (src/data/academia/audios.ts)
 *
 *   node --env-file=.env.local scripts/generar-audios-academia.mjs            # solo los que falten
 *   node --env-file=.env.local scripts/generar-audios-academia.mjs gloria --forzar
 *
 * El argumento es un prefijo de id (vacío = todos). Requiere ELEVENLABS_API_KEY y ffmpeg en el PATH
 * (normaliza a −16 LUFS, mono, 96 kbps; la radio de Diana va con filtro de banda telefónica).
 *
 * Los MP3 versionados se hicieron el 5-nov-2026 con el conector de ElevenLabs (mismas voces,
 * modelos y textos que aquí). `vigilante-b1-4` es el silencio de la tabla B1: un carraspeo
 * corto mezclado con un fondo de ambiente nocturno (ruido marrón filtrado a −30 dB).
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const importar = (ruta) => import(pathToFileURL(join(raiz, ruta)).href);
// Node 24 importa TypeScript directamente (type stripping).
const { GUIONES_ACADEMIA } = await importar("src/data/narracion/guiones-academia.ts");
const { AUDIOS_ACADEMIA } = await importar("src/data/academia/audios.ts");
const { VOZ_ARS } = await importar("src/lib/narracion/contrato.ts");

/** Voz de ElevenLabs por personaje (todas en español de Colombia). */
const VOCES = {
  oscar: "W1hAcdh0RNsPYUA7fkJh", // El Faraón – Deep, Powerful and Peaceful
  vigilante: "qqab7XtemzUr6wYwGSrQ", // Jerome – Calm & Friendly Colombian voice
  edgar: "JmwppWx5vSX4FtbIik4Z", // Juan Pablo – grave, sobria
  yamile: "yfUfwZTRubVrsUZWqzwp", // Lina – Colombian Warm & Confident (paisa)
  gloria: "HRi5Prm2B3PevwpDmVLP", // María Blanco – Warm Expressive (mayor)
  zuluaga: "hk68gGZHnB7d5XsCTniP", // DAVOFLOW – autoridad, sofisticación
  kevin: "NGuczaxV7CJACyG07XxA", // El Boga – Enthusiastic and Energetic
  diana: "x5IDPSl4ZUbhosMmVFTk", // Lumina – Neutral and Clear
  ramiro: "0ji4DHZV895MuXeZB0PL", // Rogher – Encouraging and Passionate
};

/** Dirección de actuación (etiquetas de eleven_v4) que se antepone al texto de cada clip. */
const DIRECCION = {
  "oscar-bienvenida": "[firm, commanding military instructor voice]",
  "oscar-canon": "[shouting a sharp range command]",
  "oscar-dedo": "[shouting a sharp range command]",
  "oscar-alto": "[shouting a sharp range command]",
  "oscar-vacio": "[shouting a sharp range command]",
  "vigilante-b1-1": "[calm, respectful, firm]",
  "vigilante-b1-2": "[annoyed, dismissive]",
  "vigilante-b1-3": "[threatening, smug]",
  "edgar-b1-1": "[drunk, slurring, lowering his voice, sad]",
  "edgar-b1-2": "[drunk, slurring, angry, shouting]",
  "edgar-b1-3": "[drunk, furious, shouting]",
  "edgar-b1-4": "[drunk, slurring, irritated]",
  "yamile-guion": "[warm, friendly teacher]",
  gloria: "[elderly woman, sweet, embarrassed, a bit worried]",
  zuluaga: "[arrogant, indignant, impatient]",
  kevin: "[cheerful, fast, Caribbean coastal Colombian accent from Barranquilla]",
  "diana-radio": "[professional radio dispatcher, crisp, calm]",
  ramiro: "[friendly but businesslike supervisor]",
};
/** El silencio de B1 no tiene texto: solo un carraspeo. */
const PROMPT_ESPECIAL = { "vigilante-b1-4": "[clears throat] ... [sighs quietly] Mm." };

const vozDe = (id) => VOCES[id.split("-")[0]];

const clave = process.env.ELEVENLABS_API_KEY;
if (!clave) {
  console.error("Falta ELEVENLABS_API_KEY (use --env-file=.env.local).");
  process.exit(1);
}
const args = process.argv.slice(2);
const forzar = args.includes("--forzar");
const prefijo = args.find((a) => !a.startsWith("--")) ?? "";

const trabajos = [
  ...Object.entries(GUIONES_ACADEMIA).map(([id, texto]) => ({
    id,
    destino: join(raiz, "public/audio/narracion", `${id}.mp3`),
    voz: VOZ_ARS,
    modelo: "eleven_multilingual_v2",
    texto,
  })),
  ...AUDIOS_ACADEMIA.map((a) => ({
    id: a.id,
    destino: join(raiz, "public", a.src),
    voz: vozDe(a.id),
    modelo: "eleven_v4",
    texto: PROMPT_ESPECIAL[a.id] ?? `${DIRECCION[a.id] ?? ""} ${a.texto}`.trim(),
  })),
].filter((t) => t.id.startsWith(prefijo) && (forzar || !existsSync(t.destino)));

const tmp = mkdtempSync(join(tmpdir(), "academia-"));
const LN = "loudnorm=I=-16:TP=-1.5:LRA=11";
const ffmpeg = (...a) => execFileSync("ffmpeg", ["-v", "error", "-y", ...a], { stdio: "inherit" });
const salida = ["-ac", "1", "-ar", "44100", "-c:a", "libmp3lame", "-b:a", "96k"];

let hechos = 0;
for (const t of trabajos) {
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${t.voz}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": clave, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({ text: t.texto, model_id: t.modelo }),
  });
  if (!r.ok) {
    console.error(`✗ ${t.id}: ${r.status} ${(await r.text()).slice(0, 300)}`);
    process.exitCode = 1;
    continue;
  }
  const crudo = join(tmp, `${t.id.replaceAll("/", "_")}.mp3`);
  writeFileSync(crudo, Buffer.from(await r.arrayBuffer()));
  mkdirSync(dirname(t.destino), { recursive: true });
  if (t.id === "vigilante-b1-4") {
    ffmpeg(
      "-i", crudo, "-f", "lavfi", "-t", "3.6", "-i", "anoisesrc=color=brown:amplitude=0.5:seed=7",
      "-filter_complex",
      "[0:a]aresample=44100,aformat=channel_layouts=mono,loudnorm=I=-20:TP=-3,adelay=300[v];" +
        "[1:a]lowpass=f=900,highpass=f=60,volume=-30dB[n];" +
        "[n][v]amix=inputs=2:duration=first:normalize=0,afade=t=in:d=0.3,afade=t=out:st=3.1:d=0.5",
      ...salida, t.destino,
    );
  } else {
    const filtro =
      t.id === "diana-radio" ? `highpass=f=300,lowpass=f=3400,acompressor=threshold=-20dB:ratio=6,${LN}` : LN;
    ffmpeg("-i", crudo, "-af", filtro, ...salida, t.destino);
  }
  hechos++;
  console.log(`✓ ${t.id}`);
}
console.log(`${hechos} clip(s) generados de ${trabajos.length} pendientes con el prefijo «${prefijo || "(todos)"}».`);
