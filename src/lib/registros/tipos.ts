/**
 * Registros de leads que el sitio guarda en el módulo de ARS (ERP propio).
 * Contrato compartido con el servidor de ARS: ver docs/BACKEND-REGISTROS.md.
 * Si cambias algo aquí, sube `VERSION_REGISTRO` y actualiza el documento.
 */
import type { AutorizacionDatos } from "@/data/diagnostico/autorizacion";
import type {
  AdjuntoTurno,
  AreaId,
  ContactoDiagnostico,
  Diagnostico,
  PerfilEmpresa,
  TurnoEntrevista,
} from "@/data/diagnostico/tipos";

export const VERSION_REGISTRO = 1 as const;

export type TipoRegistro = "contacto" | "diagnostico";

export const ESTADOS_REGISTRO = [
  "nuevo",
  "contactado",
  "en-propuesta",
  "ganado",
  "perdido",
  "descartado",
] as const;
export type EstadoRegistro = (typeof ESTADOS_REGISTRO)[number];

/** De dónde vino el registro. La IP nunca se guarda en claro. */
export type OrigenRegistro = {
  /** Ruta de la página (p. ej. "/diagnostico" o "/contacto"), si se conoce. */
  pagina: string | null;
  /** Host del sitio que lo recibió (p. ej. "ars-intelligence.com"). */
  sitio: string | null;
  /** SHA-256 (truncado a 32 hex) de IP + sal secreta. */
  ipHash: string;
  userAgent: string | null;
  /** "production" | "preview" | "development". */
  entorno: string;
};

export type CambioEstado = { estado: EstadoRegistro; fecha: string; nota?: string };

type BaseRegistro = {
  /** Id legible y único: CONT-2026-7K3QF2 / DIAG-2026-M4X9PA. Es también la Idempotency-Key. */
  id: string;
  tipo: TipoRegistro;
  version: typeof VERSION_REGISTRO;
  /** ISO 8601 UTC. */
  creado: string;
  actualizado: string;
  estado: EstadoRegistro;
  historialEstados: CambioEstado[];
  origen: OrigenRegistro;
};

export type RegistroContacto = BaseRegistro & {
  tipo: "contacto";
  contacto: { nombre: string; empresa: string | null; email: string; telefono: string | null };
  mensaje: string;
};

export type RegistroDiagnostico = BaseRegistro & {
  tipo: "diagnostico";
  /** "ia" = generado por Claude; "demo" = simulado (pruebas, sin clave). */
  fuente: "ia" | "demo";
  /** Nombre de la empresa (atajo de `perfil.nombre`). */
  empresa: string;
  /** Solo si la persona aceptó la autorización de datos; si no, null. */
  contacto: ContactoDiagnostico | null;
  /** Evidencia de la autorización Ley 1581 (texto aceptado, versión y fecha); null si no la aceptó. */
  autorizacion: AutorizacionDatos | null;
  perfil: PerfilEmpresa;
  conversacion: TurnoEntrevista[];
  /** Solo metadatos y lo que entendió la IA; el archivo no se guarda. */
  adjuntos: AdjuntoTurno[];
  /** Resumen para listados y tableros (derivado de `diagnostico`). */
  resumen: {
    titular: string;
    madurezHoy: number;
    madurezConArs: number;
    areasRecomendadas: AreaId[];
    prioridadAlta: AreaId[];
  };
  diagnostico: Diagnostico;
};

export type Registro = RegistroContacto | RegistroDiagnostico;

/** Estado de sincronización con ARS; solo vive en la copia local (no se envía). */
export type Sincronizacion = {
  remoto: "enviado" | "pendiente" | "no-configurado";
  intentos: number;
  ultimoIntento: string | null;
  ultimoError: string | null;
};

export type RegistroLocal = Registro & { sincronizacion?: Sincronizacion };

/** Lo que se envía (POST) al módulo de ARS. */
export type EventoRegistro = {
  evento: "registro.creado";
  version: typeof VERSION_REGISTRO;
  enviado: string;
  registro: Registro;
};
