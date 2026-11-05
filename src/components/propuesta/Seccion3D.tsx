"use client";

import dynamic from "next/dynamic";
import type { RefObject } from "react";
import { CargaTecnologica } from "@/components/carga/CargaTecnologica";
import type { Propuesta } from "@/data/propuesta/tipos";
import type { ControlEscena3D } from "./escena3d";

/** La escena 3D (three) se baja solo cuando se monta esta sección; sin SSR. */
const EscenaPropuesta3D = dynamic(() => import("./escena3d").then((m) => m.EscenaPropuesta3D), {
  ssr: false,
  loading: () => <CargaTecnologica variante="caja" etiqueta={ETIQUETA_CARGA} />,
});

const ETIQUETA_CARGA = "Cargando su operación en 3D";

/** «Su operación en 3D»: la escena 3D de la propuesta; su ref permite capturar vistas para el PDF y el envío. */
export function Seccion3D({ propuesta, escenaRef }: { propuesta: Propuesta; escenaRef: RefObject<ControlEscena3D | null> }) {
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden border border-white/10 bg-[#030c1f] @2xl:aspect-video">
      <EscenaPropuesta3D ref={escenaRef} propuesta={propuesta} className="absolute inset-0" />
    </div>
  );
}
