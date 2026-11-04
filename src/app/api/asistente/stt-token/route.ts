import { configuracion, limitado } from "@/lib/asistente/servidor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Token de un solo uso (15 min) para Scribe en tiempo real desde el navegador:
 * transcripción parcial en vivo sin exponer la API key.
 */
export async function POST(req: Request) {
  const cfg = configuracion();
  if (!cfg.elevenKey) {
    return Response.json({ ok: false, codigo: "sin_clave", mensaje: "Falta ELEVENLABS_API_KEY en el .env del servidor." }, { status: 503 });
  }
  if (limitado(req, "stt-token", 30)) {
    return Response.json({ ok: false, codigo: "limite", mensaje: "Demasiadas peticiones de voz." }, { status: 429 });
  }
  const r = await fetch("https://api.elevenlabs.io/v1/single-use-token/realtime_scribe", {
    method: "POST",
    headers: { "xi-api-key": cfg.elevenKey },
    cache: "no-store",
  });
  if (!r.ok) {
    console.error("[asistente/stt-token] ElevenLabs", r.status, (await r.text().catch(() => "")).slice(0, 300));
    return Response.json({ ok: false, codigo: "proveedor", mensaje: "No se pudo iniciar la transcripción en vivo." }, { status: 502 });
  }
  const data = (await r.json()) as { token?: string };
  return Response.json({ ok: true, token: data.token }, { headers: { "Cache-Control": "no-store" } });
}
