/**
 * Motor de la «Propuesta ARS» (solo servidor).
 *  - `preguntasIa`: con las respuestas base, un modelo rápido devuelve 2–3 preguntas de seguimiento.
 *  - `propuestaIa`: arma la `Propuesta` completa con salida estructurada (JSON schema), usando
 *    las áreas candidatas del diagnóstico y el catálogo compacto; todo se sanea contra el catálogo.
 * Sin clave (desarrollo o ASISTENTE_DEMO=1): reglas determinísticas y `PROPUESTA_EJEMPLO` adaptada.
 */
import Anthropic from "@anthropic-ai/sdk";
import type { AreaId, PerfilEmpresa } from "@/data/diagnostico/tipos";
import { PROPUESTA_EJEMPLO } from "@/data/propuesta/ejemplo";
import { analiticas as CATALOGO_ANALITICAS } from "@/data/analiticas";
import { ANALITICAS_PROHIBIDAS, ESCENARIOS } from "@/data/propuesta/tipos";
import type {
  AnaliticaPropuesta,
  Escenario,
  EstrategiaErp,
  FaseTrabajo,
  Indicador,
  Integracion,
  ModuloPropuesto,
  PeticionPreguntas,
  PeticionPropuesta,
  PreguntaSeguimiento,
  Propuesta,
  RangoVigilantes,
  ReporteEntregable,
  Respuestas,
  RespuestaSeguimiento,
} from "@/data/propuesta/tipos";
import { areaPorId, moduloPorId } from "@/data/servicios";
import { areasCandidatas, catalogoCompacto, esAreaId, modulosPara } from "@/lib/diagnostico/catalogo";

export const MODELO_RAPIDO_POR_DEFECTO = "claude-haiku-5-5";

export function modoDemoPropuesta(): boolean {
  return process.env.ASISTENTE_DEMO === "1" || process.env.NODE_ENV === "development";
}

export function modeloRapido(): string {
  return process.env.ASISTENTE_MODELO_RAPIDO?.trim() || MODELO_RAPIDO_POR_DEFECTO;
}

/* ───────────── Utilidades ───────────── */

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

const texto = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");
const lista = (v: unknown, maxItems: number, maxLargo: number): string[] => {
  if (!Array.isArray(v)) return [];
  const out: string[] = [];
  for (const x of v) {
    const t = texto(x, maxLargo);
    if (t && !out.some((o) => norm(o) === norm(t))) out.push(t);
    if (out.length >= maxItems) break;
  }
  return out;
};
const obj = (v: unknown) => (v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
const contiene = (lista: string[], ...claves: string[]) => lista.some((x) => claves.some((c) => norm(x).includes(c)));
const unirY = (xs: string[]) => (xs.length <= 1 ? (xs[0] ?? "") : `${xs.slice(0, -1).join(", ")} y ${xs[xs.length - 1]}`);
const minusculaInicial = (s: string) => (s ? s[0].toLowerCase() + s.slice(1) : s);

/** Lo que nunca se promete (src/lib/asistente/prompt.ts y 25-servicios-ars.md). */
const PROHIBIDO =
  /placas?\b|\barmas\b|\bepp\b|termic|fuego|humo|\bsla\b|cero caidas|sin caidas|disponibilidad garantizada|antisuplantacion|identificacion automatica|no es un erp|no somos un erp|no (lo )?reemplaza(mos)? (su|el|a su) (erp|sistema contable|contabilidad)|nunca (lo )?reemplaza/;
const prohibido = (s: string) => PROHIBIDO.test(norm(s));
/** Cifras de dinero (no se inventan ahorros en plata). */
const DINERO = /\$|\bcop\b|\busd\b|millones|\bmillon\b|pesos|\bmm\b|dolares/;
const conDinero = (s: string) => DINERO.test(norm(s));
const limpio = (s: string) => Boolean(s) && !prohibido(s);

const RANGOS: RangoVigilantes[] = ["1-50", "51-200", "201-1000", "1000+"];
const CENTRAL = ["si", "no", "en-proyecto"] as const;
const MODOS: Integracion["modo"][] = ["integra", "centraliza", "migra", "convive", "reemplaza"];
const MODOS_ERP: EstrategiaErp["modo"][] = ["ars-centraliza", "fluye-con-su-sistema", "mixto"];

/* ───────────── Validación de la entrada ───────────── */

/** Sanea respuestas (completas o parciales) que vienen del cliente. Nunca lanza. */
export function sanearRespuestas(v: unknown): Respuestas {
  const o = obj(v);
  const vigilantes = typeof o.vigilantes === "string" && (RANGOS as string[]).includes(o.vigilantes) ? (o.vigilantes as RangoVigilantes) : "";
  const central = typeof o.central === "string" && (CENTRAL as readonly string[]).includes(o.central) ? (o.central as Respuestas["central"]) : "";
  return {
    nombre: texto(o.nombre, 80),
    cargo: texto(o.cargo, 80),
    empresa: texto(o.empresa, 100),
    ciudad: texto(o.ciudad, 60),
    vigilantes,
    sedes: texto(typeof o.sedes === "number" ? String(o.sedes) : o.sedes, 30),
    servicios: lista(o.servicios, 10, 60),
    central,
    aplicaciones: lista(o.aplicaciones, 14, 60),
    erp: texto(o.erp, 60),
    datos: lista(o.datos, 10, 60),
    integraciones: texto(o.integraciones, 600),
    dolores: lista(o.dolores, 10, 160),
    reportes: lista(o.reportes, 8, 120),
    plazo: texto(o.plazo, 40),
    notas: texto(o.notas, 1200),
    email: texto(o.email, 120),
    telefono: texto(o.telefono, 40),
    autoriza: o.autoriza === true,
  };
}

const hayAlgo = (r: Respuestas) =>
  Boolean(
    r.empresa || r.nombre || r.vigilantes || r.sedes || r.central || r.erp || r.integraciones || r.notas ||
      r.servicios.length || r.aplicaciones.length || r.datos.length || r.dolores.length || r.reportes.length,
  );

export function validarPeticionPreguntas(raw: unknown): PeticionPreguntas & { respuestas: Respuestas } {
  const respuestas = sanearRespuestas(obj(raw).respuestas);
  if (!hayAlgo(respuestas)) throw new EntradaInvalida("Cuéntenos primero un poco de su operación.");
  return { respuestas };
}

export function validarPeticionPropuesta(raw: unknown): PeticionPropuesta {
  const o = obj(raw);
  if (!o.respuestas || typeof o.respuestas !== "object") throw new EntradaInvalida("Faltan sus respuestas.");
  const respuestas = sanearRespuestas(o.respuestas);
  if (!respuestas.empresa && !respuestas.nombre) throw new EntradaInvalida("Díganos al menos su nombre o el de su empresa.");
  const seguimiento: RespuestaSeguimiento[] = (Array.isArray(o.seguimiento) ? o.seguimiento : [])
    .slice(0, 6)
    .map((s) => {
      const x = obj(s);
      return { id: texto(x.id, 40), pregunta: texto(x.pregunta, 240), respuesta: texto(x.respuesta, 400) };
    })
    .filter((s) => s.respuesta);
  return { respuestas, seguimiento };
}

export class EntradaInvalida extends Error {}

/* ───────────── Lectura de las respuestas ───────────── */

const usaErp = (r: Respuestas) => Boolean(r.erp) || contiene(r.aplicaciones, "erp", "contab") || contiene(r.datos, "erp");
const usaCamaras = (r: Respuestas) => contiene(r.aplicaciones, "vms", "grabador", "camara", "cctv", "dvr", "nvr");
const pideInformeCliente = (r: Respuestas) => contiene(r.reportes, "cliente") || contiene(r.dolores, "cliente");

/** Perfil compatible con el diagnóstico para reutilizar `areasCandidatas`. */
function perfilDe(r: Respuestas, seg: RespuestaSeguimiento[] = []): Partial<PerfilEmpresa> {
  return {
    nombre: r.empresa || r.nombre,
    sector: r.servicios.join(", ") || "Vigilancia privada",
    ciudad: r.ciudad || undefined,
    tamano: r.vigilantes || undefined,
    dolores: r.dolores,
    herramientasActuales: [...r.aplicaciones, ...r.datos, ...(r.erp ? [r.erp, "erp"] : [])],
    prioridades: r.reportes,
    notas: [r.integraciones, r.notas, r.central === "si" ? "central de monitoreo propia" : "", ...seg.map((s) => s.respuesta)]
      .filter(Boolean)
      .join(". "),
  };
}

/** Respuesta de seguimiento que cuenta el nombre del ERP (si la hubo). */
function erpDe(r: Respuestas, seg: RespuestaSeguimiento[]): string {
  if (r.erp) return r.erp;
  const s = seg.find((x) => x.id === "erp-nombre" || /erp|contab/i.test(x.pregunta));
  const resp = s ? texto(s.respuesta, 60) : "";
  // Solo si la respuesta es un nombre de sistema, no «Todo en Excel», «No tenemos», «Sí, tenemos un ERP»…
  const n = norm(resp);
  const noEsNombre = /\b(no|ningun|ninguno|sin|excel|otro|nada|tenemos|usamos|solo|todo|software|sistema|se)\b/.test(n) || n.split(/\s+/).length > 4;
  return resp && !noEsNombre ? "su software contable" : "";
}

/**
 * ARS tiene su propio ERP: la propuesta nunca nombra marcas de software de terceros
 * (aunque la persona las mencione). Se reemplazan por un nombre genérico.
 */
const MARCAS = /(?<![\p{L}\p{N}])(siigo(\s+n[oó]mina)?|world\s*office|sap(\s+business\s+one)?|helisa|alegra|ofim[aá]tica|odoo|oracle|dynamics(\s+365)?|contapyme|novasoft|heinsohn)(?![\p{L}\p{N}])/giu;
export function sinMarcas<T>(v: T): T {
  if (typeof v === "string") return v.replace(MARCAS, "su software contable") as T;
  if (Array.isArray(v)) return v.map((x) => sinMarcas(x)) as T;
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, sinMarcas(x)])) as T;
  return v;
}

