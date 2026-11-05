"use client";

import dynamic from "next/dynamic";
import type { RefObject } from "react";
import { Box } from "lucide-react";
import type { Propuesta } from "@/data/propuesta/tipos";
import type { ControlEscena3D } from "./escena3d";

/** La escena 3D (three) se baja solo cuando se monta esta sección; sin SSR. */
const EscenaPropuesta3D = dynamic(() => import("./escena3d").then((m) => m.EscenaPropuesta3D), {
  ssr: false,
  loading: () => <Marcador cargando />,
});

function Marcador({ cargando }: { cargando?: boolean }) {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(35,72,212,0.18)_10%,#020a18_80%)]" />
      <div className="relative flex flex-col items-center gap-3 px-6 text-center">
        <span className="grid size-14 place-items-center border border-[#6b8aff]/50 bg-[#2348d4]/20 text-[#9fb4ff] motion-safe:animate-pulse">
          <Box className="size-6" aria-hidden="true" />
        </span>
        <p className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-white/70">{cargando ? "Cargando escena 3D…" : "Escena 3D en preparación"}</p>
      </div>
    </div>
  );
}

/** «Su operación en 3D»: la escena 3D de la propuesta; su ref permite capturar vistas para el PDF y el envío. */
export function Seccion3D({ propuesta, escenaRef }: { propuesta: Propuesta; escenaRef: RefObject<ControlEscena3D | null> }) {
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden border border-white/10 bg-[#030c1f] @2xl:aspect-video">
      <EscenaPropuesta3D ref={escenaRef} propuesta={propuesta} className="absolute inset-0" />
    </div>
  );
}
