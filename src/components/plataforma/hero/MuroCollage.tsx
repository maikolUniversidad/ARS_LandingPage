"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/dictionaries";
import type { Pantalla } from "./pantallas";

/**
 * Respaldo sin WebGL: el mismo muro como collage CSS 3D (perspective + rotateY).
 * Cada pantalla es un botón que abre su pie de foto, igual que en la escena 3D.
 */
export function MuroCollage({
  pantallas,
  locale,
  focused,
  onSelect,
}: {
  pantallas: Pantalla[];
  locale: Locale;
  focused: number | null;
  onSelect: (index: number | null) => void;
}) {
  const filas = pantallas.length > 4 ? 2 : 1;
  const porFila = Math.ceil(pantallas.length / filas);
  const rows = Array.from({ length: filas }, (_, f) => pantallas.slice(f * porFila, (f + 1) * porFila));

  return (
    <div
      className="absolute inset-0 flex items-start justify-center overflow-hidden pt-[12svh] [perspective:1100px] lg:items-center lg:pl-[28%] lg:pt-0"
      onClick={(e) => {
        if (e.target === e.currentTarget) onSelect(null);
      }}
    >
      <div className="pointer-events-none flex flex-col items-center gap-4 [transform-style:preserve-3d] md:gap-6">
        {rows.map((row, f) => (
          <div key={f} className={cn("pointer-events-none flex items-center gap-3 [transform-style:preserve-3d] md:gap-5", f === 1 && "translate-x-[6%]")}>
            {row.map((p, k) => {
              const i = f * porFila + k;
              const off = k - (row.length - 1) / 2;
              const activo = focused === i;
              return (
                <button
                  key={p.src}
                  type="button"
                  onClick={() => onSelect(activo ? null : i)}
                  aria-label={`${p.modulo[locale]} — ${p.area[locale]}`}
                  style={{
                    transform: `rotateY(${(-off * 11).toFixed(1)}deg) translateZ(${(activo ? 90 : -Math.abs(off) * 28).toFixed(0)}px) scale(${activo ? 1.7 : 1})`,
                    borderColor: `${p.color}${activo ? "ff" : "66"}`,
                    boxShadow: `0 0 ${activo ? 42 : 18}px ${p.color}${activo ? "66" : "26"}`,
                  }}
                  className={cn(
                    "pointer-events-auto relative aspect-[16/8.5] w-[34vw] shrink-0 overflow-hidden border-2 bg-[#020a18] p-1 transition-[transform,opacity,box-shadow] duration-500 sm:w-[24vw] lg:w-[9.5vw]",
                    focused !== null && !activo && "opacity-35"
                  )}
                >
                  <span className="relative block size-full overflow-hidden">
                    <Image src={p.src} alt={p.alt} fill sizes="(min-width: 1024px) 10vw, 34vw" className="object-contain" />
                    <span className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.03)_0_1px,transparent_1px_3px)]" />
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
