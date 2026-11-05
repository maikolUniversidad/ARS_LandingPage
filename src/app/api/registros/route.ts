/**
 * API pull para el ERP de ARS: lista paginada de registros del almacén local.
 * GET /api/registros?tipo=diagnostico&estado=nuevo&desde=2026-11-01&pagina=1&limite=50&completo=1
 * Requiere `Authorization: Bearer ${REGISTROS_API_TOKEN}`. Ver docs/BACKEND-REGISTROS.md §6.
 */
import { almacenLocal, ESTADOS_REGISTRO, type EstadoRegistro, type TipoRegistro } from "@/lib/registros";
import { rechazoAutorizacion, respuestaJson } from "@/lib/registros/auth";
import type { RegistroLocal } from "@/lib/registros/tipos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIPOS: TipoRegistro[] = ["contacto", "diagnostico", "propuesta"];

/** Vista corta para listados (sin conversación ni diagnóstico completo). */
function resumen(r: RegistroLocal) {
  const comun = {
    id: r.id,
    tipo: r.tipo,
    creado: r.creado,
    actualizado: r.actualizado,
    estado: r.estado,
    pagina: r.origen.pagina,
    sincronizacion: r.sincronizacion?.remoto ?? null,
  };
  if (r.tipo === "contacto") {
    return { ...comun, nombre: r.contacto.nombre, empresa: r.contacto.empresa, email: r.contacto.email, telefono: r.contacto.telefono };
  }
  if (r.tipo === "propuesta") {
    return {
      ...comun,
      referencia: r.referencia,
      empresa: r.empresa,
      nombre: r.contacto.nombre,
      email: r.contacto.email,
      telefono: r.contacto.telefono,
      titular: r.resumen.titular,
      areasRecomendadas: r.resumen.areas,
    };
  }
  return {
    ...comun,
    fuente: r.fuente,
    empresa: r.empresa,
    nombre: r.contacto?.nombre ?? null,
    email: r.contacto?.email ?? null,
    telefono: r.contacto?.telefono ?? null,
    titular: r.resumen.titular,
    areasRecomendadas: r.resumen.areasRecomendadas,
  };
}

const fechaValida = (v: string | null) => (v && !Number.isNaN(Date.parse(v)) ? v : undefined);

export async function GET(req: Request) {
  const rechazo = rechazoAutorizacion(req);
  if (rechazo) return rechazo;

  const q = new URL(req.url).searchParams;
  const tipo = q.get("tipo");
  const estado = q.get("estado");
  if (tipo && !TIPOS.includes(tipo as TipoRegistro)) return respuestaJson({ ok: false, error: `tipo debe ser: ${TIPOS.join(", ")}` }, 400);
  if (estado && !ESTADOS_REGISTRO.includes(estado as EstadoRegistro)) {
    return respuestaJson({ ok: false, error: `estado debe ser: ${ESTADOS_REGISTRO.join(", ")}` }, 400);
  }
  if ((q.get("desde") && !fechaValida(q.get("desde"))) || (q.get("hasta") && !fechaValida(q.get("hasta")))) {
    return respuestaJson({ ok: false, error: "desde/hasta deben ser fechas ISO 8601" }, 400);
  }
  const pagina = Math.max(1, Number.parseInt(q.get("pagina") ?? "1", 10) || 1);
  const limite = Math.min(200, Math.max(1, Number.parseInt(q.get("limite") ?? "50", 10) || 50));
  const completo = q.get("completo") === "1";

  try {
    const { total, registros } = await almacenLocal().listar({
      tipo: (tipo as TipoRegistro) || undefined,
      estado: (estado as EstadoRegistro) || undefined,
      desde: fechaValida(q.get("desde")),
      hasta: fechaValida(q.get("hasta")),
      pagina,
      limite,
    });
    return respuestaJson(
      {
        ok: true,
        total,
        pagina,
        limite,
        paginas: Math.ceil(total / limite),
        registros: completo ? registros : registros.map(resumen),
      },
      200,
    );
  } catch (err) {
    console.error("[registros] listar:", err);
    return respuestaJson({ ok: false, error: "No se pudo leer el almacén local." }, 500);
  }
}
