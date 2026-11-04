/**
 * Utilidades de servidor del asistente: configuración desde variables de
 * entorno, límite de peticiones y validación del cuerpo del chat.
 * Las claves solo se leen aquí (nunca NEXT_PUBLIC_*).
 */
import { analiticas } from "@/data/analiticas";
import {
  CLAVES_PERFIL,
  LIMITES,
  TIPOS_IMAGEN,
  type ClavePerfil,
  type DocumentoAdjunto,
  type EstadoServicios,
  type PasoRecorrido,
  type PeticionChat,
} from "./tipos";

export const MODELO_POR_DEFECTO = "claude-sonnet-5-5";

export function configuracion() {
  const anthropic = process.env.ANTHROPIC_API_KEY?.trim() || "";
  const eleven = process.env.ELEVENLABS_API_KEY?.trim() || "";
  return {
    anthropicKey: anthropic,
    modelo: process.env.ASISTENTE_MODELO?.trim() || MODELO_POR_DEFECTO,
    elevenKey: eleven,
    vozId: process.env.ELEVENLABS_VOICE_ID?.trim() || "",
    agenteId: process.env.ELEVENLABS_AGENT_ID?.trim() || "",
    modeloTts: process.env.ELEVENLABS_TTS_MODEL?.trim() || "eleven_flash_v2_5",
  };
}

export function estadoServicios(): EstadoServicios {
  const c = configuracion();
  return {
    chat: Boolean(c.anthropicKey) || (process.env.NODE_ENV !== "production" && process.env.ASISTENTE_DEMO === "1"),
    modelo: c.modelo,
    voz: {
      tts: Boolean(c.elevenKey && c.vozId),
      stt: Boolean(c.elevenKey),
      agente: Boolean(c.elevenKey && c.agenteId),
    },
  };
}

/* ───────────── Límite de peticiones (memoria del proceso, best-effort) ───────────── */

const ventanas = new Map<string, number[]>();

export function ipDe(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd?.split(",")[0] ?? req.headers.get("x-real-ip") ?? "local").trim();
}

/** true si la IP superó `max` peticiones en `ventanaMs` para este `cubo`. */
export function limitado(req: Request, cubo: string, max: number, ventanaMs = 60_000): boolean {
  const clave = `${cubo}:${ipDe(req)}`;
  const ahora = Date.now();
  const previas = (ventanas.get(clave) ?? []).filter((t) => ahora - t < ventanaMs);
  previas.push(ahora);
  ventanas.set(clave, previas);
  if (ventanas.size > 5_000) {
    for (const [k, v] of ventanas) if (!v.some((t) => ahora - t < ventanaMs)) ventanas.delete(k);
  }
  return previas.length > max;
}

/* ───────────── Validación del cuerpo del chat ───────────── */

const ids = new Set(analiticas.map((a) => a.id));
const B64 = /^[A-Za-z0-9+/]+={0,2}$/;
const s = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");

function documento(v: unknown): DocumentoAdjunto | null {
  if (!v || typeof v !== "object") return null;
  const d = v as Record<string, unknown>;
  const tipo = s(d.tipo, 60);
  const codificacion = d.codificacion === "texto" ? "texto" : "base64";
  const datos = typeof d.datos === "string" ? d.datos : "";
  const nombre = s(d.nombre, 160) || "documento";
  const bytes = typeof d.bytes === "number" && d.bytes > 0 ? d.bytes : datos.length;
  if (d.codificacion === "fotogramas") {
    const lista = Array.isArray(d.fotogramas) ? d.fotogramas : [];
    const fotogramas = lista
      .slice(0, LIMITES.fotogramasMax)
      .map((f) => {
        const o = (f && typeof f === "object" ? f : {}) as Record<string, unknown>;
        const t = typeof o.t === "number" && Number.isFinite(o.t) ? Math.max(0, o.t) : 0;
        const b = typeof o.datos === "string" ? o.datos : "";
        return B64.test(b.slice(0, 1000)) && b.length > 100 ? { t, datos: b } : null;
      })
      .filter((f): f is { t: number; datos: string } => f !== null);
    if (!fotogramas.length) return null;
    const duracion = typeof d.duracion === "number" && Number.isFinite(d.duracion) ? d.duracion : undefined;
    // Para el límite cuentan los bytes reales que viajan (los fotogramas), no el video original.
    const reales = Math.round(fotogramas.reduce((n, f) => n + f.datos.length, 0) * 0.75);
    return { id: s(d.id, 60), nombre, tipo: "video/fotogramas", bytes: reales, datos: "", codificacion: "fotogramas", fotogramas, duracion };
  }
  if (!datos) return null;
  if (codificacion === "texto") {
    return { id: s(d.id, 60), nombre, tipo: "text/plain", bytes, datos: datos.slice(0, LIMITES.textoCaracteres), codificacion };
  }
  const esImagen = (TIPOS_IMAGEN as readonly string[]).includes(tipo);
  if (tipo !== "application/pdf" && !esImagen) return null;
  if (!B64.test(datos.slice(0, 1000))) return null;
  return { id: s(d.id, 60), nombre, tipo, bytes, datos, codificacion };
}

