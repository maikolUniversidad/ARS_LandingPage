import type { FocoAcademia } from "./escena/focos";
import { DESCRIPCION_FOCO } from "./escena/focos";
import { cn } from "@/lib/utils";

/**
 * Respaldo estático (sin WebGL o si la escena falla): una ilustración SVG
 * estilizada por foco, con la misma paleta de la escena 3D.
 */

const AZUL = "#6b8aff";
const INDIGO = "#2348d4";
const VIOLETA = "#b78bff";
const VERDE = "#3dffa0";
const HIELO = "#d5e0ff";

function Persona({ x, y, s = 1, color = "#1d3885" }: { x: number; y: number; s?: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={color}>
      <circle cx="0" cy="-58" r="9" />
      <path d="M-13 -46 h26 l-3 34 h-20 z" />
      <path d="M-10 -12 h8 l-1 12 h-6 z M2 -12 h8 l-1 12 h-6 z" />
    </g>
  );
}

function Portal() {
  return (
    <>
      <defs>
        <radialGradient id="ra-portal" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={VERDE} stopOpacity="0.05" />
          <stop offset="70%" stopColor={VERDE} stopOpacity="0.35" />
          <stop offset="100%" stopColor={VERDE} stopOpacity="0.9" />
        </radialGradient>
      </defs>
      <rect x="0" y="230" width="640" height="130" fill="#0d2350" opacity="0.6" />
      <ellipse cx="320" cy="290" rx="190" ry="26" fill="none" stroke="#1a3570" strokeWidth="14" />
      {[0, 1, 2, 3, 4].map((i) => (
        <Persona key={i} x={190 + i * 62} y={292 - (i % 2) * 6} s={0.7} color="#2a4fa8" />
      ))}
      <Persona x={410} y={316} s={0.95} color="#0e1f4a" />
      <circle cx="320" cy="200" r="132" fill="url(#ra-portal)" />
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d="M320 200 m-110 0 a110 110 0 0 1 180 -80"
          fill="none"
          stroke={VERDE}
          strokeOpacity="0.55"
          strokeWidth="3"
          transform={`rotate(${i * 120} 320 200)`}
        />
      ))}
      <circle cx="320" cy="200" r="136" fill="none" stroke={VERDE} strokeWidth="4" />
      <circle cx="320" cy="200" r="146" fill="none" stroke="#1b2c55" strokeWidth="10" />
    </>
  );
}

function Dotacion() {
  const piezas = [
    ["Gorra", 300, 92, "izq"],
    ["Credencial", 340, 150, "der"],
    ["Pito", 300, 156, "izq"],
    ["Libreta", 300, 186, "izq"],
    ["Radio", 352, 222, "der"],
    ["Linterna", 286, 226, "izq"],
    ["Celular", 304, 230, "izq"],
    ["Bastón", 358, 262, "der"],
    ["Uniforme", 346, 190, "der"],
  ] as const;
  return (
    <>
      <rect x="0" y="0" width="640" height="300" fill="#0c1b40" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <rect key={i} x={40 + i * 74} y="110" width="64" height="190" fill="#18306a" opacity={Math.abs(i - 3.5) < 1 ? 0 : 0.9} />
      ))}
      <ellipse cx="320" cy="340" rx="80" ry="12" fill="#142a5c" stroke={AZUL} strokeWidth="2" />
      <circle cx="320" cy="84" r="20" fill="#6a7590" />
      <path d="M296 72 a24 18 0 0 1 48 0 h10 v6 h-58 z" fill="#0e1b42" />
      <path d="M288 108 h64 l-6 96 h-52 z" fill="#2448a0" />
      <path d="M294 204 h22 l-2 130 h-18 z M324 204 h22 l-4 130 h-18 z" fill="#0e1b42" />
      <path d="M286 110 l-14 92 h12 l12 -86 z M354 110 l14 92 h-12 l-12 -86 z" fill="#2448a0" />
      <rect x="290" y="200" width="60" height="9" fill="#070b16" />
      <rect x="332" y="132" width="14" height="20" fill="#f2f5ff" />
      <rect x="350" y="200" width="10" height="24" fill="#070b16" />
      {piezas.map(([t, x, y, lado]) => (
        <g key={t} transform={`translate(${x} ${y})`}>
          <circle r="3" fill={AZUL} />
          <line x1="0" y1="0" x2={lado === "izq" ? -70 : 70} y2="0" stroke={AZUL} strokeOpacity="0.5" />
          <text
            x={lado === "izq" ? -76 : 76}
            y="4"
            textAnchor={lado === "izq" ? "end" : "start"}
            fill={HIELO}
            fontSize="12"
            fontFamily="system-ui, sans-serif"
          >
            {t}
          </text>
        </g>
      ))}
    </>
  );
}

