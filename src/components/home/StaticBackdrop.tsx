/**
 * Fondo estático (sin WebGL): mientras carga el canvas, si el navegador no
 * soporta WebGL o si el contexto se pierde. Ilustra las tres capas como anillos
 * isométricos alrededor de la sede, con la cadena cámara → IA → central.
 */
export function StaticBackdrop({ step = -1, note }: { step?: number; note?: string }) {
  const hot = (i: number) => step >= i;
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#020a18]">
      <div className="grid-bg absolute inset-0 opacity-60" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_45%,rgba(35,72,212,0.28),transparent_65%)]" />
      <svg
        viewBox="0 0 800 600"
        className="absolute left-1/2 top-[38%] w-[min(1100px,150vw)] -translate-x-1/2 -translate-y-1/2 md:left-[62%] md:top-1/2"
        aria-hidden="true"
      >
        <g transform="translate(400 330) scale(1 0.5) rotate(45)">
          {[250, 180, 110].map((r, i) => (
            <rect
              key={r}
              x={-r}
              y={-r}
              width={r * 2}
              height={r * 2}
              rx={18}
              fill="none"
              stroke={i === 0 ? "#1d3885" : i === 1 ? "#2348d4" : "#6b8aff"}
              strokeWidth={i === 2 ? 3 : 2}
              strokeDasharray={i === 0 ? "10 10" : undefined}
              opacity={0.85}
            />
          ))}
          <rect x={-60} y={-60} width={120} height={120} fill="#0a1736" stroke="#2348d4" strokeWidth={2} />
          <rect x={10} y={-110} width={70} height={50} fill="#0a1736" stroke="#2348d4" strokeWidth={2} />
        </g>
        {/* núcleo IA */}
        <g transform="translate(400 120)">
          <circle r={70} fill="url(#coreGlow)" />
          <polygon points="0,-34 30,-17 30,17 0,34 -30,17 -30,-17" fill="none" stroke="#6b8aff" strokeWidth={2.5} />
          <polygon points="0,-18 16,-9 16,9 0,18 -16,9 -16,-9" fill="#2348d4" opacity={hot(1) ? 0.9 : 0.5} />
        </g>
        {/* cámara → IA */}
        <path d="M600 300 Q 560 160 430 130" fill="none" stroke="#ffb547" strokeWidth={2} strokeDasharray="4 8" opacity={hot(0) ? 1 : 0.35} />
        {/* IA → central */}
        <path d="M370 130 Q 230 170 220 330" fill="none" stroke="#ff3b5c" strokeWidth={2} strokeDasharray="4 8" opacity={hot(2) ? 1 : 0.35} />
        <circle cx={600} cy={305} r={7} fill="#ffb547" />
        <circle cx={640} cy={345} r={9} fill="#ff3b5c" opacity={0.9} />
        <circle cx={220} cy={335} r={9} fill="#ff3b5c" opacity={hot(2) ? 1 : 0.4} />
        <circle cx={470} cy={420} r={7} fill="#5fd8ff" />
        <path d="M470 420 Q 560 410 630 350" fill="none" stroke="#5fd8ff" strokeWidth={2} opacity={hot(3) ? 1 : 0.3} />
        <defs>
          <radialGradient id="coreGlow">
            <stop offset="0" stopColor="#2348d4" stopOpacity={0.7} />
            <stop offset="1" stopColor="#2348d4" stopOpacity={0} />
          </radialGradient>
        </defs>
      </svg>
      {note && (
        <div className="absolute right-4 top-20 font-mono text-[9px] uppercase tracking-[0.3em] text-foreground/40">{note}</div>
      )}
    </div>
  );
}
