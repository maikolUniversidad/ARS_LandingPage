"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { Cuadro } from "./datos";
import { useMovimientoReducido, useTamano } from "./hooks";
import s from "./movimiento.module.css";

/** Duración de cada pantalla y momento del clic dentro de ella (ms). */
const DURACION = 3800;
const CLIC = 1350;

const limitar = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

/**
 * Encuadre tipo «cover» que deja el punto de clic lo más centrado posible.
 * Devuelve el tamaño y la posición (px) de la captura dentro del marco.
 */
function encuadre(cuadro: Cuadro, ancho: number, alto: number) {
  const r = cuadro.captura.ancho / cuadro.captura.alto;
  const w = ancho / alto > r ? ancho : alto * r;
  const h = w / r;
  const izq = limitar(ancho / 2 - (cuadro.foco.cx / 100) * w, ancho - w, 0);
  const arr = limitar(alto / 2 - (cuadro.foco.cy / 100) * h, alto - h, 0);
  return { w, h, izq, arr };
}

/**
 * «GIF» hecho con capturas reales: fundido entre pantallas, acercamiento lento
 * hacia la zona de interés y un cursor simulado que llega, hace clic y la resalta.
 * Solo anima con `activo` (a la vista) y sin «reducir movimiento».
 */
export function SecuenciaGif({
  cuadros,
  color,
  activo,
  sizes,
  className,
}: {
  cuadros: Cuadro[];
  color: string;
  activo: boolean;
  sizes: string;
  className?: string;
}) {
  const marco = useRef<HTMLDivElement>(null);
  const { ancho, alto } = useTamano(marco);
  const reducido = useMovimientoReducido();
  const [i, setI] = useState(0);
  const [clic, setClic] = useState(false);
  const n = cuadros.length;
  const corre = activo && !reducido && n > 0;

  useEffect(() => {
    if (!corre) return;
    const t1 = window.setTimeout(() => setClic(true), CLIC);
    const t2 = window.setTimeout(() => {
      setClic(false);
      setI((x) => (x + 1) % n);
    }, DURACION);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [corre, i, n]);

  const medido = ancho > 0 && alto > 0;
  const actual = cuadros[i];
  const enc = medido && actual ? encuadre(actual, ancho, alto) : null;
  const cursorX = enc ? enc.izq + (actual.foco.cx / 100) * enc.w : 0;
  const cursorY = enc ? enc.arr + (actual.foco.cy / 100) * enc.h : 0;
  const mostrarResalte = reducido || clic;

  return (
    <div
      ref={marco}
      data-pausa={!corre}
      className={cn("absolute inset-0 overflow-hidden bg-[#060f24]", className)}
    >
      {cuadros.map((c, k) => {
        const e = medido ? encuadre(c, ancho, alto) : null;
        const visible = k === i;
        return (
          <div
            key={c.captura.src}
            aria-hidden={!visible}
            className={cn(
              "absolute transition-opacity duration-700 ease-out",
              visible ? "opacity-100" : "opacity-0",
              !e && "inset-0",
            )}
            style={
              e
                ? { width: e.w, height: e.h, left: e.izq, top: e.arr }
                : undefined
            }
          >
            <div
              className={cn(
                "relative h-full w-full",
                visible && corre
                  ? "scale-[1.08] transition-transform duration-[4200ms] ease-out"
                  : "scale-100 transition-transform delay-700 duration-0",
              )}
              style={{ transformOrigin: `${c.foco.cx}% ${c.foco.cy}%` }}
            >
              <Image
                src={c.captura.src}
                alt={visible ? c.captura.alt : ""}
                width={c.captura.ancho}
                height={c.captura.alto}
                sizes={sizes}
                loading="lazy"
                className={cn(
                  "h-full w-full",
                  e ? "object-fill" : "object-cover object-left-top",
                )}
              />
              {visible && mostrarResalte && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none absolute rounded-md border-2",
                    s.resalte,
                  )}
                  style={{
                    left: `${c.foco.x}%`,
                    top: `${c.foco.y}%`,
                    width: `${c.foco.w}%`,
                    height: `${c.foco.h}%`,
                    borderColor: color,
                    background: `${color}1f`,
                    boxShadow: `0 0 0 9999px rgba(2,10,24,0.38), 0 0 24px ${color}66`,
                  }}
                />
              )}
            </div>
          </div>
        );
      })}

      {/* Cursor simulado */}
      {enc && !reducido && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 z-10 transition-transform duration-1000 ease-in-out"
          style={{ transform: `translate(${cursorX}px, ${cursorY}px)` }}
        >
          {clic && (
            <span
              key={`onda-${i}`}
              className={cn(
                "absolute left-0 top-0 size-10 rounded-full border-2",
                s.onda,
              )}
              style={{ borderColor: color }}
            />
          )}
          <svg
            key={`cursor-${i}-${clic}`}
            width="22"
            height="24"
            viewBox="0 0 22 24"
            className={cn(
              "-translate-x-[3px] -translate-y-[2px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]",
              clic && s.toque,
            )}
          >
            <path
              d="M3 2 L3 19 L7.6 14.8 L10.6 21.6 L13.6 20.3 L10.7 13.6 L17 13.6 Z"
              fill="#fff"
              stroke="#020a18"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}

      {/* Indicador de cuadro */}
      {n > 1 && (
        <div
          aria-hidden="true"
          className="absolute right-3 top-11 z-10 flex gap-1"
        >
          {cuadros.map((c, k) => (
            <span
              key={c.captura.src}
              className={cn(
                "h-1 rounded-full transition-all duration-500",
                k === i ? "w-4" : "w-1.5 bg-white/35",
              )}
              style={k === i ? { background: color } : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
