import type { RespuestaPreguntas } from "@/data/propuesta/tipos";
import { configuracion, limitado } from "@/lib/asistente/servidor";
import { EntradaInvalida, modoDemoPropuesta, preguntasDemo, preguntasIa, validarPeticionPreguntas } from "@/lib/propuesta/servidor";

export const runtime = "nodejs";
export const maxDuration = 20;

const responder = (r: RespuestaPreguntas, status = 200) => Response.json(r, { status, headers: { "Cache-Control": "no-store" } });

/** Recibe `PeticionPreguntas` y devuelve `RespuestaPreguntas` (2–3 preguntas de seguimiento). */
export async function POST(req: Request) {
  const cfg = configuracion();
  const demo = !cfg.anthropicKey && modoDemoPropuesta();
  if (!demo && limitado(req, "propuesta-preguntas", 10, 10 * 60_000)) {
    return responder({ ok: false, mensaje: "Hizo varias consultas seguidas. Intente de nuevo en unos minutos." }, 429);
  }

  let respuestas;
  try {
    const cuerpo = await req.text();
    if (cuerpo.length > 30_000) return responder({ ok: false, mensaje: "La información enviada es demasiado larga." }, 413);
    ({ respuestas } = validarPeticionPreguntas(JSON.parse(cuerpo)));
  } catch (err) {
    const mensaje = err instanceof EntradaInvalida ? err.message : "No pudimos leer sus respuestas. Intente de nuevo.";
    return responder({ ok: false, mensaje }, 400);
  }

  // Sin clave (demo o servidor sin IA) las preguntas salen de reglas: el flujo nunca se bloquea aquí.
  if (!cfg.anthropicKey) return responder({ ok: true, preguntas: preguntasDemo(respuestas) });

  try {
    return responder({ ok: true, preguntas: await preguntasIa(respuestas, cfg, req.signal) });
  } catch {
    if (req.signal.aborted) return responder({ ok: false, mensaje: "Cancelado." }, 499);
    return responder({ ok: true, preguntas: preguntasDemo(respuestas) });
  }
}
