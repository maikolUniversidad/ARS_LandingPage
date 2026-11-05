/**
 * GET   /api/registros/:id  → registro completo (almacén local).
 * PATCH /api/registros/:id  → { "estado": "contactado", "nota": "Llamó Juan" } cambia el estado.
 * Requiere `Authorization: Bearer ${REGISTROS_API_TOKEN}`.
 */
import { almacenLocal, ESTADOS_REGISTRO, type EstadoRegistro } from "@/lib/registros";
import { rechazoAutorizacion, respuestaJson } from "@/lib/registros/auth";
import { ID_RE } from "@/lib/registros/crear";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Contexto = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Contexto) {
  const rechazo = rechazoAutorizacion(req);
  if (rechazo) return rechazo;
  const { id } = await params;
  if (!ID_RE.test(id)) return respuestaJson({ ok: false, error: "Id inválido." }, 400);
  const registro = await almacenLocal().obtener(id);
  if (!registro) return respuestaJson({ ok: false, error: "No existe." }, 404);
  return respuestaJson({ ok: true, registro }, 200);
}

export async function PATCH(req: Request, { params }: Contexto) {
  const rechazo = rechazoAutorizacion(req);
  if (rechazo) return rechazo;
  const { id } = await params;
  if (!ID_RE.test(id)) return respuestaJson({ ok: false, error: "Id inválido." }, 400);

  let cuerpo: Record<string, unknown>;
  try {
    const raw: unknown = await req.json();
    if (!raw || typeof raw !== "object") throw new Error();
    cuerpo = raw as Record<string, unknown>;
  } catch {
    return respuestaJson({ ok: false, error: "JSON inválido." }, 400);
  }
  const estado = cuerpo.estado;
  if (typeof estado !== "string" || !ESTADOS_REGISTRO.includes(estado as EstadoRegistro)) {
    return respuestaJson({ ok: false, error: `estado debe ser: ${ESTADOS_REGISTRO.join(", ")}` }, 422);
  }
  const nota = typeof cuerpo.nota === "string" ? cuerpo.nota.trim().slice(0, 500) || undefined : undefined;

  const registro = await almacenLocal().cambiarEstado(id, estado as EstadoRegistro, nota);
  if (!registro) return respuestaJson({ ok: false, error: "No existe." }, 404);
  return respuestaJson({ ok: true, registro: { id: registro.id, estado: registro.estado, actualizado: registro.actualizado, historialEstados: registro.historialEstados } }, 200);
}
