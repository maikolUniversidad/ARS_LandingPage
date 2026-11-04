import { ArrowUpRight } from "lucide-react";
import type { AreaId } from "@/data/diagnostico/tipos";
import { areaPorId, moduloPorId } from "@/data/servicios";
import { Icono, rgba } from "@/components/servicios/ui";

type Tarjeta = { clave: string; areaId: string; color: string; icono: string; etiqueta: string; titulo: string; frase: string; href: string };

function tarjetas(areas: AreaId[], modulos: string[]): Tarjeta[] {
  const out: Tarjeta[] = [];
  for (const id of modulos) {
    const m = moduloPorId(id);
    if (!m) continue;
    out.push({
      clave: `m-${id}`,
      areaId: m.area.id,
      color: m.area.color,
      icono: m.area.icono,
      etiqueta: m.area.corto,
      titulo: m.modulo.nombre,
      frase: m.modulo.frase,
      href: `/servicios/${m.area.id}#${m.modulo.id}`,
    });
  }
  for (const id of areas) {
    if (out.some((t) => t.areaId === id)) continue;
    const a = areaPorId(id);
    if (!a) continue;
    out.push({ clave: `a-${id}`, areaId: id, color: a.color, icono: a.icono, etiqueta: `Área ${a.letra}`, titulo: a.nombre, frase: a.frase, href: `/servicios/${id}` });
  }
  return out.slice(0, 4);
}

/** Tarjetas de áreas/módulos de ARS que responden a lo que la persona acaba de contar. */
export function TarjetasServicio({ areas, modulos }: { areas: AreaId[]; modulos: string[] }) {
  const lista = tarjetas(areas, modulos);
  if (!lista.length) return null;
  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      {lista.map((t, i) => (
        <a
          key={t.clave}
          href={t.href}
          target="_blank"
          rel="noopener"
          className="group relative block overflow-hidden border border-white/10 bg-white/[0.03] p-3 transition-colors animate-in fade-in slide-in-from-bottom-2 fill-mode-both hover:border-white/25 hover:bg-white/[0.06]"
          style={{ animationDelay: `${i * 120}ms`, animationDuration: "500ms" }}
        >
          <span className="absolute inset-y-0 left-0 w-[3px]" style={{ background: t.color, boxShadow: `0 0 14px ${rgba(t.color, 0.8)}` }} />
          <div className="flex items-center gap-2 pl-1.5">
            <span className="grid size-6 shrink-0 place-items-center" style={{ background: rgba(t.color, 0.14), color: t.color }}>
              <Icono nombre={t.icono} className="size-3.5" />
            </span>
            <span className="font-mono text-[9.5px] uppercase tracking-[0.22em]" style={{ color: t.color }}>
              {t.etiqueta}
            </span>
            <ArrowUpRight className="ml-auto size-3.5 text-white/30 transition-colors group-hover:text-white/80" aria-hidden="true" />
          </div>
          <p className="mt-2 pl-1.5 text-[13.5px] font-bold leading-snug text-white">{t.titulo}</p>
          <p className="mt-1 line-clamp-2 pl-1.5 text-[12px] leading-snug text-[#9eb0c0]">{t.frase}</p>
        </a>
      ))}
    </div>
  );
}
