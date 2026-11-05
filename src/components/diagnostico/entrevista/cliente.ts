/** Cliente de las APIs del diagnóstico (navegador). */
import {
  CLAVE_ALMACEN,
  type Diagnostico,
  type PerfilEmpresa,
  type PeticionDiagnostico,
  type RespuestaAdjunto,
  type RespuestaDiagnostico,
} from "@/data/diagnostico/tipos";
import { MAX_PETICION } from "./adjuntos";
import type { EventoEntrevista, PeticionTurno } from "./eventos";

/** Envía un turno y llama `alEvento` por cada línea NDJSON recibida. */
export async function turnoEntrevista(peticion: PeticionTurno, alEvento: (e: EventoEntrevista) => void, signal?: AbortSignal) {
  const res = await fetch("/api/diagnostico/entrevista", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(peticion),
    signal,
  });
  if (!res.ok || !res.body) {
    let mensaje = "No pude conectarme. Intenta de nuevo.";
    try {
      const j = (await res.json()) as { mensaje?: string };
      if (j.mensaje) mensaje = j.mensaje;
    } catch {
      /* sin cuerpo JSON */
    }
    alEvento({ t: "error", mensaje });
    return;
  }
  const lector = res.body.getReader();
  const dec = new TextDecoder();
  let resto = "";
  for (;;) {
    const { value, done } = await lector.read();
    if (done) break;
    resto += dec.decode(value, { stream: true });
    const lineas = resto.split("\n");
    resto = lineas.pop() ?? "";
    for (const l of lineas) {
      if (!l.trim()) continue;
      try {
        alEvento(JSON.parse(l) as EventoEntrevista);
      } catch {
        /* línea corrupta: se ignora */
      }
    }
  }
  if (resto.trim()) {
    try {
      alEvento(JSON.parse(resto) as EventoEntrevista);
    } catch {
      /* ignorar */
    }
  }
}

/**
 * Sube un adjunto a /api/diagnostico/adjuntos para que la IA lo «mire».
 * Video: se mandan los `fotograma` (JPEG) y el archivo solo si cabe en la
 * petición; si no, van `nombre`/`mime`/`bytes` para identificarlo.
 */
export async function analizarAdjunto(
  archivo: File,
  perfil: Partial<PerfilEmpresa>,
  fotogramas?: Blob[],
  signal?: AbortSignal,
): Promise<RespuestaAdjunto> {
  const form = new FormData();
  const pesoFotogramas = (fotogramas ?? []).reduce((s, b) => s + b.size, 0);
  const cabe = archivo.size + pesoFotogramas <= MAX_PETICION;
  if (cabe) form.append("archivo", archivo, archivo.name);
  else if (!fotogramas?.length) return { ok: false, mensaje: `«${archivo.name}» pesa demasiado (máx. ${Math.round(MAX_PETICION / 1_000_000)} MB). Prueba con una versión más liviana.` };
  form.append("nombre", archivo.name);
  form.append("mime", archivo.type || "application/octet-stream");
  form.append("bytes", String(archivo.size));
  form.append("perfil", JSON.stringify(perfil));
  fotogramas?.forEach((b, i) => form.append("fotograma", b, `fotograma-${i + 1}.jpg`));
  try {
    const res = await fetch("/api/diagnostico/adjuntos", { method: "POST", body: form, signal });
    try {
      const j = (await res.json()) as RespuestaAdjunto;
      if (j && typeof j === "object" && "ok" in j) return j;
    } catch {
      /* sin JSON */
    }
    return { ok: false, mensaje: res.status === 413 ? "El archivo es demasiado pesado para analizarlo." : "No pude analizar este archivo ahora. Intenta de nuevo en un momento." };
  } catch (err) {
    if (signal?.aborted) throw err;
    return { ok: false, mensaje: "No pude subir el archivo. Revisa tu conexión." };
  }
}

export async function pedirDiagnostico(peticion: PeticionDiagnostico, signal?: AbortSignal): Promise<RespuestaDiagnostico> {
  try {
    const res = await fetch("/api/diagnostico", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(peticion),
      signal,
    });
    return (await res.json()) as RespuestaDiagnostico;
  } catch (err) {
    if (signal?.aborted) throw err;
    return { ok: false, mensaje: "No pude conectarme con el servidor. Revisa tu conexión e intenta de nuevo." };
  }
}

export function guardarDiagnostico(d: Diagnostico) {
  try {
    sessionStorage.setItem(CLAVE_ALMACEN, JSON.stringify(d));
  } catch {
    /* almacenamiento no disponible */
  }
}

export function leerDiagnostico(): Diagnostico | null {
  try {
    const raw = sessionStorage.getItem(CLAVE_ALMACEN);
    if (!raw) return null;
    const d = JSON.parse(raw) as Diagnostico;
    return d && typeof d === "object" && Array.isArray(d.capitulos) && d.perfil ? d : null;
  } catch {
    return null;
  }
}
