/** Construcción de registros: id legible, origen (IP con hash) y saneo de entradas. */
import { createHash, randomBytes } from "node:crypto";
import type {
  AdjuntoTurno,
  ContactoDiagnostico,
  Diagnostico,
  PeticionDiagnostico,
  TipoAdjunto,
} from "@/data/diagnostico/tipos";
import { autorizacionDe } from "@/data/diagnostico/autorizacion";
import { ipDe } from "@/lib/asistente/servidor";
import { CONTACT_EMAIL } from "@/lib/contact";
import { configRegistros, entornoRegistro } from "./config";
import { cuerpoPropuesta, type DatosPropuesta } from "./propuesta";
import {
  VERSION_REGISTRO,
  type OrigenRegistro,
  type RegistroContacto,
  type RegistroDiagnostico,
  type RegistroPropuesta,
  type TipoRegistro,
} from "./tipos";

/** Alfabeto Crockford (sin I, L, O, U): legible por teléfono. */
const ALFABETO = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const PREFIJO: Record<TipoRegistro, string> = { contacto: "CONT", diagnostico: "DIAG", propuesta: "PROP" };
export const ID_RE = /^(CONT|DIAG|PROP)-\d{4}-[0-9A-HJKMNP-TV-Z]{6}$/;

/** CONT-2026-7K3QF2 / DIAG-2026-M4X9PA / PROP-2026-9T4HKB (32^6 ≈ 1.000 millones por año). */
export function nuevoId(tipo: TipoRegistro, fecha = new Date()): string {
  const bytes = randomBytes(6);
  const sufijo = Array.from(bytes, (b) => ALFABETO[b % 32]).join("");
  return `${PREFIJO[tipo]}-${fecha.getUTCFullYear()}-${sufijo}`;
}

const texto = (v: unknown, max: number): string => (typeof v === "string" ? v.trim().slice(0, max) : "");
const opcional = (v: unknown, max: number): string | undefined => texto(v, max) || undefined;

function rutaDe(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).pathname.slice(0, 200);
  } catch {
    return null;
  }
}

/** Origen del registro. `pagina` explícita (del cliente) gana sobre el Referer. */
export function origenDe(req: Request, pagina?: unknown): OrigenRegistro {
  const cfg = configRegistros();
  const ip = ipDe(req);
  const explicita = texto(pagina, 200);
  return {
    pagina: explicita.startsWith("/") ? explicita : rutaDe(req.headers.get("referer")),
    sitio: texto(req.headers.get("x-forwarded-host") ?? req.headers.get("host"), 200) || null,
    ipHash: createHash("sha256").update(`${cfg.salIp}:${ip}`).digest("hex").slice(0, 32),
    userAgent: texto(req.headers.get("user-agent"), 300) || null,
    entorno: entornoRegistro(),
  };
}

function base<T extends TipoRegistro>(tipo: T, req: Request, pagina?: unknown) {
  const ahora = new Date();
  const iso = ahora.toISOString();
  return {
    id: nuevoId(tipo, ahora),
    tipo,
    version: VERSION_REGISTRO,
    creado: iso,
    actualizado: iso,
    estado: "nuevo" as const,
    historialEstados: [{ estado: "nuevo" as const, fecha: iso }],
    origen: origenDe(req, pagina),
  };
}

export function registroContacto(
  req: Request,
  datos: { nombre: string; email: string; empresa?: string; telefono?: string; mensaje: string; pagina?: unknown },
): RegistroContacto {
  return {
    ...base("contacto", req, datos.pagina),
    contacto: {
      nombre: datos.nombre,
      email: datos.email,
      empresa: datos.empresa || null,
      telefono: datos.telefono || null,
    },
    mensaje: datos.mensaje,
  };
}

/* ───────────── Diagnóstico ───────────── */

const TIPOS_ADJUNTO: TipoAdjunto[] = ["imagen", "video", "documento", "audio"];

