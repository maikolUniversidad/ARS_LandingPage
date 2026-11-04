/**
 * Servidor del planificador: le pide a la IA (Claude y, de respaldo, GPT) una
 * propuesta de cámaras y analíticas con salida JSON estructurada, restringida
 * al catálogo real. Si no hay clave o la IA falla, responde el motor de reglas.
 */
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { analiticas } from "@/data/analiticas";
import { configuracion } from "@/lib/asistente/servidor";
import { PRIORIDADES, TAMANOS, TIPOS_SITIO, TIPOS_ZONA, type PeticionPlan, type PlanVision } from "./plan";
import { IDS_ANALITICAS, LIMITES_PLAN, planPorReglas, sanearPlan } from "./planificador";

type Esquema = Record<string, unknown>;
const obj = (props: Record<string, Esquema>): Esquema => ({
  type: "object",
  properties: props,
  required: Object.keys(props),
  additionalProperties: false,
});
const str: Esquema = { type: "string" };
const lista = (items: Esquema): Esquema => ({ type: "array", items });

export const ESQUEMA_PLAN: Esquema = obj({
  titulo: str,
  resumen: str,
  tipoSitio: { type: "string", enum: [...TIPOS_SITIO] },
  zonas: lista(obj({ id: str, nombre: str, tipo: { type: "string", enum: [...TIPOS_ZONA] }, tamano: { type: "string", enum: [...TAMANOS] }, motivo: str })),
  camaras: lista(obj({ zona: str, analiticas: lista({ type: "string", enum: IDS_ANALITICAS }), proposito: str })),
  analiticas: lista(obj({ id: { type: "string", enum: IDS_ANALITICAS }, motivo: str, prioridad: { type: "string", enum: ["alta", "media"] } })),
  notas: lista(str),
});

const CATALOGO_TXT = analiticas.map((a) => `- ${a.id} (${a.familia}) · ${a.nombre}: ${a.corta}`).join("\n");

const SISTEMA = `Eres el ingeniero de preventa de ARS Intelligence. Diseñas sistemas de video analítica con IA que corren sobre el circuito de cámaras del cliente (CCTV existente + un servidor en sitio). Tu trabajo: a partir de lo que cuenta el cliente, proponer las zonas del sitio, cuántas cámaras van en cada una y qué analíticas corre cada cámara.

Reglas:
- Usa SOLO analíticas de este catálogo (por id):
${CATALOGO_TXT}
- Zonas: entre 2 y ${LIMITES_PLAN.zonas}, del tipo que mejor describa cada espacio (${TIPOS_ZONA.join(", ")}). "parqueadero" y "perimetro" son exteriores. Incluye siempre la entrada (acceso o recepción) si la gente entra por algún lado. Tamaño: pequena (<40 m²), mediana (40–120 m²), grande (>120 m²).
- Cámaras: entre 3 y ${LIMITES_PLAN.camaras} en total. Cada una con 1 a ${LIMITES_PLAN.analiticasPorCamara} analíticas (la primera es la principal); una cámara puede correr varias analíticas a la vez sobre el mismo video. Pon las cámaras donde se necesitan, no por cubrir: puertas, cajas, zonas de riesgo. Zonas grandes pueden necesitar 2-3. "zona" debe ser el id de una zona tuya.
- Sé realista y austero: el cliente valora que no se le sobrevendan cámaras. Si dice cuántas cámaras tiene, apóyate en ellas.
- "analiticas": cada analítica usada, con por qué le sirve A ESTE cliente (concreto, citando su situación) y prioridad alta|media.
- "resumen": 2-3 frases en lenguaje de negocio: qué problema resuelve, cuántas cámaras y cuántas analíticas.
- "notas": 2-4 supuestos o siguientes pasos (p. ej. visita técnica, resolución mínima, iluminación nocturna).
- Escribe en español latino, cálido y concreto, sin jerga técnica ni precios.`;

function mensajeUsuario(p: PeticionPlan): string {
  const extra = [
    p.tipoSitio && `Tipo de sitio indicado: ${p.tipoSitio}.`,
    p.tamano && `Tamaño aproximado: ${p.tamano}.`,
    p.prioridades?.length && `Le importa sobre todo: ${p.prioridades.filter((x) => PRIORIDADES.includes(x)).join(", ")}.`,
    p.camarasExistentes != null && `Cámaras ya instaladas: ${p.camarasExistentes}.`,
  ].filter(Boolean);
  return `<cliente>\n${p.descripcion}\n</cliente>\n${extra.join("\n")}\n\nDiseña la propuesta.`;
}

async function conClaude(p: PeticionPlan, key: string, modelo: string, signal: AbortSignal): Promise<unknown> {
  const client = new Anthropic({ apiKey: key, maxRetries: 1 });
  const s = client.beta.messages.stream(
    {
      model: modelo,
      max_tokens: 6000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low", format: { type: "json_schema", schema: ESQUEMA_PLAN } },
      system: [{ type: "text", text: SISTEMA, cache_control: { type: "ephemeral", ttl: "1h" } }],
      messages: [{ role: "user", content: mensajeUsuario(p) }],
    },
    { signal },
  );
  const final = await s.finalMessage();
  if (final.stop_reason === "refusal" || final.stop_reason === "max_tokens") throw new Error(`stop:${final.stop_reason}`);
  const texto = final.content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
  return JSON.parse(texto) as unknown;
}

async function conOpenai(p: PeticionPlan, key: string, modelo: string, signal: AbortSignal): Promise<unknown> {
  const client = new OpenAI({ apiKey: key, maxRetries: 1 });
  const r = await client.responses.create(
    {
      model: modelo,
      instructions: SISTEMA,
      input: mensajeUsuario(p),
      max_output_tokens: 6000,
      text: { format: { type: "json_schema", name: "plan_vision", schema: ESQUEMA_PLAN, strict: true } },
    },
    { signal },
  );
  return JSON.parse(r.output_text) as unknown;
}

/** Propuesta con IA si hay proveedor configurado; si no, o si falla, por reglas. */
export async function planificar(p: PeticionPlan, signal: AbortSignal): Promise<{ plan: PlanVision; aviso?: string }> {
  const cfg = configuracion();
  const intentos: (() => Promise<unknown>)[] = [];
  for (const prov of cfg.proveedores) {
    if (prov === "anthropic") intentos.push(() => conClaude(p, cfg.anthropicKey, cfg.modelo, signal));
    if (prov === "openai") intentos.push(() => conOpenai(p, cfg.openaiKey, cfg.modeloOpenai, signal));
  }
  for (const intento of intentos) {
    if (signal.aborted) break;
    try {
      const plan = sanearPlan(await intento(), p);
      if (plan && plan.camaras.length) return { plan };
    } catch (err) {
      if (signal.aborted) break;
      console.warn("[vision/plan] proveedor falló, sigo con el siguiente:", err instanceof Error ? err.message : err);
    }
  }
  return {
    plan: planPorReglas(p),
    aviso: intentos.length ? "La IA no respondió a tiempo; esta propuesta la armó nuestro motor de reglas." : undefined,
  };
}
