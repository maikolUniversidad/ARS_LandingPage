/**
 * Servidor del Arquitecto IA de plataforma: le pide a la IA (Claude y, de
 * respaldo, GPT) una plataforma a la medida con salida JSON estructurada,
 * restringida a los ids reales del catálogo. Si no hay clave o la IA falla,
 * responde el motor de reglas.
 */
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { configuracion } from "@/lib/asistente/servidor";
import { IDS_MODULOS, MODULOS_PERMITIDOS, TAMANO_DESCRIPCION, propuestaPorReglas, sanearPropuesta } from "./arquitecto";
import { LIMITES_ARQUITECTO as L, type PeticionArquitecto, type PrioridadOp, type PropuestaPlataforma } from "./tipos";

type Esquema = Record<string, unknown>;
const obj = (props: Record<string, Esquema>): Esquema => ({
  type: "object",
  properties: props,
  required: Object.keys(props),
  additionalProperties: false,
});
const str: Esquema = { type: "string" };
const lista = (items: Esquema): Esquema => ({ type: "array", items });
const idModulo: Esquema = { type: "string", enum: IDS_MODULOS };

export const ESQUEMA_PROPUESTA: Esquema = obj({
  titulo: str,
  diagnostico: str,
  dolores: lista(obj({ dolor: str, moduloIds: lista(idModulo) })),
  modulos: lista(obj({ id: idModulo, por_que: str, prioridad: { type: "string", enum: ["alta", "media"] } })),
  fases: lista(obj({ nombre: str, semanas: { type: "integer" }, moduloIds: lista(idModulo), resultado: str })),
  indicadores: lista(obj({ nombre: str, antes: str, despues: str })),
  siguientePaso: str,
});

const CATALOGO_TXT = MODULOS_PERMITIDOS.map(
  ({ area, modulo }) => `- ${modulo.id} [${area.nombre}${modulo.estado === "piloto" ? " · en piloto" : ""}] ${modulo.nombre}: ${modulo.frase}`,
).join("\n");

const PRIORIDAD_TXT: Record<PrioridadOp, string> = {
  turnos: "programación de turnos",
  puesto: "saber quién está en el puesto",
  "sala-control": "ver la operación en vivo desde una central",
  comunicacion: "comunicación con el personal",
  video: "cámaras y video analítica",
  nomina: "nómina",
  documentos: "documentos del personal",
  finanzas: "finanzas y ERP",
  formacion: "capacitación",
};

const SISTEMA = `Eres el arquitecto de soluciones de ARS Intelligence, la plataforma para empresas de seguridad privada y operaciones con personal en campo (turnos, rondas, sala de control, comunicación, visión artificial, gestión humana, documentos, formación, finanzas y ERP, realidad virtual). A partir de lo que cuenta el visitante, armas SU plataforma a la medida usando SOLO módulos del catálogo.

Catálogo (usa los ids exactos; no existe nada fuera de esta lista):
${CATALOGO_TXT}

Cómo responder:
- "dolores": entre 2 y ${L.dolores} problemas concretos que el visitante tiene o casi seguro tiene por lo que cuenta, en sus propias palabras cuando se pueda. Cada uno con 1 a ${L.modulosPorDolor} moduloIds que lo resuelven (el primero es el principal).
- "modulos": entre 4 y ${L.modulos} módulos, los que de verdad necesita (austero: no le vendas todo el catálogo). "por_que" en 1-2 frases citando SU situación. Prioridad "alta" para lo que resuelve el dolor principal; "media" para lo que complementa. Todo módulo citado en dolores o fases debe estar aquí.
- "fases": de 2 a ${L.fases} fases de implementación en orden lógico (primero la base: estructura de clientes/sedes/puestos, turnos y marcación en campo; luego control en vivo; después gestión humana y back office). "semanas": duración orientativa de la fase (1 a 8). "resultado": lo que queda funcionando al terminarla. Cada módulo va en una sola fase.
- "indicadores": de 3 a ${L.indicadores}, CUALITATIVOS: cómo se trabaja antes y cómo después. PROHIBIDO usar números, porcentajes, tiempos, ahorros o precios: no inventes cifras.
- "diagnostico": 2-3 frases en lenguaje de negocio sobre su operación y lo que hay que resolver primero. Si el visitante dio cifras (personas, sedes), puedes repetirlas; nunca inventes otras.
- "titulo": corto, p. ej. "Plataforma para una operación de 400 guardas en 60 sedes".
- "siguientePaso": una frase con el siguiente paso concreto (p. ej. demostración con su estructura de clientes y sedes).

Lo que no se promete (obligatorio):
- Sin precios, sin SLA, sin cifras de uso ni porcentajes de mejora.
- En cámaras: nada de lectura de placas, detección de armas, EPP, cámaras térmicas ni detección de fuego. El reconocimiento facial es solo una alerta con verificación humana.
- ZKTeco y relojes biométricos solo como compatibilidad, no como producto propio.
- Los módulos marcados "en piloto" se presentan como piloto.
- Si pide algo que no está en el catálogo, no lo inventes: resuélvelo con lo que sí existe o menciónalo en el siguiente paso como algo a conversar.

Tono: cálido, concreto y honesto, sin jerga técnica. Háblale de tú al visitante ("tu operación").`;

