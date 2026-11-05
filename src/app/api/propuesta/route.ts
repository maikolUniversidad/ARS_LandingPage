import type { RespuestaPropuesta } from "@/data/propuesta/tipos";
import { configuracion, limitado } from "@/lib/asistente/servidor";
import { EntradaInvalida, modoDemoPropuesta, propuestaDemo, propuestaIa, validarPeticionPropuesta } from "@/lib/propuesta/servidor";

export const runtime = "nodejs";
export const maxDuration = 120;

const responder = (r: RespuestaPropuesta, status = 200) => Response.json(r, { status, headers: { "Cache-Control": "no-store" } });

/** Recibe `PeticionPropuesta` y devuelve `RespuestaPropuesta`. */
export async function POST(req: Request) {
  const cfg = configuracion();
  const demo = !cfg.anthropicKey && modoDemoPropuesta();
  if (!cfg.anthropicKey && !demo) {
    return responder({ ok: false, mensaje: "La propuesta aún no está disponible. Escríbanos por WhatsApp y un asesor le ayuda." }, 503);
  }
  if (!demo && limitado(req, "propuesta", 5, 10 * 60_000)) {
    return responder({ ok: false, mensaje: "Ya armó varias propuestas seguidas. Intente de nuevo en unos minutos." }, 429);
  }

  let peticion;
  try {
    const cuerpo = await req.text();
    if (cuerpo.length > 40_000) return responder({ ok: false, mensaje: "La información enviada es demasiado larga." }, 413);
    peticion = validarPeticionPropuesta(JSON.parse(cuerpo));
  } catch (err) {
    const mensaje = err instanceof EntradaInvalida ? err.message : "No pudimos leer sus respuestas. Intente de nuevo.";
    return responder({ ok: false, mensaje }, 400);
  }

  if (demo) return responder({ ok: true, propuesta: propuestaDemo(peticion) });

  try {
    return responder({ ok: true, propuesta: await propuestaIa(peticion, cfg, req.signal) });
  } catch (err) {
    if (req.signal.aborted) return responder({ ok: false, mensaje: "Cancelado." }, 499);
    // Si la IA falla, la persona igual recibe una propuesta preliminar armada con reglas.
    console.error("[propuesta] IA falló, uso la propuesta por reglas:", err instanceof Error ? err.message : err);
    try {
      return responder({ ok: true, propuesta: propuestaDemo(peticion) });
    } catch {
      return responder({ ok: false, mensaje: "No pudimos armar su propuesta. Intente de nuevo o escríbanos por WhatsApp." }, 502);
    }
  }
}
