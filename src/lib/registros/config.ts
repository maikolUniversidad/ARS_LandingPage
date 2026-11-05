/** Variables de entorno de los registros (solo servidor). Ver docs/CONFIGURACION.md. */
import path from "node:path";

const env = (k: string) => process.env[k]?.trim() || "";
const entero = (k: string, porDefecto: number, min: number, max: number) => {
  const n = Number.parseInt(env(k), 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : porDefecto;
};

const ENTORNOS = ["production", "preview", "development"] as const;
export type EntornoRegistro = (typeof ENTORNOS)[number];

/**
 * `origen.entorno` del registro. REGISTROS_ENTORNO (production|preview|development), si está, manda sobre
 * VERCEL_ENV y NODE_ENV: así los pods de prueba marcan sus registros como `development` aunque corran en producción.
 */
export function entornoRegistro(e: Record<string, string | undefined> = process.env): string {
  const pedido = e.REGISTROS_ENTORNO?.trim().toLowerCase();
  if (pedido && (ENTORNOS as readonly string[]).includes(pedido)) return pedido;
  return e.VERCEL_ENV?.trim() || e.NODE_ENV?.trim() || "development";
}

export function configRegistros() {
  const url = env("ARS_REGISTROS_URL");
  const token = env("ARS_REGISTROS_TOKEN");
  const secreto = env("ARS_REGISTROS_SECRET");
  return {
    /** Push al módulo de ARS: requiere URL + token + secreto. */
    remoto: url && token && secreto ? { url, token, secreto } : null,
    /** Faltan piezas del remoto (para avisar en el log). */
    remotoIncompleto: Boolean(url || token || secreto) && !(url && token && secreto),
    timeoutMs: entero("ARS_REGISTROS_TIMEOUT_MS", 8_000, 1_000, 30_000),
    /** Carpeta del almacén local de respaldo. */
    dir: path.resolve(process.cwd(), env("REGISTROS_DIR") || ".data/registros"),
    /** "siempre" = copia local aunque el remoto responda; "respaldo" = solo si falla o no hay remoto. */
    copiaLocal: env("REGISTROS_COPIA_LOCAL") === "respaldo" ? ("respaldo" as const) : ("siempre" as const),
    /** Token para la API pull /api/registros (vacío = API deshabilitada). */
    apiToken: env("REGISTROS_API_TOKEN"),
    /** Sal para el hash de la IP. */
    salIp: env("REGISTROS_SAL_IP") || secreto || "ars-registros",
    /** Cuánto espera la petición del usuario a que el guardado se confirme. */
    esperaMs: entero("REGISTROS_ESPERA_MS", 2_500, 0, 15_000),
  };
}

export type ConfigRegistros = ReturnType<typeof configRegistros>;
