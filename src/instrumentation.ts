/**
 * Se ejecuta una vez al arrancar el servidor de Next.js.
 * Arranca el reintento de fondo de los registros que no llegaron a ARS
 * (cada REGISTROS_REINTENTO_MS, por defecto 5 min). No hace nada si el push
 * a ARS no está configurado. Ver docs/BACKEND-REGISTROS.md §2.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { configRegistros } = await import("./lib/registros/config");
  if (!configRegistros().remoto) return;
  const { iniciarReintentoFondo, intervaloReintento } = await import("./lib/registros/reintento-fondo");
  const intervaloMs = intervaloReintento();
  if (!intervaloMs) return;
  const { reintentarPendientes } = await import("./lib/registros");
  iniciarReintentoFondo({
    intervaloMs,
    // 1 minuto de gracia para lo que su propia petición aún está enviando; si ARS no responde, se corta y sigue en el
    // próximo ciclo. Lo que ARS rechazó (4xx) no se reenvía solo: queda para POST /api/registros/reintentar.
    reintentar: () => reintentarPendientes(50, { edadMinimaMs: 60_000, cortarAlPrimerFallo: true, omitirRechazados: true }),
  });
}
