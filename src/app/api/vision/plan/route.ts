import { limitado } from "@/lib/asistente/servidor";
import { escenaDesdePlan } from "@/lib/vision/disposicion";
import { leerPeticion } from "@/lib/vision/planificador";
import { planificar } from "@/lib/vision/servidor";

export const runtime = "nodejs";
export const maxDuration = 60;

const responder = (cuerpo: unknown, status = 200) => Response.json(cuerpo, { status, headers: { "Cache-Control": "no-store" } });

/**
 * POST `PeticionPlan` → `{ ok, plan: PlanVision, escena: EscenaPlan, aviso? }`.
 * Siempre responde una propuesta: con IA si hay clave, o con el motor de reglas.
 */
export async function POST(req: Request) {
  if (limitado(req, "vision-plan", 8, 10 * 60_000)) {
    return responder({ ok: false, mensaje: "Ya pediste varias propuestas seguidas. Intenta de nuevo en unos minutos." }, 429);
  }
  let raw: unknown;
  try {
    const cuerpo = await req.text();
    if (cuerpo.length > 20_000) return responder({ ok: false, mensaje: "La descripción es demasiado larga." }, 413);
    raw = JSON.parse(cuerpo);
  } catch {
    return responder({ ok: false, mensaje: "JSON inválido." }, 400);
  }
  const peticion = leerPeticion(raw);
  if (!peticion) return responder({ ok: false, mensaje: "Cuéntanos un poco más de tu sitio (al menos una frase)." }, 400);

  try {
    const { plan, aviso } = await planificar(peticion, req.signal);
    return responder({ ok: true, plan, escena: escenaDesdePlan(plan), aviso });
  } catch (err) {
    if (req.signal.aborted) return responder({ ok: false, mensaje: "Cancelado." }, 499);
    console.error("[vision/plan] error:", err);
    return responder({ ok: false, mensaje: "No pudimos armar la propuesta. Intenta de nuevo." }, 502);
  }
}
