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
import type { Propuesta, Respuestas, RespuestaSeguimiento } from "@/data/propuesta/tipos";

/**
 * Versión del contrato. 2 (5-nov-2026): se suma el tipo `propuesta`; `contacto` y `diagnostico` no cambian.
 * El receptor de ARS guarda cualquier versión ≥ 1 (lo que no conoce queda completo en `datos`).
 */
export const VERSION_REGISTRO = 2 as const;

export type TipoRegistro = "contacto" | "diagnostico" | "propuesta";

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
  /** Id legible y único: CONT-2026-7K3QF2 / DIAG-2026-M4X9PA / PROP-2026-9T4HKB. Es también la Idempotency-Key. */
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

/** Lo que la persona respondió sobre su operación (sin sus datos de contacto, que van en `contacto`). */
export type RespuestasOperacion = Omit<Respuestas, "nombre" | "cargo" | "empresa" | "ciudad" | "email" | "telefono" | "autoriza">;

/**
 * «Propuesta ARS» de la sección #contacto: la persona cuenta cómo opera, la IA le arma una propuesta
 * y la envía a un asesor. El registro se crea al enviarla (para enviarla tiene que aceptar la
 * autorización de datos). El PDF y las vistas 3D no se guardan: van solo en el correo.
 */
export type RegistroPropuesta = BaseRegistro & {
  tipo: "propuesta";
  /** Referencia comercial que la persona ve en su PDF (= `propuesta.id`, p. ej. "ARS-2611-7K3Q"). */
  referencia: string;
  /** Nombre de la empresa. */
  empresa: string;
  ciudad: string | null;
  /** Quien pidió la propuesta. */
  contacto: { nombre: string; cargo: string | null; email: string; telefono: string | null };
  /** Evidencia de la autorización Ley 1581 (texto aceptado, versión y fecha). */
  autorizacion: AutorizacionDatos | null;
  respuestas: RespuestasOperacion;
  /** Preguntas de seguimiento que hizo la IA y lo que contestó. */
  seguimiento: RespuestaSeguimiento[];
  /** Resumen para listados y tableros (derivado de `propuesta`). */
  resumen: {
    titular: string;
    areas: AreaId[];
    /** Nombres legibles de los módulos propuestos. */
    modulos: string[];
    plazo: string | null;
    fases: number;
  };
  /** La propuesta tal como la vio la persona (sin `contacto`, que va arriba). Áreas y módulos van por id. */
  propuesta: Omit<Propuesta, "contacto">;
  /** Nombres legibles de los ids que usa `propuesta`, para mostrarla sin el catálogo del sitio. */
  nombres: { areas: Record<string, string>; modulos: Record<string, string> };
  /** Lo que recibió el asesor por correo: si el PDF se pudo generar y cuántas vistas 3D llevaba. */
  entrega: { pdf: boolean; vistas3d: number };
};

export type Registro = RegistroContacto | RegistroDiagnostico | RegistroPropuesta;

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
