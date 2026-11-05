/**
 * POST /api/registros/reintentar → reenvía a ARS los registros locales con
 * sincronización «pendiente» (p. ej. si el servidor de ARS estuvo caído).
 * Requiere `Authorization: Bearer ${REGISTROS_API_TOKEN}`.
 */
import { reintentarPendientes } from "@/lib/registros";
import { rechazoAutorizacion, respuestaJson } from "@/lib/registros/auth";
import { configRegistros } from "@/lib/registros/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(req: Request) {
  const rechazo = rechazoAutorizacion(req);
  if (rechazo) return rechazo;
  if (!configRegistros().remoto) return respuestaJson({ ok: false, error: "ARS remoto no configurado (ARS_REGISTROS_*)." }, 409);
  try {
    return respuestaJson({ ok: true, ...(await reintentarPendientes()) }, 200);
  } catch (err) {
    console.error("[registros] reintentar:", err);
    return respuestaJson({ ok: false, error: "No se pudo reintentar." }, 500);
  }
}
