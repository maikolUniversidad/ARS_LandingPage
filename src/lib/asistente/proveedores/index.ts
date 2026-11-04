/**
 * Selector de proveedor: recorre los proveedores configurados en orden
 * (ASISTENTE_PROVEEDORES, por defecto anthropic → openai → deepseek) y pasa al
 * siguiente si uno falla antes de haber enviado nada al navegador.
 * DeepSeek no lee PDF: si hay un PDF adjunto se salta.
 */
import { configuracion, modeloDe, type NombreProveedor } from "../servidor";
import type { PeticionChat } from "../tipos";
import { turnoAnthropic } from "./anthropic";
import { ErrorProveedor, tienePdf, type Emitir } from "./comun";
import { turnoOpenai } from "./openai";

export { ErrorProveedor } from "./comun";

export function ordenProveedores(p: PeticionChat): NombreProveedor[] {
  const { proveedores } = configuracion();
  return tienePdf(p) ? proveedores.filter((n) => n !== "deepseek") : proveedores;
}

export async function responder(peticion: PeticionChat, enviar: Emitir, signal: AbortSignal): Promise<string> {
  const cfg = configuracion();
  const orden = ordenProveedores(peticion);
  if (!orden.length) {
    throw new ErrorProveedor(
      "sin_clave",
      cfg.proveedores.length
        ? "Para leer PDF hace falta ANTHROPIC_API_KEY u OPENAI_API_KEY en el servidor."
        : "El asistente aún no está configurado: falta una clave de LLM (ANTHROPIC_API_KEY, OPENAI_API_KEY o DEEPSEEK_API_KEY).",
      false,
    );
  }
  let ultimo: ErrorProveedor | null = null;
  for (const nombre of orden) {
    let emitidos = 0;
    let huboTexto = false;
    let separar = false;
    const contar: Emitir = (ev) => {
      let e = ev;
      if (e.t === "texto") {
        // Sin espacios al inicio, y un solo salto de párrafo entre el texto de antes y el de después de las herramientas.
        const d = huboTexto && !separar ? e.d : e.d.replace(/^\s+/, "");
        if (!d) return;
        e = { t: "texto", d: separar && huboTexto ? `\n\n${d}` : d };
        separar = false;
        huboTexto = true;
      }
      emitidos++;
      enviar(e);
    };
    const turno = {
      peticion,
      enviar: contar,
      signal,
      modelo: modeloDe(cfg, nombre),
      separar: () => {
        separar = true;
      },
    };
    try {
      if (nombre === "openai") return await turnoOpenai(turno, cfg.openaiKey);
      if (nombre === "deepseek") return await turnoAnthropic(turno, "deepseek", cfg.deepseekKey);
      return await turnoAnthropic(turno, "claude", cfg.anthropicKey);
    } catch (err) {
      const e = err instanceof ErrorProveedor ? err : new ErrorProveedor("proveedor", String(err));
      // Si ya salió texto, cambiar de modelo a mitad de respuesta confundiría: se informa el error.
      if (emitidos > 0 || !e.reintentable) throw e;
      console.warn(`[asistente] ${nombre} falló (${e.codigo}): ${e.message}; probando el siguiente proveedor`);
      ultimo = e;
    }
  }
  throw ultimo ?? new ErrorProveedor("proveedor", "Ningún proveedor respondió.");
}
