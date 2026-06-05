#!/usr/bin/env node
/**
 * Auto-hospeda los modelos de IA en /public para que el proyecto sea
 * AUTÓNOMO: tras `git clone && npm install`, todo queda local y la app no
 * depende de CDNs externos en runtime.
 *
 * Corre solo en `postinstall`. Es idempotente (omite lo que ya existe) y NO
 * rompe la instalación si algo falla (avisa y sale 0). Para forzar redescarga:
 *   FORCE=1 npm run fetch-models
 *
 *  - MediaPipe wasm  ← se COPIA de node_modules/@mediapipe/tasks-vision/wasm
 *  - MediaPipe models ← se DESCARGAN de storage.googleapis.com (no vienen en npm)
 *  - tesseract worker+core ← se COPIAN de node_modules
 *  - eng.traineddata ← se DESCARGA de tessdata (no viene en npm)
 */

import { cp, mkdir, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FORCE = process.env.FORCE === "1";

const MP_WASM_SRC = join(ROOT, "node_modules/@mediapipe/tasks-vision/wasm");
const MP_WASM_DST = join(ROOT, "public/mediapipe/wasm");
const MP_MODELS_DST = join(ROOT, "public/mediapipe/models");
const TESS_DST = join(ROOT, "public/tesseract");
const TESS_WORKER_SRC = join(ROOT, "node_modules/tesseract.js/dist/worker.min.js");
const TESS_CORE_SRC = join(ROOT, "node_modules/tesseract.js-core");
const ORT_SRC = join(ROOT, "node_modules/onnxruntime-web/dist");
const ORT_DST = join(ROOT, "public/ort");

const MP_MODELS = [
  {
    name: "pose_landmarker_lite.task",
    url: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
  },
  {
    name: "efficientdet_lite0.tflite",
    url: "https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite",
  },
  {
    name: "blaze_face_short_range.tflite",
    url: "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
  },
];

const TESS_LANG = {
  name: "eng.traineddata.gz",
  url: "https://tessdata.projectnaptha.com/4.0.0/eng.traineddata.gz",
};

async function hasFile(p) {
  try {
    return !FORCE && (await stat(p)).size > 0;
  } catch {
    return false;
  }
}

async function download(url, dest) {
  if (await hasFile(dest)) {
    console.log(`  ✓ ya existe ${rel(dest)}`);
    return;
  }
  await mkdir(dirname(dest), { recursive: true });
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
  console.log(`  ↓ ${rel(dest)} (${(buf.length / 1024 / 1024).toFixed(1)} MB)`);
}

async function copyDirOrFile(src, dst) {
  if (await hasFile(dst)) {
    console.log(`  ✓ ya existe ${rel(dst)}`);
    return;
  }
  await mkdir(dirname(dst), { recursive: true });
  await cp(src, dst, { recursive: true });
  console.log(`  ⇒ copiado ${rel(dst)}`);
}

const rel = (p) => p.replace(ROOT + "/", "");

async function main() {
  console.log("[fetch-models] preparando modelos locales en /public…");

  // 1) MediaPipe wasm (copiado del paquete)
  if (existsSync(MP_WASM_SRC)) {
    if (FORCE || !existsSync(join(MP_WASM_DST, "vision_wasm_internal.wasm"))) {
      await mkdir(MP_WASM_DST, { recursive: true });
      await cp(MP_WASM_SRC, MP_WASM_DST, { recursive: true });
      console.log(`  ⇒ copiado ${rel(MP_WASM_DST)}`);
    } else {
      console.log(`  ✓ ya existe ${rel(MP_WASM_DST)}`);
    }
  } else {
    console.warn("  ⚠ no se encontró @mediapipe/tasks-vision/wasm (¿npm install?)");
  }

  // 2) MediaPipe models (descargados)
  for (const m of MP_MODELS) {
    await download(m.url, join(MP_MODELS_DST, m.name));
  }

  // 3) tesseract worker + core (copiados del paquete)
  if (existsSync(TESS_WORKER_SRC)) {
    await copyDirOrFile(TESS_WORKER_SRC, join(TESS_DST, "worker.min.js"));
  } else {
    console.warn("  ⚠ no se encontró tesseract.js/dist/worker.min.js");
  }
  if (existsSync(TESS_CORE_SRC)) {
    if (FORCE || !existsSync(join(TESS_DST, "tesseract-core-simd-lstm.wasm"))) {
      await mkdir(TESS_DST, { recursive: true });
      await cp(TESS_CORE_SRC, TESS_DST, { recursive: true });
      console.log(`  ⇒ copiado core de tesseract → ${rel(TESS_DST)}`);
    } else {
      console.log(`  ✓ ya existe core de tesseract`);
    }
  } else {
    console.warn("  ⚠ no se encontró tesseract.js-core");
  }

  // 4) eng.traineddata (descargado)
  await download(TESS_LANG.url, join(TESS_DST, TESS_LANG.name));

  // 5) onnxruntime-web wasm (copiado del paquete) — para los detectores YOLOX (EPP/armas)
  if (existsSync(ORT_SRC)) {
    const { readdir } = await import("node:fs/promises");
    const files = (await readdir(ORT_SRC)).filter((f) => f.startsWith("ort-wasm"));
    await mkdir(ORT_DST, { recursive: true });
    let copied = 0;
    for (const f of files) {
      const dst = join(ORT_DST, f);
      if (!FORCE && existsSync(dst)) continue;
      await cp(join(ORT_SRC, f), dst);
      copied++;
    }
    console.log(`  ⇒ onnxruntime-web wasm → ${rel(ORT_DST)} (${copied} archivos nuevos / ${files.length})`);
  } else {
    console.warn("  ⚠ no se encontró onnxruntime-web/dist (¿npm install?)");
  }

  // 6) Modelos vigias (EPP/armas): NO se pueden auto-descargar (server privado).
  //    Solo dejamos la carpeta + aviso de dónde colocarlos.
  const VIGIAS_DST = join(ROOT, "public/models/vigias");
  await mkdir(VIGIAS_DST, { recursive: true });
  const epp = join(VIGIAS_DST, "epp_detector.onnx");
  if (!existsSync(epp)) {
    console.warn(
      "  ⚠ faltan los modelos YOLOX en public/models/vigias/ (epp_detector.onnx, weapon_detector.onnx)."
    );
    console.warn("     Son privados (server vigias) → copialos a mano. Ver public/models/vigias/README.txt");
  }

  console.log("[fetch-models] listo. Modelos locales en /public/mediapipe, /public/tesseract, /public/ort.");
}

main().catch((e) => {
  console.warn("\n[fetch-models] ⚠ no se pudo completar la descarga de modelos:");
  console.warn("  " + (e?.message ?? e));
  console.warn("  La app puede no cargar la IA hasta correr:  npm run fetch-models");
  console.warn("  (no se interrumpe la instalación).\n");
  process.exit(0); // nunca romper npm install
});
