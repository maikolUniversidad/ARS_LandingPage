/**
 * Parte propia del registro de una «Propuesta ARS» (el id, el origen y el estado los pone `crear.ts`).
 *
 * Reglas:
 *  - Los datos de la persona van UNA sola vez, en `contacto`: se sacan de `respuestas` y de
 *    `propuesta.contacto`. Así, cuando ARS anonimiza el registro (habeas data), no queda una copia suelta.
 *  - `propuesta` va tal como la vio la persona (áreas y módulos por id); `nombres` trae los nombres
 *    legibles de esos ids, porque el ERP no tiene el catálogo del sitio.
 *  - El PDF y las vistas 3D no se guardan: `entrega` solo dice qué recibió el asesor por correo.
 *
 * Sin dependencias en tiempo de ejecución (solo tipos): lo usan el servidor y las pruebas
 * (`npm run test:registros`).
 */
import type { AutorizacionDatos } from "@/data/diagnostico/autorizacion";
import type { AreaId } from "@/data/diagnostico/tipos";
import type { Propuesta, Respuestas, RespuestaSeguimiento } from "@/data/propuesta/tipos";
import type { RegistroPropuesta } from "./tipos";

export type DatosPropuesta = {
  /** Ya limpias y validadas por /api/propuesta/enviar. */
  propuesta: Propuesta;
  respuestas: Respuestas;
  seguimiento: RespuestaSeguimiento[];
  /** Evidencia de la autorización de datos; null si no la aceptó. */
  autorizacion: AutorizacionDatos | null;
  /** Si el PDF se pudo generar. */
  pdf: boolean;
  /** Cuántas vistas 3D llevaba el correo. */
  vistas3d: number;
  /** Nombre legible de un área / módulo del catálogo del sitio. */
  nombreArea: (id: string) => string;
  nombreModulo: (id: string) => string;
};

export type CuerpoPropuesta = Pick<
  RegistroPropuesta,
  "referencia" | "empresa" | "ciudad" | "contacto" | "autorizacion" | "respuestas" | "seguimiento" | "resumen" | "propuesta" | "nombres" | "entrega"
>;

const texto = (...valores: (string | null | undefined)[]): string | null => {
  for (const v of valores) {
    const t = v?.trim();
    if (t) return t;
  }
  return null;
};

const unicos = <T>(xs: T[]): T[] => [...new Set(xs)];

export function cuerpoPropuesta(d: DatosPropuesta): CuerpoPropuesta {
  const { contacto: c, ...propuesta } = d.propuesta;
  const { nombre, cargo, empresa, ciudad, email, telefono, autoriza, ...respuestas } = d.respuestas;
  void autoriza; // queda como evidencia en `autorizacion`, no como un sí/no suelto

  const areas = unicos(propuesta.modulos.map((m) => m.area)) as AreaId[];
  const idsModulos = unicos([...propuesta.modulos.map((m) => m.modulo), ...propuesta.lineaDeTrabajo.flatMap((f) => f.modulos)]);

  return {
    referencia: propuesta.id,
    empresa: texto(empresa, propuesta.empresa) ?? "",
    ciudad: texto(ciudad, c.ciudad),
    contacto: {
      nombre: texto(nombre, c.nombre) ?? "",
      cargo: texto(cargo, c.cargo),
      email: texto(email, c.email) ?? "",
      telefono: texto(telefono, c.telefono),
    },
    autorizacion: d.autorizacion,
    respuestas,
    seguimiento: d.seguimiento,
    resumen: {
      titular: propuesta.titular,
      areas,
      modulos: unicos(propuesta.modulos.map((m) => d.nombreModulo(m.modulo))),
      plazo: texto(respuestas.plazo),
      fases: propuesta.lineaDeTrabajo.length,
    },
    propuesta,
    nombres: {
      areas: Object.fromEntries(areas.map((id) => [id, d.nombreArea(id)])),
      modulos: Object.fromEntries(idsModulos.map((id) => [id, d.nombreModulo(id)])),
    },
    entrega: { pdf: d.pdf, vistas3d: d.vistas3d },
  };
}
