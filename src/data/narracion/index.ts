import { GUIONES_HOME } from "./guiones-home";
import { GUIONES_PLATAFORMA } from "./guiones-plataforma";
import { GUIONES_SERVICIOS_AREAS } from "./guiones-servicios-areas";
import { GUIONES_SERVICIOS_HUB } from "./guiones-servicios-hub";

/** Todos los guiones de Ars (id → texto), para los subtítulos. */
export const GUIONES: Record<string, string> = {
  ...GUIONES_HOME,
  ...GUIONES_PLATAFORMA,
  ...GUIONES_SERVICIOS_HUB,
  ...GUIONES_SERVICIOS_AREAS,
};