/* ───────────── Preguntas de seguimiento ───────────── */

const PREGUNTA_APROBACION: PreguntaSeguimiento = {
  id: "aprobacion",
  pregunta: "¿Quién aprueba una decisión como esta en su empresa?",
  porQue: "Para preparar la propuesta pensando en quien la va a revisar.",
  opciones: ["Gerencia general", "Socios o junta", "Operaciones", "Financiero o compras"],
};

const PREGUNTA_EXPORTAR: PreguntaSeguimiento = {
  id: "exportar-datos",
  pregunta: "¿Cómo sacan hoy la información de sus sistemas?",
  porQue: "Para saber cómo conectamos sus datos: por API, por conexión directa o por carga programada.",
  opciones: ["Exportamos a Excel o CSV", "Informes del ERP", "Copiamos a mano", "Tenemos API", "No sabemos"],
};

/** Reglas determinísticas (modo demo y respaldo si la IA no responde a tiempo). */
export function preguntasDemo(r: Respuestas): PreguntaSeguimiento[] {
  const out: PreguntaSeguimiento[] = [];
  const exportar: PreguntaSeguimiento = usaErp(r)
    ? PREGUNTA_EXPORTAR
    : { ...PREGUNTA_EXPORTAR, pregunta: "¿Cómo consolidan hoy la información de turnos y novedades?", opciones: ["Un Excel por sede", "Un Excel general", "Por WhatsApp", "En papel", "No se consolida"] };
  if (usaErp(r) && !r.erp) {
    out.push({
      id: "erp-nombre",
      pregunta: "¿Cómo llevan hoy la nómina, la contabilidad y la facturación?",
      porQue: "Para saber qué asume el ERP de ARS desde el primer día y qué información hay que traer.",
      opciones: ["En Excel", "Con un contador externo", "En un software contable", "En un sistema propio"],
    });
  }
  if (usaCamaras(r)) {
    out.push({
      id: "camaras-sedes",
      pregunta: "¿En cuántas de sus sedes hay cámaras con grabador?",
      porQue: "Para saber si sus cámaras actuales se pueden sumar al monitoreo sin cambiar equipos.",
      opciones: ["Menos de 5", "Entre 5 y 20", "Entre 21 y 100", "Más de 100"],
    });
  }
  if (pideInformeCliente(r)) {
    out.push({
      id: "informe-cliente",
      pregunta: "¿Qué le exige hoy su cliente en el informe?",
      porQue: "Para que el informe que le entreguemos traiga justo lo que le piden.",
      opciones: ["Rondas cumplidas", "Novedades con foto", "Horas por puesto", "Indicadores del contrato", "Lo armamos a nuestro criterio"],
    });
  }
  if (r.central === "no" || r.central === "en-proyecto") {
    out.push({
      id: "novedades-hoy",
      pregunta: "¿Quién recibe hoy las novedades de los puestos?",
      porQue: "Para saber si conviene empezar por una sala de control o por el supervisor en campo.",
      opciones: ["El supervisor por WhatsApp", "El gerente directamente", "Un coordinador en la oficina", "Nadie en la noche"],
    });
  }
  if (contiene(r.aplicaciones, "nomina") && !contiene(r.aplicaciones, "erp")) {
    out.push({
      id: "nomina-software",
      pregunta: "¿Cómo liquidan hoy la nómina?",
      porQue: "Para saber cómo pasar la nómina al ERP de ARS, calculada desde los turnos.",
      opciones: ["En Excel", "Un software de nómina", "La hace el contador", "Otro"],
    });
  }
  if (out.length < 3 && (contiene(r.datos, "excel", "papel") || contiene(r.aplicaciones, "excel"))) out.push(exportar);
  if (out.length < 3) out.push(PREGUNTA_APROBACION);
  if (out.length < 2) out.push(exportar);
  return out.slice(0, 3);
}

function sanearPreguntas(raw: unknown, r: Respuestas): PreguntaSeguimiento[] {
  return sinMarcas(sanearPreguntasBase(raw, r));
}

function sanearPreguntasBase(raw: unknown, r: Respuestas): PreguntaSeguimiento[] {
  const ids = new Set<string>();
  const out: PreguntaSeguimiento[] = [];
  for (const p of Array.isArray(obj(raw).preguntas) ? (obj(raw).preguntas as unknown[]) : []) {
    const x = obj(p);
    const pregunta = texto(x.pregunta, 160);
    const porQue = texto(x.porQue, 160);
    const opciones = lista(x.opciones, 5, 50).filter(limpio);
    if (!pregunta || !porQue || opciones.length < 3 || prohibido(pregunta)) continue;
    let id = norm(texto(x.id, 40) || pregunta).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 32) || `p${out.length + 1}`;
    while (ids.has(id)) id = `${id}-${out.length + 1}`;
    ids.add(id);
    out.push({ id, pregunta, porQue, opciones });
    if (out.length === 3) break;
  }
  // Respaldo: completar con reglas hasta tener al menos 2.
  for (const p of preguntasDemo(r)) {
    if (out.length >= 2) break;
    if (!ids.has(p.id)) out.push(p);
  }
  return out;
}

const ESQUEMA_PREGUNTAS = {
  type: "object",
  additionalProperties: false,
  required: ["preguntas"],
  properties: {
    preguntas: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "pregunta", "porQue", "opciones"],
        properties: {
          id: { type: "string" },
          pregunta: { type: "string" },
          porQue: { type: "string" },
          opciones: { type: "array", items: { type: "string" } },
        },
      },
    },
  },
};

const SISTEMA_PREGUNTAS = `Eres el consultor de ARS Intelligence (plataforma colombiana para empresas de seguridad privada: turnos, rondas, central de monitoreo, radio en el celular, nómina, documentos, cámaras, y su PROPIO ERP —nómina, contabilidad, facturación, clientes— que además puede conectarse con lo que la empresa ya tenga). Nunca nombres marcas de software de terceros (ni en preguntas ni en opciones).
Una persona acaba de contar cómo opera su empresa. Antes de armarle una propuesta, haces 2 o 3 preguntas de seguimiento CORTAS y CONCRETAS que llenen los huecos de contexto que más cambian la propuesta y la integración. Ejemplos de buenos huecos:
- no está claro cómo llevan hoy nómina, contabilidad y facturación → cómo (Excel, contador externo, software contable, sistema propio), para saber qué asume el ERP de ARS;
- tiene cámaras o grabadores → en cuántas sedes;
- pide informe al cliente → qué le exige hoy el cliente;
- datos en Excel o papel → cómo los exportan o consolidan hoy;
- no hay central → quién recibe hoy las novedades;
- quién aprueba la compra.
No preguntes lo que ya respondió, ni por presupuesto o precios, ni datos personales.
Reglas de forma: español colombiano, trato de usted, cálido y sin tecnicismos. «pregunta» ≤ 14 palabras. «porQue» empieza con «Para …» (≤ 18 palabras). «opciones»: 3 a 5 respuestas cortas (≤ 5 palabras) y realistas para una empresa de seguridad colombiana. «id» en kebab-case.`;

const resumenRespuestas = (r: Respuestas) => {
  const { email: _e, telefono: _t, autoriza: _a, ...resto } = r;
  void _e;
  void _t;
  void _a;
  return JSON.stringify(resto);
};

async function llamarJson(
  client: Anthropic,
  modelo: string,
  opciones: { system: string; usuario: string; schema: Record<string, unknown>; effort?: "low" | "medium" | "high"; maxTokens: number },
  signal: AbortSignal,
): Promise<unknown> {
  const s = client.beta.messages.stream(
    {
      model: modelo,
      max_tokens: opciones.maxTokens,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: {
        ...(opciones.effort ? { effort: opciones.effort } : {}),
        format: { type: "json_schema", schema: opciones.schema },
      },
      system: [{ type: "text", text: opciones.system, cache_control: { type: "ephemeral", ttl: "1h" } }],
      messages: [{ role: "user", content: opciones.usuario }],
    },
    { signal },
  );
  const inicio = Date.now();
  const final = await s.finalMessage();
  const u = final.usage;
  console.info(
    `[propuesta] ${final.model} stop=${final.stop_reason} ${Date.now() - inicio}ms in=${u.input_tokens} cache_read=${u.cache_read_input_tokens ?? 0} out=${u.output_tokens}`,
  );
  if (final.stop_reason === "refusal") throw new Error("rechazo");
  if (final.stop_reason === "max_tokens") throw new Error("salida truncada");
  const t = final.content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
  return JSON.parse(t) as unknown;
}

/** Preguntas con IA (modelo rápido, tope ~8 s). Si la IA falla o tarda, responde con las reglas. */
export async function preguntasIa(r: Respuestas, cfg: { anthropicKey: string }, signal: AbortSignal): Promise<PreguntaSeguimiento[]> {
  const client = new Anthropic({ apiKey: cfg.anthropicKey, maxRetries: 0 });
  const tope = AbortSignal.any([signal, AbortSignal.timeout(8_000)]);
  try {
    const raw = await llamarJson(
      client,
      modeloRapido(),
      { system: SISTEMA_PREGUNTAS, usuario: `<respuestas>${resumenRespuestas(r)}</respuestas>`, schema: ESQUEMA_PREGUNTAS, maxTokens: 1200 },
      tope,
    );
    return sanearPreguntas(raw, r);
  } catch (err) {
    if (signal.aborted) throw err;
    console.error("[propuesta/preguntas] IA no respondió, uso reglas:", err instanceof Error ? err.message : err);
    return preguntasDemo(r);
  }
}

