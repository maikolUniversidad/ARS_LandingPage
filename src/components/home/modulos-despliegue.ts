import { moduloPorId } from "@/data/servicios";
import { MODULOS_DESPLIEGUE, type ModuloDespliegueId } from "./contenido-despliegue";
import type { ErpModuleRef } from "./erp-groups";

export type ModulosDespliegue = Partial<Record<ModuloDespliegueId, ErpModuleRef>>;

/** Se resuelve en build (Server Component): nombre, área y estado salen siempre del catálogo. */
export function buildModulosDespliegue(): ModulosDespliegue {
  const out: ModulosDespliegue = {};
  for (const id of MODULOS_DESPLIEGUE) {
    const found = moduloPorId(id);
    if (!found) continue;
    const { area, modulo } = found;
    out[id] = { id, area: area.id, nombre: modulo.nombre, estado: modulo.estado, ...(modulo.notaEstado ? { nota: modulo.notaEstado } : {}) };
  }
  return out;
}
