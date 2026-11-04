/**
 * Proveedor OpenAI (GPT) con la API de Responses, en streaming y con las mismas
 * herramientas que Claude (se convierten de `input_schema` a `function`).
 * - `store: false`: OpenAI no guarda la conversación; el razonamiento viaja
 *   cifrado entre vueltas del bucle de herramientas.
 * - PDF como `input_file`, imágenes y fotogramas como `input_image`, textos como texto.
 */
import OpenAI from "openai";
import type {
  FunctionTool,
  ResponseFunctionToolCall,
  ResponseInputContent,
  ResponseInputItem,
  ResponseOutputItem,
} from "openai/resources/responses/responses";
import { HERRAMIENTAS, ejecutarHerramientaAsync } from "../herramientas";
import { bloqueContexto, systemEstable } from "../prompt";
import type { DocumentoAdjunto, PeticionChat } from "../tipos";
import { ErrorProveedor, MAX_VUELTAS, encabezadoVideo, listaAdjuntos, mmss, textoComoDocumento, type Turno } from "./comun";

let herramientasCache: FunctionTool[] | null = null;
function herramientas(): FunctionTool[] {
  herramientasCache ??= HERRAMIENTAS.map((h) => {
    const t = h as { name: string; description?: string; input_schema?: Record<string, unknown> };
    return {
      type: "function",
      name: t.name,
      description: t.description ?? null,
      parameters: t.input_schema ?? { type: "object", properties: {} },
      // Los esquemas tienen campos opcionales: sin modo estricto. El servidor valida igual.
      strict: false,
    };
  });
  return herramientasCache;
}

function contenidoDocumento(d: DocumentoAdjunto): ResponseInputContent[] {
  if (d.codificacion === "texto") return [{ type: "input_text", text: textoComoDocumento(d) }];
  if (d.codificacion === "fotogramas" && d.fotogramas?.length) {
    const out: ResponseInputContent[] = [{ type: "input_text", text: encabezadoVideo(d) }];
    for (const [i, f] of d.fotogramas.entries()) {
      out.push({ type: "input_text", text: `Fotograma ${i + 1} — t=${mmss(f.t)}` });
      out.push({ type: "input_image", detail: "low", image_url: `data:image/jpeg;base64,${f.datos}` });
    }
    out.push({ type: "input_text", text: "</video>" });
    return out;
  }
  if (d.tipo === "application/pdf") {
    return [{ type: "input_file", filename: d.nombre.endsWith(".pdf") ? d.nombre : `${d.nombre}.pdf`, file_data: `data:application/pdf;base64,${d.datos}` }];
  }
  return [
    { type: "input_text", text: `Imagen adjunta: ${d.nombre}` },
    { type: "input_image", detail: "auto", image_url: `data:${d.tipo};base64,${d.datos}` },
  ];
}

function construirEntrada(p: PeticionChat): ResponseInputItem[] {
  const out: ResponseInputItem[] = p.mensajes.slice(0, -1).map((m) => ({ type: "message", role: m.rol, content: m.texto }));
  const contenido: ResponseInputContent[] = [];
  for (const d of p.documentos) contenido.push(...contenidoDocumento(d));
  const lista = listaAdjuntos(p);
  if (lista) contenido.push({ type: "input_text", text: lista });
  contenido.push({ type: "input_text", text: bloqueContexto(p.contexto, p.modo) });
  contenido.push({ type: "input_text", text: p.mensajes[p.mensajes.length - 1].texto });
  out.push({ type: "message", role: "user", content: contenido });
  return out;
}

function traducirError(err: unknown): ErrorProveedor {
  if (err instanceof ErrorProveedor) return err;
  if (err instanceof OpenAI.AuthenticationError || err instanceof OpenAI.PermissionDeniedError) {
    return new ErrorProveedor("sin_clave", "La OPENAI_API_KEY del servidor no es válida.");
  }
  if (err instanceof OpenAI.RateLimitError) return new ErrorProveedor("limite", "El servicio está ocupado. Intenta en unos segundos.");
  if (err instanceof OpenAI.BadRequestError) {
    console.error("[asistente:openai] bad request:", err.message);
    return new ErrorProveedor("invalido", "No pude procesar ese mensaje (¿un documento dañado o demasiado grande?).");
  }
  console.error("[asistente:openai] error:", err);
  return new ErrorProveedor("proveedor", "Se cortó la conexión con el modelo. Intenta de nuevo.");
}

export async function turnoOpenai(t: Turno, apiKey: string): Promise<string> {
  const client = new OpenAI({ apiKey, maxRetries: 1 });
  const { peticion, enviar, signal, modelo } = t;
  const entrada = construirEntrada(peticion);
  let motivo = "end_turn";
  try {
    for (let vuelta = 0; vuelta < MAX_VUELTAS; vuelta++) {
      const stream = await client.responses.create(
        {
          model: modelo,
          instructions: systemEstable(),
          input: entrada,
          tools: herramientas(),
          store: false,
          include: ["reasoning.encrypted_content"],
          reasoning: { effort: peticion.documentos.length ? "medium" : "low" },
          max_output_tokens: 8000,
          // Mismo prefijo (instrucciones + herramientas) → caché de prompt de OpenAI.
          prompt_cache_key: "ars-asistente-v1",
          stream: true,
        },
        { signal },
      );
      let salida: ResponseOutputItem[] = [];
      let incompleto = false;
      for await (const ev of stream) {
        if (ev.type === "response.output_text.delta") enviar({ t: "texto", d: ev.delta });
        else if (ev.type === "response.refusal.delta") enviar({ t: "texto", d: ev.delta });
        else if (ev.type === "response.completed") salida = ev.response.output;
        else if (ev.type === "response.incomplete") {
          salida = ev.response.output;
          incompleto = true;
        } else if (ev.type === "response.failed") {
          throw new ErrorProveedor("proveedor", ev.response.error?.message ?? "Falló la respuesta del modelo.");
        } else if (ev.type === "error") {
          throw new ErrorProveedor("proveedor", ev.message);
        }
      }
      const llamadas = salida.filter((o): o is ResponseFunctionToolCall => o.type === "function_call");
      if (process.env.NODE_ENV !== "production") {
        console.info(`[asistente:openai] ${modelo} vuelta=${vuelta} herramientas=${llamadas.length}${incompleto ? " incompleto" : ""}`);
      }
      if (!llamadas.length) {
        motivo = incompleto ? "max_tokens" : "end_turn";
        break;
      }
      motivo = "tool_use";
      entrada.push(...(salida as ResponseInputItem[]));
      const ejecutados = await Promise.all(
        llamadas.map((ll) => {
          let args: unknown;
          try {
            args = ll.arguments ? JSON.parse(ll.arguments) : {};
          } catch {
            return { resultado: "Argumentos JSON inválidos; vuelve a intentarlo.", esError: true, acciones: [], tarjetas: [] };
          }
          return ejecutarHerramientaAsync(ll.name, args);
        }),
      );
      for (const [i, ll] of llamadas.entries()) {
        const r = ejecutados[i];
        for (const accion of r.acciones) enviar({ t: "accion", accion });
        for (const tarjeta of r.tarjetas) enviar({ t: "tarjeta", tarjeta });
        entrada.push({ type: "function_call_output", call_id: ll.call_id, output: r.esError ? `ERROR: ${r.resultado}` : r.resultado });
      }
      t.separar();
    }
    return motivo;
  } catch (err) {
    if (signal.aborted) return "cancelado";
    throw traducirError(err);
  }
}
