/**
 * Escena 3D de la propuesta (la implementa la sesión «Escena 3D»).
 * API estable para la UI y el PDF:
 *  - <EscenaPropuesta3D propuesta={p} ref={escenaRef} className=… />  (componente cliente, carga dinámica)
 *  - escenaRef.current?.capturar(): Promise<string[]>  → 2–3 PNG/JPEG dataURL (vistas de la escena) para el PDF.
 *
 * Cargar con `next/dynamic(() => import("./escena3d").then((m) => m.EscenaPropuesta3D), { ssr: false })`.
 * three se importa aparte, solo cuando el componente se monta (./escena).
 */
import type { Propuesta } from "@/data/propuesta/tipos";

export type ControlEscena3D = { capturar: () => Promise<string[]> };
export type PropsEscena3D = { propuesta: Propuesta; className?: string };

export { EscenaPropuesta3D } from "./EscenaPropuesta3D";
export { MODOS, planDesdePropuesta, type PlanEscena } from "./plan";
