import Anthropic from "@anthropic-ai/sdk";
import type { RespuestaDiagnostico } from "@/data/diagnostico/tipos";
import { configuracion, limitado } from "@/lib/asistente/servidor";
import { areasCandidatas } from "@/lib/diagnostico/catalogo";
import { diagnosticoDemo, diagnosticoIa, modoDemoDiagnostico, validarPeticionDiagnostico } from "@/lib/diagnostico/servidor";

export const runtime = "nodejs";
export const maxDuration = 300;

const responder = (r: RespuestaDiagnostico, status = 200) => Response.json(r, { status, headers: { "Cache-Control": "no-store" } });

/** Recibe `PeticionDiagnostico` y devuelve `RespuestaDiagnostico`. */
export async function POST(req: Request) {
  const cfg = configuracion();
  const demo = !cfg.anthropicKey && modoDemoDiagnostico();
  if (!cfg.anthropicKey && !demo) {
    return responder({ ok: false, mensaje: "El diagnóstico aún no está configurado en este servidor." }, 503);
  }
  if (!demo && limitado(req, "diagnostico", 5, 10 * 60_000)) {
    return responder({ ok: false, mensaje: "Ya hiciste varios diagnósticos seguidos. Intenta de nuevo en unos minutos." }, 429);
  }

  let raw: unknown;
  try {
    const cuerpo = await req.text();
    if (cuerpo.length > 150_000) return responder({ ok: false, mensaje: "La petición es demasiado grande." }, 413);
    raw = JSON.parse(cuerpo);
  } catch {
    return responder({ ok: false, mensaje: "JSON inválido." }, 400);
  }
  const peticion = validarPeticionDiagnostico(raw);
  if (!peticion) return responder({ ok: false, mensaje: "Falta el perfil de la empresa." }, 400);

  if (demo) return responder({ ok: true, diagnostico: diagnosticoDemo(peticion.perfil) });

  try {
    const candidatas = areasCandidatas(peticion.perfil, 3, 6);
    const diagnostico = await diagnosticoIa(peticion, candidatas, cfg, req.signal);
    return responder({ ok: true, diagnostico });
  } catch (err) {
    if (req.signal.aborted) return responder({ ok: false, mensaje: "Cancelado." }, 499);
    console.error("[diagnostico] error:", err);
    const mensaje =
      err instanceof Anthropic.RateLimitError
        ? "El servicio está ocupado. Intenta en unos segundos."
        : "No pudimos terminar el análisis. Intenta de nuevo.";
    return responder({ ok: false, mensaje }, 502);
  }
}
