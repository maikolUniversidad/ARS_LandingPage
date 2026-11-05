"use client";

import {
  Activity,
  BellRing,
  Cctv,
  Cloud,
  Cpu,
  DatabaseBackup,
  FingerprintPattern,
  GitBranch,
  HardDrive,
  Radar,
  Server,
  ShieldUser,
  Waypoints,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useId, useRef, useSyncExternalStore, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  COLOR,
  COLOR_FLUJO,
  COLOR_SITIO,
  ETIQUETAS,
  MODOS,
  TIPO_FLUJO,
  type ConfigModo,
  type FlujoId,
  type IconoId,
  type ModoDespliegue,
  type SitioId,
} from "./datos";
import { ANCHA, COMPACTA, type Caja, type Disposicion } from "./geometria";

const ICONOS: Record<IconoId, LucideIcon> = {
  camaras: Cctv,
  biometricos: FingerprintPattern,
  sensores: Radar,
  vigilantes: ShieldUser,
  monitor: Activity,
  devops: GitBranch,
  respaldos: DatabaseBackup,
  alertas: BellRing,
  gpu: Cpu,
  plataforma: Server,
  nube: Cloud,
  agente: Waypoints,
  equipo: HardDrive,
};

const FLUJOS = Object.keys(TIPO_FLUJO) as FlujoId[];

/** Duración (s) del recorrido de un paquete según el largo aproximado del trazo. */
const DURACION: Record<FlujoId, number> = {
  "f-sede-dc": 2.6,
  "f-sede-nube": 2.8,
  "f-sede-onprem": 1.4,
  "f-dc-nube": 1.2,
  "f-nube-dc": 1.2,
  "c-dc": 2.4,
  "c-nube": 3,
  "c-onprem": 3.6,
};

const may = (texto: string) => texto.toLocaleUpperCase("es-CO");

function suscribirMovimiento(avisar: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", avisar);
  return () => mq.removeEventListener("change", avisar);
}

function useMovimientoReducido() {
  return useSyncExternalStore(
    suscribirMovimiento,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => true,
  );
}

export function MapaDespliegue({ modo, className }: { modo: ModoDespliegue; className?: string }) {
  const config = MODOS[modo];
  const reducido = useMovimientoReducido();
  const base = useId().replace(/[^a-zA-Z0-9]/g, "");

  return (
    <figure className={cn("relative w-full", className)} data-modo={modo}>
      <Lienzo
        disposicion={ANCHA}
        config={config}
        reducido={reducido}
        prefijo={`${base}a`}
        className="hidden md:block"
      />
      <Lienzo
        disposicion={COMPACTA}
        config={config}
        reducido={reducido}
        prefijo={`${base}c`}
        className="mx-auto max-w-[440px] md:hidden"
      />
      <Leyenda />
    </figure>
  );
}

