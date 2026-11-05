/** Interfaces de los almacenes de registros (adaptadores elegidos por variables de entorno). */
import type { EstadoRegistro, Registro, RegistroLocal, TipoRegistro } from "./tipos";

export interface AlmacenRegistros {
  readonly nombre: string;
  /** Guarda el registro; lanza si no pudo. Debe ser idempotente por `registro.id`. */
  guardar(registro: Registro): Promise<void>;
}

export type FiltroRegistros = {
  tipo?: TipoRegistro;
  estado?: EstadoRegistro;
  /** ISO 8601 (incluido). */
  desde?: string;
  /** ISO 8601 (excluido). */
  hasta?: string;
  pagina: number;
  limite: number;
};

export type PaginaRegistros = { total: number; registros: RegistroLocal[] };

/** Almacén que además permite consultar y cambiar estado (lo usa /api/registros). */
export interface AlmacenConsultable extends AlmacenRegistros {
  obtener(id: string): Promise<RegistroLocal | null>;
  listar(filtro: FiltroRegistros): Promise<PaginaRegistros>;
  cambiarEstado(id: string, estado: EstadoRegistro, nota?: string): Promise<RegistroLocal | null>;
}
