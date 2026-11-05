/**
 * Esquema JSON (salida estructurada de Claude) para cambios al PerfilEmpresa.
 * Lo comparten la entrevista y el análisis de adjuntos; la salida SIEMPRE se
 * vuelve a sanear con `perfilParcial` (catalogo.ts).
 */
import { TAMANOS } from "./catalogo";

const cadenaONull = { anyOf: [{ type: "string" }, { type: "null" }] };
const enteroONull = { anyOf: [{ type: "integer" }, { type: "null" }] };
const listaCadenas = { type: "array", items: { type: "string" } };

const CONTACTO = {
  type: "object",
  additionalProperties: false,
  required: ["nombre", "cargo", "email", "telefono"],
  properties: { nombre: cadenaONull, cargo: cadenaONull, email: cadenaONull, telefono: cadenaONull },
};

export const ESQUEMA_PERFIL: Record<string, unknown> = {
  type: "object",
  additionalProperties: false,
  required: [
    "nombre",
    "sector",
    "ciudad",
    "tamano",
    "sedes",
    "personal",
    "servicios",
    "dolores",
    "incidentes",
    "herramientasActuales",
    "prioridades",
    "plazo",
    "presupuesto",
    "contacto",
    "notas",
  ],
  properties: {
    nombre: cadenaONull,
    sector: cadenaONull,
    ciudad: cadenaONull,
    tamano: { anyOf: [{ type: "string", enum: TAMANOS }, { type: "null" }] },
    sedes: enteroONull,
    personal: enteroONull,
    servicios: listaCadenas,
    dolores: listaCadenas,
    incidentes: listaCadenas,
    herramientasActuales: listaCadenas,
    prioridades: listaCadenas,
    plazo: cadenaONull,
    presupuesto: cadenaONull,
    contacto: { anyOf: [CONTACTO, { type: "null" }] },
    notas: cadenaONull,
  },
};

export { cadenaONull, listaCadenas };
