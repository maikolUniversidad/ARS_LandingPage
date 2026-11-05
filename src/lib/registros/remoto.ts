/**
 * Adaptador «ARS remoto»: POST JSON firmado (HMAC-SHA256) al módulo de registros
 * del ERP de ARS. Contrato en docs/BACKEND-REGISTROS.md §3.
 */
import { createHmac } from "node:crypto";
import type { AlmacenRegistros } from "./almacen";
import { VERSION_REGISTRO, type EventoRegistro, type Registro, type RegistroLocal } from "./tipos";

/** Error que no vale la pena reintentar (4xx: el servidor rechazó el cuerpo o la firma). */
export class ErrorDefinitivo extends Error {}

export type Firma = { timestamp: string; firma: string };

/** firma = hex(HMAC-SHA256(secreto, `${timestamp}.${cuerpo}`)). */
export function firmar(secreto: string, cuerpo: string, timestamp = Math.floor(Date.now() / 1000).toString()): Firma {
  const firma = createHmac("sha256", secreto).update(`${timestamp}.${cuerpo}`).digest("hex");
  return { timestamp, firma: `sha256=${firma}` };
}

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Quita los campos que solo existen en la copia local. */
function limpio(registro: Registro): Registro {
  const { sincronizacion: _s, ...resto } = registro as RegistroLocal;
  void _s;
  return resto as Registro;
}

export class AlmacenArsRemoto implements AlmacenRegistros {
  readonly nombre = "ars-remoto";
  /** Intentos hechos en la última llamada a `guardar` (para el estado de sincronización). */
  ultimosIntentos = 0;

  constructor(
    private readonly opciones: {
      url: string;
      token: string;
      secreto: string;
      timeoutMs: number;
      /** Reintentos después del primer intento. */
      reintentos?: number;
      /** Espera antes de cada reintento (backoff). */
      backoffMs?: number[];
    },
  ) {}

  private async enviar(cuerpo: string, idempotencia: string): Promise<void> {
    const { timestamp, firma } = firmar(this.opciones.secreto, cuerpo);
    let res: Response;
    try {
      res = await fetch(this.opciones.url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.opciones.token}`,
          "Content-Type": "application/json; charset=utf-8",
          "User-Agent": "ARS-Landing-Registros/1",
          "X-ARS-Firma": firma,
          "X-ARS-Timestamp": timestamp,
          "X-ARS-Version": String(VERSION_REGISTRO),
          "Idempotency-Key": idempotencia,
        },
        body: cuerpo,
        signal: AbortSignal.timeout(this.opciones.timeoutMs),
        cache: "no-store",
      });
    } catch (err) {
      throw new Error(`Red/timeout: ${err instanceof Error ? err.message : String(err)}`);
    }
    // 2xx = guardado; 409 = ya existía con esa Idempotency-Key (también es éxito).
    if (res.ok || res.status === 409) return;
    const detalle = (await res.text().catch(() => "")).slice(0, 300);
    const msg = `HTTP ${res.status}${detalle ? `: ${detalle}` : ""}`;
    if (res.status >= 400 && res.status < 500 && res.status !== 408 && res.status !== 429) throw new ErrorDefinitivo(msg);
    throw new Error(msg);
  }

  async guardar(registro: Registro): Promise<void> {
    const evento: EventoRegistro = {
      evento: "registro.creado",
      version: VERSION_REGISTRO,
      enviado: new Date().toISOString(),
      registro: limpio(registro),
    };
    const cuerpo = JSON.stringify(evento);
    const reintentos = this.opciones.reintentos ?? 2;
    const backoff = this.opciones.backoffMs ?? [500, 2_000];
    let ultimo: unknown;
    this.ultimosIntentos = 0;
    for (let i = 0; i <= reintentos; i++) {
      if (i > 0) await esperar((backoff[i - 1] ?? backoff.at(-1) ?? 1_000) + Math.floor(Math.random() * 250));
      this.ultimosIntentos = i + 1;
      try {
        await this.enviar(cuerpo, registro.id);
        return;
      } catch (err) {
        ultimo = err;
        if (err instanceof ErrorDefinitivo) break;
      }
    }
    throw ultimo instanceof Error ? ultimo : new Error(String(ultimo));
  }
}