function Leyenda() {
  const items = [
    { color: COLOR.datos, texto: "Flujo de datos", forma: "linea" },
    { color: COLOR.sincronia, texto: "Sincronía", forma: "linea" },
    { color: COLOR.control, texto: "Canal de la consola", forma: "punteada" },
    { color: COLOR.borde, texto: "Dónde viven los datos", forma: "insignia" },
    { color: COLOR.ia, texto: "Dónde corre la IA", forma: "insignia" },
  ] as const;
  return (
    <figcaption className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-[#9eb0c0] md:text-[10px]">
      {items.map((it) => (
        <span key={it.texto} className="inline-flex items-center gap-1.5">
          <svg width="18" height="8" viewBox="0 0 18 8" aria-hidden="true">
            {it.forma === "insignia" ? (
              <rect x="1" y="0.5" width="16" height="7" rx="3.5" fill={it.color} fillOpacity={0.25} stroke={it.color} />
            ) : (
              <line
                x1="0"
                y1="4"
                x2="18"
                y2="4"
                stroke={it.color}
                strokeWidth="2"
                strokeDasharray={it.forma === "punteada" ? "2 3" : undefined}
                strokeLinecap="round"
              />
            )}
          </svg>
          {it.texto}
        </span>
      ))}
    </figcaption>
  );
}

interface PropsLienzo {
  disposicion: Disposicion;
  config: ConfigModo;
  reducido: boolean;
  prefijo: string;
  className?: string;
}

function Lienzo({ disposicion: d, config, reducido, prefijo, className }: PropsLienzo) {
  const ref = useRef<SVGSVGElement>(null);

  // Las animaciones SMIL se pausan cuando el diagrama no está a la vista (o está oculto).
  useEffect(() => {
    const svg = ref.current;
    if (!svg || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entrada]) => {
      if (entrada?.isIntersecting) svg.unpauseAnimations();
      else svg.pauseAnimations();
    });
    io.observe(svg);
    return () => io.disconnect();
  }, []);

  const activo = (s: SitioId) => config.activos.includes(s);
  const idFlujo = (f: FlujoId) => `${prefijo}-${f}`;

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${d.ancho} ${d.alto}`}
      role="img"
      aria-label={config.aria}
      className={cn("h-auto w-full select-none", className)}
    >
      <defs>
        <filter id={`${prefijo}-brillo`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={d.compacta ? 5 : 8} />
        </filter>
        <pattern id={`${prefijo}-malla`} width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M24 0H0V24" fill="none" stroke="#5fd8ff" strokeOpacity="0.05" />
        </pattern>
      </defs>

      <rect width={d.ancho} height={d.alto} rx={16} fill={COLOR.fondo} />
      <rect width={d.ancho} height={d.alto} rx={16} fill={`url(#${prefijo}-malla)`} />

      {/* Trazos: primero el rastro tenue de todas las rutas posibles, encima las activas. */}
      <g fill="none" strokeLinecap="round">
        {FLUJOS.map((f) => {
          const tipo = TIPO_FLUJO[f];
          const on = config.flujos.includes(f);
          return (
            <g key={f} className={cn("transition-opacity duration-700 ease-out", on ? "opacity-100" : "opacity-[0.08]")}>
              <path
                id={idFlujo(f)}
                d={d.flujos[f]}
                stroke={COLOR_FLUJO[tipo]}
                strokeWidth={tipo === "control" ? 1.4 : 2}
                strokeOpacity={0.75}
                strokeDasharray={tipo === "control" ? "2 5" : "6 6"}
              >
                {!reducido && (
                  <animate
                    attributeName="stroke-dashoffset"
                    from="0"
                    to={tipo === "control" ? "-14" : "-24"}
                    dur="1.2s"
                    repeatCount="indefinite"
                  />
                )}
              </path>
            </g>
          );
        })}
      </g>

      {/* Lugares */}
      <Sitio caja={d.cajas.sede} color={COLOR_SITIO.sede} encendido prefijo={prefijo} tenue />
      <Sitio caja={d.cajas.onprem} color={COLOR_SITIO.onprem} encendido={activo("onprem")} prefijo={prefijo} />
      <Sitio caja={d.cajas.dc} color={COLOR_SITIO.dc} encendido={activo("dc")} prefijo={prefijo} />
      <Sitio caja={d.cajas.nube} color={COLOR_SITIO.nube} encendido={activo("nube")} prefijo={prefijo} />
      <Sitio caja={d.cajas.consola} color={COLOR_SITIO.consola} encendido prefijo={prefijo} />

      {/* Consola única */}
      <g>
        <Texto d={d} x={centro(d.cajas.consola)} y={d.textos.consola.titulo} tam={d.fuente.titulo} color="#ffffff" fuerte anchor="middle">
          {ETIQUETAS.consola.titulo}
        </Texto>
        <Texto d={d} x={centro(d.cajas.consola)} y={d.textos.consola.sub} tam={d.fuente.sub} color={COLOR.control} anchor="middle">
          {ETIQUETAS.consola.sub}
        </Texto>
        {ETIQUETAS.consola.piezas.map((p, i) => (
          <PiezaVertical key={p.texto} d={d} caja={d.piezas.consola[i]!} icono={p.icono} texto={p.texto} color={COLOR.control} />
        ))}
      </g>

      {/* Sede del cliente */}
      <g>
        <Texto d={d} x={d.cajas.sede.x + 16} y={d.textos.sede.titulo} tam={d.fuente.titulo} color="#ffffff" fuerte>
          {ETIQUETAS.sede.titulo}
        </Texto>
        <Texto d={d} x={d.cajas.sede.x + 16} y={d.textos.sede.sub} tam={d.fuente.sub} color="#9eb0c0">
          {ETIQUETAS.sede.sub}
        </Texto>
        {ETIQUETAS.sede.piezas.map((p, i) => (
          <PiezaVertical key={p.texto} d={d} caja={d.piezas.sede[i]!} icono={p.icono} texto={p.texto} color="#c5d2ee" />
        ))}
      </g>

      {/* Equipo on premise */}
      <Atenuable encendido={activo("onprem")}>
        <IconoEn icono="equipo" x={d.cajas.onprem.x + 14} y={d.textos.onprem.titulo - d.icono + 2} tam={d.icono} color={COLOR.borde} />
        <Texto d={d} x={d.cajas.onprem.x + 20 + d.icono} y={d.textos.onprem.titulo} tam={d.fuente.titulo} color="#ffffff" fuerte>
          {ETIQUETAS.onprem.titulo}
        </Texto>
        <Texto d={d} x={d.cajas.onprem.x + 14} y={d.textos.onprem.sub} tam={d.fuente.sub} color={COLOR.borde}>
          {ETIQUETAS.onprem.sub}
        </Texto>
        <Texto d={d} x={d.cajas.onprem.x + 14} y={d.textos.onprem.nota!} tam={d.fuente.nota} color="#9eb0c0">
          {d.compacta ? ETIQUETAS.onprem.notaCorta : ETIQUETAS.onprem.nota}
        </Texto>
        <Insignias d={d} caja={d.cajas.onprem} config={config} sitio="onprem" />
      </Atenuable>

      {/* Centro de datos ARS */}
      <Atenuable encendido={activo("dc")}>
        <Texto d={d} x={d.cajas.dc.x + 16} y={d.textos.dc.titulo} tam={d.fuente.titulo} color="#ffffff" fuerte>
          {d.compacta ? ETIQUETAS.dc.tituloCorto : ETIQUETAS.dc.titulo}
        </Texto>
        <Texto d={d} x={d.cajas.dc.x + 16} y={d.textos.dc.sub} tam={d.fuente.sub} color={COLOR.datos}>
          {d.compacta ? ETIQUETAS.dc.subCorto : ETIQUETAS.dc.sub}
        </Texto>
        {ETIQUETAS.dc.piezas.map((p, i) => (
          <PiezaHorizontal
            key={p.texto}
            d={d}
            caja={d.piezas.dc[i]!}
            icono={p.icono}
            texto={d.compacta ? p.corto : p.texto}
            color={COLOR.datos}
          />
        ))}
        <Insignias d={d} caja={d.cajas.dc} config={config} sitio="dc" />
      </Atenuable>

      {/* Nube del cliente */}
      <Atenuable encendido={activo("nube")}>
        <Texto d={d} x={d.cajas.nube.x + 16} y={d.textos.nube.titulo} tam={d.fuente.titulo} color="#ffffff" fuerte>
          {ETIQUETAS.nube.titulo}
        </Texto>
        {d.compacta ? (
          ETIQUETAS.nube.subLineas.map((linea, i) => (
            <Texto key={linea} d={d} x={d.cajas.nube.x + 16} y={d.textos.nube.sub + i * 12} tam={d.fuente.sub} color={COLOR.sincronia}>
              {linea}
            </Texto>
          ))
        ) : (
          <Texto d={d} x={d.cajas.nube.x + 16} y={d.textos.nube.sub} tam={d.fuente.sub} color={COLOR.sincronia}>
            {ETIQUETAS.nube.sub}
          </Texto>
        )}
        {ETIQUETAS.nube.piezas.map((p, i) => (
          <PiezaHorizontal
            key={p.texto}
            d={d}
            caja={d.piezas.nube[i]!}
            icono={p.icono}
            texto={d.compacta ? p.corto : p.texto}
            color={COLOR.control}
          />
        ))}
        <Texto d={d} x={d.cajas.nube.x + 16} y={d.textos.nube.nota!} tam={d.fuente.nota} color="#9eb0c0">
          {d.compacta ? ETIQUETAS.nube.notaCorta : ETIQUETAS.nube.nota}
        </Texto>
        <Insignias d={d} caja={d.cajas.nube} config={config} sitio="nube" />
      </Atenuable>

      {/* Paquetes que viajan por los trazos activos */}
      {!reducido && (
        <g>
          {FLUJOS.map((f) => {
            const tipo = TIPO_FLUJO[f];
            const on = config.flujos.includes(f);
            const dur = DURACION[f];
            return (
              <g key={f} className={cn("transition-opacity duration-700 ease-out", on ? "opacity-100" : "opacity-0")}>
                {[0, 1, 2].map((i) => (
                  <circle key={i} r={tipo === "control" ? 2.2 : 2.8} fill={COLOR_FLUJO[tipo]}>
                    <animateMotion dur={`${dur}s`} begin={`${(-i * dur) / 3}s`} repeatCount="indefinite" rotate="auto">
                      <mpath href={`#${idFlujo(f)}`} />
                    </animateMotion>
                  </circle>
                ))}
              </g>
            );
          })}
        </g>
      )}
    </svg>
  );
}

