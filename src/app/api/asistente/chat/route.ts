import { ErrorProveedor, responder } from "@/lib/asistente/proveedores";
import { configuracion, limitado, validarPeticion } from "@/lib/asistente/servidor";
import { demoActivo, streamSimulado } from "@/lib/asistente/simulado";
import { LIMITES, type CodigoError, type EventoStream } from "@/lib/asistente/tipos";

export const runtime = "nodejs";
export const maxDuration = 60;

function jsonError(codigo: CodigoError, mensaje: string, status: number) {
  return Response.json({ ok: false, codigo, mensaje }, { status });
}

export async function POST(req: Request) {
  const cfg = configuracion();
  const demo = !cfg.proveedores.length && demoActivo();
  if (!cfg.proveedores.length && !demo) {
    return jsonError(
      "sin_clave",
      "El asistente aún no está configurado: falta una clave de LLM (ANTHROPIC_API_KEY, OPENAI_API_KEY o DEEPSEEK_API_KEY) en el .env del servidor.",
      503,
    );
  }
  if (limitado(req, "chat", 20)) {
    return jsonError("limite", "Demasiados mensajes seguidos. Espera un momento.", 429);
  }

  const largo = Number(req.headers.get("content-length") ?? 0);
  if (largo > LIMITES.cuerpoBytes) return jsonError("muy_grande", "La petición supera 4.3 MB.", 413);
  const texto = await req.text();
  if (texto.length > LIMITES.cuerpoBytes) return jsonError("muy_grande", "La petición supera 4.3 MB.", 413);

  let raw: unknown;
  try {
    raw = JSON.parse(texto);
  } catch {
    return jsonError("invalido", "JSON inválido", 400);
  }
  const peticion = validarPeticion(raw);
  if ("codigo" in peticion) return jsonError(peticion.codigo, peticion.mensaje, peticion.codigo === "muy_grande" ? 413 : 400);

  if (demo) {
    return new Response(streamSimulado(peticion), { headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" } });
  }

  const codificador = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const enviar = (e: EventoStream) => controller.enqueue(codificador.encode(`${JSON.stringify(e)}\n`));
      try {
        const motivo = await responder(peticion, enviar, req.signal);
        if (!req.signal.aborted) enviar({ t: "fin", motivo });
      } catch (err) {
        if (!req.signal.aborted) {
          const e = err instanceof ErrorProveedor ? err : new ErrorProveedor("proveedor", "Se cortó la conexión con el modelo. Intenta de nuevo.");
          enviar({ t: "error", codigo: e.codigo, mensaje: e.message });
        }
      } finally {
        try {
          controller.close();
        } catch {
          /* ya cerrado */
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
