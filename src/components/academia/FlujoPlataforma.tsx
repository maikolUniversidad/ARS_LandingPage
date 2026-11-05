import { CloudOff, Glasses, GraduationCap, LayoutDashboard, QrCode, Server, UserCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PLATAFORMA, VIOLETA, AZUL, VERDE } from "@/data/academia/contenido";

const ICONOS: LucideIcon[] = [UserCheck, Glasses, GraduationCap, CloudOff, Server, QrCode, LayoutDashboard];
/** Dónde ocurre cada paso: web del ARS (azul), la gafa (violeta) o el servidor y sus salidas (verde). */
const ZONA = [AZUL, VIOLETA, VIOLETA, VIOLETA, VERDE, VERDE, VERDE];

/**
 * Diagrama del viaje de la capacitación (§3.1–3.2): asignación → gafa → eventos → servidor →
 * hoja de vida y certificado QR → mesa directiva. HTML puro: en móvil es una columna con
 * flechas hacia abajo y en escritorio una fila con flechas a la derecha.
 */
export function FlujoPlataforma() {
  return (
    <div>
      <ul className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-[9.5px] uppercase tracking-[0.2em] text-white/55" aria-label="Leyenda">
        {[
          { c: AZUL, t: "Web del ARS" },
          { c: VIOLETA, t: "La gafa" },
          { c: VERDE, t: "Servidor y resultados" },
        ].map((l) => (
          <li key={l.t} className="flex items-center gap-2">
            <span className="inline-block size-2" style={{ background: l.c }} aria-hidden="true" />
            {l.t}
          </li>
        ))}
      </ul>

      <ol className="mt-5 grid gap-0 xl:grid-cols-7 xl:gap-0">
        {PLATAFORMA.pasos.map((p, i) => {
          const Icono = ICONOS[i];
          const c = ZONA[i];
          const ultimo = i === PLATAFORMA.pasos.length - 1;
          return (
            <li key={p.n} className="relative flex flex-col xl:flex-row">
              <div
                className="relative flex-1 border bg-[#050d22]/85 p-4"
                style={{ borderColor: `${c}55`, boxShadow: `inset 0 2px 0 ${c}` }}
              >
                <div className="flex items-center justify-between gap-2">
                  <Icono className="size-5" style={{ color: c }} aria-hidden="true" />
                  <span className="font-mono text-[10px] font-bold tabular-nums text-white/40">0{p.n}</span>
                </div>
                <p className="mt-3 font-heading text-[15px] font-black leading-tight text-white">{p.titulo}</p>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: c }}>
                  {p.lugar}
                </p>
                <p className="mt-2 text-[13px] leading-snug text-[#c5d2ee]">{p.texto}</p>
              </div>
              {!ultimo && (
                <div
                  aria-hidden="true"
                  className="flex items-center justify-center py-1.5 text-white/35 xl:w-0 xl:py-0"
                >
                  <span className="xl:hidden">↓</span>
                  <span className="hidden xl:absolute xl:-right-2 xl:top-1/2 xl:z-10 xl:block xl:-translate-y-1/2 xl:bg-[#020a18] xl:px-0.5 xl:text-[13px]">
                    →
                  </span>
                </div>
              )}
              {i === 3 && (
                <span className="mx-auto mb-1 -mt-0.5 block font-mono text-[9px] uppercase tracking-[0.18em] text-white/45 xl:hidden">
                  internet, o cola cifrada si no hay señal
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <p className="mt-3 hidden font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/45 xl:block">
        Del paso 04 al 05: por internet, o en cola cifrada si no hay señal.
      </p>
    </div>
  );
}