function Poligono() {
  return (
    <>
      <path d="M0 360 L250 150 H390 L640 360 Z" fill="#081633" />
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={i} x1={250 + i * 35} y1="150" x2={i * 160} y2="360" stroke={AZUL} strokeOpacity="0.15" />
      ))}
      <rect x="236" y="90" width="168" height="60" fill="#13285e" />
      <rect x="306" y="104" width="28" height="38" fill="#f3efe4" />
      {[14, 10, 6, 3].map((r, i) => (
        <circle key={r} cx="320" cy="122" r={r} fill="none" stroke="#1d3885" strokeWidth={i === 3 ? 3 : 1.2} />
      ))}
      <rect x="470" y="120" width="22" height="58" rx="3" fill="#070b16" />
      <circle cx="481" cy="134" r="6" fill="#ff3b5c" />
      <circle cx="481" cy="150" r="6" fill="#ff3b5c" opacity="0.2" />
      <circle cx="481" cy="166" r="6" fill={VERDE} opacity="0.2" />
      <line x1="320" y1="240" x2="320" y2="150" stroke={VERDE} strokeDasharray="4 8" strokeWidth="2" />
      <g transform="translate(320 270)">
        <rect x="-10" y="-68" width="20" height="62" rx="5" fill="#2c3548" />
        <rect x="-26" y="-12" width="52" height="40" rx="8" fill="#46526a" />
        <rect x="-22" y="20" width="44" height="18" fill="#2c3548" />
        <path d="M-20 34 q-10 50 10 74 h30 q-6 -40 2 -74 z" fill="#4a2a1a" />
        <path d="M-26 40 a26 26 0 0 0 30 30" fill="none" stroke="#2c3548" strokeWidth="4" />
        <circle cx="-10" cy="56" r="34" fill="none" stroke={VERDE} strokeOpacity="0.8" strokeWidth="2" />
      </g>
      <g fontFamily="system-ui, sans-serif" fontSize="12">
        <rect x="350" y="200" width="122" height="24" rx="12" fill="#04251c" stroke={VERDE} strokeOpacity="0.7" />
        <text x="362" y="216" fill="#bfffe0">Cañón al frente ✓</text>
        <rect x="350" y="316" width="162" height="24" rx="12" fill="#04251c" stroke={VERDE} strokeOpacity="0.7" />
        <text x="362" y="332" fill="#bfffe0">Dedo fuera del gatillo ✓</text>
      </g>
    </>
  );
}

function Garita() {
  return (
    <>
      <rect x="0" y="0" width="640" height="360" fill="#01050f" />
      {[60, 160, 300, 470, 560].map((x, i) => (
        <rect key={x} x={x} y={60 + (i % 2) * 30} width="80" height="200" fill="#061028" />
      ))}
      <rect x="0" y="260" width="640" height="100" fill="#07112a" />
      <circle cx="150" cy="210" r="120" fill="#ffcf8a" opacity="0.12" />
      <rect x="90" y="150" width="120" height="120" fill="#1a2c5c" />
      <rect x="100" y="168" width="100" height="56" fill="#ffcf8a" opacity="0.55" />
      <rect x="80" y="140" width="140" height="12" fill="#0e1d44" />
      <rect x="226" y="236" width="14" height="40" fill="#1d3885" />
      <rect x="236" y="236" width="150" height="8" fill="#ff3b5c" />
      {Array.from({ length: 22 }, (_, i) => (
        <line key={i} x1={400 + i * 10} y1="150" x2={400 + i * 10} y2="276" stroke="#2c3a5e" strokeWidth="3" />
      ))}
      <rect x="610" y="200" width="12" height="20" fill="#101a33" stroke={AZUL} />
      <Persona x={500} y={288} s={1.2} color="#2a3550" />
    </>
  );
}

