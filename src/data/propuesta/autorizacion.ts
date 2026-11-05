/**
 * Autorización de tratamiento de datos personales (Ley 1581 de 2012) que la persona acepta en el
 * último paso de la entrevista de la «Propuesta ARS», antes de armarla y enviarla.
 *
 * El navegador solo manda `respuestas.autoriza = true`; el servidor guarda en el registro el TEXTO
 * de la versión vigente con la fecha, como evidencia. La casilla de la entrevista pinta este mismo
 * texto: así lo que la persona lee y lo que queda guardado no pueden separarse.
 * Si cambias el texto, crea una versión nueva (no edites una publicada: los registros viejos deben
 * poder mostrar lo que la persona aceptó).
 *
 * Sin dependencias: lo usan el navegador, el servidor y las pruebas (`npm run test:registros`).
 */

export const VERSION_AUTORIZACION_PROPUESTA = "2026-11-05";

/** Texto de cada versión publicada. */
export const TEXTOS_AUTORIZACION_PROPUESTA: Record<string, string> = {
  "2026-11-05":
    "Autorizo a ARS Intelligence a tratar mis datos personales para preparar esta propuesta y contactarme, conforme a la " +
    "Ley 1581 de 2012 y su política de tratamiento de datos. Puedo consultar, actualizar o pedir la supresión de mis " +
    "datos en cualquier momento.",
};

/** El texto vigente: el que pinta la casilla de la entrevista. */
export const TEXTO_AUTORIZACION_PROPUESTA: string = TEXTOS_AUTORIZACION_PROPUESTA[VERSION_AUTORIZACION_PROPUESTA];

/** Evidencia que queda en el registro (misma forma que la del diagnóstico). null si no la aceptó. */
export function autorizacionPropuesta(aceptada: unknown, ahora: Date = new Date()): { texto: string; version: string; fecha: string } | null {
  if (aceptada !== true) return null;
  return { texto: TEXTO_AUTORIZACION_PROPUESTA, version: VERSION_AUTORIZACION_PROPUESTA, fecha: ahora.toISOString() };
}
