import Anthropic from "@anthropic-ai/sdk";
import { after } from "next/server";
import type { Diagnostico, PeticionDiagnostico, RespuestaDiagnostico } from "@/data/diagnostico/tipos";
import { configuracion, limitado } from "@/lib/asistente/servidor";
import { areasCandidatas } from "@/lib/diagnostico/catalogo";
import { diagnosticoDemo, diagnosticoIa, modoDemoDiagnostico, validarPeticionDiagnostico } from "@/lib/diagnostico/servidor";
import { guardarRegistro, registroDiagnostico } from "@/lib/registros";
import { correoDiagnostico, enviarCorreoEquipo } from "@/lib/registros/correo";

export const runtime = "nodejs";
export const maxDuration = 300;

const responder = (r: RespuestaDiagnostico, status = 200) => Response.json(r, { status, headers: { "Cache-Control": "no-store" } });

/** Guarda el registro (ARS + copia local), avisa al equipo por correo y responde con el id. */
async function responderConRegistro(req: Request, peticion: PeticionDiagnostico, diagnostico: Diagnostico, raw: unknown) {
  const registro = registroDiagnostico(req, peticion, diagnostico, raw);
  // El correo no bloquea la respuesta.
  after(() => enviarCorreoEquipo(correoDiagnostico(registro), "diagnostico"));
  const guardado = await guardarRegistro(registro);
  return responder({ ok: true, diagnostico, registro: guardado });
}

/** Recibe `PeticionDiagnostico` y devuelve `RespuestaDiagnostico`. */
export async function POST(req: Request) {
  const cfg = configuracion();
  const demo = !cfg.anthropicKey && modoDemoDiagnostico();
  if (!cfg.anthropicKey && !demo) {
    return responder({ ok: false, mensaje: "El diagnóstico aún no está configurado en este servidor." }, 503);
  }
  // Cada diagnóstico (también en demo) crea un registro en el ERP de ARS: el demo tiene un tope más holgado.
  if (demo ? limitado(req, "diagnostico-demo", 20, 10 * 60_000) : limitado(req, "diagnostico", 5, 10 * 60_000)) {
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

  // Demo también se guarda (marcado con fuente "demo") para probar el flujo completo.
  if (demo) return responderConRegistro(req, peticion, diagnosticoDemo(peticion.perfil), raw);

  try {
    const candidatas = areasCandidatas(peticion.perfil, 3, 6);
    const diagnostico = await diagnosticoIa(peticion, candidatas, cfg, req.signal);
    return await responderConRegistro(req, peticion, diagnostico, raw);
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
