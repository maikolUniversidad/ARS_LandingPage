"use client";

import { CornerDownLeft, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useMemo, useState } from "react";
import { buscarModulos } from "@/data/servicios";
import { cn } from "@/lib/utils";

const SUGERENCIAS = ["nómina", "reconocimiento facial", "rondas", "radio", "facturación", "cursos"];

/** Buscador de módulos: salta a /servicios/<area>#<modulo>. */
export function BuscadorModulos() {
  const router = useRouter();
  const id = useId();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const resultados = useMemo(() => buscarModulos(q, 8), [q]);
  const hay = q.trim().length > 1;

  const ir = (i: number) => {
    const r = resultados[i];
    if (r) router.push(`/servicios/${r.area.id}#${r.modulo.id}`);
  };

  return (
    <div className="relative">
      <label htmlFor={`${id}-q`} className="sr-only">
        Buscar un módulo
      </label>
      <div className="flex items-center gap-3 border border-white/20 bg-[#020a18]/80 px-4 backdrop-blur focus-within:border-[#6b8aff] md:px-5">
        <Search className="size-5 shrink-0 text-[#6b8aff]" aria-hidden="true" />
        <input
          id={`${id}-q`}
          type="search"
          role="combobox"
          aria-expanded={hay}
          aria-controls={`${id}-lista`}
          aria-autocomplete="list"
          aria-activedescendant={hay && resultados[sel] ? `${id}-r${sel}` : undefined}
          autoComplete="off"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setSel(0);
          }}
          onKeyDown={(e) => {
            if (!resultados.length) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setSel((s) => (s + 1) % resultados.length);
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setSel((s) => (s - 1 + resultados.length) % resultados.length);
            } else if (e.key === "Enter") {
              e.preventDefault();
              ir(sel);
            }
          }}
          placeholder="¿Qué necesita resolver? Ej.: nómina, cámaras, rondas…"
          className="h-14 w-full min-w-0 bg-transparent text-base text-white placeholder:text-white/35 focus:outline-none md:h-16 md:text-lg"
        />
      </div>

      {!hay && (
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Sugerencias">
          {SUGERENCIAS.map((s) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => setQ(s)}
                className="border border-white/12 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/65 transition-colors hover:border-white/35 hover:text-white"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}

      {hay && (
        <ul id={`${id}-lista`} role="listbox" aria-label="Resultados" className="mt-3 divide-y divide-white/[0.07] border border-white/12 bg-[#020a18]/95">
          {resultados.length === 0 && (
            <li className="px-5 py-4 text-sm text-[#9eb0c0]">
              Sin coincidencias. Pruebe con otra palabra, o pregúntele a Ars.
            </li>
          )}
          {resultados.map(({ area, modulo }, i) => (
            <li key={modulo.id} id={`${id}-r${i}`} role="option" aria-selected={i === sel}>
              <Link
                href={`/servicios/${area.id}#${modulo.id}`}
                onMouseEnter={() => setSel(i)}
                tabIndex={-1}
                className={cn(
                  "flex items-center gap-4 px-4 py-3.5 transition-colors md:px-5",
                  i === sel ? "bg-white/[0.06]" : "hover:bg-white/[0.04]"
                )}
              >
                <span
                  className="grid size-9 shrink-0 place-items-center border font-serif text-lg italic text-white"
                  style={{ borderColor: `${area.color}88`, background: `${area.color}1a` }}
                  aria-hidden="true"
                >
                  {area.letra}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold text-white">{modulo.nombre}</span>
                  <span className="block truncate text-[13px] text-[#9eb0c0]">
                    {area.nombre} · {modulo.frase}
                  </span>
                </span>
                {i === sel && <CornerDownLeft className="hidden size-4 shrink-0 text-white/40 sm:block" aria-hidden="true" />}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