/* ───────────── Identidad de la propuesta ───────────── */

export const AVISO_PROPUESTA = PROPUESTA_EJEMPLO.aviso;

function idPropuesta(fecha: Date): string {
  const partes = new Intl.DateTimeFormat("es-CO", { timeZone: "America/Bogota", day: "2-digit", month: "2-digit" }).formatToParts(fecha);
  const dd = (partes.find((p) => p.type === "day")?.value ?? "1").padStart(2, "0");
  const mm = (partes.find((p) => p.type === "month")?.value ?? "1").padStart(2, "0");
  const alfabeto = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  const sufijo = [...bytes].map((b) => alfabeto[b % alfabeto.length]).join("");
  return `ARS-${dd}${mm}-${sufijo}`;
}

const contactoDe = (r: Respuestas): Propuesta["contacto"] => ({
  nombre: r.nombre,
  cargo: r.cargo,
  email: r.email,
  telefono: r.telefono,
  ciudad: r.ciudad,
});

/* ───────────── Integraciones: cubrir cada sistema que mencionó ───────────── */

/* ───────────── Estrategia ERP: ARS es un ERP completo y se adapta ───────────── */

/** Sistemas administrativos que ya tiene (ERP, contable, nómina), tal como los nombró. */
function sistemasAdministrativos(r: Respuestas, erp: string): string[] {
  const out: string[] = [];
  if (erp) out.push(erp);
  else if (usaErp(r)) out.push("Su ERP");
  for (const app of r.aplicaciones) {
    const n = norm(app);
    if ((n.includes("nomina") || n.includes("contab") || n.includes("factur")) && !out.some((x) => norm(x) === n)) out.push(app);
  }
  return out;
}

export function estrategiaErpDemo(r: Respuestas, erp: string): EstrategiaErp {
  const sistemas = sistemasAdministrativos(r, erp);
  if (!sistemas.length) {
    const hoy = [contiene(r.aplicaciones, "excel") || contiene(r.datos, "excel") ? "Excel" : "", contiene(r.datos, "papel") ? "papel" : ""].filter(Boolean);
    return {
      modo: "ars-centraliza",
      sistemas: [],
      explicacion: `ARS tiene su propio ERP con nómina, contabilidad, facturación, clientes y contratos. Como hoy ${hoy.length ? `todo se lleva en ${unirY(hoy)}` : "no tienen un sistema administrativo"}, el ERP de ARS lo centraliza: los turnos se vuelven nómina y la información de cada cliente queda en un solo lugar, sin digitar dos veces.`,
    };
  }
  const tieneErp = Boolean(erp) || usaErp(r);
  const nombre = unirY(sistemas);
  if (tieneErp) {
    return {
      modo: "mixto",
      sistemas,
      explicacion: `ARS tiene su propio ERP: turnos, nómina, facturación, clientes y contratos viven en ARS desde el primer día. Mientras ustedes decidan conservar ${nombre}, el agente interoperador de datos le envía la información lista para que nada se digite dos veces. Cuando lo decidan, el ERP de ARS asume también esa parte y todo queda centralizado.`,
    };
  }
  return {
    modo: "mixto",
    sistemas,
    explicacion: `ARS centraliza en su propio ERP la contabilidad, los clientes y los contratos, mientras ${nombre} recibe las horas trabajadas listas desde los turnos por medio del agente interoperador de datos. Cuando ustedes lo decidan, el ERP de ARS también puede asumir esa parte.`,
  };
}

const MENCIONA_ASUMIR = /asum|centraliz|cuando (ustedes )?lo decidan|cuando quieran/;

function sanearEstrategiaErp(v: unknown, r: Respuestas, erp: string): EstrategiaErp {
  const demo = estrategiaErpDemo(r, erp);
  const x = obj(v);
  const modo = MODOS_ERP.includes(x.modo as EstrategiaErp["modo"]) ? (x.modo as EstrategiaErp["modo"]) : demo.modo;
  let explicacion = texto(x.explicacion, 700);
  // Reglas del dueño: sin sistema administrativo → ARS centraliza; con sistema → fluye o mixto.
  const coherente = demo.modo === "ars-centraliza" ? modo === "ars-centraliza" : modo !== "ars-centraliza";
  if (!coherente || !limpio(explicacion)) return demo;
  if (modo !== "ars-centraliza" && !MENCIONA_ASUMIR.test(norm(explicacion))) {
    explicacion = `${explicacion} Si más adelante prefieren centralizar todo, el ERP de ARS lo asume cuando ustedes lo decidan.`;
  }
  const sistemas = modo === "ars-centraliza" ? [] : lista(x.sistemas, 6, 60).filter(limpio);
  return { modo, sistemas: sistemas.length || modo === "ars-centraliza" ? sistemas : demo.sistemas, explicacion };
}

type Fuente = { etiqueta: string; claves: string[]; base: Integracion };

/** Cada aplicación y fuente de datos que mencionó, con su integración por defecto. */
function fuentesDe(r: Respuestas, erp: string): Fuente[] {
  const centraliza = estrategiaErpDemo(r, erp).modo === "ars-centraliza";
  const out: Fuente[] = [];
  const agregar = (f: Fuente) => {
    if (!out.some((x) => x.claves.some((c) => f.claves.includes(c)))) out.push(f);
  };
  const nombreErp = erp || "Su ERP";
  for (const app of [...r.aplicaciones, ...r.datos]) {
    const n = norm(app);
    if (n.includes("erp") || n.includes("contab")) {
      agregar({
        etiqueta: app,
        claves: ["erp", ...(erp ? [norm(erp)] : []), "contab"],
        base: {
          sistema: nombreErp,
          modo: "integra",
          detalle: `El agente interoperador le envía nómina, novedades y servicios listos a ${nombreErp}; si lo deciden, el ERP de ARS lo asume.`,
        },
      });
    } else if (n.includes("nomina")) {
      agregar({
        etiqueta: app,
        claves: ["nomina"],
        base: { sistema: app, modo: "integra", detalle: "ARS le entrega las horas trabajadas, extras y recargos desde los turnos; la nómina de ARS puede asumirla cuando lo decidan." },
      });
    } else if (n.includes("whatsapp")) {
      agregar({ etiqueta: app, claves: ["whatsapp"], base: { sistema: "WhatsApp", modo: "reemplaza", detalle: "Las novedades operativas pasan a un chat y una radio propios, con todo grabado." } });
    } else if (n.includes("radio")) {
      agregar({ etiqueta: app, claves: ["radio"], base: { sistema: app, modo: "reemplaza", detalle: "La radio pasa al teléfono del vigilante y cada transmisión queda grabada." } });
    } else if (n.includes("vms") || n.includes("grabador") || n.includes("camara")) {
      agregar({ etiqueta: app, claves: ["grabador", "vms", "camara"], base: { sistema: "Cámaras y grabadores", modo: "convive", detalle: "Sus equipos actuales se quedan; se pueden sumar después a la central con analíticas." } });
    } else if (n.includes("ronda")) {
      agregar({ etiqueta: app, claves: ["ronda"], base: { sistema: app, modo: "migra", detalle: "Los puntos de ronda se cargan una vez y pasan a rondas con QR en ARS." } });
    } else if (n.includes("excel")) {
      agregar({
        etiqueta: app,
        claves: ["excel"],
        base: centraliza
          ? { sistema: "Excel de turnos, nómina y clientes", modo: "centraliza", detalle: "Lo que hoy vive en hojas sueltas pasa al ERP de ARS: turnos, nómina, clientes y contratos en un solo lugar." }
          : { sistema: "Excel de turnos y novedades", modo: "migra", detalle: "Se carga una vez lo que hoy vive en hojas sueltas y desde ahí se lleva en ARS." },
      });
    } else if (n.includes("papel")) {
      agregar({ etiqueta: app, claves: ["papel", "planilla", "minuta"], base: { sistema: "Planillas y minutas en papel", modo: "reemplaza", detalle: "Pasan a formularios en el celular con foto, firma, ubicación y hora." } });
    } else if (n.includes("nube") || n.includes("drive") || n.includes("onedrive")) {
      agregar({ etiqueta: app, claves: ["nube", "drive", "onedrive"], base: { sistema: app, modo: "convive", detalle: "Sus carpetas siguen ahí; ARS toma lo que necesita por carga programada." } });
    } else if (n.includes("servidor")) {
      agregar({ etiqueta: app, claves: ["servidor"], base: { sistema: "Servidor propio", modo: "integra", detalle: "Se conecta por conexión de backend con permisos controlados, sin mover sus datos de casa." } });
    } else {
      agregar({
        etiqueta: app,
        claves: [norm(app)],
        base: { sistema: app, modo: "convive", detalle: "Se conecta por API, por conexión de backend o por carga programada, según lo que permita." },
      });
    }
  }
  if (erp && !out.some((f) => f.claves.includes("erp"))) {
    agregar({ etiqueta: erp, claves: ["erp", norm(erp)], base: { sistema: erp, modo: "integra", detalle: `El agente interoperador le envía la información lista a ${erp}; si lo deciden, el ERP de ARS lo asume.` } });
  }
  return out;
}

