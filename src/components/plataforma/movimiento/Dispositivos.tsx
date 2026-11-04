"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { Area, Captura, Modulo } from "@/data/servicios";
import { cn } from "@/lib/utils";
import s from "./movimiento.module.css";

/** Medidas reales del arte de cada área (/public/servicios/arte). */
const ARTE = { ancho: 1280, alto: 720 };
/** Tiempo de cada pantalla en el portátil (ms). */
export const TIEMPO_PANTALLA = 3600;

/** Rota un índice cada `ms` mientras `activo`. */
function useRotacion(n: number, ms: number, activo: boolean) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!activo || n < 2) return;
    const id = window.setInterval(() => setI((x) => (x + 1) % n), ms);
    return () => window.clearInterval(id);
  }, [activo, n, ms]);
  return n ? i % n : 0;
}

/**
 * Portátil (y, en áreas de campo, un celular) en perspectiva 3D con CSS.
 * La pantalla rota por las capturas reales del área; sin capturas, muestra su arte.
 */
export function Dispositivos({
  area,
  capturas,
  modulos,
  conTelefono,
  activo,
  etiquetas,
}: {
  area: Area;
  capturas: Captura[];
  modulos: Modulo[];
  conTelefono: boolean;
  activo: boolean;
  etiquetas: { pantalla: string; telefono: string; arte: string };
}) {
  const i = useRotacion(capturas.length, TIEMPO_PANTALLA, activo);
  const actual = capturas[i];

  return (
    <div className="relative mx-auto w-full max-w-[680px] pt-4">
      <div className="relative pb-6 [perspective:1800px] sm:pb-8">
        {/* Halo del color del área */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-[18%] bottom-[4%] h-1/4 rounded-[50%] opacity-25 blur-3xl transition-colors duration-700"
          style={{ background: area.color }}
        />

        <div
          className={cn(
            "relative transition-transform duration-1000 ease-out [transform-style:preserve-3d]",
            conTelefono
              ? "[transform:rotateX(7deg)_rotateY(-14deg)_translateX(-4%)]"
              : "[transform:rotateX(7deg)_rotateY(-10deg)]",
          )}
        >
          {/* Tapa con la pantalla */}
          <div className="relative rounded-t-[14px] border border-white/15 bg-gradient-to-b from-[#1b2538] to-[#0b1220] p-[1.8%] pb-[2.6%] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)]">
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-[0.7%] size-1 -translate-x-1/2 rounded-full bg-white/25"
            />
            <div className="relative aspect-[16/10] overflow-hidden rounded-[4px] bg-[#020a18]">
              {capturas.length ? (
                capturas.map((c, k) => (
                  <PantallaCaptura key={c.src} captura={c} visible={k === i} />
                ))
              ) : (
                <Image
                  src={area.arte ?? ""}
                  alt={`${etiquetas.arte}: ${area.nombre}`}
                  width={ARTE.ancho}
                  height={ARTE.alto}
                  sizes="(min-width: 1024px) 640px, 92vw"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
              {/* Reflejo del vidrio y barrido de luz */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.08)_0%,transparent_38%,transparent_70%,rgba(255,255,255,0.04)_100%)]"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-1/3 overflow-hidden opacity-40"
              >
                <span
                  className={cn(
                    "block h-full w-full bg-gradient-to-b from-transparent via-white/10 to-transparent",
                    s.barrido,
                  )}
                />
              </span>
            </div>
          </div>
          {/* Bisagra y base (teclado inclinado) */}
          <div
            aria-hidden="true"
            className="relative h-[10px] rounded-b-sm bg-gradient-to-b from-[#3a4660] to-[#1a2235]"
          />
          <div
            aria-hidden="true"
            className="relative -mx-[7%] h-[70px] origin-top rounded-b-[18px] border border-white/10 bg-gradient-to-b from-[#2a3550] via-[#1c2539] to-[#111829] -mb-[46px] [transform:rotateX(72deg)] sm:-mb-[64px] sm:h-[96px]"
          >
            <div className="absolute inset-x-[9%] top-[10%] h-[52%] rounded-md bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.06)_0_6%,transparent_6%_7%),repeating-linear-gradient(0deg,rgba(255,255,255,0.05)_0_18%,transparent_18%_22%)]" />
            <div className="absolute left-1/2 top-[68%] h-[24%] w-[30%] -translate-x-1/2 rounded-md border border-white/10 bg-white/[0.04]" />
          </div>
        </div>

        {conTelefono && (
          <Telefono
            area={area}
            modulos={modulos}
            activo={activo}
            etiqueta={etiquetas.telefono}
          />
        )}
      </div>

      {/* Pie de la pantalla actual */}
      <p
        className="relative mt-2 flex min-h-[2.5rem] items-start gap-2 text-xs leading-relaxed text-[#9eb0c0]"
        aria-live="polite"
      >
        <span
          className="mt-[7px] inline-block h-px w-3 shrink-0"
          style={{ background: area.color }}
          aria-hidden="true"
        />
        <span>
          <span className="sr-only">{etiquetas.pantalla}: </span>
          {actual ? actual.pie : area.frase}
        </span>
      </p>
    </div>
  );
}

function PantallaCaptura({
  captura,
  visible,
}: {
  captura: Captura;
  visible: boolean;
}) {
  /** Las capturas muy apaisadas (franjas) se muestran completas sobre un fondo desenfocado. */
  const franja = captura.ancho / captura.alto > 2.3;
  return (
    <div
      aria-hidden={!visible}
      className={cn(
        "absolute inset-0 transition-[opacity,transform] duration-700 ease-out",
        visible ? "scale-100 opacity-100" : "scale-[1.03] opacity-0",
      )}
    >
      {franja && (
        <Image
          src={captura.src}
          alt=""
          width={captura.ancho}
          height={captura.alto}
          sizes="320px"
          loading="lazy"
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-xl"
        />
      )}
      <Image
        src={captura.src}
        alt={visible ? captura.alt : ""}
        width={captura.ancho}
        height={captura.alto}
        sizes="(min-width: 1024px) 640px, 92vw"
        loading="lazy"
        className={cn(
          "absolute h-full w-full",
          franja
            ? "inset-x-0 top-1/2 h-auto -translate-y-1/2 shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
            : "inset-0 object-cover object-left-top",
        )}
      />
    </div>
  );
}

/** Celular de campo: fondo con el arte del área y los módulos destacados como tarjetas. */
function Telefono({
  area,
  modulos,
  activo,
  etiqueta,
}: {
  area: Area;
  modulos: Modulo[];
  activo: boolean;
  etiqueta: string;
}) {
  const lista = modulos.slice(0, 3);
  const k = useRotacion(lista.length, 2200, activo);
  return (
    <div
      className="absolute bottom-0 right-0 w-[22%] min-w-[76px] max-w-[170px] sm:w-[25%] [transform:rotateY(-20deg)_rotateX(6deg)_translateZ(80px)] sm:right-[1%]"
      role="img"
      aria-label={`${etiqueta}: ${lista.map((m) => m.nombre).join(", ")}`}
    >
      <div className="relative aspect-[9/19] overflow-hidden rounded-[1.4rem] border-[3px] border-[#2a3550] bg-[#020a18] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.08)]">
        {area.arte && (
          <Image
            src={area.arte}
            alt=""
            width={ARTE.ancho}
            height={ARTE.alto}
            sizes="180px"
            className="absolute inset-0 h-full w-full object-cover opacity-55"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#020a18]/30 via-[#020a18]/50 to-[#020a18]/95" />
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-[2.5%] h-[2.2%] w-[32%] -translate-x-1/2 rounded-full bg-black"
        />
        <div className="absolute inset-x-[7%] top-[11%] flex items-center gap-1.5">
          <span
            className="grid size-5 shrink-0 place-items-center rounded-md font-mono text-[9px] font-bold text-[#020a18]"
            style={{ background: area.color }}
          >
            {area.letra}
          </span>
          <span className="truncate font-mono text-[7px] uppercase tracking-[0.18em] text-white/85 sm:text-[8px]">
            {area.corto}
          </span>
        </div>
        <ul className="absolute inset-x-[6%] bottom-[6%] space-y-1.5">
          {lista.map((m, idx) => (
            <li
              key={m.id}
              className={cn(
                "rounded-md border px-1.5 py-1 text-[7px] font-semibold leading-tight text-white backdrop-blur transition-all duration-500 sm:text-[8.5px]",
                idx === k
                  ? "translate-x-0 bg-white/15"
                  : "translate-x-1 border-white/10 bg-white/5 text-white/70",
              )}
              style={idx === k ? { borderColor: area.color } : undefined}
            >
              {m.nombre}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
