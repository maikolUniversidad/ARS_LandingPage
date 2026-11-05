"use client";

import { useEffect, useMemo, useState } from "react";
import { GUIONES } from "@/data/narracion";
import { motorNarracion } from "@/lib/narracion/motor";
import { cn } from "@/lib/utils";
import type { EstadoOrbe } from "./OrbeArs";
import { textoCorto, type ConversacionArs } from "./useConversacionArs";
import { useEstadoNarracion } from "./useNarracion";

/** Estado y nivel del orbe según quién habla (Ars narrando, respondiendo o la persona). */
export function orbeDe(conv: ConversacionArs, narrando: boolean): { estado: EstadoOrbe; nivel: () => number } {
  if (conv.activa) {
    const f = conv.fase;
    const estado: EstadoOrbe = f === "escuchando" ? "escuchando" : f === "transcribiendo" || f === "pensando" ? "pensando" : f === "hablando" ? "hablando" : "reposo";
    return { estado, nivel: conv.nivel };
  }
  return { estado: narrando ? "hablando" : "reposo", nivel: nivelNarracion };
}
const nivelNarracion = () => motorNarracion.nivel();

/** Puntos animados de «pensando». */
export function Puntos() {
  return (
    <span className="ml-1 inline-flex gap-0.5 align-middle" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1 rounded-full bg-[#8ea6ff] motion-safe:animate-bounce"
          style={{ animationDelay: `${i * 140}ms`, animationDuration: "0.9s" }}
        />
      ))}
    </span>
  );
}

type Trozo = { texto: string; desde: number; hasta: number };

/** Parte el guion en frases (con su rango de caracteres). */
function frases(texto: string): Trozo[] {
  const out: Trozo[] = [];
  const re = /[^.!?…]+[.!?…]*["”»)]?\s*/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(texto)) && m[0]) out.push({ texto: m[0].trim(), desde: m.index, hasta: m.index + m[0].length });
  return out.length ? out : [{ texto, desde: 0, hasta: texto.length }];
}

/**
 * Subtítulo en vivo de la narración: muestra la frase que suena y va
 * iluminando las palabras al ritmo del clip (avance repartido por caracteres
 * sobre la duración real del audio).
 */
export function SubtituloNarracion({ className }: { className?: string }) {
  const estado = useEstadoNarracion();
  const id = estado.hablando ? estado.idActual : null;
  const texto = id ? GUIONES[id] ?? "" : "";
  const trozos = useMemo(() => frases(texto), [texto]);
  const [pos, setPos] = useState(0);

  useEffect(() => {
    if (!texto || !id) return;
    let raf = 0;
    const tick = () => {
      const p = motorNarracion.progresoVoz();
      if (p && p.id === id) {
        // Un pelo adelantado (se lee mejor) y sin contar la cola de silencio.
        const f = Math.min(1, (p.transcurrido + 0.2) / Math.max(0.5, p.duracion * 0.94));
        let c = Math.round(f * texto.length);
        // Ajuste a fin de palabra: solo re-renderiza al cambiar de palabra.
        const fin = texto.indexOf(" ", c);
        c = fin === -1 ? texto.length : fin;
        setPos((prev) => (prev === c ? prev : c));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      setPos(0);
    };
  }, [id, texto]);

  if (!texto) return null;
  const actual = trozos.find((t) => pos < t.hasta) ?? trozos[trozos.length - 1];
  const dicho = Math.max(0, Math.min(actual.texto.length, pos - actual.desde));
  return (
    <>
      <span className={cn("block", className)} aria-hidden="true">
        <span className="text-white">{actual.texto.slice(0, dicho)}</span>
        <span className="text-white/40">{actual.texto.slice(dicho)}</span>
      </span>
      <span className="sr-only">{texto}</span>
    </>
  );
}

type Props = {
  conv: ConversacionArs;
  narrada: boolean;
  /** Dock móvil (push-to-talk) o panel de escritorio. */
  ptt: boolean;
  className?: string;
};

/**
 * Área en vivo del panel/dock: mientras Ars narra, el subtítulo sincronizado;
 * cuando la persona pregunta, su transcripción («Usted: …»), luego «Ars está
 * pensando…» y la frase de la respuesta que va sonando.
 */
export function AreaVivo({ conv, narrada, ptt, className }: Props) {
  const estado = useEstadoNarracion();
  const ultimo = conv.avisos[conv.avisos.length - 1];
  const base = "text-[12.5px] leading-snug";

  let contenido: React.ReactNode;
  if (conv.activa) {
    const f = conv.fase;
    const usted = conv.parcial ? (
      <span className="line-clamp-2 text-white/90">
        <span className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-[#7fd1ff]">Usted · </span>«{conv.parcial}»
      </span>
    ) : null;
    if (conv.aviso) contenido = <span className="text-amber-200/90">{conv.aviso}</span>;
    else if (f === "escuchando" || f === "transcribiendo")
      contenido = usted ?? (
        <span className="text-white/70">
          {ptt ? "Le escucho… suelte para enviar" : "Le escucho… al callar, se lo envío a Ars"}
          {f === "transcribiendo" && <Puntos />}
        </span>
      );
    else if (f === "pensando")
      contenido = (
        <>
          {usted}
          <span className="block text-[#c5d2ee]">
            Ars está pensando
            <Puntos />
          </span>
        </>
      );
    else if (f === "hablando")
      contenido = (
        <span className="line-clamp-2 text-white">
          <span className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-[#8ea6ff]">Ars · </span>
          {ultimo?.frase || (ultimo ? textoCorto(ultimo.texto, 120) : "")}
        </span>
      );
    else if (f === "escribiendo") contenido = <span className="text-white/70">Escriba su pregunta y Ars le responde en voz.</span>;
    else contenido = <span className="text-white/70">{ptt ? "¿Algo más? Mantenga a Ars para hablar" : "¿Algo más? Le escucho…"}</span>;
  } else if (estado.esperandoGesto) {
    contenido = <span className="text-white/70">{narrada ? "Ars lista · toque cualquier parte para escuchar" : "Toque para activar la música"}</span>;
  } else if (estado.hablando && estado.idActual && GUIONES[estado.idActual]) {
    contenido = <SubtituloNarracion />;
  } else if (estado.pausada) {
    contenido = <span className="text-white/60">Narración en pausa{ptt ? " · toque a Ars para seguir" : ""}</span>;
  } else {
    contenido = <span className="text-white/60">{ptt ? "Mantenga a Ars presionado para preguntarle" : "Pregúntele lo que quiera: le escucha aquí mismo"}</span>;
  }

  return (
    <div className={cn(base, "min-h-[2.6em]", className)} aria-live="polite">
      {contenido}
    </div>
  );
}
