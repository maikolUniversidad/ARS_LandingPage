"use client";

import { useState } from "react";
import { CheckCircle2, Download, Loader2, MessageCircle, Pencil, RotateCcw, Send } from "lucide-react";
import type { Propuesta, Respuestas, RespuestaSeguimiento } from "@/data/propuesta/tipos";
import { descargarPropuestaPdf } from "./pdf/descargar";
import { whatsappUrl } from "@/lib/contact";
import { enviarPropuesta } from "./cliente";

type Estado = "idle" | "trabajando" | "error";

export function Acciones({
  propuesta,
  respuestas,
  seguimiento,
  enviada,
  capturas3d,
  onEnviada,
  onEditar,
  onNueva,
}: {
  propuesta: Propuesta;
  respuestas: Respuestas;
  seguimiento: RespuestaSeguimiento[];
  enviada: boolean;
  /** Capturas de la escena 3D (dataURL) para el PDF y el envío; [] si no hay escena. */
  capturas3d: () => Promise<string[]>;
  onEnviada: () => void;
  onEditar: () => void;
  onNueva: () => void;
}) {
  const [pdf, setPdf] = useState<Estado>("idle");
  const [envio, setEnvio] = useState<Estado>("idle");
  const [mensajeEnvio, setMensajeEnvio] = useState("");
  const wa = whatsappUrl(`Hola ARS, soy ${respuestas.nombre || "…"} de ${propuesta.empresa}. Acabo de armar la propuesta ${propuesta.id} en su sitio y quiero hablar con un asesor.`);

  const descargar = async () => {
    setPdf("trabajando");
    try {
      const extras = { capturas3d: await capturas3d() };
      await descargarPropuestaPdf(propuesta, extras);
      setPdf("idle");
    } catch {
      setPdf("error");
    }
  };

  const enviar = async () => {
    setEnvio("trabajando");
    const r = await enviarPropuesta({ propuesta, respuestas, seguimiento, capturas3d: await capturas3d() });
    if (r.ok) {
      setEnvio("idle");
      onEnviada();
    } else {
      setMensajeEnvio(r.mensaje);
      setEnvio("error");
    }
  };

  return (
    <div className="space-y-4">
      {enviada && (
        <div role="status" className="border border-[#35e0a1]/40 bg-[#35e0a1]/[0.07] p-4 motion-safe:animate-in motion-safe:fade-in md:p-5">
          <p className="flex items-center gap-2 text-[16px] font-bold text-white">
            <CheckCircle2 className="size-5 text-[#35e0a1]" aria-hidden="true" /> Listo, {respuestas.nombre.split(" ")[0] || "gracias"}.
          </p>
          <p className="mt-1.5 text-[14px] leading-relaxed text-[#c5d2ee]">
            Un asesor de ARS revisará su propuesta y le {respuestas.telefono ? "llamará" : "escribirá"} muy pronto
            {respuestas.telefono ? ` al ${respuestas.telefono}` : ` a ${respuestas.email}`}. Si prefiere adelantarse, escríbanos por WhatsApp.
          </p>
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex min-h-11 items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[#a8f0d2] hover:text-white"
          >
            <MessageCircle className="size-4" aria-hidden="true" /> Escribir por WhatsApp
          </a>
        </div>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {!enviada && (
          <button
            type="button"
            onClick={enviar}
            disabled={envio === "trabajando"}
            className="bevel-btn inline-flex min-h-12 items-center justify-center gap-3 bg-[#d5e0ff] px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#020a18] transition-colors hover:bg-white disabled:opacity-70"
          >
            {envio === "trabajando" ? <Loader2 className="size-4 motion-safe:animate-spin" aria-hidden="true" /> : <Send className="size-4" aria-hidden="true" />}
            {envio === "trabajando" ? "Enviando…" : "Enviar a un asesor de ARS"}
          </button>
        )}
        <button
          type="button"
          onClick={descargar}
          disabled={pdf === "trabajando"}
          className="bevel-btn inline-flex min-h-12 items-center justify-center gap-3 border border-white/30 bg-[#0b1840] px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-white/10 disabled:opacity-70"
        >
          {pdf === "trabajando" ? <Loader2 className="size-4 motion-safe:animate-spin" aria-hidden="true" /> : <Download className="size-4" aria-hidden="true" />}
          {pdf === "trabajando" ? "Generando PDF…" : "Descargar propuesta en PDF"}
        </button>
      </div>

      <div aria-live="polite">
        {envio === "error" && (
          <p className="text-[13.5px] text-[#ffb3c8]">
            {mensajeEnvio || "No pudimos enviarla."} Intente de nuevo o{" "}
            <a href={wa} target="_blank" rel="noopener noreferrer" className="font-bold text-white underline underline-offset-4">
              escríbanos por WhatsApp
            </a>
            .
          </p>
        )}
        {pdf === "error" && (
          <p className="text-[13.5px] text-[#ffb3c8]">No pudimos generar el PDF en este momento. Puede enviarla a un asesor y se la hacemos llegar por correo.</p>
        )}
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-1 pt-1">
        <button type="button" onClick={onEditar} className="inline-flex min-h-11 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/65 hover:text-white">
          <Pencil className="size-3.5" aria-hidden="true" /> Editar respuestas
        </button>
        <button type="button" onClick={onNueva} className="inline-flex min-h-11 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/45 hover:text-white">
          <RotateCcw className="size-3.5" aria-hidden="true" /> Empezar de nuevo
        </button>
      </div>
    </div>
  );
}
