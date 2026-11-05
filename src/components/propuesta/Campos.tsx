"use client";

import { useId, useState, type ReactNode } from "react";
import { Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const etiquetaCls = "font-mono text-[10px] uppercase tracking-[0.24em] text-[#9eb0c0]";
const inputCls =
  "w-full border border-white/15 bg-[#020a18]/70 px-3.5 py-3 text-[15px] text-white placeholder:text-white/30 outline-none transition-colors focus:border-[#6b8aff] focus-visible:ring-2 focus-visible:ring-[#6b8aff]/40 aria-[invalid=true]:border-[#ff8fb1]/70";

export function MensajeError({ id, children }: { id: string; children?: string }) {
  if (!children) return null;
  return (
    <p id={id} className="mt-2 text-[13px] text-[#ffb3c8] animate-in fade-in duration-300">
      {children}
    </p>
  );
}

export function CampoTexto({
  etiqueta,
  valor,
  onCambio,
  error,
  tipo = "text",
  autoComplete,
  placeholder,
  opcional,
  autoFocus,
  multilinea,
  inputMode,
}: {
  etiqueta: string;
  valor: string;
  onCambio: (v: string) => void;
  error?: string;
  tipo?: "text" | "email" | "tel";
  autoComplete?: string;
  placeholder?: string;
  opcional?: boolean;
  autoFocus?: boolean;
  multilinea?: boolean;
  inputMode?: "numeric" | "text" | "email" | "tel";
}) {
  const id = useId();
  const idError = `${id}-error`;
  const comunes = {
    id,
    value: valor,
    placeholder,
    autoFocus,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? idError : undefined,
    className: inputCls,
  };
  return (
    <div>
      <label htmlFor={id} className={etiquetaCls}>
        {etiqueta}
        {opcional && <span className="ml-2 normal-case tracking-normal text-white/40">(opcional)</span>}
      </label>
      <div className="mt-2">
        {multilinea ? (
          <textarea {...comunes} rows={3} maxLength={600} onChange={(e) => onCambio(e.target.value)} className={cn(inputCls, "resize-y")} />
        ) : (
          <input {...comunes} type={tipo} inputMode={inputMode} autoComplete={autoComplete} maxLength={160} onChange={(e) => onCambio(e.target.value)} />
        )}
      </div>
      <MensajeError id={idError}>{error}</MensajeError>
    </div>
  );
}

function Chip({
  tipo,
  nombre,
  marcado,
  onCambio,
  children,
  tint = "#6b8aff",
  describedBy,
}: {
  tipo: "checkbox" | "radio";
  nombre: string;
  marcado: boolean;
  onCambio: () => void;
  children: ReactNode;
  tint?: string;
  describedBy?: string;
}) {
  return (
    <label
      className={cn(
        "group relative inline-flex min-h-11 cursor-pointer select-none items-center gap-2 border px-3.5 py-2 text-[14px] leading-snug transition-all duration-200",
        "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#6b8aff]/60",
        marcado ? "border-transparent text-white" : "border-white/15 bg-white/[0.03] text-white/80 hover:border-white/35 hover:text-white",
      )}
      style={marcado ? { background: `${tint}2e`, boxShadow: `inset 0 0 0 1px ${tint}` } : undefined}
    >
      <input type={tipo} name={nombre} checked={marcado} onChange={onCambio} aria-describedby={describedBy} className="sr-only" />
      <span
        aria-hidden="true"
        className={cn("grid size-4 shrink-0 place-items-center border transition-colors", tipo === "radio" && "rounded-full", marcado ? "border-transparent" : "border-white/30")}
        style={marcado ? { background: tint } : undefined}
      >
        {marcado && <Check className="size-3 text-[#020a18]" strokeWidth={3} />}
      </span>
      {children}
    </label>
  );
}

/** Grupo de chips de selección múltiple + campo «Otro» para agregar lo que no está. */
export function ChipsMultiples({
  etiqueta,
  opciones,
  valor,
  onCambio,
  error,
  conOtro = true,
  tint,
}: {
  etiqueta: string;
  opciones: readonly string[];
  valor: string[];
  onCambio: (v: string[]) => void;
  error?: string;
  conOtro?: boolean;
  tint?: string;
}) {
  const id = useId();
  const idError = `${id}-error`;
  const [otro, setOtro] = useState("");
  const extras = valor.filter((v) => !opciones.includes(v));
  const todas = [...opciones, ...extras];
  const alternar = (o: string) => onCambio(valor.includes(o) ? valor.filter((x) => x !== o) : [...valor, o]);
  const agregar = () => {
    const t = otro.trim().slice(0, 60);
    if (!t) return;
    const existente = todas.find((o) => o.toLowerCase() === t.toLowerCase());
    if (existente) {
      if (!valor.includes(existente)) onCambio([...valor, existente]);
    } else onCambio([...valor, t]);
    setOtro("");
  };
  return (
    <fieldset aria-describedby={error ? idError : undefined}>
      <legend className={etiquetaCls}>{etiqueta}</legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {todas.map((o) => (
          <Chip key={o} tipo="checkbox" nombre={id} marcado={valor.includes(o)} onCambio={() => alternar(o)} tint={tint}>
            {o}
          </Chip>
        ))}
      </div>
      {conOtro && (
        <div className="mt-3 flex max-w-md gap-2">
          <label htmlFor={`${id}-otro`} className="sr-only">
            Otro: escríbalo y agréguelo
          </label>
          <input
            id={`${id}-otro`}
            value={otro}
            maxLength={60}
            onChange={(e) => setOtro(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                agregar();
              }
            }}
            placeholder="Otro… escríbalo aquí"
            className={cn(inputCls, "py-2.5 text-[14px]")}
          />
          <button
            type="button"
            onClick={agregar}
            disabled={!otro.trim()}
            className="inline-flex shrink-0 items-center gap-1.5 border border-white/20 px-3 font-mono text-[10.5px] uppercase tracking-[0.18em] text-white/80 transition-colors hover:bg-white/10 disabled:opacity-40"
          >
            <Plus className="size-3.5" aria-hidden="true" /> Agregar
          </button>
        </div>
      )}
      <MensajeError id={idError}>{error}</MensajeError>
    </fieldset>
  );
}