function mensajeUsuario(p: PeticionArquitecto): string {
  const extra = [
    p.tamano && `Tamaño de la operación: ${TAMANO_DESCRIPCION[p.tamano]}.`,
    p.prioridades?.length && `Le importa sobre todo: ${p.prioridades.map((x) => PRIORIDAD_TXT[x]).join(", ")}.`,
    p.idioma === "en" ? "Write every text field in English (keep module ids as they are)." : "Escribe en español latino.",
  ].filter(Boolean);
  return `<operacion>\n${p.descripcion}\n</operacion>\n${extra.join("\n")}\n\nArma su plataforma.`;
}

async function conClaude(p: PeticionArquitecto, key: string, modelo: string, signal: AbortSignal): Promise<unknown> {
  const client = new Anthropic({ apiKey: key, maxRetries: 1 });
  const s = client.beta.messages.stream(
    {
      model: modelo,
      max_tokens: 6000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low", format: { type: "json_schema", schema: ESQUEMA_PROPUESTA } },
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

async function conOpenai(p: PeticionArquitecto, key: string, modelo: string, signal: AbortSignal): Promise<unknown> {
  const client = new OpenAI({ apiKey: key, maxRetries: 1 });
  const r = await client.responses.create(
    {
      model: modelo,
      instructions: SISTEMA,
      input: mensajeUsuario(p),
      max_output_tokens: 6000,
      text: { format: { type: "json_schema", name: "propuesta_plataforma", schema: ESQUEMA_PROPUESTA, strict: true } },
    },
    { signal },
  );
  return JSON.parse(r.output_text) as unknown;
}

const AVISO_SIN_IA = "Propuesta automática armada por nuestro motor de reglas a partir de sus palabras clave. Un asesor la afina contigo.";
const AVISO_FALLO = "La IA no respondió a tiempo; esta propuesta automática la armó nuestro motor de reglas.";

/** Propuesta con IA si hay proveedor configurado; si no, o si falla, por reglas. */
export async function disenarPlataforma(p: PeticionArquitecto, signal: AbortSignal): Promise<{ propuesta: PropuestaPlataforma; aviso?: string }> {
  const cfg = configuracion();
  const intentos: (() => Promise<unknown>)[] = [];
  for (const prov of cfg.proveedores) {
    if (prov === "anthropic") intentos.push(() => conClaude(p, cfg.anthropicKey, cfg.modelo, signal));
    if (prov === "openai") intentos.push(() => conOpenai(p, cfg.openaiKey, cfg.modeloOpenai, signal));
  }
  for (const intento of intentos) {
    if (signal.aborted) break;
    try {
      const propuesta = sanearPropuesta(await intento());
      if (propuesta && propuesta.modulos.length) return { propuesta };
    } catch (err) {
      if (signal.aborted) break;
      console.warn("[plataforma/arquitecto] proveedor falló, sigo con el siguiente:", err instanceof Error ? err.message : err);
    }
  }
  return { propuesta: propuestaPorReglas(p), aviso: intentos.length ? AVISO_FALLO : AVISO_SIN_IA };
}
