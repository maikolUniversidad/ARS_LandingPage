"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { MapPin } from "lucide-react";
import { seccionVisible } from "@/lib/asistente/contexto-pagina";
import { useTextosAsistente } from "@/lib/asistente/i18n";
import { OrbeArs } from "./OrbeArs";
import { useTextosBloques } from "./bloques/textos";

/** Nombre corto de cada página para la línea «Estás en». */
const NOMBRE_RUTA: Record<string, { es: string; en: string }> = {
  "/": { es: "Inicio", en: "Home" },
  "/servicios": { es: "Servicios", en: "Services" },
  "/vision": { es: "Visión con IA", en: "AI vision" },
  "/plataforma": { es: "Plataforma", en: "Platform" },
  "/proyectos": { es: "Proyectos", en: "Projects" },
  "/laboratorio": { es: "Laboratorio", en: "Lab" },
  "/vision-lab": { es: "Laboratorio de visión", en: "Vision lab" },
  "/arquitectura": { es: "Arquitectura", en: "Architecture" },
  "/diagnostico": { es: "Diagnóstico", en: "Assessment" },
};

function nombrePagina(ruta: string, idioma: "es" | "en"): string {
  const fijo = NOMBRE_RUTA[ruta];
  if (fijo) return fijo[idioma];
  if (ruta.startsWith("/servicios/")) {
    const h1 = document.querySelector("main h1, h1")?.textContent?.trim();
    return `${NOMBRE_RUTA["/servicios"][idioma]}${h1 ? ` · ${h1.slice(0, 40)}` : ""}`;
  }
  return ruta;
}

const recortar = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

/** «Estás en: página · sección», al día con el scroll y la navegación. */
export function LineaContexto({ rastro }: { rastro?: ReactNode }) {
  const pathname = usePathname();
  const { idioma } = useTextosAsistente();
  const tx = useTextosBloques();
  const lang = idioma === "en" ? "en" : "es";
  const [texto, setTexto] = useState("");

  useEffect(() => {
    let t = 0;
    const leer = () => {
      const pagina = nombrePagina(window.location.pathname, lang);
      const s = seccionVisible();
      const sec = s?.titulo ? recortar(s.titulo.replace(/\s+/g, " "), 48) : "";
      setTexto(sec && !pagina.includes(sec) ? `${pagina} · ${sec}` : pagina);
    };
    const programar = () => {
      window.clearTimeout(t);
      t = window.setTimeout(leer, 350);
    };
    programar();
    window.addEventListener("scroll", programar, { passive: true });
    window.addEventListener("hashchange", programar);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("scroll", programar);
      window.removeEventListener("hashchange", programar);
    };
  }, [pathname, lang]);

  return (
    <div className="relative border-b border-white/10 px-4 pb-2.5">
      <p className="flex min-w-0 items-center gap-1.5 text-[11px] text-[#c5d2ee]/70">
        <MapPin className="size-3 shrink-0 text-[#6b8aff]" aria-hidden="true" />
        <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.22em] text-[#9eb0c0]">{tx.estasEn}:</span>
        <span key={texto} className="min-w-0 truncate text-[#d5e0ff] motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300">
          {texto || "…"}
        </span>
      </p>
      {rastro}
    </div>
  );
}

type Parada = { href: string; nombre: string };

/**
 * Rastro de a dónde fue la persona con el panel abierto (Ars la llevó o ella
 * navegó): migas tocables para volver. Se actualiza con la ruta y el ancla.
 */
export function RastroNavegacion({ alIr }: { alIr: (href: string) => void }) {
  const pathname = usePathname();
  const { idioma } = useTextosAsistente();
  const tx = useTextosBloques();
  const lang = idioma === "en" ? "en" : "es";
  const [paradas, setParadas] = useState<Parada[]>([]);
  const ultima = useRef("");

  useEffect(() => {
    let t = 0;
    const registrar = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        const ancla = decodeURIComponent(window.location.hash.slice(1));
        const href = `${window.location.pathname}${ancla ? `#${ancla}` : ""}`;
        if (href === ultima.current) return;
        ultima.current = href;
        const pagina = nombrePagina(window.location.pathname, lang);
        const titulo = ancla ? document.getElementById(ancla)?.querySelector("h1,h2,h3")?.textContent?.trim() : "";
        const nombre = recortar(titulo ? `${pagina.split(" · ")[0]} · ${titulo}` : pagina, 34);
        setParadas((prev) => [...prev.filter((p) => p.href !== href), { href, nombre }].slice(-4));
      }, 700);
    };
    registrar();
    window.addEventListener("hashchange", registrar);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("hashchange", registrar);
    };
  }, [pathname, lang]);

  if (paradas.length < 2) return null;
  return (
    <nav aria-label={tx.rastro} className="mt-1.5 flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <span className="shrink-0 font-mono text-[8.5px] uppercase tracking-[0.22em] text-[#9eb0c0]/70">{tx.rastro}</span>
      <ol className="flex items-center gap-1">
        {paradas.map((p, i) => {
          const actual = i === paradas.length - 1;
          return (
            <li key={p.href} className="flex shrink-0 items-center gap-1">
              <span aria-hidden="true" className="h-px w-2.5 bg-[#6b8aff]/40" />
              <button
                type="button"
                onClick={() => !actual && alIr(p.href)}
                aria-current={actual ? "location" : undefined}
                className={`rounded-full border px-2 py-0.5 text-[10px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6b8aff] ${
                  actual ? "ars-rastro-nuevo border-[#6b8aff]/70 bg-[#2348d4]/30 text-white" : "border-white/10 text-[#c5d2ee]/60 hover:border-[#6b8aff]/50 hover:text-white"
                }`}
              >
                {p.nombre}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Indicador de pensamiento: orbe que piensa, texto que brilla y barra de escaneo. */
export function IndicadorPensando({ actividad }: { actividad: string }) {
  return (
    <span className="flex flex-col gap-2 py-1" role="status">
      <span className="flex items-center gap-2.5">
        <OrbeArs estado="pensando" tamano={22} />
        <span key={actividad} className="ars-chispa font-mono text-[10px] uppercase tracking-[0.22em] motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300">
          {actividad}
        </span>
      </span>
      <span aria-hidden="true" className="ars-escaner block h-px w-40 rounded-full bg-[#6b8aff]/20" />
    </span>
  );
}