function perfilValido(v: unknown): Partial<Record<ClavePerfil, string>> | undefined {
  if (!v || typeof v !== "object") return undefined;
  const o = v as Record<string, unknown>;
  const out: Partial<Record<ClavePerfil, string>> = {};
  for (const k of CLAVES_PERFIL) {
    const val = s(o[k], 160).trim();
    if (val) out[k] = val;
  }
  return Object.keys(out).length ? out : undefined;
}

function recorridoValido(v: unknown): PasoRecorrido[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const out = v.slice(-12).map((p) => {
    const o = (p && typeof p === "object" ? p : {}) as Record<string, unknown>;
    return {
      ruta: s(o.ruta, 120),
      ancla: s(o.ancla, 80),
      titulo: s(o.titulo, 120),
      haceSeg: typeof o.haceSeg === "number" && o.haceSeg >= 0 ? Math.round(o.haceSeg) : 0,
    };
  });
  return out.filter((p) => p.ruta).length ? out.filter((p) => p.ruta) : undefined;
}

export type ErrorValidacion = { codigo: "invalido" | "muy_grande"; mensaje: string };

export function validarPeticion(raw: unknown): PeticionChat | ErrorValidacion {
  if (!raw || typeof raw !== "object") return { codigo: "invalido", mensaje: "Cuerpo inválido" };
  const r = raw as Record<string, unknown>;
  const lista = Array.isArray(r.mensajes) ? r.mensajes : [];
  const mensajes = lista
    .slice(-LIMITES.historialMensajes)
    .map((m) => {
      const o = (m && typeof m === "object" ? m : {}) as Record<string, unknown>;
      const rol: "user" | "assistant" = o.rol === "assistant" ? "assistant" : "user";
      return { rol, texto: s(o.texto, LIMITES.mensajeCaracteres).trim() };
    })
    .filter((m) => m.texto.length > 0);
  // La conversación debe empezar con el usuario y terminar con el usuario.
  while (mensajes.length && mensajes[0].rol !== "user") mensajes.shift();
  if (!mensajes.length || mensajes[mensajes.length - 1].rol !== "user") {
    return { codigo: "invalido", mensaje: "Falta el mensaje del usuario" };
  }

  const c = (r.contexto && typeof r.contexto === "object" ? r.contexto : {}) as Record<string, unknown>;
  const sec = c.seccion && typeof c.seccion === "object" ? (c.seccion as Record<string, unknown>) : null;
  const an = c.analitica && typeof c.analitica === "object" ? (c.analitica as Record<string, unknown>) : null;
  const anId = an ? s(an.id, 80) : "";
  const contexto: PeticionChat["contexto"] = {
    ruta: s(c.ruta, 200) || "/",
    ancla: s(c.ancla, 120),
    tituloDocumento: s(c.tituloDocumento, 200),
    seccion: sec ? { id: s(sec.id, 80), titulo: s(sec.titulo, 200) } : null,
    analitica: an && ids.has(anId) ? { id: anId, nombre: s(an.nombre, 160) } : null,
    idioma: c.idioma === "en" ? "en" : "es",
    perfil: perfilValido(c.perfil),
    recorrido: recorridoValido(c.recorrido),
    resumenPrevio: s(c.resumenPrevio, 3000) || undefined,
  };

  const docsRaw = Array.isArray(r.documentos) ? r.documentos : [];
  if (docsRaw.length > LIMITES.documentosMax) {
    return { codigo: "muy_grande", mensaje: `Máximo ${LIMITES.documentosMax} documentos a la vez` };
  }
  const documentos = docsRaw.map(documento).filter((d): d is DocumentoAdjunto => d !== null);
  const total = documentos.reduce((n, d) => n + d.bytes, 0);
  if (total > LIMITES.documentosBytes * 1.05) {
    return { codigo: "muy_grande", mensaje: "Los documentos superan el límite total" };
  }

  return { mensajes, contexto, documentos, modo: r.modo === "voz" ? "voz" : "texto" };
}