/** Garantiza que cada sistema mencionado tenga su nodo en el mapa de integración. */
function completarIntegraciones(propias: Integracion[], r: Respuestas, erp: string): Integracion[] {
  const out = [...propias];
  for (const f of fuentesDe(r, erp)) {
    const cubierta = out.some((i) => {
      const s = norm(`${i.sistema} ${i.detalle}`);
      return f.claves.some((c) => c && s.includes(c)) || s.includes(norm(f.etiqueta));
    });
    if (!cubierta) out.push(f.base);
  }
  return out.slice(0, 10);
}

/* ───────────── Reportes ───────────── */

function paraDe(s: string): string {
  const n = norm(s);
  if (n.includes("supervigilancia")) return "Supervigilancia";
  if (n.includes("cliente")) return "Cliente final";
  if (n.includes("gerencia") || n.includes("gerente") || n.includes("junta") || n.includes("socio")) return "Gerencia";
  if (n.includes("nomina") || n.includes("humana")) return "Gestión humana y finanzas";
  if (n.includes("supervisor") || n.includes("coordinador")) return "Coordinadores";
  return "Gerencia";
}

function frecuenciaDe(s: string): string {
  const n = norm(s);
  if (n.includes("tiempo real") || n.includes("en vivo")) return "En tiempo real";
  if (n.includes("diari") || n.includes("del dia") || n.includes("cada dia")) return "Diario";
  if (n.includes("seman")) return "Semanal";
  if (n.includes("quincen")) return "Quincenal";
  return "Mensual";
}

function reporteDesde(pedido: string, r: Respuestas): ReporteEntregable {
  const para = paraDe(pedido);
  const contenido =
    para === "Cliente final"
      ? "Turnos cumplidos, rondas, novedades y evidencia por sede."
      : para === "Supervigilancia"
        ? "La información del personal y la operación organizada para lo que le soliciten."
        : para === "Gestión humana y finanzas"
          ? "Horas trabajadas, extras y recargos por centro de costo."
          : para === "Coordinadores"
            ? "Revistas y rondas hechas contra las programadas."
            : `Qué pasó en ${r.sedes && r.sedes !== "1" ? "cada sede" : "la operación"}, qué falta cubrir y quién respondió.`;
  return { nombre: pedido.slice(0, 80), para, frecuencia: frecuenciaDe(pedido), contenido };
}

/** Cada reporte que pidió queda en la lista, con destinatario y frecuencia. */
function completarReportes(propios: ReporteEntregable[], r: Respuestas): ReporteEntregable[] {
  const out = [...propios];
  for (const pedido of r.reportes) {
    const n = norm(pedido);
    const claves = n.split(/[^a-z0-9]+/).filter((w) => w.length > 4);
    const cubierto = out.some((x) => {
      const s = norm(`${x.nombre} ${x.para} ${x.contenido}`);
      return s.includes(n) || (claves.length > 0 && claves.filter((c) => s.includes(c)).length >= Math.min(2, claves.length));
    });
    if (!cubierto) out.push(reporteDesde(pedido, r));
  }
  return out.slice(0, 8);
}

/* ───────────── Saneamiento contra el catálogo ───────────── */

function moduloPropuestoDe(v: unknown): ModuloPropuesto | null {
  const x = obj(v);
  const id = texto(x.modulo, 60);
  const m = moduloPorId(id);
  if (!m || !esAreaId(m.area.id)) return null;
  let porQue = texto(x.porQue, 220);
  if (!limpio(porQue)) porQue = m.modulo.frase;
  if (m.modulo.estado === "piloto" && !norm(porQue).includes("piloto")) porQue = `${porQue} (en piloto)`;
  return { area: m.area.id, modulo: id, porQue };
}

const conEstimado = (s: string) => (/estimad/i.test(s) ? s : `${s} (estimado)`);

function duracionPorTamano(r: Respuestas, i: number): string {
  const tabla: Record<RangoVigilantes | "", [string, string, string]> = {
    "": ["3 a 4 semanas", "3 a 4 semanas", "4 a 6 semanas"],
    "1-50": ["2 a 3 semanas", "2 a 3 semanas", "3 a 4 semanas"],
    "51-200": ["3 a 4 semanas", "3 a 4 semanas", "4 a 5 semanas"],
    "201-1000": ["4 a 6 semanas", "3 a 4 semanas", "4 a 6 semanas"],
    "1000+": ["6 a 8 semanas", "4 a 6 semanas", "6 a 8 semanas"],
  };
  return `${tabla[r.vigilantes][Math.min(i, 2)]} (estimado)`;
}

function sanearFases(v: unknown, modulos: string[], r: Respuestas): FaseTrabajo[] {
  const fases: FaseTrabajo[] = [];
  const usados = new Set<string>();
  for (const f of Array.isArray(v) ? v : []) {
    const x = obj(f);
    const ids = lista(x.modulos, 8, 60).filter((id) => modulos.includes(id) && !usados.has(id));
    const nombre = texto(x.nombre, 80);
    if (!nombre || !ids.length) continue;
    ids.forEach((id) => usados.add(id));
    fases.push({
      nombre,
      duracion: conEstimado(texto(x.duracion, 50) || duracionPorTamano(r, fases.length)),
      objetivo: texto(x.objetivo, 200),
      entregables: lista(x.entregables, 6, 140).filter(limpio),
      modulos: ids,
    });
    if (fases.length === 4) break;
  }
  // Módulos que quedaron por fuera: van a la última fase (o a una nueva si no hay).
  if (fases.length < 2) return fasesPorArea(modulos, r);
  const faltan = modulos.filter((id) => !usados.has(id));
  fases[fases.length - 1].modulos.push(...faltan);
  return fases;
}

/* ───────────── Modo demo (sin clave) ───────────── */

const ETAPAS: { nombre: string; objetivo: string; areas: AreaId[] }[] = [
  { nombre: "El campo en el teléfono", objetivo: "Que cada turno, marcación y ronda quede con evidencia.", areas: ["operacion-en-campo", "gobierno-y-seguridad"] },
  {
    nombre: "Central y comunicación",
    objetivo: "Ver y coordinar la operación en vivo, con la comunicación en un solo canal.",
    areas: ["centro-de-operaciones", "comunicacion-y-emergencias", "monitoreo-inteligente", "realidad-virtual"],
  },
  {
    nombre: "Gente, nómina y datos conectados",
    objetivo: "De los turnos a la nómina, los informes y sus sistemas sin digitar dos veces.",
    areas: ["gestion-humana", "formacion", "finanzas-y-erp", "productividad-e-ia", "infraestructura"],
  },
];

function fasesPorArea(modulos: string[], r: Respuestas): FaseTrabajo[] {
  const grupos = ETAPAS.map((e) => ({ ...e, ids: modulos.filter((id) => e.areas.includes(moduloPorId(id)?.area.id as AreaId)) })).filter(
    (g) => g.ids.length,
  );
  // Siempre 2–4 fases: si solo hay un grupo, se parte en dos.
  if (grupos.length === 1 && grupos[0].ids.length > 1) {
    const g = grupos[0];
    const mitad = Math.ceil(g.ids.length / 2);
    grupos.splice(0, 1, { ...g, ids: g.ids.slice(0, mitad) }, { ...g, nombre: `${g.nombre}: segunda etapa`, ids: g.ids.slice(mitad) });
  }
  return grupos.map((g, i) => ({
    nombre: `Fase ${i + 1} · ${g.nombre === "Central y comunicación" && r.central === "no" ? "Comunicación con los puestos" : g.nombre}`,
    duracion: duracionPorTamano(r, i),
    objetivo: g.objetivo,
    entregables: g.ids
      .map((id) => {
        const m = moduloPorId(id)?.modulo;
        return `${m?.nombre ?? id} ${m?.estado === "piloto" ? "(en piloto)" : "en marcha"}`;
      })
      .slice(0, 5),
    modulos: g.ids,
  }));
}

/** Frases de lo que ARS suple, por módulo (se usan si el módulo entra en la propuesta). */
const SUPLE: Record<string, string> = {
  "turnos-y-programacion": "La programación de todos los puestos en un solo lugar, sin hojas sueltas.",
  "control-de-asistencia-y-relevos": "Marcación con rostro y ubicación en el celular del vigilante, para saber quién llegó.",
  "rondas-qr": "Rondas con QR que demuestran al cliente que se hicieron, aun sin señal.",
  "reportes-operativos-y-supervision": "Minutas y revistas del supervisor con foto, firma, ubicación y hora.",
  "sala-de-control": "Un mapa vivo con quién está en cada puesto.",
  "cumplimiento-supervisores-y-vigilantes": "El cumplimiento de supervisores y vigilantes medido solo, sin perseguir a nadie.",
  "radio-ptt": "Radio en el teléfono que queda grabada, en lugar de radio análoga y WhatsApp.",
  "chat-corporativo": "Un chat propio de la operación, separado del WhatsApp personal.",
  "reporte-por-sede": "Cada sede reporta sus novedades en un solo canal, ordenadas y con evidencia.",
  "boton-de-panico": "Botón de pánico en el celular que llega directo a quien debe responder.",
  nomina: "Nómina calculada desde los turnos que de verdad se trabajaron.",
  "agente-interoperador-de-datos": "Sus sistemas conectados: la información fluye sin digitar dos veces.",
  "su-erp-dentro-de-ars": "Su ERP consultable desde la misma pantalla de la operación.",
  "centro-de-ia": "Informes que se arman solos con la evidencia de cada turno.",
  "portal-documental-para-el-cliente": "Un portal donde su cliente consulta los documentos y la evidencia sin pedírsela.",
  "formularios-dinamicos": "Formularios en el celular que reemplazan las planillas de papel.",
  "vision-artificial": "Analíticas sobre sus cámaras actuales que avisan a la central, y un operador verifica.",
  "seleccion-y-contratacion": "Selección y contratación ordenadas para sostener la rotación.",
  "cargue-inteligente-de-documentos": "Los documentos del personal se cargan y se ordenan solos.",
  "capacitacion-virtual": "Capacitación virtual con registro de quién la hizo.",
  "centro-de-datos-ars": "Su información se procesa y se resguarda en Colombia, en el centro de datos propio de ARS.",
  "granja-de-gpu-ia-local": "La analítica de video y la IA corren en tarjetas gráficas propias, sin enviar datos afuera.",
  "ubicaciones-y-agente-remoto": "Si ya tiene su nube o su sala de servidores, un agente la conecta a ARS sin abrir puertos.",
  "equipo-on-premise": "Si los datos no pueden salir de su sede, ARS instala el equipo allá.",
  "respaldos-verificados": "Respaldos verificados, con copia fuera del sitio y aviso si alguno falla.",
};

