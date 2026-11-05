/**
 * Llamadas a /api/propuesta/* y persistencia en sessionStorage.
 * En desarrollo, si una ruta aún no existe (404), usa datos de ejemplo para
 * poder probar la experiencia completa.
 */
import { PROPUESTA_EJEMPLO } from "@/data/propuesta/ejemplo";
import type {
  PeticionEnvio,
  PeticionPreguntas,
  PeticionPropuesta,
  PreguntaSeguimiento,
  Propuesta,
  Respuestas,
  RespuestaEnvio,
  RespuestaPreguntas,
  RespuestaPropuesta,
  RespuestaSeguimiento,
} from "@/data/propuesta/tipos";

const DEV = process.env.NODE_ENV === "development";

const PREGUNTAS_DEMO: PreguntaSeguimiento[] = [
  {
    id: "demo-turnos",
    pregunta: "¿Cómo programan hoy los turnos de sus sedes?",
    porQue: "Para saber por dónde empezar la migración de sus turnos.",
    opciones: ["Un Excel por coordinador", "Un Excel central", "En papel", "En una app"],
  },
  {
    id: "demo-cliente",
    pregunta: "¿Sus clientes le exigen evidencia de las rondas?",
    porQue: "Para decidir si las rondas con QR van en la primera fase.",
    opciones: ["Sí, cada mes", "Solo algunos", "Todavía no"],
  },
];

async function postJson<T>(url: string, cuerpo: unknown, signal?: AbortSignal): Promise<{ status: number; json: T | null }> {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cuerpo), signal });
  let json: T | null = null;
  try {
    json = (await res.json()) as T;
  } catch {
    json = null;
  }
  return { status: res.status, json };
}

/** Preguntas de seguimiento. Nunca lanza: si falla o tarda más de `ms`, devuelve []. */
export async function pedirPreguntas(respuestas: Partial<Respuestas>, ms = 10_000): Promise<PreguntaSeguimiento[]> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const cuerpo: PeticionPreguntas = { respuestas };
    const { status, json } = await postJson<RespuestaPreguntas>("/api/propuesta/preguntas", cuerpo, ctrl.signal);
    if (status === 404 && DEV) return PREGUNTAS_DEMO;
    if (json && json.ok) return json.preguntas.filter((p) => p && p.id && p.pregunta).slice(0, 3);
    return [];
  } catch {
    return [];
  } finally {
    clearTimeout(t);
  }
}

export async function pedirPropuesta(peticion: PeticionPropuesta, signal?: AbortSignal): Promise<RespuestaPropuesta> {
  try {
    const { status, json } = await postJson<RespuestaPropuesta>("/api/propuesta", peticion, signal);
    if (status === 404 && DEV) {
      const r = peticion.respuestas;
      return {
        ok: true,
        propuesta: {
          ...PROPUESTA_EJEMPLO,
          empresa: r.empresa || PROPUESTA_EJEMPLO.empresa,
          contacto: { nombre: r.nombre, cargo: r.cargo, email: r.email, telefono: r.telefono, ciudad: r.ciudad },
          fecha: new Date().toISOString(),
        },
      };
    }
    if (json && typeof json === "object" && "ok" in json) return json;
    return { ok: false, mensaje: "No pudimos armar la propuesta en este momento." };
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw e;
    return { ok: false, mensaje: "Parece que se cayó la conexión mientras armábamos la propuesta." };
  }
}

export async function enviarPropuesta(peticion: PeticionEnvio): Promise<RespuestaEnvio> {
  try {
    const { status, json } = await postJson<RespuestaEnvio>("/api/propuesta/enviar", peticion);
    if (json && typeof json === "object" && "ok" in json) return json;
    if (status === 404 && DEV) return { ok: false, mensaje: "La ruta de envío aún no está lista (desarrollo)." };
    return { ok: false, mensaje: "No pudimos enviarla en este momento." };
  } catch {
    return { ok: false, mensaje: "Parece que se cayó la conexión." };
  }
}

/* ───────────── sessionStorage ───────────── */

const CLAVE = "ars-propuesta-v1";

export type Guardado = {
  respuestas: Respuestas;
  paso: number;
  seguimiento: RespuestaSeguimiento[];
  propuesta: Propuesta | null;
  enviada: boolean;
};

export function leerGuardado(): Partial<Guardado> | null {
  try {
    const crudo = window.sessionStorage.getItem(CLAVE);
    if (!crudo) return null;
    const v = JSON.parse(crudo) as unknown;
    return v && typeof v === "object" ? (v as Partial<Guardado>) : null;
  } catch {
    return null;
  }
}

export function escribirGuardado(g: Guardado) {
  try {
    window.sessionStorage.setItem(CLAVE, JSON.stringify(g));
  } catch {
    /* almacenamiento no disponible */
  }
}

export function borrarGuardado() {
  try {
    window.sessionStorage.removeItem(CLAVE);
  } catch {
    /* almacenamiento no disponible */
  }
}
