/**
 * Arquitecto IA de plataforma: catálogo permitido, motor de reglas (sin IA,
 * siempre disponible), saneo de la salida de la IA y validación de la petición.
 * Todo lo que sale de aquí usa SOLO ids reales de `@/data/servicios`.
 */
import { moduloPorId, todosLosModulos, type Area, type Modulo } from "@/data/servicios";
import {
  IDIOMAS,
  LIMITES_ARQUITECTO as L,
  PRIORIDADES_OP,
  TAMANOS_OP,
  type DolorPropuesta,
  type FasePropuesta,
  type Idioma,
  type IndicadorPropuesta,
  type ModuloPropuesta,
  type PeticionArquitecto,
  type PrioridadOp,
  type PropuestaPlataforma,
  type TamanoOp,
} from "./tipos";

/* ------------------------------- Catálogo ------------------------------- */

/**
 * Solo se proponen módulos que existen hoy (vivos o en piloto). Lo que está
 * «Próximamente» u «Hoja de ruta» no entra en una propuesta: no se promete.
 */
export const MODULOS_PERMITIDOS = todosLosModulos().filter(({ modulo }) => modulo.estado === "vivo" || modulo.estado === "piloto");
export const IDS_MODULOS = MODULOS_PERMITIDOS.map(({ modulo }) => modulo.id);
const PERMITIDOS = new Set(IDS_MODULOS);
export const TOTAL_MODULOS = todosLosModulos().length;

/** Orden del área en el catálogo (A=0 … J=9), para ordenar fases y tarjetas. */
const ORDEN_AREA = new Map<string, number>();
todosLosModulos().forEach(({ area }) => {
  if (!ORDEN_AREA.has(area.id)) ORDEN_AREA.set(area.id, ORDEN_AREA.size);
});

export function moduloValido(id: string): { area: Area; modulo: Modulo } | undefined {
  return PERMITIDOS.has(id) ? moduloPorId(id) : undefined;
}

/* ------------------------------ Conocimiento ------------------------------ */

type Regla = {
  re: RegExp;
  prioridad?: PrioridadOp;
  dolor: string;
  ids: string[];
};