const IMPACTO: { modulo: string; indicador: string; hoy: string; conArs: string }[] = [
  { modulo: "control-de-asistencia-y-relevos", indicador: "Confirmar quién llegó al turno", hoy: "Llamadas uno a uno", conArs: "En vivo en el celular o la central (estimado)" },
  { modulo: "centro-de-ia", indicador: "Armar el informe al cliente", hoy: "Varios días al mes", conArs: "Se genera solo (estimado)" },
  { modulo: "nomina", indicador: "Liquidar horas extra", hoy: "Excel manual", conArs: "Desde los turnos (estimado)" },
  { modulo: "rondas-qr", indicador: "Demostrar que la ronda se hizo", hoy: "Palabra del vigilante", conArs: "Con hora, lugar y foto (estimado)" },
  { modulo: "radio-ptt", indicador: "Buscar qué se dijo en una novedad", hoy: "No queda registro", conArs: "Cada transmisión grabada (estimado)" },
  { modulo: "agente-interoperador-de-datos", indicador: "Digitar la misma información", hoy: "Dos veces o más", conArs: "Una sola vez (estimado)" },
  { modulo: "formularios-dinamicos", indicador: "Consolidar planillas de papel", hoy: "A mano al final del mes", conArs: "Al instante (estimado)" },
  { modulo: "sala-de-control", indicador: "Ver todas las sedes", hoy: "Por partes y a destiempo", conArs: "En un solo mapa (estimado)" },
];

function modulosDemo(r: Respuestas, seg: RespuestaSeguimiento[], erp: string): string[] {
  const texto = [...r.dolores, ...r.aplicaciones, ...r.datos, r.integraciones, ...r.reportes, r.notas, ...seg.map((s) => s.respuesta)].join(". ");
  const ids = ["turnos-y-programacion", "control-de-asistencia-y-relevos"];
  const add = (id: string) => {
    if (moduloPorId(id) && !ids.includes(id)) ids.push(id);
  };
  if (r.vigilantes !== "1-50" || contiene(r.dolores, "ronda")) add("rondas-qr");
  if (r.central === "si" || r.central === "en-proyecto") add("sala-de-control");
  else add("reportes-operativos-y-supervision");
  if (contiene(r.aplicaciones, "radio")) add("radio-ptt");
  if (contiene(r.aplicaciones, "whatsapp")) add(contiene(r.aplicaciones, "radio") || r.central === "si" ? "radio-ptt" : "reporte-por-sede");
  if (contiene(r.dolores, "nomina", "hora") || contiene(r.aplicaciones, "nomina")) add("nomina");
  if (erp || usaErp(r)) add("agente-interoperador-de-datos");
  if (r.reportes.length || contiene(r.dolores, "informe", "reporte")) add("centro-de-ia");
  if (contiene(r.datos, "papel")) add("formularios-dinamicos");
  for (const id of modulosPara(texto, 6)) add(id);
  // Sin central no se propone la sala del coordinador ni la consola de radio.
  const fuera = r.central === "no" ? ["sala-del-coordinador", "consola-de-radio", "sala-de-control"] : [];
  // No se proponen módulos de cámaras si no mencionó cámaras.
  if (!usaCamaras(r) && !contiene(r.servicios, "tecnolog", "monitoreo")) fuera.push("vision-artificial", "acceso-inteligente", "puertas-reconocimiento-facial");
  return ids.filter((id) => !fuera.includes(id)).slice(0, r.vigilantes === "1-50" ? 6 : 9);
}

/** porQue por defecto para módulos que no están en el ejemplo. */
const PORQUE: Record<string, string> = {
  "centro-de-ia": "Para que los informes que hoy se arman a mano salgan solos de la evidencia.",
  "reporte-por-sede": "Para que cada sede reporte sus novedades en un solo canal y se vea quién no respondió.",
  "chat-corporativo": "Para sacar la operación del WhatsApp personal sin perder la conversación.",
  "reportes-operativos-y-supervision": "Para que la supervisión de campo quede con foto, firma, ubicación y hora.",
  "formularios-dinamicos": "Para cambiar las planillas de papel por formularios en el celular.",
  "boton-de-panico": "Para que una emergencia en el puesto llegue de inmediato a quien responde.",
  "portal-documental-para-el-cliente": "Para que el cliente consulte la evidencia sin tener que pedirla.",
};

function porQueDemo(id: string, r: Respuestas, erp: string): string {
  const ej = PROPUESTA_EJEMPLO.modulos.find((m) => m.modulo === id)?.porQue ?? PORQUE[id];
  const sedes = r.sedes && r.sedes !== "1" ? `las ${r.sedes} sedes` : "su operación";
  if (ej) {
    return ej
      .replaceAll("las 48 sedes", sedes)
      .replaceAll("su software contable", erp || "su software contable")
      .replace("todas las sedes", r.sedes === "1" ? "la sede" : "todas las sedes");
  }
  const m = moduloPorId(id)?.modulo;
  const dolor = r.dolores.find((d) => modulosPara(d, 4).includes(id));
  return dolor ? `Porque nos contó: «${dolor}».` : (m?.frase ?? "");
}

export function propuestaDemo(p: PeticionPropuesta): Propuesta {
  return sinMarcas(propuestaDemoBase(p));
}

function propuestaDemoBase(p: PeticionPropuesta): Propuesta {
  const r = p.respuestas;
  const erp = erpDe(r, p.seguimiento);
  const empresa = r.empresa || `La empresa de ${r.nombre}`;
  const fecha = new Date();
  const ids = modulosDemo(r, p.seguimiento, erp);
  const modulos = ids.map((id) => moduloPropuestoDe({ modulo: id, porQue: porQueDemo(id, r, erp) })).filter((m): m is ModuloPropuesto => m !== null);
  const herramientas = [...r.aplicaciones.filter((a) => !/^erp$/i.test(a)), ...(erp ? [erp] : [])];
  const sedesTxt = r.sedes ? `${r.sedes} ${r.sedes === "1" ? "sede" : "sedes"}` : "su operación";
  const vigTxt = r.vigilantes
    ? ` con ${{ "1-50": "hasta 50", "51-200": "entre 51 y 200", "201-1000": "entre 201 y 1.000", "1000+": "más de 1.000" }[r.vigilantes]} vigilantes`
    : "";
  const nombreHerr = (h: string) => (/^(radio|software|app|planillas?)\b/i.test(h) ? minusculaInicial(h) : h);
  const situacion = [
    `Hoy ${empresa} opera ${sedesTxt}${vigTxt}${herramientas.length ? ` apoyada en ${unirY(herramientas.slice(0, 4).map(nombreHerr))}` : ""}.`,
    r.dolores.length ? `Lo que más le pesa: ${unirY(r.dolores.slice(0, 3).map(minusculaInicial))}.` : "",
    r.central === "no" ? "No tiene central propia, así que las novedades llegan por partes." : "",
  ]
    .filter(Boolean)
    .join(" ");
  const corto = herramientas.filter((h) => !erp || h !== erp).slice(0, 2);
  const titular = `${corto.length ? `De ${unirY(corto)}` : "Del día a día manual"} a una sola operación trazada${erp ? `, conectada con ${erp}` : ""}.`;

  const seQueda: string[] = [];
  if (erp || usaErp(r)) seQueda.push(`${erp || "Su ERP"}, mientras ustedes lo decidan: ARS le entrega la información lista.`);
  if (usaCamaras(r)) seQueda.push("Sus cámaras y grabadores actuales.");
  if (contiene(r.aplicaciones, "nomina") && !erp) seQueda.push("Su software de nómina, mientras ustedes lo decidan: ARS le entrega las horas listas.");
  if (contiene(r.datos, "nube", "drive")) seQueda.push("Sus carpetas en la nube.");
  if (!seQueda.length) seQueda.push("Su forma de trabajar con sus clientes: ARS se adapta a ella.");

  const arsSuple = ids.map((id) => SUPLE[id]).filter(Boolean).slice(0, 6);
  const impacto = IMPACTO.filter((i) => ids.includes(i.modulo))
    .slice(0, 4)
    .map(({ indicador, hoy, conArs }) => ({ indicador, hoy, conArs }));

  const reportesBase: ReporteEntregable[] = [];
  if (ids.includes("reportes-operativos-y-supervision") || ids.includes("sala-de-control")) {
    reportesBase.push({ nombre: "Cumplimiento de supervisores", para: "Coordinadores", frecuencia: "Semanal", contenido: "Revistas hechas contra las programadas." });
  }
  if (ids.includes("nomina")) {
    reportesBase.push({ nombre: "Nómina por centro de costo", para: "Gestión humana y finanzas", frecuencia: "Quincenal", contenido: `Horas trabajadas, extras y recargos${erp ? ` listos para ${erp}` : ""}.` });
  }
  const reportes = completarReportes([], r);
  for (const b of reportesBase) if (reportes.length < 6 && !reportes.some((x) => norm(x.nombre) === norm(b.nombre))) reportes.push(b);
  if (!reportes.length) reportes.push(reporteDesde("Novedades diarias para gerencia", r));

  const pequena = r.vigilantes === "1-50" || Number(r.sedes) <= 5;
  return {
    id: idPropuesta(fecha),
    fecha: fecha.toISOString(),
    empresa,
    contacto: contactoDe(r),
    situacion,
    titular,
    arsSuple: arsSuple.length ? arsSuple : PROPUESTA_EJEMPLO.arsSuple.slice(0, 3),
    seQueda,
    modulos,
    lineaDeTrabajo: fasesPorArea(modulos.map((m) => m.modulo), r),
    integraciones: completarIntegraciones([], r, erp),
    reportes,
    impacto,
    siguientesPasos: [
      "Un asesor de ARS le llama para validar esta propuesta.",
      `Demo de 30 minutos con ${r.sedes === "1" ? "su sede" : "sus sedes"} y sus turnos.`,
      pequena ? "Arranque con una o dos sedes." : "Plan piloto con dos o tres sedes.",
    ],
    analiticas: tieneCamaras(r, p.seguimiento) ? analiticasDemo(escenarioDe(r, p.seguimiento)) : undefined,
    indicadores: indicadoresDemo(r, modulos.map((m) => m.modulo), erp),
    escenario: escenarioDe(r, p.seguimiento),
    estrategiaErp: estrategiaErpDemo(r, erp),
    aviso: AVISO_PROPUESTA,
  };
}