/** Adjuntos del cuerpo crudo (por si la validación de la petición no los conserva). */
export function adjuntosDe(raw: unknown): AdjuntoTurno[] {
  const lista = raw && typeof raw === "object" ? (raw as Record<string, unknown>).adjuntos : null;
  if (!Array.isArray(lista)) return [];
  return lista.slice(0, 20).flatMap((a): AdjuntoTurno[] => {
    if (!a || typeof a !== "object") return [];
    const o = a as Record<string, unknown>;
    const tipo = TIPOS_ADJUNTO.find((t) => t === o.tipo);
    const nombre = texto(o.nombre, 200);
    if (!tipo || !nombre) return [];
    return [
      {
        id: texto(o.id, 80) || nombre,
        nombre,
        tipo,
        resumen: texto(o.resumen, 1_000),
        hallazgos: (Array.isArray(o.hallazgos) ? o.hallazgos : []).map((h) => texto(h, 400)).filter(Boolean).slice(0, 12),
      },
    ];
  });
}

/** Contacto del perfil crudo (por si la validación de la petición no lo conserva). */
export function contactoDe(raw: unknown): ContactoDiagnostico | null {
  const perfil = raw && typeof raw === "object" ? (raw as Record<string, unknown>).perfil : null;
  const c = perfil && typeof perfil === "object" ? (perfil as Record<string, unknown>).contacto : null;
  if (!c || typeof c !== "object") return null;
  const o = c as Record<string, unknown>;
  const contacto: ContactoDiagnostico = {
    nombre: opcional(o.nombre, 120),
    cargo: opcional(o.cargo, 120),
    email: opcional(o.email, 200),
    telefono: opcional(o.telefono, 40),
  };
  const limpio = Object.fromEntries(Object.entries(contacto).filter(([, v]) => v)) as ContactoDiagnostico;
  return Object.keys(limpio).length ? limpio : null;
}

export function registroDiagnostico(
  req: Request,
  peticion: PeticionDiagnostico,
  diagnostico: Diagnostico,
  raw: unknown,
): RegistroDiagnostico {
  const adjuntos = peticion.adjuntos?.length ? peticion.adjuntos : adjuntosDe(raw);
  // Los datos de contacto solo se guardan con la autorización de datos aceptada (Ley 1581).
  const autorizacion = autorizacionDe(peticion.autorizacion, CONTACT_EMAIL);
  const contacto = autorizacion ? (peticion.perfil.contacto ?? contactoDe(raw)) : null;
  const { contacto: _sinAutorizacion, ...perfilSinContacto } = peticion.perfil;
  void _sinAutorizacion;
  const perfil = contacto ? { ...perfilSinContacto, contacto } : perfilSinContacto;
  // El reporte copia el perfil: sin autorización tampoco lleva el contacto.
  const reporte = contacto ? diagnostico : { ...diagnostico, perfil: { ...diagnostico.perfil, contacto: undefined } };
  const pagina = raw && typeof raw === "object" ? (raw as Record<string, unknown>).pagina : undefined;
  return {
    ...base("diagnostico", req, pagina ?? "/diagnostico"),
    fuente: diagnostico.fuente,
    empresa: perfil.nombre,
    contacto,
    autorizacion,
    perfil,
    conversacion: peticion.conversacion,
    adjuntos,
    resumen: {
      titular: diagnostico.titular,
      madurezHoy: diagnostico.madurez.hoy,
      madurezConArs: diagnostico.madurez.conArs,
      areasRecomendadas: diagnostico.recomendaciones.map((r) => r.areaId),
      prioridadAlta: diagnostico.recomendaciones.filter((r) => r.prioridad === "alta").map((r) => r.areaId),
    },
    diagnostico: reporte,
  };
}

/* ───────────── Propuesta ARS ───────────── */

/** Registro de una propuesta enviada a un asesor (/api/propuesta/enviar). Ver `./propuesta.ts`. */
export function registroPropuesta(req: Request, datos: DatosPropuesta & { pagina?: unknown }): RegistroPropuesta {
  const { pagina, ...resto } = datos;
  return { ...base("propuesta", req, pagina), ...cuerpoPropuesta(resto) };
}
