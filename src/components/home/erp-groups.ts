import { moduloPorId } from "@/data/servicios";
import type { EstadoModulo } from "@/data/servicios/tipos";

/** Módulo del catálogo tal como lo necesita la sección «La base» (sin el resto de la ficha). */
export type ErpModuleRef = { id: string; area: string; nombre: string; estado: EstadoModulo; nota?: string };
export type ErpGroup = { modules: ErpModuleRef[] };

/**
 * Módulos del catálogo (`src/data/servicios`) que forman cada bloque del ERP de
 * gestión, en el orden de `home.erp.modules`: contratos y turnos, personas y
 * nómina, documental, formación, clientes, finanzas y facturación, gobierno.
 */
const ERP_GROUP_IDS: string[][] = [
  ["turnos-y-programacion", "control-de-asistencia-y-relevos", "ordenes-de-servicio-del-erp"],
  ["seleccion-y-contratacion", "empleados-prestamos-y-contratos", "nomina", "prima-vacaciones-y-liquidacion"],
  ["area-documental-inicio", "cargue-inteligente-de-documentos", "expedientes-y-descargas-masivas", "auditoria-de-gestion-humana"],
  ["capacitacion-virtual", "disenador-de-cursos-con-ia", "evaluaciones-de-conocimiento"],
  ["clientes-contratos-y-planes", "portal-documental-para-el-cliente", "cotizador-y-crm-propios"],
  ["contabilidad-conectada", "asistente-contable-con-ia", "facturas-dian-y-radian", "su-erp-dentro-de-ars"],
  ["configuracion-multiempresa", "auditoria-y-trazabilidad", "torre-de-control", "agente-interoperador-de-datos"],
];

/** Se resuelve en build (Server Component): nombre y estado salen siempre del catálogo. */
export function buildErpGroups(): ErpGroup[] {
  return ERP_GROUP_IDS.map((ids) => ({
    modules: ids.flatMap((id) => {
      const found = moduloPorId(id);
      if (!found) return [];
      const { area, modulo } = found;
      return [{ id: modulo.id, area: area.id, nombre: modulo.nombre, estado: modulo.estado, ...(modulo.notaEstado ? { nota: modulo.notaEstado } : {}) }];
    }),
  }));
}
