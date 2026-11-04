"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowUpRight, X } from "lucide-react";
import { moduloPorId, type EstadoModulo } from "@/data/servicios";
import type { Locale } from "@/lib/i18n/dictionaries";
import { rgba } from "@/components/servicios/ui";
import { CAPAS, COLOR_ESTADO, tx, type Copy, type Nodo } from "./contenido";

export function EstadoChip({ estado, t }: { estado: EstadoModulo; t: Copy }) {
  const c = COLOR_ESTADO[estado];
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1.5 border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-white/85"
      style={{ borderColor: rgba(c, 0.45), background: rgba(c, 0.1) }}
    >
      <span className="inline-block size-1.5 rounded-full" style={{ background: c }} aria-hidden="true" />
      {t.estados[estado]}
    </span>
  );
}

/** Panel lateral (escritorio) u hoja inferior (móvil) con los módulos de un nodo. */
export function PanelNodo({ nodo, l, t, onClose }: { nodo: Nodo; l: Locale; t: Copy; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const cerrarRef = useRef<HTMLButtonElement>(null);
  const capa = CAPAS.find((c) => c.id === nodo.capa);
  const modulos = nodo.modulos.flatMap((id) => {
    const m = moduloPorId(id);
    return m ? [m] : [];
  });

  useEffect(() => {
    cerrarRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !ref.current) return;
      const f = ref.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
      if (!f.length) return;
      const primero = f[0];
      const ultimo = f[f.length - 1];
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, nodo.id]);

  const Icon = nodo.Icon;
  return (
    <>
      <div className="arq-fade fixed inset-0 z-[60] bg-[#020a18]/70 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="arq-panel-titulo"
        className="arq-sube fixed inset-x-0 bottom-0 z-[61] flex max-h-[80svh] flex-col border-t border-white/15 bg-[#04112a]/95 shadow-2xl backdrop-blur-xl lg:inset-y-0 lg:left-auto lg:right-0 lg:max-h-none lg:w-[440px] lg:border-l lg:border-t-0"
        style={{ boxShadow: `0 0 80px ${rgba(nodo.color, 0.18)}` }}
      >
        <span className="absolute inset-x-0 top-0 h-[2px]" style={{ background: nodo.color }} aria-hidden="true" />
        <div className="flex items-start gap-4 border-b border-white/10 p-5 md:p-6">
          <span
            className="grid size-11 shrink-0 place-items-center border"
            style={{ borderColor: rgba(nodo.color, 0.55), background: rgba(nodo.color, 0.12), color: nodo.color }}
            aria-hidden="true"
          >
            <Icon className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            {capa && (
              <div className="font-mono text-[9.5px] uppercase tracking-[0.24em] text-[#9eb0c0]">
                {capa.n} · {tx(capa.titulo, l)}
              </div>
            )}
            <h3 id="arq-panel-titulo" className="mt-1 text-xl font-black leading-tight text-white">
              {tx(nodo.titulo, l)}
            </h3>
            <p className="mt-2 text-[13.5px] leading-relaxed text-[#c5d2ee]">{tx(nodo.desc, l)}</p>
          </div>
          <button
            ref={cerrarRef}
            type="button"
            onClick={onClose}
            className="grid size-9 shrink-0 place-items-center border border-white/15 text-white/80 transition-colors hover:border-white/40 hover:text-white focus-visible:outline-2 focus-visible:outline-[#6b8aff]"
            aria-label={t.cerrar}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain p-5 md:p-6">
          {nodo.extras && (
            <ul className="mb-6 space-y-2">
              {nodo.extras.map((x) => (
                <li key={x.titulo.es}>
                  <Link
                    href={x.href}
                    className="group block border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-white/30"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-bold text-white">{tx(x.titulo, l)}</span>
                      <span className="shrink-0 border border-white/20 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-white/75">
                        {tx(x.etiqueta, l)}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-[#9eb0c0]">{tx(x.detalle, l)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {modulos.length > 0 && (
            <>
              <h4 className="font-mono text-[10px] uppercase tracking-[0.26em] text-[#9eb0c0]">{t.panelModulos}</h4>
              {t.enIngles && <p className="mt-1 text-[11.5px] italic text-white/45">{t.enIngles}</p>}
              <ul className="mt-3 space-y-2">
                {modulos.map(({ area, modulo }) => (
                  <li key={modulo.id}>
                    <Link
                      href={`/servicios/${area.id}#${modulo.id}`}
                      className="group block border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-white/30 hover:bg-white/[0.06]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-bold leading-snug text-white">{modulo.nombre}</span>
                        <EstadoChip estado={modulo.estado} t={t} />
                      </div>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-[#c5d2ee]">{modulo.frase}</p>
                      {modulo.notaEstado && <p className="mt-1.5 text-[11.5px] leading-relaxed text-white/50">{modulo.notaEstado}</p>}
                      <span className="mt-2 inline-flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/55 group-hover:text-white">
                        <span className="inline-block size-1.5" style={{ background: area.color }} aria-hidden="true" />
                        {area.corto}
                        <ArrowUpRight className="size-3" aria-hidden="true" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div className="border-t border-white/10 p-4 md:px-6">
          <Link
            href={nodo.href}
            className="bevel-btn flex items-center justify-center gap-2 bg-white px-5 py-3 font-mono text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#020a18] transition-colors hover:bg-[#d5e0ff]"
          >
            ▸ {t.panelVerArea}
          </Link>
        </div>
      </div>
    </>
  );
}
