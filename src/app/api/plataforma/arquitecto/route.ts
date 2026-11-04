import { limitado } from "@/lib/asistente/servidor";
import { leerPeticionArquitecto } from "@/lib/plataforma/arquitecto";
import { disenarPlataforma } from "@/lib/plataforma/servidor";

export const runtime = "nodejs";
export const maxDuration = 60;

const responder = (cuerpo: unknown, status = 200) => Response.json(cuerpo, { status, headers: { "Cache-Control": "no-store" } });

/**
 * POST `PeticionArquitecto` → `RespuestaArquitecto` (`{ ok, propuesta, aviso? }`).
 * Siempre responde una propuesta: con IA si hay clave, o con el motor de reglas.
 */
export async function POST(req: Request) {
  if (limitado(req, "plataforma-arquitecto", 8, 10 * 60_000)) {
    return responder({ ok: false, mensaje: "Ya pediste varias propuestas seguidas. Intenta de nuevo en unos minutos." }, 429);
  }
  let raw: unknown;
  try {
    const cuerpo = await req.text();
    if (cuerpo.length > 12_000) return responder({ ok: false, mensaje: "La descripción es demasiado larga." }, 413);
    raw = JSON.parse(cuerpo);
  } catch {
    return responder({ ok: false, mensaje: "JSON inválido." }, 400);
  }
  const peticion = leerPeticionArquitecto(raw);
  if (!peticion) return responder({ ok: false, mensaje: "Cuéntanos un poco más de tu operación (al menos una frase)." }, 400);

  try {
    const { propuesta, aviso } = await disenarPlataforma(peticion, req.signal);
    return responder({ ok: true, propuesta, aviso });
  } catch (err) {
    if (req.signal.aborted) return responder({ ok: false, mensaje: "Cancelado." }, 499);
    console.error("[plataforma/arquitecto] error:", err);
    return responder({ ok: false, mensaje: "No pudimos armar la propuesta. Intenta de nuevo." }, 502);
  }
}
