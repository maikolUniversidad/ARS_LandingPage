"use client";

import { useId, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import type { ContactoDiagnostico } from "@/data/diagnostico/tipos";
import { VERSION_AUTORIZACION, textoAutorizacion, type AceptacionAutorizacion } from "@/data/diagnostico/autorizacion";
import { CONTACT_EMAIL } from "@/lib/contact";
import { limpiarContacto } from "./perfil";

const CAMPO =
  "w-full border border-white/15 bg-[#020a18] px-3 py-2.5 text-[14.5px] text-white outline-none placeholder:text-white/35 focus:border-[#6b8aff]";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CAMPOS: { k: keyof ContactoDiagnostico; etiqueta: string; tipo: string; auto: string; ejemplo: string; max: number }[] = [
  { k: "nombre", etiqueta: "Nombre", tipo: "text", auto: "name", ejemplo: "Laura Gómez", max: 120 },
  { k: "cargo", etiqueta: "Cargo", tipo: "text", auto: "organization-title", ejemplo: "Gerente de operaciones", max: 120 },
  { k: "email", etiqueta: "Correo", tipo: "email", auto: "email", ejemplo: "laura@empresa.co", max: 200 },
  { k: "telefono", etiqueta: "Teléfono", tipo: "tel", auto: "tel", ejemplo: "300 123 4567", max: 40 },
];

/**
 * Paso antes del análisis: datos para enviar el reporte y autorización de datos (Ley 1581).
 * Recomendado pero opcional: si la persona sigue sin sus datos, el diagnóstico se hace igual
 * y el registro queda sin contacto. Los datos de contacto no se le envían a la IA.
 */
export function PasoDatos({
  empresa,
  inicial,
  onContinuar,
  onVolver,
}: {
  empresa?: string;
  inicial?: ContactoDiagnostico;
  onContinuar: (contacto: ContactoDiagnostico | undefined, autorizacion: AceptacionAutorizacion | undefined) => void;
  onVolver: () => void;
}) {
  const id = useId();
  const [c, setC] = useState<ContactoDiagnostico>(inicial ?? {});
  const [acepta, setAcepta] = useState(false);
  const texto = textoAutorizacion(VERSION_AUTORIZACION, CONTACT_EMAIL) ?? "";
  const limpio = limpiarContacto(c);
  const correoMalo = Boolean(c.email?.trim()) && !EMAIL_RE.test(c.email?.trim() ?? "");
  const conComoContactar = Boolean(limpio?.email || limpio?.telefono) && !correoMalo;
  const puedeEnviar = acepta && conComoContactar;

  const enviar = (ev: FormEvent) => {
    ev.preventDefault();
    if (!puedeEnviar) return;
    onContinuar(limpio, { version: VERSION_AUTORIZACION, aceptada: true });
  };

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-10 md:py-16">
      <p className="text-center font-mono text-[10.5px] uppercase tracking-[0.3em] text-[#6b8aff]">Antes de analizar</p>
      <h2 className="mt-3 text-center font-serif text-3xl leading-tight text-white md:text-4xl">
        ¿A quién le enviamos el reporte{empresa ? <span className="italic text-[#9eb0c0]"> de {empresa}</span> : null}?
      </h2>
      <p className="mx-auto mt-3 max-w-md text-center text-[14px] leading-relaxed text-[#9eb0c0]">
        Recomendado: con tus datos te enviamos el reporte y un consultor de ARS puede revisarlo contigo.
      </p>

      <form onSubmit={enviar} className="mt-7 grid gap-3 border border-white/10 bg-[#050f24]/80 p-4 backdrop-blur">
        <div className="grid gap-3 sm:grid-cols-2">
          {CAMPOS.map((f) => (
            <label key={f.k} className="grid gap-1.5" htmlFor={`${id}-${f.k}`}>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/55">{f.etiqueta}</span>
              <input
                id={`${id}-${f.k}`}
                type={f.tipo}
                value={c[f.k] ?? ""}
                onChange={(ev) => setC((x) => ({ ...x, [f.k]: ev.target.value }))}
                maxLength={f.max}
                autoComplete={f.auto}
                placeholder={f.ejemplo}
                aria-invalid={f.k === "email" && correoMalo ? true : undefined}
                className={CAMPO}
              />
            </label>
          ))}
        </div>
        {correoMalo && (
          <p role="alert" className="text-[12px] text-[#ff9b9b]">
            Revisa el correo: parece incompleto.
          </p>
        )}

        <label className="flex cursor-pointer gap-2.5 border border-white/10 bg-white/[0.02] p-3 text-[12px] leading-relaxed text-[#c3cfdb]">
          <input
            type="checkbox"
            checked={acepta}
            onChange={(ev) => setAcepta(ev.target.checked)}
            className="mt-0.5 size-4 shrink-0 accent-[#2348d4]"
          />
          <span>{texto}</span>
        </label>
        <p className="flex items-center gap-1.5 text-[11.5px] text-[#9eb0c0]">
          <ShieldCheck className="size-3.5 shrink-0 text-[#35e0a1]" aria-hidden="true" />
          Para enviarte el reporte necesitamos un correo o un teléfono y tu autorización.
        </p>

        <button
          type="submit"
          disabled={!puedeEnviar}
          className="bevel-btn flex w-full items-center justify-center gap-2 bg-white px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[#020a18] transition-colors hover:bg-[#d5e0ff] disabled:cursor-not-allowed disabled:opacity-45"
        >
          Enviarme el reporte y analizar <ArrowRight className="size-4" aria-hidden="true" />
        </button>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button type="button" onClick={onVolver} className="inline-flex items-center gap-1.5 px-1 py-1 font-mono text-[10.5px] uppercase tracking-[0.2em] text-white/60 hover:text-white">
            <ArrowLeft className="size-3.5" aria-hidden="true" /> Volver a la conversación
          </button>
          <button
            type="button"
            onClick={() => onContinuar(undefined, undefined)}
            className="px-1 py-1 font-mono text-[10.5px] uppercase tracking-[0.2em] text-white/60 hover:text-white"
          >
            Analizar sin dejar mis datos
          </button>
        </div>
      </form>
    </div>
  );
}