/** Palabras del visitante → dolor reconocible → módulos que lo resuelven. */
const REGLAS: Regla[] = [
  {
    re: /excel|hoja(s)? de c[aá]lculo|cuadro de turnos|program(o|amos|an|ar|aci[oó]n)[^.]{0,40}turno|turnos? a mano|spreadsheet|shift schedul|schedul[a-z]* shifts/i,
    prioridad: "turnos",
    dolor: "La programación de turnos se arma a mano en hojas de cálculo, mes a mes.",
    ids: ["turnos-y-programacion"],
  },
  {
    re: /qui[eé]n est[aá]|en el puesto|asistencia|relevo|lleg(a|an|ó) tarde|no lleg|ausen|abandon|marcaci[oó]n|dormid|who('s| is) (actually )?(at|on)|attendance|no-show/i,
    prioridad: "puesto",
    dolor: "No hay certeza de quién está realmente en el puesto ni a qué hora llegó o se fue.",
    ids: ["control-de-asistencia-y-relevos", "recorridos-y-tiempo-en-el-puesto", "turnos-y-programacion"],
  },
  {
    re: /ronda|punto(s)? de control|\bqr\b|recorrido(s)? del vigilante|patrol|checkpoint/i,
    dolor: "Las rondas se registran en planillas que nadie puede verificar.",
    ids: ["rondas-qr", "cumplimiento-supervisores-y-vigilantes"],
  },
  {
    re: /supervis|revista|visitas? (a|de) (los )?(puestos|sedes)|site visits?/i,
    dolor: "La supervisión de puestos no deja un registro comparable ni medible.",
    ids: ["reportes-operativos-y-supervision", "cumplimiento-supervisores-y-vigilantes"],
  },
  {
    re: /\bsedes?\b|ciudades|regional|mapa|centro de (control|operaciones|monitoreo)|central de|\bgps\b|ubicaci[oó]n|dispers|\bsites?\b|control room|monitoring cent/i,
    prioridad: "sala-control",
    dolor: "Con tantas sedes, la operación completa no se ve en un solo lugar ni en tiempo real.",
    ids: ["sala-de-control", "zonas-y-salida-de-zona", "sala-del-coordinador"],
  },
  {
    re: /radio|avantel|walkie|comunica|whats ?app|llamad(a|as)|grupos? de chat|\bcalls?\b|phone/i,
    prioridad: "comunicacion",
    dolor: "La comunicación con el personal va por radios, llamadas y grupos de chat dispersos.",
    ids: ["radio-ptt", "chat-corporativo", "conversacion-con-la-central"],
  },
  {
    re: /p[aá]nico|emergencia|atraco|asalto|incidente|alarma|novedad(es)? grave|panic|emergenc|robbery|alarm/i,
    dolor: "Ante una emergencia, la respuesta depende de que alguien conteste el teléfono.",
    ids: ["boton-de-panico", "notificaciones-y-telegram", "sala-de-control"],
  },
  {
    re: /c[aá]mara|cctv|\bvideo\b|anal[ií]tica|monitoreo de video|camera/i,
    prioridad: "video",
    dolor: "Las cámaras graban, pero el video se revisa después de que las cosas pasan.",
    ids: ["vision-artificial", "acceso-inteligente"],
  },
  {
    re: /visitant|porter[ií]a|minuta|control de (acceso|ingreso)|bicicleta|visitor|gatehouse|logbook/i,
    dolor: "El registro de visitantes y la minuta de portería siguen en papel.",
    ids: ["visitantes-y-bicicletas", "acceso-inteligente"],
  },
  {
    re: /n[oó]mina|liquid|horas? extra|recargo|dominical|pago(s)? (al|del) personal|payroll|overtime/i,
    prioridad: "nomina",
    dolor: "La nómina se liquida consolidando horas y recargos a mano, con errores y reclamos.",
    ids: ["nomina", "costos-y-comparacion-con-el-erp", "nomina-de-administrativos-y-ajuste"],
  },
  {
    re: /document|hoja(s)? de vida|expediente|carpeta|papeleo|archivo|vencimiento|acreditaci|credencial|r[eé]sum[eé]|folder|expir|certificate/i,
    prioridad: "documentos",
    dolor: "Los documentos del personal están dispersos y los vencimientos se pasan sin aviso.",
    ids: ["cargue-inteligente-de-documentos", "expedientes-y-descargas-masivas", "auditoria-de-gestion-humana"],
  },
  {
    re: /auditor[ií]a|supervigilancia|superintendencia|el cliente (nos )?pide|soportes? (al|para el) cliente|informe(s)? (al|para el|del) cliente|audit/i,
    dolor: "Reunir soportes para auditorías y para los clientes toma días de trabajo manual.",
    ids: ["portal-documental-para-el-cliente", "auditoria-y-trazabilidad", "reporte-por-sede"],
  },
  {
    re: /selecci[oó]n|reclut|contrataci|vincula|rotaci[oó]n de personal|nuevos? (vigilantes|guardas)|recruit|hiring/i,
    dolor: "Seleccionar y contratar personal es un proceso lento, por correo y papel.",
    ids: ["seleccion-y-contratacion", "empleados-prestamos-y-contratos"],
  },
  {
    re: /capacita|\bcurso|formaci[oó]n|entrenamiento|reentren|inducci|training|course/i,
    prioridad: "formacion",
    dolor: "La capacitación del personal es difícil de programar, certificar y demostrar.",
    ids: ["capacitacion-virtual", "auditoria-de-capacitacion-y-reglas", "disenador-de-cursos-con-ia"],
  },
  {
    re: /factur|contab|\berp\b|siigo|world office|\bsap\b|finanz|cartera|orden(es)? de servicio|accounting|invoic|financ/i,
    prioridad: "finanzas",
    dolor: "La operación y la contabilidad viven en sistemas separados que se cruzan en Excel.",
    ids: ["contabilidad-conectada", "agente-interoperador-de-datos", "ordenes-de-servicio-del-erp"],
  },
  {
    re: /\barmas?\b|veh[ií]culo|motos?\b|canin|perros?\b|dotaci[oó]n|recursos operativos|weapon|vehicle|\bk9\b|dogs?\b/i,
    dolor: "Armas, vehículos y caninos se controlan en planillas, sin historial por puesto.",
    ids: ["recursos-operativos"],
  },
  {
    re: /descargo|sanci[oó]n|disciplin|llamado(s)? de atenci|no conforme|disciplin/i,
    dolor: "Los procesos disciplinarios y los descargos no tienen un trámite ordenado.",
    ids: ["juridica-no-conformes-y-descargos"],
  },
  {
    re: /tarea|pendiente|seguimiento|reuni[oó]n|ticket|solicitud(es)?|\btasks?\b|meeting|follow-up/i,
    dolor: "Los pendientes y las solicitudes se pierden entre correos, chats y reuniones.",
    ids: ["seguimiento-de-tareas", "tickets-de-soporte", "formularios-dinamicos"],
  },
  {
    re: /varias empresas|multiempresa|grupo empresarial|filial|permisos|roles|several companies|permissions/i,
    dolor: "Varias empresas o equipos necesitan ver solo lo suyo, con permisos claros.",
    ids: ["configuracion-multiempresa", "torre-de-control", "ingreso-y-doble-factor"],
  },
];

const POR_PRIORIDAD = new Map(REGLAS.filter((r) => r.prioridad).map((r) => [r.prioridad as PrioridadOp, r]));

/** Fases: qué áreas del catálogo entran en cada una (en orden de implementación). */
const FASES: { nombre: string; areas: string[]; resultado: string }[] = [
  {
    nombre: "Base operativa",
    areas: ["operacion-en-campo", "gobierno-y-seguridad"],
    resultado: "Clientes, sedes y puestos cargados; el trabajo de campo queda registrado desde el celular.",
  },
  {
    nombre: "Control en tiempo real",
    areas: ["centro-de-operaciones", "comunicacion-y-emergencias", "monitoreo-inteligente", "realidad-virtual"],
    resultado: "La central ve la operación completa en vivo y atiende las novedades desde un solo lugar.",
  },
  {
    nombre: "Gestión humana y documentos",
    areas: ["gestion-humana", "formacion"],
    resultado: "Personal, nómina, documentos y formación conectados con lo que de verdad pasa en la operación.",
  },
  {
    nombre: "Back office conectado",
    areas: ["finanzas-y-erp", "productividad-e-ia"],
    resultado: "Lo que pasa en la operación llega solo a nómina, contabilidad y seguimiento de tareas.",
  },
];

/** Indicadores cualitativos por módulo (cómo se trabaja antes y después). Sin cifras. */
const INDICADORES: Record<string, IndicadorPropuesta> = {
  "turnos-y-programacion": { nombre: "Programación del mes", antes: "Hojas de cálculo armadas a mano cada mes", despues: "Mes generado con las reglas de cada cliente y comparado con lo trabajado" },
  "control-de-asistencia-y-relevos": { nombre: "Presencia en el puesto", antes: "Se sabe por llamadas o al final del turno", despues: "Entrada, salida y relevo con foto, ubicación y hora" },
  "sala-de-control": { nombre: "Visibilidad de la operación", antes: "Cada sede es un punto ciego hasta que alguien llama", despues: "Mapa en vivo con el estado de cada sede y cada persona" },
  "rondas-qr": { nombre: "Rondas", antes: "Planillas firmadas que nadie puede verificar", despues: "Cada punto marcado con QR, hora y evidencia" },
  "reportes-operativos-y-supervision": { nombre: "Supervisión", antes: "Visitas sin un registro comparable", despues: "Revistas con formato, foto y firma, listas para el informe" },
  "radio-ptt": { nombre: "Comunicación con el personal", antes: "Radios, llamadas y grupos de chat dispersos", despues: "Radio PTT y chat en el mismo celular, con registro" },
  "boton-de-panico": { nombre: "Atención de emergencias", antes: "Depende de que alguien conteste el teléfono", despues: "Alerta con ubicación que abre una ventana de atención en la central" },
  "vision-artificial": { nombre: "Cámaras", antes: "Video que se revisa después del hecho", despues: "Analíticas que avisan mientras pasa, con verificación humana" },
  "visitantes-y-bicicletas": { nombre: "Portería", antes: "Minuta y registro de visitantes en papel", despues: "Registro digital de visitantes, consultable por sede" },
  nomina: { nombre: "Nómina", antes: "Horas y recargos consolidados a mano", despues: "Liquidación a partir de los turnos realmente trabajados" },
  "cargue-inteligente-de-documentos": { nombre: "Documentos del personal", antes: "Carpetas y correos dispersos; vencimientos que se pasan", despues: "Expediente por persona, clasificado solo, con alertas de vencimiento" },
  "portal-documental-para-el-cliente": { nombre: "Auditorías del cliente", antes: "Reunir soportes es trabajo manual de varios días", despues: "El cliente consulta sus soportes en su propio portal" },
  "capacitacion-virtual": { nombre: "Formación", antes: "Cursos difíciles de programar y de certificar", despues: "Cursos virtuales con certificado verificable por QR" },
  "contabilidad-conectada": { nombre: "Contabilidad", antes: "Operación y contabilidad se cruzan en Excel", despues: "Datos de la operación conectados con la contabilidad" },
  "seleccion-y-contratacion": { nombre: "Contratación", antes: "Proceso por correo y papel, sin trazabilidad", despues: "Selección y contratación con cada paso registrado" },
  "recursos-operativos": { nombre: "Recursos operativos", antes: "Armas, vehículos y caninos en planillas", despues: "Asignación por puesto con historial" },
  "seguimiento-de-tareas": { nombre: "Seguimiento", antes: "Pendientes perdidos en correos y chats", despues: "Tareas con responsable y fecha" },
  "juridica-no-conformes-y-descargos": { nombre: "Procesos disciplinarios", antes: "Descargos y sanciones sin trámite ordenado", despues: "Cada caso con su trámite, soportes y trazabilidad" },
  "configuracion-multiempresa": { nombre: "Permisos", antes: "Todos ven todo, o nadie ve nada", despues: "Cada empresa y cada rol ve solo lo suyo" },
};

const TAMANO_TXT: Record<TamanoOp, string> = {
  pequena: "menos de 50 personas en campo",
  mediana: "entre 50 y 300 personas en campo",
  grande: "entre 300 y 1.000 personas en campo",
  "muy-grande": "más de 1.000 personas en campo",
};
export const TAMANO_DESCRIPCION = TAMANO_TXT;

/* --------------------------------- Reglas -------------------------------- */

const unico = <T>(xs: T[]) => [...new Set(xs)];
const ordenArea = (id: string) => ORDEN_AREA.get(moduloPorId(id)?.area.id ?? "") ?? 99;

const EN_ES: Record<string, string> = {
  guards: "guardas",
  officers: "vigilantes",
  people: "personas",
  employees: "empleados",
  sites: "sedes",
  posts: "puestos",
  clients: "clientes",
};

/** Lee cifras que el propio visitante dio (nunca se inventan). */
function cifrasDelCliente(texto: string): { personas?: string; sedes?: string } {
  const personas = texto.match(/(\d[\d.,]*)\s*(guardas|guardias|vigilantes|escoltas|operarios|personas|empleados|colaboradores|trabajadores|guards|officers|people|employees)/i);
  const sedes = texto.match(/(\d[\d.,]*)\s*(sedes|puestos|clientes|sitios|edificios|conjuntos|sites|posts|clients)/i);
  // Las reglas escriben en español: los sustantivos en inglés se traducen.
  const es = (w: string) => EN_ES[w.toLowerCase()] ?? w.toLowerCase();
  return {
    personas: personas ? `${personas[1]} ${es(personas[2])}` : undefined,
    sedes: sedes ? `${sedes[1]} ${es(sedes[2])}` : undefined,
  };
}

function fasesDe(ids: string[]): FasePropuesta[] {
  const fases: FasePropuesta[] = [];
  for (const f of FASES) {
    const delaFase = ids.filter((id) => f.areas.includes(moduloPorId(id)?.area.id ?? ""));
    if (!delaFase.length) continue;
    fases.push({
      nombre: `Fase ${fases.length + 1} · ${f.nombre}`,
      semanas: Math.min(6, Math.max(2, Math.ceil(delaFase.length * 1.5))),
      moduloIds: delaFase,
      resultado: f.resultado,
    });
  }
  return fases;
}

export function propuestaPorReglas(p: PeticionArquitecto): PropuestaPlataforma {
  const texto = p.descripcion;
  const aplicadas: Regla[] = [];
  for (const r of REGLAS) if (r.re.test(texto)) aplicadas.push(r);
  for (const pr of p.prioridades ?? []) {
    const r = POR_PRIORIDAD.get(pr);
    if (r && !aplicadas.includes(r)) aplicadas.push(r);
  }
  // Operaciones grandes: la vista central casi siempre es un dolor aunque no lo nombren.
  if ((p.tamano === "grande" || p.tamano === "muy-grande") && !aplicadas.some((r) => r.prioridad === "sala-control")) {
    const r = POR_PRIORIDAD.get("sala-control");
    if (r) aplicadas.push(r);
  }
  // Sin pistas: el núcleo de cualquier operación de seguridad.
  if (aplicadas.length < 2) {
    for (const pr of ["puesto", "turnos", "sala-control"] as PrioridadOp[]) {
      const r = POR_PRIORIDAD.get(pr);
      if (r && !aplicadas.includes(r) && aplicadas.length < 3) aplicadas.push(r);
    }
  }

  const dolores: DolorPropuesta[] = aplicadas.slice(0, L.dolores).map((r) => ({
    dolor: r.dolor,
    moduloIds: r.ids.filter((id) => PERMITIDOS.has(id)).slice(0, L.modulosPorDolor),
  }));

  // El primer módulo de cada dolor es prioridad alta; los demás, recomendados.
  const prioridad = new Map<string, "alta" | "media">();
  for (const d of dolores) d.moduloIds.forEach((id, i) => prioridad.set(id, prioridad.get(id) === "alta" || i === 0 ? "alta" : "media"));
  const ids = unico(dolores.flatMap((d) => d.moduloIds))
    .sort((a, b) => (prioridad.get(a) === prioridad.get(b) ? ordenArea(a) - ordenArea(b) : prioridad.get(a) === "alta" ? -1 : 1))
    .slice(0, L.modulos);
  const ordenados = [...ids].sort((a, b) => ordenArea(a) - ordenArea(b));

  const modulos: ModuloPropuesta[] = ids.map((id) => {
    const d = dolores.find((x) => x.moduloIds.includes(id));
    const m = moduloPorId(id)?.modulo;
    return {
      id,
      prioridad: prioridad.get(id) ?? "media",
      por_que: `${m?.frase ?? ""}. Atiende: ${d ? d.dolor.charAt(0).toLowerCase() + d.dolor.slice(1) : "la operación diaria."}`.replace(/\.\./g, "."),
    };
  });

  const { personas, sedes } = cifrasDelCliente(texto);
  const escala = personas && sedes ? `${personas} en ${sedes}` : personas ?? sedes ?? (p.tamano ? TAMANO_TXT[p.tamano] : "");
  const indicadores = ordenados.map((id) => INDICADORES[id]).filter(Boolean).slice(0, 5);

  return {
    titulo: escala ? `Plataforma a la medida para ${escala}` : "Plataforma a la medida de tu operación",
    diagnostico: `${escala ? `Una operación de ${escala}` : "Tu operación"} necesita resolver primero ${dolores.length === 1 ? "un frente" : `${dolores.length} frentes`}: ${dolores
      .slice(0, 3)
      .map((d) => d.dolor.replace(/\.$/, "").toLowerCase())
      .join("; ")}${dolores.length > 3 ? ", entre otros" : ""}. Proponemos ${modulos.length} módulos de ARS que comparten la misma estructura de clientes, sedes y puestos, implementados por fases para que cada una entregue resultados antes de pasar a la siguiente.`,
    dolores,
    modulos,
    fases: fasesDe(ordenados),
    indicadores,
    siguientePaso: "Agendar una demostración con tu propia estructura de clientes, sedes y puestos, empezando por la primera fase.",
    fuente: "reglas",
  };
}

/* ------------------------- Saneado de la salida IA ------------------------- */

const txt = (v: unknown, max: number) => (typeof v === "string" ? v.trim().replace(/\s+/g, " ").slice(0, max) : "");
const idsValidos = (v: unknown, max: number) =>
  unico((Array.isArray(v) ? v : []).filter((x): x is string => typeof x === "string" && PERMITIDOS.has(x))).slice(0, max);
/** Un indicador cualitativo no lleva números, porcentajes ni precios (no se inventan cifras). */
const SIN_CIFRAS = (s: string) => !/\d|%|\$|\bCOP\b|\bUSD\b|precio|price/i.test(s);

/** Valida y repara lo que devuelve la IA. Devuelve null si no se puede usar. */
export function sanearPropuesta(raw: unknown): PropuestaPlataforma | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;

  const modulos: ModuloPropuesta[] = [];
  for (const mi of Array.isArray(r.modulos) ? r.modulos : []) {
    if (modulos.length >= L.modulos || !mi || typeof mi !== "object") continue;
    const m = mi as Record<string, unknown>;
    const id = txt(m.id, 80);
    if (!PERMITIDOS.has(id) || modulos.some((x) => x.id === id)) continue;
    modulos.push({ id, por_que: txt(m.por_que, 320) || (moduloPorId(id)?.modulo.frase ?? ""), prioridad: m.prioridad === "alta" ? "alta" : "media" });
  }

  const dolores: DolorPropuesta[] = [];
  for (const di of Array.isArray(r.dolores) ? r.dolores : []) {
    if (dolores.length >= L.dolores || !di || typeof di !== "object") continue;
    const d = di as Record<string, unknown>;
    const dolor = txt(d.dolor, 240);
    const ids = idsValidos(d.moduloIds, L.modulosPorDolor);
    if (!dolor || !ids.length) continue;
    dolores.push({ dolor, moduloIds: ids });
  }
  // Todo módulo citado en un dolor debe tener su tarjeta.
  for (const id of dolores.flatMap((d) => d.moduloIds)) {
    if (modulos.length >= L.modulos) break;
    if (!modulos.some((m) => m.id === id)) modulos.push({ id, por_que: moduloPorId(id)?.modulo.frase ?? "", prioridad: "media" });
  }
  if (!modulos.length) return null;
  const elegidos = new Set(modulos.map((m) => m.id));
  for (const d of dolores) d.moduloIds = d.moduloIds.filter((id) => elegidos.has(id));

  let fases: FasePropuesta[] = [];
  const enFase = new Set<string>();
  for (const fi of Array.isArray(r.fases) ? r.fases : []) {
    if (fases.length >= L.fases || !fi || typeof fi !== "object") continue;
    const f = fi as Record<string, unknown>;
    const ids = idsValidos(f.moduloIds, L.modulos).filter((id) => elegidos.has(id) && !enFase.has(id));
    if (!ids.length) continue;
    ids.forEach((id) => enFase.add(id));
    const sem = typeof f.semanas === "number" && Number.isFinite(f.semanas) ? Math.round(f.semanas) : 3;
    fases.push({ nombre: txt(f.nombre, 80) || `Fase ${fases.length + 1}`, semanas: Math.max(1, Math.min(12, sem)), moduloIds: ids, resultado: txt(f.resultado, 240) });
  }
  const sueltos = modulos.map((m) => m.id).filter((id) => !enFase.has(id));
  if (!fases.length) fases = fasesDe([...elegidos].sort((a, b) => ordenArea(a) - ordenArea(b)));
  else if (sueltos.length) fases[fases.length - 1].moduloIds.push(...sueltos);

  const indicadores: IndicadorPropuesta[] = [];
  for (const ii of Array.isArray(r.indicadores) ? r.indicadores : []) {
    if (indicadores.length >= L.indicadores || !ii || typeof ii !== "object") continue;
    const i = ii as Record<string, unknown>;
    const ind = { nombre: txt(i.nombre, 80), antes: txt(i.antes, 180), despues: txt(i.despues, 180) };
    if (ind.nombre && ind.antes && ind.despues && [ind.nombre, ind.antes, ind.despues].every(SIN_CIFRAS)) indicadores.push(ind);
  }
  if (!indicadores.length) indicadores.push(...modulos.map((m) => INDICADORES[m.id]).filter(Boolean).slice(0, 5));

  return {
    titulo: txt(r.titulo, 110) || "Plataforma a la medida de tu operación",
    diagnostico: txt(r.diagnostico, 700),
    dolores,
    modulos,
    fases,
    indicadores,
    siguientePaso: txt(r.siguientePaso, 260) || "Agendar una demostración con tu propia estructura de clientes, sedes y puestos.",
    fuente: "ia",
  };
}

/** Valida el cuerpo que manda el navegador. */
export function leerPeticionArquitecto(body: unknown): PeticionArquitecto | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const descripcion = txt(b.descripcion, L.descripcion);
  if (descripcion.length < 12) return null;
  const prioridades = Array.isArray(b.prioridades)
    ? unico(b.prioridades.filter((x): x is PrioridadOp => PRIORIDADES_OP.includes(x as PrioridadOp)))
    : [];
  return {
    descripcion,
    prioridades,
    tamano: TAMANOS_OP.includes(b.tamano as TamanoOp) ? (b.tamano as TamanoOp) : undefined,
    idioma: IDIOMAS.includes(b.idioma as Idioma) ? (b.idioma as Idioma) : "es",
  };
}
