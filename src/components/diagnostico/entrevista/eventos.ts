/**
 * Protocolo NDJSON de /api/diagnostico/entrevista (un objeto JSON por línea).
 * Lo comparten la ruta y la UI de la entrevista.
 */
import type { AreaId, PerfilEmpresa, TurnoEntrevista } from "@/data/diagnostico/tipos";

/** Un dato o tema de la empresa que la IA destaca mientras conversa. */
export type DatoEmpresa = { titulo: string; texto: string };

export type EventoEntrevista =
  /** Fragmento del texto de la IA. */
  | { t: "texto"; d: string }
  /** Cambios al perfil en construcción (se fusionan con el actual). */
  | { t: "perfil"; cambios: Partial<PerfilEmpresa> }
  /** Áreas y módulos del catálogo que vale la pena mostrar ahora. */
  | { t: "mostrar"; areas: AreaId[]; modulos: string[] }
  /** Respuestas rápidas sugeridas para el siguiente turno. */
  | { t: "chips"; opciones: string[]; multiple: boolean }
  | { t: "dato"; dato: DatoEmpresa }
  /** La IA ya tiene lo necesario para analizar. */
  | { t: "listo" }
  | { t: "fin" }
  | { t: "error"; mensaje: string };

export type PeticionTurno = {
  conversacion: TurnoEntrevista[];
  perfil: Partial<PerfilEmpresa>;
};

/** Saludo inicial (lo pinta la UI sin llamar a la IA). */
export const SALUDO =
  "¡Hola! Soy Ars. En unos minutos vamos a armar el diagnóstico de tu empresa y a ver cómo se vería con ARS. Para empezar, ¿cómo se llama tu empresa y a qué se dedica?";

export const CHIPS_INICIALES = [
  "Empresa de vigilancia privada",
  "Administración de conjuntos residenciales",
  "Industria o planta de producción",
  "Escoltas y transporte de valores",
];
