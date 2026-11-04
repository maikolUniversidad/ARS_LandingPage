/**
 * Proveedor con la API de Messages de Anthropic. Sirve para dos destinos:
 *  - "claude": Claude con todo (caché 1 h, fallback de servidor, effort, citas en documentos).
 *  - "deepseek": el endpoint compatible de DeepSeek (https://api.deepseek.com/anthropic).
 *    No admite bloques `document`, betas ni `output_config`: los textos van como texto,
 *    los PDF no se envían aquí (el selector los manda a otro proveedor) y el
 *    razonamiento se apaga en la charla para responder rápido.
 */
import Anthropic from "@anthropic-ai/sdk";
import { HERRAMIENTAS, ejecutarHerramienta } from "../herramientas";
import { bloqueContexto, systemEstable } from "../prompt";
import type { DocumentoAdjunto, PeticionChat } from "../tipos";
import { ErrorProveedor, MAX_VUELTAS, encabezadoVideo, listaAdjuntos, mmss, textoComoDocumento, type Turno } from "./comun";

type Bloque = Anthropic.Beta.BetaContentBlockParam;
type Mensaje = Anthropic.Beta.BetaMessageParam;
type Destino = "claude" | "deepseek";

const DEEPSEEK_URL = "https://api.deepseek.com/anthropic";

function bloquesDocumento(d: DocumentoAdjunto, destino: Destino): Bloque[] {
  if (d.codificacion === "texto") {
    // Citas activadas en todos los documentos (la API exige todas o ninguna).
    if (destino === "claude") {
      return [{ type: "document", title: d.nombre, citations: { enabled: true }, source: { type: "text", media_type: "text/plain", data: d.datos } }];
    }
    return [{ type: "text", text: textoComoDocumento(d) }];
  }
  if (d.codificacion === "fotogramas" && d.fotogramas?.length) {
    const out: Bloque[] = [{ type: "text", text: encabezadoVideo(d) }];
    for (const [i, f] of d.fotogramas.entries()) {
      out.push({ type: "text", text: `Fotograma ${i + 1} — t=${mmss(f.t)}` });
      out.push({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: f.datos } });
    }
    out.push({ type: "text", text: "</video>" });
    return out;
  }
  if (d.tipo === "application/pdf") {
    if (destino !== "claude") throw new ErrorProveedor("invalido", "PDF no soportado por este proveedor");
    return [{ type: "document", title: d.nombre, citations: { enabled: true }, source: { type: "base64", media_type: "application/pdf", data: d.datos } }];
  }
  return [
    { type: "text", text: `Imagen adjunta: ${d.nombre}` },
    { type: "image", source: { type: "base64", media_type: d.tipo as "image/jpeg" | "image/png" | "image/webp" | "image/gif", data: d.datos } },
  ];
}

/** Historial → mensajes. El último mensaje lleva documentos + contexto (después del punto de caché). */
function construirMensajes(p: PeticionChat, destino: Destino): Mensaje[] {
  const out: Mensaje[] = p.mensajes.slice(0, -1).map((m) => ({ role: m.rol, content: m.texto }));
  const ultimo = p.mensajes[p.mensajes.length - 1];
  const contenido: Bloque[] = [];
  for (const d of p.documentos) contenido.push(...bloquesDocumento(d, destino));
  const lista = listaAdjuntos(p);
  if (lista) contenido.push({ type: "text", text: lista });
  contenido.push({ type: "text", text: bloqueContexto(p.contexto, p.modo) });
  contenido.push({ type: "text", text: ultimo.texto });
  out.push({ role: "user", content: contenido });
  return out;
}

function traducirError(err: unknown, destino: Destino): ErrorProveedor {
  const quien = destino === "claude" ? "ANTHROPIC_API_KEY" : "DEEPSEEK_API_KEY";
  if (err instanceof ErrorProveedor) return err;
  if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) {
    return new ErrorProveedor("sin_clave", `La ${quien} del servidor no es válida.`);
  }
  if (err instanceof Anthropic.RateLimitError) return new ErrorProveedor("limite", "El servicio está ocupado. Intenta en unos segundos.");
  if (err instanceof Anthropic.BadRequestError) {
    console.error(`[asistente:${destino}] bad request:`, err.message);
    return new ErrorProveedor("invalido", "No pude procesar ese mensaje (¿un documento dañado o demasiado grande?).");
  }
  console.error(`[asistente:${destino}] error:`, err);
  return new ErrorProveedor("proveedor", "Se cortó la conexión con el modelo. Intenta de nuevo.");
}

export async function turnoAnthropic(t: Turno, destino: Destino, apiKey: string): Promise<string> {
  const client =
    destino === "claude"
      ? new Anthropic({ apiKey, maxRetries: 1 })
      : new Anthropic({ apiKey, authToken: null, baseURL: DEEPSEEK_URL, maxRetries: 1 });
  const { peticion, enviar, signal, modelo } = t;
  const conDocs = peticion.documentos.length > 0;

  try {
    const mensajes = construirMensajes(peticion, destino);
    let motivo = "end_turn";
    for (let vuelta = 0; vuelta < MAX_VUELTAS; vuelta++) {
      const base = {
        model: modelo,
        max_tokens: 8000,
        tools: HERRAMIENTAS,
        messages: mensajes,
      };
      const params: Anthropic.Beta.MessageCreateParamsStreaming =
        destino === "claude"
          ? {
              ...base,
              stream: true,
              // Rechazos de seguridad: el servidor reintenta solo con otro modelo.
              betas: ["server-side-fallback-2026-07-01"],
              fallbacks: "default",
              // Charla: esfuerzo bajo (rápido). Documentos o video: medio, para analizarlos a fondo.
              output_config: { effort: conDocs ? "medium" : "low" },
              system: [{ type: "text", text: systemEstable(), cache_control: { type: "ephemeral", ttl: "1h" } }],
              // Caché automática de la conversación (último bloque cacheable).
              cache_control: { type: "ephemeral" },
            }
          : {
              ...base,
              stream: true,
              system: [{ type: "text", text: systemEstable(), cache_control: { type: "ephemeral" } }],
              // Charla sin razonamiento (latencia baja); con adjuntos sí razona.
              thinking: conDocs ? { type: "adaptive" } : { type: "disabled" },
            };
      const s = client.beta.messages.stream(params, { signal });
      for await (const ev of s) {
        if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
          enviar({ t: "texto", d: ev.delta.text });
        } else if (ev.type === "content_block_delta" && ev.delta.type === "citations_delta") {
          const c = ev.delta.citation;
          if (c.type === "char_location" || c.type === "page_location" || c.type === "content_block_location") {
            enviar({
              t: "cita",
              cita: {
                documento: c.document_title ?? `Documento ${c.document_index + 1}`,
                texto: c.cited_text.slice(0, 400),
                pagina: c.type === "page_location" ? c.start_page_number : undefined,
              },
            });
          }
        }
      }
      const final = await s.finalMessage();
      motivo = final.stop_reason ?? "end_turn";
      if (process.env.NODE_ENV !== "production") {
        const u = final.usage;
        console.info(
          `[asistente:${destino}] ${final.model} vuelta=${vuelta} stop=${motivo} in=${u.input_tokens} cache_read=${u.cache_read_input_tokens ?? 0} cache_write=${u.cache_creation_input_tokens ?? 0} out=${u.output_tokens}`,
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
      t.separar();
    }
    return motivo;
  } catch (err) {
    if (signal.aborted) return "cancelado";
    throw traducirError(err, destino);
  }
}
