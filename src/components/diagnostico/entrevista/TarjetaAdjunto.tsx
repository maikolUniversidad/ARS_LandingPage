"use client";

import { useRef } from "react";
import { AlertTriangle, Camera, FileText, Film, Image as ImageIcon, Paperclip, Sparkles, Upload, X } from "lucide-react";
import { Icono, rgba } from "@/components/servicios/ui";
import { areaInfo } from "@/lib/diagnostico/catalogo";
import { cn } from "@/lib/utils";
import { ACEPTA, ACEPTA_TODO, formatoBytes } from "./adjuntos";
import { INFO_CAMPO } from "./perfil";
import type { AdjuntoLocal, PedidoAdjunto } from "./useEntrevista";
import css from "./entrevista.module.css";

const ICONO = { imagen: ImageIcon, video: Film, documento: FileText, audio: FileText } as const;

/** Un archivo compartido en el chat: miniatura, «Ars está mirando…» y lo que entendió. */
export function TarjetaAdjunto({ a, onQuitar }: { a: AdjuntoLocal; onQuitar: () => void }) {
  const Ico = ICONO[a.tipo];
  const mirando = a.estado === "preparando" || a.estado === "mirando";
  const r = a.resultado;
  return (
    <div className="w-[min(100%,26rem)] overflow-hidden border border-[#6b8aff]/25 bg-[#0a1838]/90 animate-in fade-in zoom-in-95 slide-in-from-right-3 duration-500">
      <div className="flex gap-3 p-2.5">
        <div className="relative size-20 shrink-0 overflow-hidden bg-[#020a18]">
          {a.miniatura ? (
            // eslint-disable-next-line @next/next/no-img-element -- URL local (blob:) de la vista previa
            <img src={a.miniatura} alt="" className={cn("size-full object-cover transition-[filter] duration-700", mirando && "brightness-75 saturate-50")} />
          ) : (
            <span className="grid size-full place-items-center text-[#6b8aff]">
              <Ico className="size-7" aria-hidden="true" />
            </span>
          )}
          {a.tipo === "video" && a.miniatura && (
            <span className="absolute bottom-1 left-1 bg-black/60 px-1 font-mono text-[9px] uppercase tracking-wider text-white">video</span>
          )}
          {mirando && <span className={css.escaneo} aria-hidden="true" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <p className="min-w-0 flex-1 truncate text-[13px] font-bold text-white" title={a.nombre}>
              {a.nombre}
            </p>
            <button type="button" onClick={onQuitar} className="-m-1 p-1 text-white/40 hover:text-white" aria-label={`Quitar ${a.nombre}`}>
              <X className="size-3.5" aria-hidden="true" />
            </button>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#9eb0c0]/70">
            {a.tipo} · {formatoBytes(a.bytes)}
          </p>
          {mirando && (
            <p className="mt-2 flex items-center gap-1.5 text-[12.5px]" aria-live="polite">
              <Sparkles className="size-3.5 text-[#6b8aff]" aria-hidden="true" />
              <span className={css.brillo}>
                {a.estado === "preparando"
                  ? a.tipo === "video"
                    ? `Tomando fotogramas${a.avance ? ` · ${Math.round(a.avance * 100)}%` : "…"}`
                    : "Preparando…"
                  : "Ars está mirando…"}
              </span>
            </p>
          )}
          {a.estado === "error" && (
            <p className="mt-2 flex gap-1.5 text-[12.5px] leading-snug text-[#ffb3b3]">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              {a.error}
            </p>
          )}
          {r && <p className="mt-1.5 text-[12.5px] leading-snug text-white/85 animate-in fade-in duration-700">{r.resumen}</p>}
        </div>
      </div>
      {r && (r.hallazgos.length > 0 || (a.llenados?.length ?? 0) > 0 || r.areas.length > 0) && (
        <div className="space-y-2 border-t border-white/[0.07] px-3 py-2.5 animate-in fade-in slide-in-from-top-1 duration-700">
          {r.hallazgos.length > 0 && (
            <ul className="space-y-1">
              {r.hallazgos.slice(0, 4).map((h, i) => (
                <li key={h} className="flex gap-2 text-[12px] leading-snug text-[#c9d5e0] animate-in fade-in slide-in-from-left-1 fill-mode-both duration-500" style={{ animationDelay: `${200 + i * 120}ms` }}>
                  <span className="mt-1.5 size-1 shrink-0 bg-[#6b8aff]" aria-hidden="true" />
                  {h}
                </li>
              ))}
            </ul>
          )}
          {(a.llenados?.length ?? 0) > 0 && (
            <p className="flex flex-wrap items-center gap-1 text-[11px] text-[#35e0a1]">
              <span className="font-mono uppercase tracking-[0.16em] text-[#35e0a1]/80">Llenó:</span>
              {a.llenados?.map((c) => (
                <span key={c} className="border border-[#35e0a1]/30 bg-[#35e0a1]/10 px-1.5 py-px">
                  {INFO_CAMPO[c].etiqueta}
                </span>
              ))}
            </p>
          )}
          {r.areas.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {r.areas.map((id) => {
                const info = areaInfo(id);
                return (
                  <span key={id} className="inline-flex items-center gap-1 border px-1.5 py-px text-[10.5px]" style={{ borderColor: rgba(info.color, 0.35), color: info.color }}>
                    <Icono nombre={info.icono} className="size-3" />
                    {info.corto}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const TEXTO_PEDIDO = {
  imagen: { subir: "Subir foto", tomar: "Tomar foto", acepta: ACEPTA.imagen, captura: "environment" as const },
  video: { subir: "Subir video", tomar: "Grabar video", acepta: ACEPTA.video, captura: "environment" as const },
  documento: { subir: "Subir documento", tomar: null, acepta: ACEPTA.documento, captura: undefined },
};

/** Ars pide un archivo concreto: botón directo para subirlo o tomarlo con la cámara. */
export function TarjetaPedido({ pedido, onArchivos, deshabilitado }: { pedido: PedidoAdjunto; onArchivos: (f: FileList) => void; deshabilitado?: boolean }) {
  const subir = useRef<HTMLInputElement>(null);
  const tomar = useRef<HTMLInputElement>(null);
  const t = TEXTO_PEDIDO[pedido.tipo];
  const Ico = pedido.tipo === "documento" ? FileText : pedido.tipo === "video" ? Film : Camera;
  const alCambiar = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) onArchivos(e.target.files);
    e.target.value = "";
  };
  return (
    <div className="mt-3 max-w-md border border-dashed border-[#6b8aff]/45 bg-[#2348d4]/[0.08] p-3 animate-in fade-in zoom-in-95 duration-500">
      <p className="flex items-start gap-2 text-[13px] leading-snug text-white">
        <span className="grid size-7 shrink-0 place-items-center bg-[#2348d4]/40 text-[#d5e0ff]">
          <Ico className="size-3.5" aria-hidden="true" />
        </span>
        <span>{pedido.motivo}</span>
      </p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {t.tomar && (
          <button
            type="button"
            disabled={deshabilitado}
            onClick={() => tomar.current?.click()}
            className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#020a18] hover:bg-[#d5e0ff] disabled:opacity-40 sm:hidden"
          >
            <Camera className="size-3.5" aria-hidden="true" /> {t.tomar}
          </button>
        )}
        <button
          type="button"
          disabled={deshabilitado}
          onClick={() => subir.current?.click()}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] disabled:opacity-40",
            t.tomar ? "border border-white/20 text-white hover:border-[#6b8aff] sm:border-0 sm:bg-white sm:text-[#020a18] sm:hover:bg-[#d5e0ff]" : "bg-white text-[#020a18] hover:bg-[#d5e0ff]",
          )}
        >
          <Upload className="size-3.5" aria-hidden="true" /> {t.subir}
        </button>
      </div>
      <input ref={subir} type="file" accept={t.acepta} multiple className="sr-only" tabIndex={-1} onChange={alCambiar} aria-hidden="true" />
      {t.tomar && <input ref={tomar} type="file" accept={t.acepta} capture={t.captura} className="sr-only" tabIndex={-1} onChange={alCambiar} aria-hidden="true" />}
    </div>
  );
}

/** Capa que aparece al arrastrar archivos sobre la conversación. */
export function CapaSoltar() {
  return (
    <div className="pointer-events-none absolute inset-2 z-30 grid place-items-center border-2 border-dashed border-[#6b8aff] bg-[#020a18]/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="text-center">
        <Paperclip className="mx-auto size-8 text-[#6b8aff]" aria-hidden="true" />
        <p className="mt-2 font-serif text-xl text-white">Suelta aquí tus archivos</p>
        <p className="mt-1 text-[12.5px] text-[#9eb0c0]">Fotos, videos, PDF u hojas de cálculo. Ars los mira y llena tu perfil.</p>
      </div>
    </div>
  );
}

export { ACEPTA_TODO };
