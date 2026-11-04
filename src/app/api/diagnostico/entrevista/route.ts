import Anthropic from "@anthropic-ai/sdk";
import type { EventoEntrevista } from "@/components/diagnostico/entrevista/eventos";
import { modoDemoDiagnostico } from "@/lib/diagnostico/servidor";
import {
  ESQUEMA_TURNO,
  eventosDeSalida,
  respuestaParcial,
  streamDemoEntrevista,
  systemEntrevista,
  validarTurno,
} from "@/lib/diagnostico/entrevista";
import { configuracion, limitado } from "@/lib/asistente/servidor";

export const runtime = "nodejs";
export const maxDuration = 60;

const CABECERAS = {
  "Content-Type": "application/x-ndjson; charset=utf-8",
  "Cache-Control": "no-store, no-transform",
  "X-Accel-Buffering": "no",
};

const jsonError = (mensaje: string, status: number) => Response.json({ ok: false, mensaje }, { status });

/** Un turno de la entrevista: streaming NDJSON (ver EventoEntrevista). */
export async function POST(req: Request) {
  const cfg = configuracion();
  const demo = !cfg.anthropicKey && modoDemoDiagnostico();
  if (!cfg.anthropicKey && !demo) {
    return jsonError("La entrevista aún no está configurada: falta ANTHROPIC_API_KEY en el servidor.", 503);
  }
  if (limitado(req, "diag-entrevista", 30)) return jsonError("Vamos muy rápido. Espera un momento y seguimos.", 429);

  const texto = await req.text();
  if (texto.length > 120_000) return jsonError("La conversación es demasiado larga.", 413);
  let raw: unknown;
  try {
    raw = JSON.parse(texto);
  } catch {
    return jsonError("JSON inválido", 400);
  }
  const peticion = validarTurno(raw);
  if (!peticion) return jsonError("Falta tu mensaje.", 400);

  if (demo) return new Response(streamDemoEntrevista(peticion), { headers: CABECERAS });

  const client = new Anthropic({ apiKey: cfg.anthropicKey, maxRetries: 1 });
  // La conversación debe empezar con el usuario (el saludo lo pinta la UI).
  const historial = peticion.conversacion;
  const ultimo = historial[historial.length - 1];
  const mensajes: Anthropic.Beta.BetaMessageParam[] = [
    { role: "user", content: "Hola, quiero hacer el diagnóstico de mi empresa." },
    ...historial.slice(0, -1).map((m) => ({ role: m.rol, content: m.texto })),
    {
      role: "user",
      content: [
        { type: "text", text: `<perfil_actual>${JSON.stringify(peticion.perfil)}</perfil_actual>` },
        { type: "text", text: ultimo.texto },
      ],
    },
  ];
  const cod = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const enviar = (e: EventoEntrevista) => controller.enqueue(cod.encode(`${JSON.stringify(e)}\n`));
      try {
        const s = client.beta.messages.stream(
          {
            model: cfg.modelo,
            max_tokens: 4000,
            betas: ["server-side-fallback-2026-07-01"],
            fallbacks: "default",
            output_config: { effort: "low", format: { type: "json_schema", schema: ESQUEMA_TURNO } },
            system: [{ type: "text", text: systemEntrevista(), cache_control: { type: "ephemeral", ttl: "1h" } }],
            cache_control: { type: "ephemeral" },
            messages: mensajes,
          },
          { signal: req.signal },
        );
        // La salida es JSON; el campo "respuesta" se reenvía como texto a medida que llega.
        let json = "";
        let emitido = "";
        for await (const ev of s) {
          if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
            json += ev.delta.text;
            const parcial = respuestaParcial(json);
            if (parcial && parcial.length > emitido.length) {
              enviar({ t: "texto", d: parcial.slice(emitido.length) });
              emitido = parcial;
            }
          }
        }
        const final = await s.finalMessage();
        if (final.stop_reason === "refusal") {
          enviar({ t: "error", mensaje: "No puedo ayudar con eso. ¿Seguimos con tu empresa?" });
        } else {
          let salida: unknown = null;
          try {
            salida = JSON.parse(json);
          } catch {
            salida = null;
          }
          const respuesta = salida && typeof salida === "object" ? (salida as { respuesta?: unknown }).respuesta : undefined;
          if (typeof respuesta === "string" && respuesta.length > emitido.length && respuesta.startsWith(emitido)) {
            enviar({ t: "texto", d: respuesta.slice(emitido.length) });
          }
          for (const e of eventosDeSalida(salida, peticion.perfil, ultimo.texto)) enviar(e);
        }
        if (process.env.NODE_ENV !== "production") {
          const u = final.usage;
          console.info(`[diagnostico/entrevista] ${final.model} stop=${final.stop_reason} in=${u.input_tokens} cache_read=${u.cache_read_input_tokens ?? 0} out=${u.output_tokens}`);
        }
        enviar({ t: "fin" });
      } catch (err) {
        if (!req.signal.aborted) {
          console.error("[diagnostico/entrevista] error:", err);
          const mensaje =
            err instanceof Anthropic.RateLimitError
              ? "El servicio está ocupado. Intenta en unos segundos."
              : err instanceof Anthropic.AuthenticationError
                ? "La clave del servidor no es válida."
                : "Se cortó la conexión. Intenta de nuevo.";
          enviar({ t: "error", mensaje });
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

  return new Response(stream, { headers: CABECERAS });
}
