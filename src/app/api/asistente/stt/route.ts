import { configuracion, limitado } from "@/lib/asistente/servidor";
import { LIMITES } from "@/lib/asistente/tipos";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * Voz → texto con ElevenLabs Scribe. Recibe el audio grabado en el navegador
 * (multipart, campo `audio`), lo reenvía y devuelve solo el texto. No se guarda.
 */
export async function POST(req: Request) {
  const cfg = configuracion();
  if (!cfg.elevenKey) {
    return Response.json(
      { ok: false, codigo: "sin_clave", mensaje: "Falta ELEVENLABS_API_KEY en el .env del servidor." },
      { status: 503 },
    );
  }
  if (limitado(req, "stt", 30)) {
    return Response.json({ ok: false, codigo: "limite", mensaje: "Demasiadas peticiones de voz." }, { status: 429 });
  }
  const largo = Number(req.headers.get("content-length") ?? 0);
  if (largo > LIMITES.audioBytes + 50_000) {
    return Response.json({ ok: false, codigo: "muy_grande", mensaje: "Audio demasiado largo." }, { status: 413 });
  }
  let audio: File | null = null;
  let idioma = "";
  try {
    const form = await req.formData();
    const f = form.get("audio");
    audio = f instanceof File ? f : null;
    const l = form.get("idioma");
    idioma = l === "en" ? "en" : l === "es" ? "es" : "";
  } catch {
    /* inválido */
  }
  if (!audio || audio.size === 0) {
    return Response.json({ ok: false, codigo: "invalido", mensaje: "Falta el audio." }, { status: 400 });
  }
  if (audio.size > LIMITES.audioBytes) {
    return Response.json({ ok: false, codigo: "muy_grande", mensaje: "Audio demasiado largo." }, { status: 413 });
  }

  const cuerpo = new FormData();
  cuerpo.append("model_id", process.env.ELEVENLABS_STT_MODEL?.trim() || "scribe_v1");
  cuerpo.append("file", audio, audio.name || "voz.webm");
  if (idioma) cuerpo.append("language_code", idioma);
  cuerpo.append("tag_audio_events", "false");

  const r = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
    method: "POST",
    headers: { "xi-api-key": cfg.elevenKey },
    body: cuerpo,
    signal: req.signal,
  });
  if (!r.ok) {
    const detalle = await r.text().catch(() => "");
    console.error("[asistente/stt] ElevenLabs", r.status, detalle.slice(0, 300));
    return Response.json({ ok: false, codigo: "proveedor", mensaje: "No pude entender el audio." }, { status: 502 });
  }
  const data = (await r.json()) as { text?: string };
  return Response.json({ ok: true, texto: (data.text ?? "").trim() });
}
