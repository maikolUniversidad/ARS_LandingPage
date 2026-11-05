/**
 * Autorización de tratamiento de datos personales (Ley 1581 de 2012, Decreto 1377 de 2013)
 * que la persona acepta antes del análisis del diagnóstico.
 *
 * El navegador solo manda `{ version, aceptada }`; el servidor guarda en el registro el TEXTO
 * oficial de esa versión con la fecha, como evidencia. Si cambias el texto, crea una versión nueva
 * (no edites una publicada: los registros viejos deben poder mostrar lo que la persona aceptó).
 *
 * Sin dependencias: lo usan el navegador, el servidor y las pruebas (`npm run test:registros`).
 */

export const VERSION_AUTORIZACION = "2026-11-05";

/** Texto de cada versión publicada. `{correo}` se reemplaza por el correo de atención. */
export const TEXTOS_AUTORIZACION: Record<string, string> = {
  "2026-11-05":
    "Autorizo a ARS Intelligence, como responsable del tratamiento, a recolectar, guardar y usar mis datos de contacto " +
    "(nombre, cargo, correo y teléfono) y lo que conté en este diagnóstico, con la finalidad de enviarme el reporte y " +
    "contactarme sobre los servicios de ARS. Sé que lo que conté y escribí en la entrevista, incluidos los datos que " +
    "haya dado en ella, lo analizan proveedores de inteligencia artificial que pueden estar fuera de Colombia. " +
    "Puedo conocer, actualizar, rectificar y suprimir mis datos, o revocar esta autorización, escribiendo a {correo}. " +
    "(Ley 1581 de 2012 y Decreto 1377 de 2013).",
};

/** Evidencia que queda en el registro. */
export type AutorizacionDatos = { texto: string; version: string; fecha: string };

/** Lo que manda el navegador en `PeticionDiagnostico.autorizacion`. */
export type AceptacionAutorizacion = { version: string; aceptada: boolean };

export function textoAutorizacion(version: string, correo: string): string | null {
  // Solo versiones propias del objeto ("__proto__", "toString"… no son versiones).
  const t = Object.hasOwn(TEXTOS_AUTORIZACION, version) ? TEXTOS_AUTORIZACION[version] : undefined;
  return typeof t === "string" ? t.replaceAll("{correo}", correo) : null;
}

/**
 * Evidencia de la autorización a partir de lo que mandó el navegador.
 * null si no la aceptó o si la versión no existe.
 */
export function autorizacionDe(raw: unknown, correo: string, ahora: Date = new Date()): AutorizacionDatos | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (o.aceptada !== true || typeof o.version !== "string") return null;
  const texto = textoAutorizacion(o.version, correo);
  return texto ? { texto, version: o.version, fecha: ahora.toISOString() } : null;
}
