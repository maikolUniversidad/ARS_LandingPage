import type { ReactNode } from "react";
import { Lightbulb } from "lucide-react";
import { AREA_IDS, type AreaId, type PerfilEmpresa } from "@/data/diagnostico/tipos";
import { Icono, rgba } from "@/components/servicios/ui";
import { areaInfo, completitud } from "@/lib/diagnostico/catalogo";
import type { DatoEmpresa } from "./eventos";

const TAMANO: Record<string, string> = { "1-50": "Hasta 50 personas", "51-200": "51 a 200 personas", "201-1000": "201 a 1.000 personas", "1000+": "Más de 1.000 personas" };

function Campo({ etiqueta, valor }: { etiqueta: string; valor?: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-white/[0.06] py-2 last:border-0">
      <dt className="shrink-0 font-mono text-[9.5px] uppercase tracking-[0.22em] text-[#9eb0c0]/70">{etiqueta}</dt>
      <dd className="min-w-0 text-right text-[13px] text-white">
        {valor ? (
          <span key={String(valor)} className="inline-block animate-in fade-in slide-in-from-right-2 duration-500">
            {valor}
          </span>
        ) : (
          <span className="inline-block h-2 w-16 animate-pulse bg-white/[0.07]" aria-label="pendiente" />
        )}
      </dd>
    </div>
  );
}

function Etiquetas({ titulo, items, tint }: { titulo: string; items?: string[]; tint: string }) {
  return (
    <div className="mt-3">
      <p className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-[#9eb0c0]/70">{titulo}</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {items?.length ? (
          items.map((x) => (
            <span
              key={x}
              className="border px-2 py-0.5 text-[11.5px] leading-snug text-white/90 animate-in fade-in zoom-in-95 duration-500"
              style={{ borderColor: rgba(tint, 0.35), background: rgba(tint, 0.08) }}
            >
              {x}
            </span>
          ))
        ) : (
          <span className="h-5 w-24 animate-pulse bg-white/[0.06]" aria-label="pendiente" />
        )}
      </div>
    </div>
  );
}

/** Panel lateral: el perfil de la empresa que se llena en vivo mientras conversa. */
export function PerfilVivo({ perfil, datos, areasVistas }: { perfil: Partial<PerfilEmpresa>; datos: DatoEmpresa[]; areasVistas: AreaId[] }) {
  const pct = Math.round(completitud(perfil) * 100);
  return (
    <aside className="flex flex-col gap-4" aria-label="Perfil de tu empresa en construcción">
      <section className="border border-white/10 bg-[#071229]/80 p-4 backdrop-blur">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#6b8aff]">Perfil en construcción</p>
          <span className="font-mono text-[11px] tabular-nums text-white/80">{pct}%</span>
        </div>
        <div className="mt-2 h-1 bg-white/[0.06]">
          <div className="h-full bg-gradient-to-r from-[#1d3885] via-[#2348d4] to-[#6b8aff] transition-[width] duration-700 ease-out" style={{ width: `${Math.max(4, pct)}%` }} />
        </div>
        <h2 className="mt-4 font-serif text-2xl leading-tight text-white">
          {perfil.nombre ? (
            <span key={perfil.nombre} className="animate-in fade-in duration-700">
              {perfil.nombre}
            </span>
          ) : (
            <span className="text-white/30">Tu empresa</span>
          )}
        </h2>
        <dl className="mt-2">
          <Campo etiqueta="Sector" valor={perfil.sector} />
          <Campo etiqueta="Tamaño" valor={perfil.tamano ? TAMANO[perfil.tamano] : undefined} />
          <Campo etiqueta="Sedes" valor={perfil.sedes ? `${perfil.sedes} ${perfil.sedes === 1 ? "sede" : "sedes"}` : undefined} />
          <Campo etiqueta="Ciudad" valor={perfil.ciudad} />
        </dl>
        <Etiquetas titulo="Lo que duele" items={perfil.dolores} tint="#ff6b6b" />
        <Etiquetas titulo="Herramientas hoy" items={perfil.herramientasActuales} tint="#9eb0c0" />
        <Etiquetas titulo="Prioridades" items={perfil.prioridades} tint="#35e0a1" />
      </section>

      <section className="border border-white/10 bg-[#071229]/60 p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#9eb0c0]">Áreas que se encienden</p>
        <ul className="mt-3 grid grid-cols-5 gap-1.5">
          {AREA_IDS.map((id) => {
            const a = areaInfo(id);
            const on = areasVistas.includes(id);
            return (
              <li
                key={id}
                title={a.nombre}
                className="grid aspect-square place-items-center border transition-all duration-700"
                style={
                  on
                    ? { borderColor: rgba(a.color, 0.6), background: rgba(a.color, 0.15), color: a.color, boxShadow: `0 0 18px ${rgba(a.color, 0.35)}` }
                    : { borderColor: "rgba(255,255,255,0.06)", color: "rgba(158,176,192,0.3)" }
                }
              >
                <Icono nombre={a.icono} className="size-4" />
                <span className="sr-only">
                  {a.nombre}
                  {on ? " (relevante)" : ""}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-[11.5px] text-[#9eb0c0]/80">
          {areasVistas.length ? `${areasVistas.length} de 10 áreas de ARS ya tienen algo que decir sobre tu empresa.` : "Las áreas de ARS se encienden según lo que nos cuentes."}
        </p>
      </section>

      {datos.length > 0 && (
        <section className="border border-white/10 bg-[#071229]/60 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#9eb0c0]">Lo que vamos notando</p>
          <ul className="mt-2 space-y-2.5">
            {datos.map((d, i) => (
              <li key={`${d.titulo}-${i}`} className="flex gap-2.5 animate-in fade-in slide-in-from-bottom-1 duration-500">
                <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-[#ffd166]" aria-hidden="true" />
                <div>
                  <p className="text-[12.5px] font-bold text-white">{d.titulo}</p>
                  <p className="text-[12px] leading-snug text-[#9eb0c0]">{d.texto}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </aside>
  );
}