function Porteria() {
  return (
    <>
      <rect x="0" y="0" width="640" height="250" fill="#0f2150" />
      <rect x="260" y="70" width="120" height="150" fill="#9fb6ff" opacity="0.12" />
      <rect x="0" y="250" width="640" height="110" fill="#0b1a3e" />
      <Persona x={330} y={250} s={1.25} color="#3e6fd1" />
      <Persona x={390} y={226} s={1.05} color="#e0503c" />
      <rect x="402" y="146" width="26" height="24" fill="#e0503c" />
      <Persona x={300} y={208} s={0.85} color="#7a6a9c" />
      <Persona x={360} y={196} s={0.75} color="#2d8a74" />
      <rect x="60" y="270" width="520" height="90" fill="#1b336e" />
      <rect x="50" y="262" width="540" height="10" fill="#2a4a96" />
      <rect x="150" y="236" width="90" height="30" rx="3" fill="#070b16" />
      <rect x="155" y="240" width="80" height="22" fill="#0b1a44" stroke={AZUL} />
      <rect x="470" y="220" width="46" height="42" fill="#8a6a44" />
      <rect x="520" y="232" width="36" height="30" fill="#6e5232" />
    </>
  );
}

function Plataforma() {
  return (
    <>
      <ellipse cx="190" cy="300" rx="110" ry="18" fill="#12204a" stroke={VIOLETA} strokeOpacity="0.7" />
      <rect x="120" y="150" width="140" height="80" rx="30" fill="#e9edf6" />
      {[150, 190, 230].map((x) => (
        <rect key={x} x={x - 6} y="170" width="12" height="40" rx="6" fill="#0b0f1a" />
      ))}
      <rect x="370" y="90" width="230" height="170" rx="6" fill="#0b1a44" stroke={VIOLETA} />
      <rect x="384" y="112" width="96" height="134" fill={INDIGO} opacity="0.3" />
      <rect x="492" y="112" width="96" height="134" fill="#f4f1ea" />
      <rect x="516" y="168" width="48" height="48" fill="#06102a" />
      <rect x="522" y="174" width="36" height="36" fill="#f4f1ea" />
      <rect x="530" y="182" width="20" height="20" fill="#06102a" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <path d={`M262 190 Q330 ${110 - i * 10} 400 ${150 + i * 24}`} fill="none" stroke={VIOLETA} strokeOpacity="0.4" />
          <circle cx={330} cy={135 - i * 4 + i * 6} r="5" fill={VIOLETA} />
        </g>
      ))}
    </>
  );
}

const DIBUJOS: Record<FocoAcademia, () => React.JSX.Element> = {
  portal: Portal,
  dotacion: Dotacion,
  poligono: Poligono,
  garita: Garita,
  porteria: Porteria,
  plataforma: Plataforma,
};

export function RespaldoAcademia({ foco, className }: { foco: FocoAcademia; className?: string }) {
  const Dibujo = DIBUJOS[foco];
  return (
    <svg
      viewBox="0 0 640 360"
      preserveAspectRatio="xMidYMid slice"
      className={cn("h-full w-full bg-[#020a18]", className)}
      role="img"
      aria-label={DESCRIPCION_FOCO[foco]}
    >
      <rect width="640" height="360" fill="#020a18" />
      <Dibujo />
    </svg>
  );
}

export default RespaldoAcademia;