/** Chips de selección única (radios nativos: flechas del teclado incluidas). */
export function ChipsUnicos<T extends string>({
  etiqueta,
  opciones,
  valor,
  onCambio,
  error,
}: {
  etiqueta: string;
  opciones: readonly { valor: T; etiqueta: string }[];
  valor: T | "";
  onCambio: (v: T) => void;
  error?: string;
}) {
  const id = useId();
  const idError = `${id}-error`;
  return (
    <fieldset aria-describedby={error ? idError : undefined}>
      <legend className={etiquetaCls}>{etiqueta}</legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {opciones.map((o) => (
          <Chip key={o.valor} tipo="radio" nombre={id} marcado={valor === o.valor} onCambio={() => onCambio(o.valor)}>
            {o.etiqueta}
          </Chip>
        ))}
      </div>
      <MensajeError id={idError}>{error}</MensajeError>
    </fieldset>
  );
}

export function Casilla({
  marcado,
  onCambio,
  error,
  children,
}: {
  marcado: boolean;
  onCambio: (v: boolean) => void;
  error?: string;
  children: ReactNode;
}) {
  const id = useId();
  const idError = `${id}-error`;
  return (
    <div>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-[13.5px] leading-relaxed text-white/80">
        <input
          id={id}
          type="checkbox"
          checked={marcado}
          onChange={(e) => onCambio(e.target.checked)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? idError : undefined}
          className="mt-0.5 size-5 shrink-0 cursor-pointer accent-[#6b8aff]"
        />
        <span>{children}</span>
      </label>
      <MensajeError id={idError}>{error}</MensajeError>
    </div>
  );
}