const centro = (c: Caja) => c.x + c.w / 2;

function Atenuable({ encendido, children }: { encendido: boolean; children: ReactNode }) {
  return (
    <g className={cn("transition-opacity duration-700 ease-out", encendido ? "opacity-100" : "opacity-30")}>{children}</g>
  );
}

function Sitio({
  caja,
  color,
  encendido,
  prefijo,
  tenue = false,
}: {
  caja: Caja;
  color: string;
  encendido: boolean;
  prefijo: string;
  tenue?: boolean;
}) {
  const { x, y, w, h } = caja;
  return (
    <g>
      {!tenue && (
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          rx={12}
          fill="none"
          stroke={color}
          strokeWidth={6}
          filter={`url(#${prefijo}-brillo)`}
          className={cn("transition-opacity duration-700 ease-out", encendido ? "opacity-45" : "opacity-0")}
        />
      )}
      <rect x={x} y={y} width={w} height={h} rx={12} fill={COLOR.fondo} />
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={12}
        fill={color}
        fillOpacity={tenue ? 0.03 : 0.07}
        stroke={color}
        strokeOpacity={tenue ? 0.3 : 0.85}
        strokeWidth={1.2}
        className={cn("transition-opacity duration-700 ease-out", encendido ? "opacity-100" : "opacity-30")}
      />
    </g>
  );
}