/* ───────────── Escenario, analíticas e indicadores ───────────── */

/** Todo lo que contó, en un solo texto normalizado (para reglas). */
const textoTotal = (r: Respuestas, seg: RespuestaSeguimiento[]) =>
  norm(
    [r.empresa, ...r.servicios, ...r.aplicaciones, ...r.datos, r.integraciones, ...r.dolores, ...r.reportes, r.notas, ...seg.map((x) => `${x.pregunta} ${x.respuesta}`)].join(
      " . ",
    ),
  );

const PISTAS_ESCENARIO: Record<Exclude<Escenario, "mixto">, string[]> = {
  residencial: ["conjunto", "residencial", "propiedad horizontal", "copropiedad", "apartamento", "porteria"],
  corporativo: ["oficina", "corporativ", "edificio empresarial", "banco", "sede administrativa", "torre empresarial"],
  industrial: ["industri", "planta", "fabrica", "mina", "manufactur", "zona franca"],
  comercial: ["comerci", "tienda", "centro comercial", "almacen", "retail", "supermercado"],
  logistica: ["logistic", "bodega", "transporte de carga", "centro de distribucion", "mercancia", "escolta de carga"],
};

export function escenarioDe(r: Respuestas, seg: RespuestaSeguimiento[] = []): Escenario {
  const t = textoTotal(r, seg);
  const puntos = (Object.keys(PISTAS_ESCENARIO) as Exclude<Escenario, "mixto">[])
    .map((e) => [e, PISTAS_ESCENARIO[e].filter((c) => t.includes(c)).length] as const)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1]);
  if (!puntos.length) return "mixto";
  if (puntos.length > 1 && puntos[1][1] >= puntos[0][1]) return "mixto";
  return puntos[0][0];
}

/** ¿Tiene o tendrá cámaras / grabadores? */
export function tieneCamaras(r: Respuestas, seg: RespuestaSeguimiento[] = []): boolean {
  const sinCamaras = seg.some((x) => norm(x.pregunta).includes("camara") && /^(no|ninguna|0|cero)\b/.test(norm(x.respuesta)));
  if (sinCamaras) return false;
  if (usaCamaras(r) || contiene(r.servicios, "tecnolog", "monitoreo")) return true;
  return /camara|cctv|\bvms\b|grabador|hikvision|dahua|\bnvr\b|\bdvr\b|videovigilancia/.test(textoTotal(r, seg));
}

const ANALITICAS_PERMITIDAS = CATALOGO_ANALITICAS.filter((a) => !ANALITICAS_PROHIBIDAS.has(a.id) && !prohibido(`${a.nombre} ${a.corta}`));
const analiticaPorId = new Map(ANALITICAS_PERMITIDAS.map((a) => [a.id, a]));
const catalogoAnaliticas = () => ANALITICAS_PERMITIDAS.map((a) => `- ${a.id}: ${a.nombre} — ${a.corta}`).join("\n");

const ANALITICAS_DEMO: Record<Escenario, AnaliticaPropuesta[]> = {
  residencial: [
    { id: "merodeo", donde: "Parqueaderos y accesos peatonales de los conjuntos", porQue: "Detecta a quien se queda dando vueltas antes de que pase algo." },
    { id: "guardian", donde: "Puestos de portería", porQue: "Confirma que la portería no quedó sola durante el turno." },
    { id: "intrusion", donde: "Cerramientos y zonas comunes de noche", porQue: "Avisa con foto y video cuando alguien entra a una zona cerrada." },
    { id: "puertas", donde: "Puertas vehiculares y peatonales", porQue: "Avisa cuando una puerta queda abierta más de la cuenta." },
  ],
  corporativo: [
    { id: "acceso", donde: "Pisos y zonas internas de las oficinas", porQue: "Avisa cuando alguien que no es del equipo cruza a una zona interna." },
    { id: "abandono", donde: "Lobbies y recepciones", porQue: "Alerta por objetos olvidados o dejados a propósito." },
    { id: "guardian", donde: "Puestos de recepción", porQue: "Confirma que el puesto no quedó solo durante el turno." },
    { id: "aforo", donde: "Auditorios y salas comunes", porQue: "Avisa al llegar al límite de personas." },
  ],
  industrial: [
    { id: "intrusion", donde: "Perímetro de las plantas de noche", porQue: "Avisa con foto y video cuando alguien entra a una zona restringida." },
    { id: "activos", donde: "Zonas de herramientas y equipos", porQue: "Avisa cuando un equipo sale de su sitio." },
    { id: "zonaCiega", donde: "Patios y zonas de cargue", porQue: "Muestra lo que ninguna cámara ve y quién entra ahí." },
    { id: "caidas", donde: "Áreas de trabajo en turno nocturno", porQue: "Avisa cuando una persona cae y no se levanta." },
  ],
  comercial: [
    { id: "hurto", donde: "Pasillos de los locales", porQue: "Distingue un hurto de una compra normal y avisa al guarda." },
    { id: "merodeo", donde: "Entradas y parqueaderos", porQue: "Detecta a quien da vueltas sin entrar ni irse." },
    { id: "aforo", donde: "Entradas de los locales", porQue: "Lleva cuántos hay adentro y avisa al llegar al límite." },
    { id: "cierre", donde: "Puertas de los locales", porQue: "Avisa si la puerta se cierra en horario comercial." },
  ],
  logistica: [
    { id: "intrusion", donde: "Patios y bodegas de noche", porQue: "Avisa cuando alguien entra a una zona restringida." },
    { id: "activos", donde: "Zonas de mercancía de alto valor", porQue: "Avisa cuando algo sale de su sitio." },
    { id: "pasillos", donde: "Pasillos de las bodegas", porQue: "Avisa de lo que se queda estorbando el paso." },
    { id: "puertas", donde: "Muelles de cargue", porQue: "Vigila qué puerta está abierta y desde cuándo." },
  ],
  mixto: [
    { id: "intrusion", donde: "Perímetro de las sedes de noche", porQue: "Avisa con foto y video cuando alguien entra a una zona restringida." },
    { id: "merodeo", donde: "Parqueaderos y accesos", porQue: "Detecta a quien se queda dando vueltas antes de que pase algo." },
    { id: "guardian", donde: "Puestos fijos de portería", porQue: "Confirma que el puesto no quedó solo durante el turno." },
    { id: "abandono", donde: "Lobbies y recepciones", porQue: "Alerta por objetos olvidados o dejados a propósito." },
  ],
};

const analiticasDemo = (escenario: Escenario) => ANALITICAS_DEMO[escenario].filter((a) => analiticaPorId.has(a.id));

function sanearAnaliticas(v: unknown, r: Respuestas, seg: RespuestaSeguimiento[], escenario: Escenario): AnaliticaPropuesta[] | undefined {
  if (!tieneCamaras(r, seg)) return undefined;
  const out: AnaliticaPropuesta[] = [];
  for (const a of Array.isArray(v) ? v : []) {
    const x = obj(a);
    const id = texto(x.id, 40);
    const donde = texto(x.donde, 100);
    const porQue = texto(x.porQue, 200) || (analiticaPorId.get(id)?.corta ?? "");
    if (!analiticaPorId.has(id) || out.some((y) => y.id === id) || !limpio(donde) || !limpio(porQue)) continue;
    out.push({ id, donde, porQue });
    if (out.length === 4) break;
  }
  for (const a of analiticasDemo(escenario)) {
    if (out.length >= 2) break;
    if (!out.some((y) => y.id === a.id)) out.push(a);
  }
  return out;
}

function numSedes(r: Respuestas): number {
  const n = Number.parseInt(r.sedes.replace(/\D+/g, ""), 10);
  if (Number.isFinite(n) && n > 0) return Math.min(n, 2000);
  return { "": 10, "1-50": 5, "51-200": 15, "201-1000": 50, "1000+": 150 }[r.vigilantes];
}
const acotar = (n: number, a: number, b: number) => Math.min(b, Math.max(a, Math.round(n)));

