/**
 * Almacén local: un archivo JSON por registro en REGISTROS_DIR (por defecto
 * .data/registros/). Es el respaldo para no perder leads y la fuente de la API
 * pull /api/registros. En Vercel el disco NO persiste (ver docs/BACKEND-REGISTROS.md).
 */
import { mkdir, readdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { ID_RE } from "./crear";
import type { AlmacenConsultable, FiltroRegistros, PaginaRegistros } from "./almacen";
import type { EstadoRegistro, RegistroLocal, Sincronizacion } from "./tipos";

export class AlmacenLocal implements AlmacenConsultable {
  readonly nombre = "local";
  constructor(private readonly dir: string) {}

  private ruta(id: string): string {
    if (!ID_RE.test(id)) throw new Error(`Id inválido: ${id}`);
    return path.join(this.dir, `${id}.json`);
  }

  /** Escritura atómica (tmp + rename) para no dejar JSON a medias. */
  async guardar(registro: RegistroLocal): Promise<void> {
    await mkdir(this.dir, { recursive: true });
    const destino = this.ruta(registro.id);
    const tmp = `${destino}.${process.pid}.${Date.now()}.tmp`;
    await writeFile(tmp, JSON.stringify(registro, null, 2), "utf8");
    await rename(tmp, destino);
  }

  async obtener(id: string): Promise<RegistroLocal | null> {
    if (!ID_RE.test(id)) return null;
    try {
      return JSON.parse(await readFile(this.ruta(id), "utf8")) as RegistroLocal;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
      throw err;
    }
  }

  async todos(): Promise<RegistroLocal[]> {
    let archivos: string[];
    try {
      archivos = await readdir(this.dir);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw err;
    }
    const ids = archivos.filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5)).filter((id) => ID_RE.test(id));
    const registros = await Promise.all(ids.map((id) => this.obtener(id).catch(() => null)));
    return registros.filter((r): r is RegistroLocal => r !== null).sort((a, b) => b.creado.localeCompare(a.creado));
  }

  async listar(f: FiltroRegistros): Promise<PaginaRegistros> {
    const desde = f.desde ? Date.parse(f.desde) : NaN;
    const hasta = f.hasta ? Date.parse(f.hasta) : NaN;
    const filtrados = (await this.todos()).filter(
      (r) =>
        (!f.tipo || r.tipo === f.tipo) &&
        (!f.estado || r.estado === f.estado) &&
        (Number.isNaN(desde) || Date.parse(r.creado) >= desde) &&
        (Number.isNaN(hasta) || Date.parse(r.creado) < hasta),
    );
    const inicio = (f.pagina - 1) * f.limite;
    return { total: filtrados.length, registros: filtrados.slice(inicio, inicio + f.limite) };
  }

  async cambiarEstado(id: string, estado: EstadoRegistro, nota?: string): Promise<RegistroLocal | null> {
    const r = await this.obtener(id);
    if (!r) return null;
    const fecha = new Date().toISOString();
    const actualizado: RegistroLocal = {
      ...r,
      estado,
      actualizado: fecha,
      historialEstados: [...(r.historialEstados ?? []), { estado, fecha, ...(nota ? { nota } : {}) }],
    };
    await this.guardar(actualizado);
    return actualizado;
  }

  async marcarSincronizacion(id: string, s: Sincronizacion): Promise<void> {
    const r = await this.obtener(id);
    if (r) await this.guardar({ ...r, sincronizacion: s });
  }
}
