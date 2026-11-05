/** Autorización de la API pull /api/registros (Bearer REGISTROS_API_TOKEN). */
import { createHash, timingSafeEqual } from "node:crypto";
import { configRegistros } from "./config";

const json = (cuerpo: unknown, status: number) =>
  Response.json(cuerpo, { status, headers: { "Cache-Control": "no-store" } });

/** Compara en tiempo constante (digests de igual longitud, sin filtrar el largo del token). */
export function tokensIguales(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb) && a.length === b.length;
}

/** Devuelve una respuesta de error si la petición NO está autorizada; null si puede seguir. */
export function rechazoAutorizacion(req: Request): Response | null {
  const esperado = configRegistros().apiToken;
  if (!esperado) return json({ ok: false, error: "API de registros deshabilitada (falta REGISTROS_API_TOKEN)." }, 503);
  const cabecera = req.headers.get("authorization") ?? "";
  const token = cabecera.toLowerCase().startsWith("bearer ") ? cabecera.slice(7).trim() : "";
  if (!token || !tokensIguales(token, esperado)) {
    return Response.json(
      { ok: false, error: "No autorizado." },
      { status: 401, headers: { "Cache-Control": "no-store", "WWW-Authenticate": 'Bearer realm="ars-registros"' } },
    );
  }
  return null;
}

export { json as respuestaJson };
