"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, Lightbulb, MessageSquare, Mic, Paperclip, PencilLine, Sparkles, X } from "lucide-react";
import { AREA_IDS, CAMPOS_PERFIL, type AreaId, type CampoPerfil } from "@/data/diagnostico/tipos";
import { Icono, rgba } from "@/components/servicios/ui";
import { areaInfo } from "@/lib/diagnostico/catalogo";
import { cn } from "@/lib/utils";
import type { DatoEmpresa } from "./eventos";
import { etiquetaFuente, faltantes, INFO_CAMPO, lleno, limpiarContacto, porcentaje, TAMANOS, valorTexto, type FuenteCampo, type Origenes, type Perfil } from "./perfil";
import type { Progreso } from "./useEntrevista";
import css from "./entrevista.module.css";

const ICONO_FUENTE = { chat: MessageSquare, voz: Mic, adjunto: Paperclip, manual: PencilLine } as const;

/** Escribe el texto letra por letra (máquina de escribir) al aparecer. */
function Maquina({ texto, animar }: { texto: string; animar: boolean }) {
  const [n, setN] = useState(animar ? 0 : texto.length);
  useEffect(() => {
    if (!animar || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const t = window.setTimeout(() => setN(texto.length), 0);
      return () => window.clearTimeout(t);
    }
    const paso = Math.max(1, Math.ceil(texto.length / 40));
    const id = window.setInterval(() => setN((x) => (x >= texto.length ? (window.clearInterval(id), x) : x + paso)), 22);
    return () => window.clearInterval(id);
  }, [texto, animar]);
  return <span className={cn(n < texto.length && css.cursor)}>{texto.slice(0, n)}</span>;
}

/** Número que sube animado hasta `valor`. */
function Contador({ valor }: { valor: number }) {
  const [v, setV] = useState(valor);
  const actual = useRef(valor);
  useEffect(() => {
    const desde = actual.current;
    if (desde === valor) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      actual.current = valor;
      const t = window.setTimeout(() => setV(valor), 0);
      return () => window.clearTimeout(t);
    }
    const inicio = performance.now();
    let raf = 0;
    const tic = (t: number) => {
      const k = Math.min(1, (t - inicio) / 900);
      const x = Math.round(desde + (valor - desde) * (1 - Math.pow(1 - k, 3)));
      actual.current = x;
      setV(x);
      if (k < 1) raf = requestAnimationFrame(tic);
    };
    raf = requestAnimationFrame(tic);
    return () => cancelAnimationFrame(raf);
  }, [valor]);
  return <>{v}</>;
}

const reciente = (f?: FuenteCampo) => Boolean(f && Date.now() - f.en < 4000);

/* ───────────── Editor de un campo ───────────── */

function Editor({ campo, perfil, onGuardar, onCancelar }: { campo: CampoPerfil; perfil: Perfil; onGuardar: (v: Perfil) => void; onCancelar: () => void }) {
  const info = INFO_CAMPO[campo];
  const inicial = (() => {
    const v = perfil[campo];
    if (Array.isArray(v)) return v.join(", ");
    if (typeof v === "number") return String(v);
    return typeof v === "string" ? v : "";
  })();
  const [texto, setTexto] = useState(inicial);
  const [contacto, setContacto] = useState(perfil.contacto ?? {});
  const input = "w-full border border-[#6b8aff]/50 bg-[#020a18] px-2 py-1.5 text-[13px] text-white outline-none placeholder:text-white/30 focus:border-[#6b8aff]";

  const guardar = () => {
    switch (info.tipo) {
      case "numero": {
        const n = Number(texto.replace(/[^\d]/g, ""));
        return onGuardar({ [campo]: n > 0 ? n : undefined });
      }
      case "lista":
        return onGuardar({ [campo]: texto.split(/[,;\n]/).map((x) => x.trim()).filter(Boolean) });
      case "contacto":
        return onGuardar({ contacto: limpiarContacto(contacto) });
      default:
        return onGuardar({ [campo]: texto.trim() || undefined });
    }
  };

  const teclas = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onCancelar();
    if (e.key === "Enter" && !(e.shiftKey && info.tipo === "lista")) {
      e.preventDefault();
      guardar();
    }
  };

  return (
    <div className="mt-1.5 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200" onKeyDown={teclas}>
      {info.tipo === "tamano" ? (
        <div className="grid grid-cols-2 gap-1">
          {TAMANOS.map((t) => (
            <button
              key={t.v}
              type="button"
              onClick={() => onGuardar({ tamano: t.v })}
              className={cn("border px-2 py-1.5 text-left text-[11.5px]", perfil.tamano === t.v ? "border-[#6b8aff] bg-[#2348d4]/30 text-white" : "border-white/15 text-white/80 hover:border-[#6b8aff]/60")}
            >
              {t.t}
            </button>
          ))}
        </div>
      ) : info.tipo === "contacto" ? (
        <div className="grid gap-1">
          {(
            [
              ["nombre", "Tu nombre", "text", "name"],
              ["cargo", "Cargo", "text", "organization-title"],
              ["email", "Correo", "email", "email"],
              ["telefono", "Celular / WhatsApp", "tel", "tel"],
            ] as const
          ).map(([k, ph, type, auto], i) => (
            <input
              key={k}
              type={type}
              autoComplete={auto}
              autoFocus={i === 0}
              placeholder={ph}
              aria-label={ph}
              value={contacto[k] ?? ""}
              onChange={(e) => setContacto((c) => ({ ...c, [k]: e.target.value }))}
              className={input}
            />
          ))}
        </div>
      ) : (
        <input
          autoFocus
          inputMode={info.tipo === "numero" ? "numeric" : undefined}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder={info.tipo === "lista" ? `${info.pista} (separa con comas)` : info.pista}
          aria-label={info.etiqueta}
          className={input}
        />
      )}
      {info.tipo !== "tamano" && (
        <div className="flex justify-end gap-1">
          <button type="button" onClick={onCancelar} className="p-1 text-white/50 hover:text-white" aria-label="Cancelar">
            <X className="size-3.5" aria-hidden="true" />
          </button>
          <button type="button" onClick={guardar} className="inline-flex items-center gap-1 bg-[#2348d4] px-2 py-1 font-mono text-[9.5px] uppercase tracking-[0.16em] text-white hover:bg-[#3358e4]">
            <Check className="size-3" aria-hidden="true" /> Guardar
          </button>
        </div>
      )}
    </div>
  );
}

