import { configuracion, limitado } from "@/lib/asistente/servidor";
import { LIMITES } from "@/lib/asistente/tipos";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * Texto → voz con ElevenLabs (streaming MP3). La voz y la clave viven en el
 * servidor; el navegador solo recibe audio.
 */
export async function POST(req: Request) {
  const cfg = configuracion();
  if (!cfg.elevenKey || !cfg.vozId) {
    return Response.json(
      { ok: false, codigo: "sin_clave", mensaje: "Falta ELEVENLABS_API_KEY o ELEVENLABS_VOICE_ID en el .env del servidor." },
      { status: 503 },
    );
  }
  if (limitado(req, "tts", 60)) {
    return Response.json({ ok: false, codigo: "limite", mensaje: "Demasiadas peticiones de voz." }, { status: 429 });
  }
  let texto = "";
  let idioma = "es";
  try {
    const b = (await req.json()) as { texto?: unknown; idioma?: unknown };
    texto = typeof b.texto === "string" ? b.texto.trim().slice(0, LIMITES.ttsCaracteres) : "";
    idioma = b.idioma === "en" ? "en" : "es";
  } catch {
    /* cuerpo inválido */
  }
  if (!texto) return Response.json({ ok: false, codigo: "invalido", mensaje: "Texto vacío" }, { status: 400 });

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(cfg.vozId)}/stream?output_format=mp3_44100_128`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "xi-api-key": cfg.elevenKey, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({
      text: texto,
      model_id: cfg.modeloTts,
      language_code: idioma,
      apply_text_normalization: "auto",
      voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.2, use_speaker_boost: true, speed: 1.0 },
    }),
    signal: req.signal,
  });
  if (!r.ok || !r.body) {
    const detalle = await r.text().catch(() => "");
    console.error("[asistente/tts] ElevenLabs", r.status, detalle.slice(0, 300));
    return Response.json(
      { ok: false, codigo: r.status === 401 ? "sin_clave" : "proveedor", mensaje: "No se pudo generar la voz." },
      { status: 502 },
    );
  }
  return new Response(r.body, { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" } });
}
