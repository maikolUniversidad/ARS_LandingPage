/**
 * Reintento en segundo plano, dentro del proceso, de los registros que quedaron
 * «pendiente» en la copia local (además de POST /api/registros/reintentar).
 * Lo arranca src/instrumentation.ts solo si el push a ARS está configurado.
 *
 * Sin dependencias (ni de Next ni de los otros módulos) para poder probarlo con
 * `node --test`: quien lo arranca le pasa la función que reintenta.
 */

export type ResultadoReintento = { revisados: number; enviados: string[]; fallidos: string[] };

export type Log = Pick<Console, "info" | "warn" | "error">;

export type OpcionesReintentoFondo = {
  intervaloMs: number;
  reintentar: () => Promise<ResultadoReintento>;
  log?: Log;
};

/** Cada cuánto se reintenta (REGISTROS_REINTENTO_MS). 0 = apagado; mínimo 30 s; por defecto 5 min. */
export function intervaloReintento(valor: string | undefined = process.env.REGISTROS_REINTENTO_MS): number {
  const v = valor?.trim();
  if (!v) return 300_000;
  const n = Number.parseInt(v, 10);
  if (!Number.isFinite(n)) return 300_000;
  if (n <= 0) return 0;
  return Math.min(86_400_000, Math.max(30_000, n));
}

/** true si el último error guardado fue un rechazo definitivo de ARS (4xx salvo 408 y 429): no se reenvía solo. */
export function rechazoDefinitivo(error: string | null | undefined): boolean {
  return /^HTTP 4(?!08|29)\d\d\b/.test(error ?? "");
}

type Ciclo = { reloj: ReturnType<typeof setInterval>; corriendo: boolean };

// En globalThis: un solo ciclo por proceso aunque el módulo se cargue más de una vez.
const CLAVE = Symbol.for("ars.registros.reintento-fondo");
const global_ = globalThis as typeof globalThis & { [CLAVE]?: Ciclo };

/** Ejecuta una pasada (sin solaparse con otra en curso). Devuelve null si ya había una corriendo. */
async function pasada(ciclo: Ciclo, op: OpcionesReintentoFondo, log: Log): Promise<ResultadoReintento | null> {
  if (ciclo.corriendo) return null;
  ciclo.corriendo = true;
  try {
    const r = await op.reintentar();
    if (r.revisados) {
      log.info(`[registros] Reintento de fondo: ${r.enviados.length} enviado(s) y ${r.fallidos.length} fallido(s) de ${r.revisados}.`);
    }
    return r;
  } catch (err) {
    log.error(`[registros] Reintento de fondo falló: ${err instanceof Error ? err.message : String(err)}`);
    return null;
  } finally {
    ciclo.corriendo = false;
  }
}

/** Arranca el ciclo una sola vez por proceso. Devuelve false si ya estaba o si el intervalo es 0. */
export function iniciarReintentoFondo(op: OpcionesReintentoFondo): boolean {
  const log = op.log ?? console;
  if (global_[CLAVE] || op.intervaloMs <= 0) return false;
  const ciclo: Ciclo = { corriendo: false, reloj: undefined as unknown as ReturnType<typeof setInterval> };
  ciclo.reloj = setInterval(() => void pasada(ciclo, op, log), op.intervaloMs);
  // No mantiene vivo el proceso por sí solo.
  ciclo.reloj.unref?.();
  global_[CLAVE] = ciclo;
  log.info(`[registros] Reintento de fondo cada ${Math.round(op.intervaloMs / 1000)} s de los registros pendientes.`);
  return true;
}

/** Para el ciclo (pruebas y apagado). */
export function detenerReintentoFondo(): void {
  const ciclo = global_[CLAVE];
  if (ciclo) clearInterval(ciclo.reloj);
  delete global_[CLAVE];
}