/* ───────────── Fila de campo ───────────── */

function Fila({
  campo,
  perfil,
  origen,
  enfoque,
  editando,
  onEditar,
  onGuardar,
  onCancelar,
}: {
  campo: CampoPerfil;
  perfil: Perfil;
  origen?: FuenteCampo;
  enfoque: boolean;
  editando: boolean;
  onEditar: () => void;
  onGuardar: (v: Perfil) => void;
  onCancelar: () => void;
}) {
  const info = INFO_CAMPO[campo];
  const texto = valorTexto(perfil, campo);
  const esLista = info.tipo === "lista";
  const items = esLista ? ((perfil[campo] as string[] | undefined) ?? []) : [];
  const FuenteIco = origen ? ICONO_FUENTE[origen.fuente] : null;
  const tint = campo === "dolores" || campo === "incidentes" ? "#ff6b6b" : campo === "prioridades" ? "#35e0a1" : "#9eb0c0";

  return (
    <div key={origen?.en ?? 0} className={cn("group -mx-2 border-b border-white/[0.06] px-2 py-2 last:border-0", reciente(origen) && css.destello, enfoque && !editando && css.enfoque)}>
      <div className="flex items-center gap-2">
        <span className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-[#9eb0c0]/75">{info.etiqueta}</span>
        {enfoque && (
          <span className="inline-flex items-center gap-1 font-mono text-[8.5px] uppercase tracking-[0.18em] text-[#ffd166]">
            <span className={cn("size-1.5 rounded-full bg-[#ffd166]", css.puntoEnfoque)} aria-hidden="true" />
            preguntando ahora
          </span>
        )}
        {!editando && (
          <button
            type="button"
            onClick={onEditar}
            className="ml-auto p-0.5 text-white/30 opacity-60 transition-opacity hover:text-white group-hover:opacity-100 focus-visible:opacity-100"
            aria-label={`Editar ${info.etiqueta}`}
          >
            <PencilLine className="size-3" aria-hidden="true" />
          </button>
        )}
      </div>
      {editando ? (
        <Editor campo={campo} perfil={perfil} onGuardar={onGuardar} onCancelar={onCancelar} />
      ) : (
        <button type="button" onClick={onEditar} className="mt-1 block w-full text-left" aria-label={texto ? `${info.etiqueta}: ${texto}. Editar` : `Llenar ${info.etiqueta}`}>
          {esLista && items.length ? (
            <span className="flex flex-wrap gap-1">
              {items.map((x, i) => (
                <span
                  key={x}
                  className="border px-1.5 py-0.5 text-[11.5px] leading-snug text-white/90 animate-in fade-in zoom-in-95 fill-mode-both duration-500"
                  style={{ borderColor: rgba(tint, 0.35), background: rgba(tint, 0.08), animationDelay: `${i * 60}ms` }}
                >
                  {x}
                </span>
              ))}
            </span>
          ) : texto ? (
            <span className="block text-[13px] leading-snug text-white">
              <Maquina key={texto} texto={texto} animar={reciente(origen)} />
            </span>
          ) : (
            <span className="block h-2 w-20 animate-pulse bg-white/[0.07] motion-reduce:animate-none" aria-hidden="true" />
          )}
        </button>
      )}
      {origen && FuenteIco && texto && !editando && (
        <p className="mt-1 flex items-center gap-1 text-[10px] text-[#9eb0c0]/60">
          <FuenteIco className="size-2.5" aria-hidden="true" />
          <span className="truncate">{etiquetaFuente(origen)}</span>
        </p>
      )}
    </div>
  );
}

/* ───────────── Panel ───────────── */

export type PropsPerfil = {
  perfil: Perfil;
  origenes: Origenes;
  progreso: Progreso | null;
  datos: DatoEmpresa[];
  areasVistas: AreaId[];
  turnos: number;
  ocupado: boolean;
  onEditar: (campo: CampoPerfil, valor: Perfil) => void;
  onPreguntar: (campo: CampoPerfil) => void;
};

export function PerfilVivo({ perfil, origenes, progreso, datos, areasVistas, turnos, ocupado, onEditar, onPreguntar }: PropsPerfil) {
  const [editando, setEditando] = useState<CampoPerfil | null>(null);
  const pct = porcentaje(perfil);
  const faltan = (progreso?.faltan.length ? progreso.faltan : faltantes(perfil)).filter((c) => !lleno(perfil, c));
  const enfoque = progreso?.enfoque ?? null;
  const pregunta = progreso ? `Pregunta ${progreso.pregunta} de ~${progreso.total}` : `Pregunta ${Math.min(turnos + 1, 8)} de ~8`;
  const guardar = (c: CampoPerfil) => (v: Perfil) => {
    onEditar(c, v);
    setEditando(null);
  };

  return (
    <aside className="flex flex-col gap-4" aria-label="Perfil de tu empresa en construcción">
      <section className="border border-white/10 bg-[#071229]/80 p-4 backdrop-blur">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#6b8aff]">Perfil en construcción</p>
          <span className="font-mono text-[13px] font-bold tabular-nums text-white" aria-label={`${pct}% completo`}>
            <Contador valor={pct} />%
          </span>
        </div>
        <div className="relative mt-2 h-1.5 overflow-hidden bg-white/[0.06]">
          <div
            className="h-full bg-gradient-to-r from-[#1d3885] via-[#2348d4] to-[#6b8aff] shadow-[0_0_12px_#2348d4] transition-[width] duration-1000 ease-out"
            style={{ width: `${Math.max(3, pct)}%` }}
          />
        </div>
        <p className="mt-1.5 flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.2em] text-[#9eb0c0]/80">
          {ocupado && <Sparkles className="size-3 animate-pulse text-[#6b8aff] motion-reduce:animate-none" aria-hidden="true" />}
          {pregunta}
        </p>

        <div className={cn("-mx-2 mt-3 px-2 py-1", reciente(origenes.nombre) && css.destello, enfoque === "nombre" && editando !== "nombre" && css.enfoque)} key={`n-${origenes.nombre?.en ?? 0}`}>
          {editando === "nombre" ? (
            <Editor campo="nombre" perfil={perfil} onGuardar={guardar("nombre")} onCancelar={() => setEditando(null)} />
          ) : (
            <button type="button" onClick={() => setEditando("nombre")} className="group flex w-full items-center gap-2 text-left" aria-label="Editar nombre de la empresa">
              <h2 className="min-w-0 flex-1 truncate font-serif text-2xl leading-tight text-white">
                {perfil.nombre ? <Maquina key={perfil.nombre} texto={perfil.nombre} animar={reciente(origenes.nombre)} /> : <span className="text-white/30">Tu empresa</span>}
              </h2>
              <PencilLine className="size-3.5 shrink-0 text-white/30 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="mt-1">
          {CAMPOS_PERFIL.filter((c) => c !== "nombre").map((c) => (
            <Fila
              key={c}
              campo={c}
              perfil={perfil}
              origen={origenes[c]}
              enfoque={enfoque === c}
              editando={editando === c}
              onEditar={() => setEditando(c)}
              onGuardar={guardar(c)}
              onCancelar={() => setEditando(null)}
            />
          ))}
        </div>
      </section>

      {faltan.length > 0 && (
        <section className="border border-white/10 bg-[#071229]/60 p-4">
          <div className="flex items-baseline justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#9eb0c0]">Lo que falta</p>
            <span className="font-mono text-[10px] text-[#9eb0c0]/60">{faltan.length}</span>
          </div>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {faltan.map((c, i) => (
              <li key={c} className="animate-in fade-in fill-mode-both duration-300" style={{ animationDelay: `${i * 40}ms` }}>
                <button
                  type="button"
                  disabled={ocupado}
                  onClick={() => onPreguntar(c)}
                  className="inline-flex items-center gap-1 border border-white/12 px-2 py-1 text-[11.5px] text-white/80 transition-colors hover:border-[#6b8aff]/60 hover:bg-[#2348d4]/15 hover:text-white disabled:opacity-40"
                  title={`Pídele a Ars que pregunte por ${INFO_CAMPO[c].etiqueta.toLowerCase()}`}
                >
                  <MessageSquare className="size-3 text-[#6b8aff]" aria-hidden="true" />
                  {INFO_CAMPO[c].etiqueta}
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] text-[#9eb0c0]/70">Toca uno y Ars te pregunta por ese dato, o llénalo tú con el lápiz.</p>
        </section>
      )}

      <section className="border border-white/10 bg-[#071229]/60 p-4">
        <div className="flex items-baseline justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#9eb0c0]">Áreas que se encienden</p>
          <span className="font-mono text-[10px] tabular-nums text-white/70">{areasVistas.length}/{AREA_IDS.length}</span>
        </div>
        <ul className="mt-3 grid grid-cols-6 gap-1.5">
          {AREA_IDS.map((id) => {
            const a = areaInfo(id);
            const on = areasVistas.includes(id);
            return (
              <li
                key={id}
                title={a.nombre}
                className={cn("relative grid aspect-square place-items-center border transition-all duration-700", on && css.areaViva, on && "animate-in zoom-in-75")}
                style={
                  on
                    ? { borderColor: rgba(a.color, 0.6), background: rgba(a.color, 0.15), color: a.color, boxShadow: `0 0 18px ${rgba(a.color, 0.35)}` }
                    : { borderColor: "rgba(255,255,255,0.06)", color: "rgba(158,176,192,0.3)" }
                }
              >
                <Icono nombre={a.icono} className="size-4" />
                <span className="sr-only">
                  {a.nombre}
                  {on ? " (relevante)" : ""}
                </span>
              </li>
            );
          })}
        </ul>
        {areasVistas.length > 0 ? (
          <ul className="mt-2.5 flex flex-wrap gap-1">
            {areasVistas.map((id) => {
              const a = areaInfo(id);
              return (
                <li key={id} className="border px-1.5 py-px text-[10.5px] animate-in fade-in slide-in-from-left-1 duration-500" style={{ borderColor: rgba(a.color, 0.3), color: a.color }}>
                  {a.corto}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-2 text-[11.5px] text-[#9eb0c0]/80">Las áreas de ARS se encienden según lo que nos cuentes o nos muestres.</p>
        )}
      </section>

      {datos.length > 0 && (
        <section className="border border-white/10 bg-[#071229]/60 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#9eb0c0]">Lo que vamos notando</p>
          <ul className="mt-2 space-y-2.5">
            {datos.map((d, i) => (
              <li key={`${d.titulo}-${i}`} className="flex gap-2.5 animate-in fade-in slide-in-from-bottom-1 duration-500">
                <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-[#ffd166]" aria-hidden="true" />
                <div>
                  <p className="text-[12.5px] font-bold text-white">{d.titulo}</p>
                  <p className="text-[12px] leading-snug text-[#9eb0c0]">{d.texto}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </aside>
  );
}

/** Barra compacta para móvil: % y botón para abrir la hoja con el perfil. */
export function BarraPerfil({ pct, pregunta, onAbrir, children }: { pct: number; pregunta: string; onAbrir: () => void; children?: ReactNode }) {
  return (
    <button type="button" onClick={onAbrir} className="flex w-full items-center gap-3 border-b border-white/[0.07] bg-[#071229]/90 px-4 py-2 text-left lg:hidden" aria-label={`Ver perfil en construcción (${pct}%)`}>
      <span className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-[#6b8aff]">Perfil</span>
      <span className="relative h-1 flex-1 overflow-hidden bg-white/[0.08]">
        <span className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#2348d4] to-[#6b8aff] transition-[width] duration-1000" style={{ width: `${Math.max(3, pct)}%` }} />
      </span>
      <span className="font-mono text-[11px] font-bold tabular-nums text-white">
        <Contador valor={pct} />%
      </span>
      <span className="hidden font-mono text-[9px] uppercase tracking-[0.18em] text-[#9eb0c0]/70 min-[400px]:inline">{pregunta}</span>
      {children}
    </button>
  );
}