function indicadoresDemo(r: Respuestas, modulos: string[], erp: string): Indicador[] {
  const sedes = numSedes(r);
  const out: Indicador[] = [];
  const tiene = (id: string) => modulos.includes(id);
  if (tiene("control-de-asistencia-y-relevos")) {
    out.push({
      nombre: "Tiempo para confirmar quién llegó al turno",
      unidad: "minutos",
      hoy: acotar(sedes * 2, 15, 120),
      conArs: 5,
      mejorEsMayor: false,
      nota: `Llamadas a ${sedes === 1 ? "la sede" : `${sedes} sedes`} hoy contra marcación con rostro en el celular.`,
    });
  }
  if (tiene("rondas-qr")) {
    out.push({
      nombre: "Rondas con evidencia verificable",
      unidad: "%",
      hoy: contiene(r.datos, "papel") || contiene(r.aplicaciones, "whatsapp") ? 20 : 35,
      conArs: 95,
      mejorEsMayor: true,
      nota: "Hoy se reportan de palabra o por WhatsApp; con QR quedan con foto, hora y ubicación.",
    });
  }
  if (tiene("centro-de-ia") || r.reportes.length) {
    const hoy = acotar(sedes * 0.8, 4, 60);
    out.push({ nombre: "Horas al mes armando informes", unidad: "horas al mes", hoy, conArs: Math.max(1, Math.round(hoy / 10)), mejorEsMayor: false, nota: "Los informes se generan desde los turnos y novedades ya registrados." });
  }
  if (tiene("nomina") || tiene("agente-interoperador-de-datos")) {
    out.push({
      nombre: `Digitación doble entre nómina y ${erp || "contabilidad"}`,
      unidad: "horas por quincena",
      hoy: acotar(sedes / 3, 4, 24),
      conArs: 2,
      mejorEsMayor: false,
      nota: `La nómina sale de los turnos y viaja ${erp ? `a ${erp}` : "a contabilidad"} sin volver a digitarla.`,
    });
  }
  if (out.length < 5 && (tiene("radio-ptt") || tiene("reporte-por-sede") || tiene("chat-corporativo"))) {
    out.push({ nombre: "Novedades con registro consultable", unidad: "%", hoy: 30, conArs: 95, mejorEsMayor: true, nota: "Lo que hoy se dice por radio o WhatsApp queda grabado y ordenado por sede." });
  }
  if (out.length < 3) {
    out.push({ nombre: "Puestos con supervisión verificada", unidad: "%", hoy: 40, conArs: 90, mejorEsMayor: true, nota: "Las revistas quedan con foto, firma, ubicación y hora." });
  }
  if (out.length < 3) {
    out.push({ nombre: "Tiempo para enterarse de una novedad en un puesto", unidad: "minutos", hoy: 45, conArs: 2, mejorEsMayor: false, nota: "La novedad llega a la central o al supervisor en el momento, con foto." });
  }
  return out.slice(0, 5);
}

function sanearIndicadores(v: unknown, respaldo: Indicador[]): Indicador[] {
  const out: Indicador[] = [];
  for (const i of Array.isArray(v) ? v : []) {
    const x = obj(i);
    const nombre = texto(x.nombre, 80);
    const unidad = texto(x.unidad, 30);
    const nota = texto(x.nota, 200);
    const hoy = Number(x.hoy);
    const conArs = Number(x.conArs);
    const mejorEsMayor = x.mejorEsMayor === true;
    if (!nombre || !unidad || !nota || !Number.isFinite(hoy) || !Number.isFinite(conArs) || hoy < 0 || conArs < 0) continue;
    if ([nombre, unidad, nota].some((t) => conDinero(t) || prohibido(t))) continue;
    if (unidad.includes("%") && (hoy > 100 || conArs > 100)) continue;
    if (mejorEsMayor ? conArs <= hoy : conArs >= hoy) continue;
    if (out.some((y) => norm(y.nombre) === norm(nombre))) continue;
    out.push({ nombre, unidad, hoy: Math.round(hoy * 10) / 10, conArs: Math.round(conArs * 10) / 10, mejorEsMayor, nota });
    if (out.length === 5) break;
  }
  for (const i of respaldo) {
    if (out.length >= 3) break;
    if (!out.some((y) => norm(y.nombre) === norm(i.nombre))) out.push(i);
  }
  return out;
}

/* ───────────── Propuesta con IA ───────────── */

function esquemaPropuesta(moduloIds: string[], areaIds: AreaId[], conCamaras: boolean) {
  const str = { type: "string" };
  const listaStr = { type: "array", items: str };
  const o = (properties: Record<string, unknown>) => ({ type: "object", additionalProperties: false, required: Object.keys(properties), properties });
  const moduloEnum = { type: "string", enum: moduloIds };
  return o({
    situacion: str,
    titular: str,
    arsSuple: listaStr,
    seQueda: listaStr,
    modulos: { type: "array", items: o({ area: { type: "string", enum: areaIds }, modulo: moduloEnum, porQue: str }) },
    lineaDeTrabajo: {
      type: "array",
      items: o({ nombre: str, duracion: str, objetivo: str, entregables: listaStr, modulos: { type: "array", items: moduloEnum } }),
    },
    integraciones: { type: "array", items: o({ sistema: str, modo: { type: "string", enum: MODOS }, detalle: str }) },
    reportes: { type: "array", items: o({ nombre: str, para: str, frecuencia: str, contenido: str }) },
    impacto: { type: "array", items: o({ indicador: str, hoy: str, conArs: str }) },
    siguientesPasos: listaStr,
    analiticas: {
      type: "array",
      items: o({ id: { type: "string", enum: conCamaras ? ANALITICAS_PERMITIDAS.map((a) => a.id) : ["ninguna"] }, donde: str, porQue: str }),
    },
    indicadores: {
      type: "array",
      items: o({ nombre: str, unidad: str, hoy: { type: "number" }, conArs: { type: "number" }, mejorEsMayor: { type: "boolean" }, nota: str }),
    },
    escenario: { type: "string", enum: ESCENARIOS },
    estrategiaErp: o({ modo: { type: "string", enum: MODOS_ERP }, sistemas: listaStr, explicacion: str }),
  });
}