function Texto({
  d,
  x,
  y,
  tam,
  color,
  fuerte = false,
  anchor = "start",
  children,
}: {
  d: Disposicion;
  x: number;
  y: number;
  tam: number;
  color: string;
  fuerte?: boolean;
  anchor?: "start" | "middle";
  children: string;
}) {
  return (
    <text
      x={x}
      y={y}
      fontSize={tam}
      fill={color}
      textAnchor={anchor}
      fontWeight={fuerte ? 700 : 400}
      className={cn("font-mono", fuerte ? (d.compacta ? "tracking-[0.08em]" : "tracking-[0.16em]") : "tracking-[0.12em]")}
    >
      {may(children)}
    </text>
  );
}

function IconoEn({ icono, x, y, tam, color }: { icono: IconoId; x: number; y: number; tam: number; color: string }) {
  const Icono = ICONOS[icono];
  return <Icono x={x} y={y} width={tam} height={tam} color={color} strokeWidth={1.8} aria-hidden="true" />;
}

function PiezaVertical({ d, caja, icono, texto, color }: { d: Disposicion; caja: Caja; icono: IconoId; texto: string; color: string }) {
  const { x, y, w, h } = caja;
  const tamIcono = d.icono + 2;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={8} fill={color} fillOpacity={0.06} stroke={color} strokeOpacity={0.3} />
      <IconoEn icono={icono} x={x + (w - tamIcono) / 2} y={y + h * 0.18} tam={tamIcono} color={color} />
      <Texto d={d} x={x + w / 2} y={y + h - (d.compacta ? 9 : 10)} tam={d.fuente.pieza - (d.compacta ? 1.5 : 1)} color="#e6edf7" anchor="middle">
        {texto}
      </Texto>
    </g>
  );
}

function PiezaHorizontal({ d, caja, icono, texto, color }: { d: Disposicion; caja: Caja; icono: IconoId; texto: string; color: string }) {
  const { x, y, w, h } = caja;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={7} fill={color} fillOpacity={0.07} stroke={color} strokeOpacity={0.35} />
      <IconoEn icono={icono} x={x + 9} y={y + (h - d.icono) / 2} tam={d.icono} color={color} />
      <Texto d={d} x={x + 16 + d.icono} y={y + h / 2 + d.fuente.pieza * 0.36} tam={d.fuente.pieza} color="#e6edf7">
        {texto}
      </Texto>
    </g>
  );
}

function Insignias({ d, caja, config, sitio }: { d: Disposicion; caja: Caja; config: ConfigModo; sitio: SitioId }) {
  const { w: iw, h: ih } = d.insignia;
  const y = caja.y + caja.h - ih - 10;
  const xIa = caja.x + caja.w - iw - 10;
  const xDatos = xIa - iw - 6;
  const items = [
    { x: xDatos, on: config.datos.includes(sitio), color: COLOR.borde, texto: ETIQUETAS.insignias.datos },
    { x: xIa, on: config.ia.includes(sitio), color: COLOR.ia, texto: ETIQUETAS.insignias.ia },
  ];
  return (
    <g>
      {items.map((it) => (
        <g key={it.texto} className={cn("transition-opacity duration-700 ease-out", it.on ? "opacity-100" : "opacity-0")}>
          <rect x={it.x} y={y} width={iw} height={ih} rx={ih / 2} fill={it.color} fillOpacity={0.18} stroke={it.color} strokeOpacity={0.9} />
          <text
            x={it.x + iw / 2}
            y={y + ih / 2 + d.fuente.nota * 0.36}
            fontSize={d.fuente.nota}
            fill={it.color}
            textAnchor="middle"
            fontWeight={700}
            className="font-mono tracking-[0.14em]"
          >
            {may(it.texto)}
          </text>
        </g>
      ))}
    </g>
  );
}
