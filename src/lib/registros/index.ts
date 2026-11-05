/**
 * Módulo de registros: guarda cada lead (contacto o diagnóstico) en el módulo
 * de ARS (push firmado) y en un almacén local de respaldo.
 *
 * Flujo de `guardarRegistro` (el id ya está generado en el registro):
 *  1. Copia local (si REGISTROS_COPIA_LOCAL=siempre o no hay remoto) → confirma rápido.
 *  2. Push al remoto con reintentos; si falla, queda la copia local «pendiente»
 *     (se reintenta con POST /api/registros/reintentar).
 *  3. Si nada funcionó, el registro completo va al log del servidor (último recurso).
 * La respuesta al usuario espera como mucho REGISTROS_ESPERA_MS a la primera
 * confirmación; el resto termina con `after()` sin bloquearla.
 */
import { after } from "next/server";
import type { RegistroGuardado } from "@/data/diagnostico/tipos";
import { configRegistros, type ConfigRegistros } from "./config";
import { AlmacenLocal } from "./local";
import { AlmacenArsRemoto } from "./remoto";
import type { Registro, RegistroLocal, Sincronizacion } from "./tipos";

export type { Registro, RegistroContacto, RegistroDiagnostico, EstadoRegistro, TipoRegistro } from "./tipos";
export { ESTADOS_REGISTRO } from "./tipos";
export { registroContacto, registroDiagnostico } from "./crear";

export function almacenLocal(cfg: ConfigRegistros = configRegistros()): AlmacenLocal {
  return new AlmacenLocal(cfg.dir);
}

function almacenRemoto(cfg: ConfigRegistros): AlmacenArsRemoto | null {
  return cfg.remoto ? new AlmacenArsRemoto({ ...cfg.remoto, timeoutMs: cfg.timeoutMs }) : null;
}

const mensaje = (err: unknown) => (err instanceof Error ? err.message : String(err)).slice(0, 300);

let avisoIncompleto = false;

/** Hace todo el trabajo de persistencia. Llama `confirmar()` en cuanto el registro queda guardado en algún lado. */
async function persistir(registro: Registro, confirmar: () => void): Promise<boolean> {
  const cfg = configRegistros();
  if (cfg.remotoIncompleto && !avisoIncompleto) {
    avisoIncompleto = true;
    console.warn("[registros] ARS_REGISTROS_URL, _TOKEN y _SECRET deben ir juntas; el push remoto está desactivado.");
  }
  const local = almacenLocal(cfg);
  const remoto = almacenRemoto(cfg);
  let guardadoLocal = false;
  let guardadoRemoto = false;

  const guardarLocal = async (s: Sincronizacion) => {
    try {
      await local.guardar({ ...registro, sincronizacion: s } satisfies RegistroLocal);
      guardadoLocal = true;
      confirmar();
    } catch (err) {
      console.error(`[registros] No se pudo escribir la copia local de ${registro.id}:`, mensaje(err));
    }
  };

  if (!remoto || cfg.copiaLocal === "siempre") {
    await guardarLocal({
      remoto: remoto ? "pendiente" : "no-configurado",
      intentos: 0,
      ultimoIntento: null,
      ultimoError: null,
    });
  }

  if (remoto) {
    let error: string | null = null;
    try {
      await remoto.guardar(registro);
      guardadoRemoto = true;
      confirmar();
    } catch (err) {
      error = mensaje(err);
      console.error(`[registros] Push a ARS falló para ${registro.id} tras ${remoto.ultimosIntentos} intento(s):`, error);
    }
    const s: Sincronizacion = {
      remoto: guardadoRemoto ? "enviado" : "pendiente",
      intentos: remoto.ultimosIntentos,
      ultimoIntento: new Date().toISOString(),
      ultimoError: error,
    };
    if (guardadoLocal) {
      await local.marcarSincronizacion(registro.id, s).catch((err) => console.error("[registros] sincronización:", mensaje(err)));
    } else if (!guardadoRemoto) {
      await guardarLocal(s);
    }
  }

  if (!guardadoLocal && !guardadoRemoto) {
    // Último recurso: que el lead quede al menos en los logs (Vercel → Logs).
    console.error(`[registros] REGISTRO NO GUARDADO ${registro.id}:`, JSON.stringify(registro));
    return false;
  }
  if (!remoto) console.info(`[registros] ${registro.id} guardado en local (${cfg.dir}); ARS remoto no configurado.`);
  return true;
}

/**
 * Guarda el registro sin bloquear la respuesta más de `REGISTROS_ESPERA_MS`.
 * `guardado: true` = confirmado (en ARS o en la copia local) dentro de ese plazo;
 * `false` = no confirmado aún (puede terminar después en segundo plano, ver logs).
 */
export async function guardarRegistro(registro: Registro): Promise<RegistroGuardado> {
  const cfg = configRegistros();
  let resolver: (ok: boolean) => void = () => {};
  const confirmado = new Promise<boolean>((r) => (resolver = r));
  const trabajo = persistir(registro, () => resolver(true))
    .then((ok) => resolver(ok))
    .catch((err) => {
      console.error(`[registros] Error inesperado guardando ${registro.id}:`, err);
      resolver(false);
    });
  try {
    after(trabajo);
  } catch {
    // Fuera de una petición (scripts/pruebas): el trabajo sigue igual en segundo plano.
  }
  let reloj: ReturnType<typeof setTimeout> | undefined;
  const plazo = new Promise<boolean>((r) => (reloj = setTimeout(() => r(false), cfg.esperaMs)));
  const guardado = await Promise.race([confirmado, plazo]);
  clearTimeout(reloj);
  return { id: registro.id, guardado };
}

/** Reenvía a ARS los registros locales con sincronización «pendiente». */
export async function reintentarPendientes(maximo = 50): Promise<{ revisados: number; enviados: string[]; fallidos: string[] }> {
  const cfg = configRegistros();
  const remoto = almacenRemoto(cfg);
  if (!remoto) throw new Error("ARS remoto no configurado");
  const local = almacenLocal(cfg);
  const pendientes = (await local.todos()).filter((r) => r.sincronizacion?.remoto === "pendiente").slice(0, maximo);
  const enviados: string[] = [];
  const fallidos: string[] = [];
  for (const r of pendientes) {
    const previos = r.sincronizacion?.intentos ?? 0;
    try {
      await remoto.guardar(r);
      enviados.push(r.id);
      await local.marcarSincronizacion(r.id, { remoto: "enviado", intentos: previos + remoto.ultimosIntentos, ultimoIntento: new Date().toISOString(), ultimoError: null });
    } catch (err) {
      fallidos.push(r.id);
      await local.marcarSincronizacion(r.id, { remoto: "pendiente", intentos: previos + remoto.ultimosIntentos, ultimoIntento: new Date().toISOString(), ultimoError: mensaje(err) });
    }
  }
  return { revisados: pendientes.length, enviados, fallidos };
}
