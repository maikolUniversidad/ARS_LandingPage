import Anthropic from "@anthropic-ai/sdk";
import { HERRAMIENTAS, ejecutarHerramienta } from "@/lib/asistente/herramientas";
import { bloqueContexto, systemEstable } from "@/lib/asistente/prompt";
import { configuracion, limitado, validarPeticion } from "@/lib/asistente/servidor";
import { demoActivo, streamSimulado } from "@/lib/asistente/simulado";
import { LIMITES, type CodigoError, type DocumentoAdjunto, type EventoStream, type PeticionChat } from "@/lib/asistente/tipos";

export const runtime = "nodejs";
export const maxDuration = 60;

type Bloque = Anthropic.Beta.BetaContentBlockParam;
type Mensaje = Anthropic.Beta.BetaMessageParam;

const MAX_VUELTAS = 5;

function jsonError(codigo: CodigoError, mensaje: string, status: number) {
  return Response.json({ ok: false, codigo, mensaje }, { status });
}

function bloquesDocumento(d: DocumentoAdjunto): Bloque[] {
  if (d.codificacion === "texto") {
    return [{ type: "document", title: d.nombre, source: { type: "text", media_type: "text/plain", data: d.datos } }];
  }
  if (d.tipo === "application/pdf") {
    return [{ type: "document", title: d.nombre, source: { type: "base64", media_type: "application/pdf", data: d.datos } }];
  }
  return [
    { type: "text", text: `Imagen adjunta: ${d.nombre}` },
    {
      type: "image",
      source: { type: "base64", media_type: d.tipo as "image/jpeg" | "image/png" | "image/webp" | "image/gif", data: d.datos },
    },
  ];
}

/** Historial → mensajes de la API. El último mensaje lleva documentos + contexto. */
function construirMensajes(p: PeticionChat): Mensaje[] {
  const out: Mensaje[] = p.mensajes.slice(0, -1).map((m) => ({ role: m.rol, content: m.texto }));
  const ultimo = p.mensajes[p.mensajes.length - 1];
  const contenido: Bloque[] = [];
  for (const d of p.documentos) contenido.push(...bloquesDocumento(d));
  if (p.documentos.length) {
    contenido.push({
      type: "text",
      text: `<documentos_adjuntos>${p.documentos.map((d) => d.nombre).join(", ")}</documentos_adjuntos>`,
    });
  }
  contenido.push({ type: "text", text: bloqueContexto(p.contexto, p.modo) });
  contenido.push({ type: "text", text: ultimo.texto });
  out.push({ role: "user", content: contenido });
  return out;
}

export async function POST(req: Request) {
  const cfg = configuracion();
  const demo = !cfg.anthropicKey && demoActivo();
  if (!cfg.anthropicKey && !demo) {
    return jsonError(
      "sin_clave",
      "El asistente aún no está configurado: falta ANTHROPIC_API_KEY en el .env del servidor.",
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

  const client = new Anthropic({ apiKey: cfg.anthropicKey, maxRetries: 1 });
  const mensajes = construirMensajes(peticion);
  const codificador = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const enviar = (e: EventoStream) => controller.enqueue(codificador.encode(`${JSON.stringify(e)}\n`));
      try {
        let motivo = "end_turn";
        for (let vuelta = 0; vuelta < MAX_VUELTAS; vuelta++) {
          const s = client.beta.messages.stream(
            {
              model: cfg.modelo,
              max_tokens: 8000,
              // Rechazos de seguridad: el servidor reintenta solo con otro modelo.
              betas: ["server-side-fallback-2026-07-01"],
              fallbacks: "default",
              output_config: { effort: "low" },
              tools: HERRAMIENTAS,
              system: [{ type: "text", text: systemEstable(), cache_control: { type: "ephemeral", ttl: "1h" } }],
              // Caché automática de la conversación (último bloque cacheable).
              cache_control: { type: "ephemeral" },
              messages: mensajes,
            },
            { signal: req.signal },
          );
          for await (const ev of s) {
            if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
              enviar({ t: "texto", d: ev.delta.text });
            }
          }
          const final = await s.finalMessage();
          motivo = final.stop_reason ?? "end_turn";
          if (process.env.NODE_ENV !== "production") {
            const u = final.usage;
            console.info(
              `[asistente] ${final.model} vuelta=${vuelta} stop=${motivo} in=${u.input_tokens} cache_read=${u.cache_read_input_tokens ?? 0} cache_write=${u.cache_creation_input_tokens ?? 0} out=${u.output_tokens}`,
            );
          }
          if (motivo === "refusal") {
            enviar({ t: "error", codigo: "rechazo", mensaje: "No puedo ayudar con eso. ¿Te cuento algo de ARS?" });
            break;
          }
          if (motivo !== "tool_use") break;

          const usos = final.content.filter((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === "tool_use");
          const resultados: Anthropic.Beta.BetaToolResultBlockParam[] = usos.map((u) => {
            const r = ejecutarHerramienta(u.name, u.input);
            for (const accion of r.acciones) enviar({ t: "accion", accion });
            for (const tarjeta of r.tarjetas) enviar({ t: "tarjeta", tarjeta });
            return { type: "tool_result", tool_use_id: u.id, content: r.resultado, is_error: r.esError || undefined };
          });
          mensajes.push({ role: "assistant", content: final.content });
          mensajes.push({ role: "user", content: resultados });
          // Separa visualmente el texto previo y posterior a las acciones.
          enviar({ t: "texto", d: "\n\n" });
        }
        enviar({ t: "fin", motivo });
      } catch (err) {
        if (req.signal.aborted) {
          // La persona cerró o canceló: nada que avisar.
        } else if (err instanceof Anthropic.AuthenticationError) {
          enviar({ t: "error", codigo: "sin_clave", mensaje: "La ANTHROPIC_API_KEY del servidor no es válida." });
        } else if (err instanceof Anthropic.RateLimitError) {
          enviar({ t: "error", codigo: "limite", mensaje: "El servicio está ocupado. Intenta en unos segundos." });
        } else if (err instanceof Anthropic.BadRequestError) {
          console.error("[asistente] bad request:", err.message);
          enviar({ t: "error", codigo: "invalido", mensaje: "No pude procesar ese mensaje (¿un documento dañado o demasiado grande?)." });
        } else {
          console.error("[asistente] error:", err);
          enviar({ t: "error", codigo: "proveedor", mensaje: "Se cortó la conexión con el modelo. Intenta de nuevo." });
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
