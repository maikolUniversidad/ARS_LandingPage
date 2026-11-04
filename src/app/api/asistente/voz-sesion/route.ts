import { promptAgenteVoz } from "@/lib/asistente/prompt";
import { configuracion, limitado } from "@/lib/asistente/servidor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * URL firmada (de un solo uso, corta duración) para abrir una conversación en
 * tiempo real con el agente de ElevenLabs sin exponer la API key.
 */
export async function GET(req: Request) {
  const cfg = configuracion();
  if (!cfg.elevenKey || !cfg.agenteId) {
    return Response.json(
      { ok: false, codigo: "sin_clave", mensaje: "Falta ELEVENLABS_API_KEY o ELEVENLABS_AGENT_ID en el .env del servidor." },
      { status: 503 },
    );
  }
  if (limitado(req, "voz-sesion", 10)) {
    return Response.json({ ok: false, codigo: "limite", mensaje: "Demasiadas sesiones de voz." }, { status: 429 });
  }
  const r = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(cfg.agenteId)}`,
    { headers: { "xi-api-key": cfg.elevenKey }, cache: "no-store" },
  );
  if (!r.ok) {
    console.error("[asistente/voz-sesion] ElevenLabs", r.status, (await r.text().catch(() => "")).slice(0, 300));
    return Response.json({ ok: false, codigo: "proveedor", mensaje: "No se pudo iniciar la voz en tiempo real." }, { status: 502 });
  }
  const data = (await r.json()) as { signed_url?: string };
  // El prompt (instrucciones + base de conocimiento) viaja como override: así el
  // agente de voz usa exactamente la misma fuente que el chat de texto.
  return Response.json({ ok: true, signedUrl: data.signed_url, prompt: promptAgenteVoz() }, { headers: { "Cache-Control": "no-store" } });
}