const SISTEMA_PROPUESTA = (catalogo: string, conCamaras: boolean) => `Eres el consultor principal de ARS Intelligence, plataforma colombiana que es el sistema operativo de una empresa de seguridad privada. Una persona le contó cómo opera su empresa y respondió unas preguntas de seguimiento. Le armas una PROPUESTA preliminar concreta.

Estilo: español colombiano, trato de usted, cálido y concreto, en las palabras de la persona (repite sus términos: si dijo «puestos», di puestos). Sin jerga técnica.

Contenido:
- situacion: 2–3 frases sobre cómo opera hoy, con sus números y sus herramientas.
- titular: una línea «de X a Y».
- arsSuple: 4–6 frases cortas; CADA una conecta con algo que contó (un dolor, una herramienta, un reporte).
- seQueda: lo que convive con ARS mientras la empresa así lo decida (p. ej. «Su software contable, mientras ustedes lo decidan: el ERP de ARS le entrega la nómina lista», «Sus cámaras y grabadores actuales»). 1–3 frases.
- modulos: 4–9 módulos SOLO del catálogo, el área correcta de cada uno, y porQue de 1 frase para ESTA empresa.
- lineaDeTrabajo: 2–4 fases («Fase N · nombre»), duracion como «4 a 6 semanas (estimado)», objetivo de 1 frase, 2–4 entregables concretos y los ids de módulo de esa fase. Todo módulo propuesto va en alguna fase.
- integraciones: un nodo por CADA aplicación y fuente de datos que mencionó (Excel, WhatsApp, radio, su software contable o administrativo, grabadores, papel, nube…). modo: integra (se conecta y la información fluye entre los dos), centraliza (esa información pasa a vivir en el ERP de ARS: p. ej. la nómina o la contabilidad que hoy está en Excel), migra (se carga una vez a ARS), convive (sigue igual al lado), reemplaza (ARS toma su función operativa, p. ej. WhatsApp o radio). detalle: qué viaja y en qué sentido. ARS conecta por API, por conexión de backend o por cargas programadas. «sistema» es el NOMBRE del sistema o la fuente («Excel de turnos», «Software contable»), nunca una respuesta copiada; no repitas un mismo sistema en dos nodos.
- reportes: 3–6, con destinatario (para) y frecuencia; incluye cada reporte que pidió.
- impacto: 2–4 indicadores operativos (tiempos, evidencia, digitación); conArs SIEMPRE termina en «(estimado)». Prohibido inventar ahorros en dinero o porcentajes de ahorro.
- siguientesPasos: 2–3 pasos (asesor que llama, demo, piloto).
- analiticas: ${
  conCamaras
    ? "2–4 analíticas de video SOLO de la lista de abajo, las que más le sirvan a su operación. «donde» nombra un lugar concreto de SU operación según lo que contó (p. ej. «Porterías de los 12 conjuntos», «Bodega de la sede norte»); «porQue» 1 frase. Las listas de personas son una alerta que verifica un operador."
    : "la persona no tiene cámaras: devuelve una lista vacía."
}
- indicadores: 3–5 indicadores operativos ESTIMADOS para graficar (tiempos, porcentaje de rondas con evidencia, horas de digitación…), NUNCA dinero. hoy y conArs numéricos, plausibles y coherentes con su tamaño (sedes, vigilantes); mejorEsMayor true si más alto es mejor (entonces conArs > hoy; si no, conArs < hoy). «nota»: 1 frase de dónde sale la estimación.
- escenario: según su sector y servicios: residencial (conjuntos, edificios), corporativo (oficinas), industrial (plantas), comercial (locales, centros comerciales), logistica (bodegas, carga) o mixto (varios o no se sabe).
- estrategiaErp: cómo se maneja su parte administrativa. ARS ES un ERP completo (nómina, contabilidad, facturación electrónica, clientes y contratos, cotizador/CRM, costos) y además se adapta: si la empresa ya tiene su sistema, creamos los mecanismos (agente interoperador de datos, API, sincronización o archivos programados) para que todo se centralice en ARS o fluya entre sistemas, según los módulos contratados.
  · modo «ars-centraliza» si no tiene ERP ni software administrativo (solo Excel o papel): el ERP de ARS centraliza nómina, contabilidad y clientes.
  · modo «mixto» (preferido) si tiene ERP o software administrativo: el ERP de ARS asume nómina, operación, clientes y facturación, y lo que la empresa decida conservar recibe la información por el agente interoperador; «fluye-con-su-sistema» solo si la persona dijo explícitamente que no quiere cambiar su sistema administrativo.
  · sistemas: sus sistemas administrativos con nombre genérico, sin marcas («Software contable», «Sistema de nómina»); vacío si no tiene.
  · explicacion: 2–3 frases: qué centraliza ARS, qué fluye y por qué mecanismo; si tiene sistema propio, di que el ERP de ARS puede asumirlo cuando ustedes lo decidan.
  Usa la estrategia sugerida que viene en <estrategia_erp_sugerida> salvo que lo que contó indique claramente otra.

Posicionamiento: ARS tiene su PROPIO ERP; es lo primero que se ofrece para nómina, contabilidad, facturación y clientes. El protagonista de titular, situacion y arsSuple es SIEMPRE el ERP y la plataforma de ARS: nunca escribas que la información «llega a su software contable» como objetivo de la propuesta. Si la empresa tiene otro sistema, va en seQueda / integraciones / estrategiaErp como algo que convive mientras así lo decidan, con «mixto» como modo preferido (ARS asume nómina, operación, clientes y facturación; lo demás fluye). NUNCA nombres marcas de software de terceros (ERP, contables o de nómina), ni aunque la persona las mencione: di «su software contable», «su sistema de nómina» o «su sistema actual». NUNCA digas que «ARS no es un ERP», ni que «no reemplazamos su ERP», ni que ARS «nunca» reemplaza su sistema. Lo correcto: ARS tiene su propio ERP y se adapta a lo que la empresa ya tiene mientras así lo decida.

Límites (nunca los rompas):no prometas lectura de placas, detección de armas, EPP, cámaras térmicas ni detección de fuego o humo. El reconocimiento facial por cámara es solo una alerta que verifica un operador. No hables de SLA, disponibilidad garantizada ni «cero caídas». No nombres clientes ni des cifras de usuarios. La facturación electrónica DIAN y RADIAN está en piloto (dilo así si la propones). La robótica está en desarrollo: no la propongas. No hables de precios.

Catálogo (ids válidos; [piloto] = en piloto):
${catalogo}${conCamaras ? `\n\nAnalíticas de video permitidas (id: nombre — qué hace):\n${catalogoAnaliticas()}` : ""}`;

export function sanearPropuesta(raw: unknown, p: PeticionPropuesta): Propuesta {
  return sinMarcas(sanearPropuestaBase(raw, p));
}

function sanearPropuestaBase(raw: unknown, p: PeticionPropuesta): Propuesta {
  const r = p.respuestas;
  const o = obj(raw);
  const erp = erpDe(r, p.seguimiento);
  const fecha = new Date();

  const modulos: ModuloPropuesto[] = [];
  for (const m of Array.isArray(o.modulos) ? o.modulos : []) {
    const x = moduloPropuestoDe(m);
    if (x && !modulos.some((y) => y.modulo === x.modulo)) modulos.push(x);
    if (modulos.length === 10) break;
  }
  if (modulos.length < 2) throw new Error("propuesta sin módulos válidos");
  const ids = modulos.map((m) => m.modulo);

  const integraciones: Integracion[] = (Array.isArray(o.integraciones) ? o.integraciones : [])
    .map((i) => {
      const x = obj(i);
      const modo = MODOS.includes(x.modo as Integracion["modo"]) ? (x.modo as Integracion["modo"]) : "convive";
      return { sistema: texto(x.sistema, 60), modo, detalle: texto(x.detalle, 220) };
    })
    .filter((i) => i.sistema && i.detalle && limpio(i.detalle))
    // La IA a veces copia una respuesta de seguimiento («Todo se maneja en Excel») como si fuera un sistema.
    .filter((i) => !p.seguimiento.some((s) => norm(s.respuesta) === norm(i.sistema)))
    .filter((i, n, xs) => xs.findIndex((y) => norm(y.sistema) === norm(i.sistema)) === n);

  const reportes: ReporteEntregable[] = (Array.isArray(o.reportes) ? o.reportes : [])
    .map((x) => {
      const y = obj(x);
      return { nombre: texto(y.nombre, 80), para: texto(y.para, 60), frecuencia: texto(y.frecuencia, 40), contenido: texto(y.contenido, 220) };
    })
    .filter((x) => x.nombre && limpio(x.contenido))
    .map((x) => ({ ...x, para: x.para || paraDe(x.nombre), frecuencia: x.frecuencia || frecuenciaDe(x.nombre) }))
    .slice(0, 6);

  const impacto = (Array.isArray(o.impacto) ? o.impacto : [])
    .map((x) => {
      const y = obj(x);
      return { indicador: texto(y.indicador, 80), hoy: texto(y.hoy, 80), conArs: texto(y.conArs, 90) };
    })
    .filter((x) => x.indicador && x.hoy && x.conArs && ![x.indicador, x.hoy, x.conArs].some((s) => conDinero(s) || prohibido(s)))
    .map((x) => ({ ...x, conArs: conEstimado(x.conArs) }))
    .slice(0, 4);

  const demo = propuestaDemo(p);
  const seQueda = lista(o.seQueda, 4, 220).filter(limpio);
  const arsSuple = lista(o.arsSuple, 7, 220).filter(limpio);
  const pasos = lista(o.siguientesPasos, 4, 160).filter(limpio);
  const situacion = texto(o.situacion, 600);
  const escenario = ESCENARIOS.includes(o.escenario as Escenario) ? (o.escenario as Escenario) : escenarioDe(r, p.seguimiento);
  const titular = texto(o.titular, 160);

  return {
    id: idPropuesta(fecha),
    fecha: fecha.toISOString(),
    empresa: r.empresa || demo.empresa,
    contacto: contactoDe(r),
    situacion: limpio(situacion) ? situacion : demo.situacion,
    titular: limpio(titular) ? titular : demo.titular,
    arsSuple: arsSuple.length >= 2 ? arsSuple : demo.arsSuple,
    seQueda: seQueda.length ? seQueda : demo.seQueda,
    modulos,
    lineaDeTrabajo: sanearFases(o.lineaDeTrabajo, ids, r),
    integraciones: completarIntegraciones(integraciones, r, erp),
    reportes: completarReportes(reportes.length ? reportes : demo.reportes, r),
    impacto: impacto.length ? impacto : demo.impacto,
    siguientesPasos: pasos.length ? pasos : demo.siguientesPasos,
    analiticas: sanearAnaliticas(o.analiticas, r, p.seguimiento, escenario),
    indicadores: sanearIndicadores(o.indicadores, indicadoresDemo(r, ids, erp)),
    escenario,
    estrategiaErp: sanearEstrategiaErp(o.estrategiaErp, r, erp),
    aviso: AVISO_PROPUESTA,
  };
}

/** Arma la propuesta con IA y la valida contra el catálogo. */
export async function propuestaIa(p: PeticionPropuesta, cfg: { anthropicKey: string; modelo: string }, signal: AbortSignal): Promise<Propuesta> {
  const r = p.respuestas;
  const candidatas = areasCandidatas(perfilDe(r, p.seguimiento), 4, 7);
  const conCamaras = tieneCamaras(r, p.seguimiento);
  for (const extra of [usaErp(r) || erpDe(r, p.seguimiento) ? "finanzas-y-erp" : null, conCamaras ? "monitoreo-inteligente" : null] as const) {
    if (extra && !candidatas.includes(extra)) candidatas.push(extra);
  }
  const moduloIds = candidatas.flatMap((a) => areaPorId(a)?.modulos.map((m) => m.id) ?? []);
  const client = new Anthropic({ apiKey: cfg.anthropicKey, maxRetries: 1 });
  const usuario = `<respuestas>${resumenRespuestas(r)}</respuestas>
<seguimiento>${JSON.stringify(p.seguimiento.map(({ pregunta, respuesta }) => ({ pregunta, respuesta })))}</seguimiento>
<erp_detectado>${erpDe(r, p.seguimiento) || "no dijo"}</erp_detectado>
<estrategia_erp_sugerida>${JSON.stringify(estrategiaErpDemo(r, erpDe(r, p.seguimiento)))}</estrategia_erp_sugerida>`;
  const raw = await llamarJson(
    client,
    cfg.modelo,
    {
      system: SISTEMA_PROPUESTA(catalogoCompacto(candidatas), conCamaras),
      usuario,
      schema: esquemaPropuesta(moduloIds, candidatas, conCamaras),
      effort: "medium",
      maxTokens: 12_000,
    },
    signal,
  );
  return sanearPropuesta(raw, p);
}
