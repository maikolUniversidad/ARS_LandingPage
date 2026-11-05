/**
 * Proyectos de ARS Intelligence (/proyectos).
 *
 * ⚠️ Fichas de referencia: el repositorio no tiene todavía datos confirmados de
 * proyectos (nombres de clientes, fechas, cifras). Cada ficha describe un tipo
 * de operación real de la plataforma con módulos del catálogo, en una ciudad,
 * y lleva `verificado: false` hasta que el equipo comercial la confirme.
 * La página lo muestra con el sello «Caso de referencia».
 *
 * Para publicar un proyecto real: completar la ficha, poner `verificado: true`
 * y, si el cliente lo autoriza, su nombre en `cliente`.
 */
import { AREAS, moduloPorId, type Area, type Captura, type Modulo } from "@/data/servicios";
import type { Ciudad, EstadoProyecto, PaisId, Proyecto, SectorId } from "./tipos";

export type * from "./tipos";

export const PAISES: Record<PaisId, string> = { CO: "Colombia", PE: "Perú" };

export const SECTORES: Record<SectorId, string> = {
  educacion: "Educación",
  "sector-publico": "Sector público",
  energia: "Energía e industria",
  transporte: "Transporte masivo",
  eventos: "Recintos y eventos",
  corporativo: "Corporativo",
  "seguridad-privada": "Empresa de seguridad",
  laboratorio: "Laboratorio ARS",
};

export const ESTADOS: Record<EstadoProyecto, { texto: string; detalle: string }> = {
  operacion: { texto: "En operación", detalle: "Todos sus módulos están en producción." },
  piloto: { texto: "Piloto", detalle: "Incluye módulos en piloto que pasan a producción en los próximos meses." },
  desarrollo: { texto: "En desarrollo", detalle: "Línea de nuestro laboratorio; todavía no es un producto." },
};

export const CIUDADES: Ciudad[] = [
  { id: "bogota", nombre: "Bogotá", region: "Bogotá D.C.", pais: "CO", lat: 4.711, lng: -74.072 },
  { id: "medellin", nombre: "Medellín", region: "Antioquia", pais: "CO", lat: 6.244, lng: -75.582 },
  { id: "cali", nombre: "Cali", region: "Valle del Cauca", pais: "CO", lat: 3.452, lng: -76.532 },
  { id: "barranquilla", nombre: "Barranquilla", region: "Atlántico", pais: "CO", lat: 10.963, lng: -74.796 },
  { id: "lima", nombre: "Lima", region: "Lima Metropolitana", pais: "PE", lat: -12.046, lng: -77.043 },
];

export const PROYECTOS: Proyecto[] = [
  {
    id: "campus-universitario",
    titulo: "Un campus que se vigila de punta a punta",
    cliente: "Universidad privada",
    sector: "educacion",
    ciudadId: "bogota",
    resumen: "Rondas, visitantes y cámaras con IA en una sola central para un campus abierto.",
    reto: "Un campus con muchas entradas, flujo de visitantes todo el día y rondas que se registraban en papel, sin forma de saber si se cumplían.",
    solucion:
      "Cada vigilante marca su turno con selfie y ubicación y hace sus rondas con QR; la portería registra visitantes y bicicletas desde el celular. La central ve el mapa vivo, recibe las alertas de las cámaras con evidencia y atiende el botón de pánico con bitácora.",
    modulos: [
      "rondas-qr",
      "control-de-asistencia-y-relevos",
      "visitantes-y-bicicletas",
      "vision-artificial",
      "sala-de-control",
      "boton-de-panico",
    ],
    resultados: [
      "Cada ronda queda con hora, punto y foto: el cumplimiento se ve, no se supone.",
      "Visitantes y bicicletas registrados sin planillas.",
      "Las alertas de las cámaras llegan con evidencia y un operador decide.",
    ],
    escala: "Varias sedes en una misma ciudad",
    verificado: false,
  },
  {
    id: "red-de-sedes-publicas",
    titulo: "Una red de sedes que le rinde cuentas al cliente",
    cliente: "Entidad pública del orden nacional",
    sector: "sector-publico",
    ciudadId: "bogota",
    resumen: "Programación, accesos y reportes por sede, con portal documental para el cliente.",
    reto: "Muchas sedes administrativas, cada una con su puesto, y un cliente que exige soportes del personal y reportes periódicos por sede.",
    solucion:
      "Programación arma el mes sobre Cliente → Sede → Puesto; el acceso inteligente lleva listas y consentimientos; cada sede genera su reporte y el cliente consulta los documentos de su personal en un portal propio, con auditoría de cada acción sensible.",
    modulos: [
      "turnos-y-programacion",
      "acceso-inteligente",
      "reporte-por-sede",
      "portal-documental-para-el-cliente",
      "auditoria-y-trazabilidad",
    ],
    resultados: [
      "El cliente consulta soportes del personal sin pedirlos por correo.",
      "Reporte por sede con la misma estructura en toda la red.",
      "Rastro de auditoría con el antes y el después de cada cambio.",
    ],
    escala: "Red de sedes en varias ciudades",
    verificado: false,
  },
  {
    id: "instalaciones-industriales",
    titulo: "Perímetros extensos con el supervisor siempre visible",
    cliente: "Compañía del sector energético",
    sector: "energia",
    ciudadId: "medellin",
    resumen: "Recorridos GPS, zonas con alerta de salida y radio en el celular para instalaciones extensas.",
    reto: "Instalaciones grandes, con puestos alejados entre sí, donde un supervisor podía pasar horas sin que nadie supiera dónde estaba.",
    solucion:
      "Los supervisores recorren su zona con GPS y la central recibe una alerta cuando alguien sale de su zona. La radio PTT funciona en el mismo teléfono, el botón de pánico abre una ventana de atención y armas, vehículos y caninos quedan inventariados y asignados.",
    modulos: [
      "recorridos-y-tiempo-en-el-puesto",
      "zonas-y-salida-de-zona",
      "radio-ptt",
      "boton-de-panico",
      "recursos-operativos",
    ],
    resultados: [
      "Recorridos y tiempo en el puesto medidos, no reportados de palabra.",
      "Salidas de zona avisadas en el momento.",
      "Un solo teléfono para marcar, hablar por radio y pedir ayuda.",
    ],
    escala: "Instalaciones extensas con varios puestos",
    verificado: false,
  },
  {
    id: "estaciones-de-transporte",
    titulo: "Estaciones con coordinación por radio y aforo en cámara",
    cliente: "Sistema de transporte masivo",
    sector: "transporte",
    ciudadId: "bogota",
    resumen: "Sala del coordinador, cumplimiento por persona y analíticas de aforo sobre las cámaras existentes.",
    reto: "Muchas estaciones con picos de afluencia, relevos que se caían sin aviso y comunicación dispersa entre radios y chats personales.",
    solucion:
      "El coordinador ve en su sala qué turno quedó sin cubrir y decide quién cubre; la consola guarda cada transmisión de radio; las cámaras cuentan personas y miden aforo, y las notificaciones llegan a la campana y a Telegram.",
    modulos: [
      "sala-del-coordinador",
      "cumplimiento-supervisores-y-vigilantes",
      "radio-ptt",
      "consola-de-radio",
      "vision-artificial",
      "notificaciones-y-telegram",
    ],
    resultados: [
      "Coberturas decididas con el mapa delante, no por teléfono.",
      "Cada transmisión de radio grabada y consultable.",
      "Aforo y conteo de personas visibles desde la central.",
    ],
    escala: "Decenas de puntos en una misma ciudad",
    verificado: false,
  },
  {
    id: "recinto-de-eventos",
    titulo: "Un recinto que cambia de tamaño cada fin de semana",
    cliente: "Recinto ferial y de eventos",
    sector: "eventos",
    ciudadId: "bogota",
    resumen: "Turnos que crecen por evento, registro de visitantes y aforo con mapa de calor.",
    reto: "Cada evento exige reforzar el personal por unos días, controlar el ingreso y vigilar el aforo de pabellones que se llenan a distintas horas.",
    solucion:
      "Programación suma los puestos del evento y los quita al cerrar; el personal recibe su turno en el celular; las cámaras miden aforo y mapa de calor por pabellón, y el equipo se coordina por chat corporativo con reportes con foto.",
    modulos: [
      "turnos-y-programacion",
      "visitantes-y-bicicletas",
      "vision-artificial",
      "chat-corporativo",
      "reportes-operativos-y-supervision",
    ],
    resultados: [
      "Refuerzos de personal programados por evento, sin hojas de cálculo.",
      "Aforo por pabellón a la vista de la central.",
      "Novedades del evento documentadas con foto, firma y hora.",
    ],
    escala: "Un recinto con picos de público por evento",
    verificado: false,
  },
  {
    id: "oficinas-corporativas",
    titulo: "Oficinas con acceso facial y sensores en un solo panel",
    cliente: "Grupo corporativo",
    sector: "corporativo",
    ciudadId: "lima",
    resumen: "Puertas con reconocimiento facial, IoT y la central en una app de escritorio.",
    reto: "Edificios de oficinas con control de acceso, alarmas y sensores de distintos sistemas que nadie veía juntos.",
    solucion:
      "Las puertas con reconocimiento facial abren o alertan y una persona verifica; sensores, alarmas y relojes quedan en un solo panel de IoT, y la central opera desde la app de escritorio con el mapa vivo.",
    modulos: [
      "puertas-reconocimiento-facial",
      "acceso-inteligente",
      "iot-y-domotica",
      "sala-de-control",
      "app-de-escritorio-para-la-central",
    ],
    resultados: [
      "Accesos, alarmas y sensores en una misma pantalla.",
      "Cada apertura queda registrada y verificada por una persona.",
      "La central opera desde su propia app de escritorio.",
    ],
    escala: "Edificios corporativos en una ciudad",
    verificado: false,
  },
  {
    id: "back-office-conectado",
    titulo: "Del turno trabajado a la nómina y la contabilidad",
    cliente: "Empresa de seguridad privada",
    sector: "seguridad-privada",
    ciudadId: "cali",
    resumen: "Nómina desde los turnos, contabilidad conectada al ERP y facturas DIAN y RADIAN en piloto.",
    reto: "La nómina se armaba a mano a partir de los turnos y la contabilidad vivía en otro sistema, sin forma de comparar lo contratado con lo facturado.",
    solucion:
      "Lo trabajado alimenta la nómina; el Agente interoperador de datos conecta el ERP de la empresa con ARS; la contabilidad se consulta en la misma pantalla y la bandeja de facturas DIAN y RADIAN, en piloto, organiza las facturas de proveedores.",
    modulos: [
      "nomina",
      "agente-interoperador-de-datos",
      "contabilidad-conectada",
      "facturas-dian-y-radian",
      "auditoria-de-gestion-humana",
    ],
    resultados: [
      "La nómina parte de los turnos reales, no de una planilla aparte.",
      "El ERP de la empresa y ARS hablan el mismo idioma.",
      "Documentos del personal auditados persona por persona.",
    ],
    escala: "Operación propia con back-office centralizado",
    verificado: false,
  },
  {
    id: "formacion-del-personal",
    titulo: "Formación continua con certificado y realidad virtual",
    cliente: "Empresa de seguridad privada",
    sector: "seguridad-privada",
    ciudadId: "barranquilla",
    resumen: "Cursos con certificado QR, evaluaciones y entrenamiento en realidad virtual.",
    reto: "Capacitaciones presenciales difíciles de coordinar con los turnos y sin forma de demostrar quién se formó en qué.",
    solucion:
      "El diseñador de cursos con IA arma el contenido; el personal estudia y presenta evaluaciones desde el celular y recibe un certificado con QR; la Central Viva y la Academia de vigilantes en realidad virtual sirven para entrenar la operación de la sala y practicar con un certificado verificable.",
    modulos: [
      "capacitacion-virtual",
      "disenador-de-cursos-con-ia",
      "evaluaciones-de-conocimiento",
      "sala-vr-central-viva",
      "academia-de-vigilantes-vr",
    ],
    resultados: [
      "Certificados verificables con QR.",
      "Cursos armados en días, no en semanas.",
      "Entrenamiento de la central sin interrumpir la operación.",
    ],
    escala: "Personal operativo distribuido en la región",
    verificado: false,
  },
  {
    id: "verificacion-con-robot",
    titulo: "Rondas de verificación con perro robot",
    cliente: "Desarrollo propio",
    sector: "laboratorio",
    ciudadId: "bogota",
    laboratorio: "robotica",
    resumen: "Un robot que recorre y verifica con las mismas analíticas de las cámaras y envía video a la central.",
    reto: "Verificar una alerta en un sector extenso exige mover a una persona; a veces lo primero que se necesita es solo ver qué pasa.",
    solucion:
      "En nuestro laboratorio desarrollamos perros robot que recorren el sector, verifican con las mismas analíticas de visión y envían el video a la Sala de Control, donde una persona decide. La plataforma está pensada para sumar nuevos dispositivos sin cambiar la forma de operar.",
    modulos: ["vision-artificial", "sala-de-control"],
    resultados: [
      "Mismas analíticas que las cámaras, ahora en movimiento.",
      "El operador sigue decidiendo desde la central.",
    ],
    escala: "Prototipo de laboratorio",
    verificado: false,
  },
];

// ───────────────────────────── Derivados ─────────────────────────────

const ciudadesPorId = new Map(CIUDADES.map((c) => [c.id, c]));

export function ciudadPorId(id: string): Ciudad | undefined {
  return ciudadesPorId.get(id);
}

export type ModuloEnProyecto = { area: Area; modulo: Modulo; href: string };

/** Módulos del proyecto resueltos contra el catálogo (los ids desconocidos se descartan). */
export function modulosDe(p: Proyecto): ModuloEnProyecto[] {
  return p.modulos.flatMap((id) => {
    const r = moduloPorId(id);
    return r ? [{ ...r, href: `/servicios/${r.area.id}#${r.modulo.id}` }] : [];
  });
}

/** Áreas del catálogo que toca el proyecto, en el orden del catálogo. */
export function areasDe(p: Proyecto): Area[] {
  const ids = new Set(modulosDe(p).map((m) => m.area.id));
  return AREAS.filter((a) => ids.has(a.id));
}

/**
 * Estado coherente con el catálogo: una línea de laboratorio está «En desarrollo»;
 * si algún módulo no está en producción, el proyecto es «Piloto».
 */
export function estadoDe(p: Proyecto): EstadoProyecto {
  if (p.laboratorio) return "desarrollo";
  return modulosDe(p).some((m) => m.modulo.estado !== "vivo") ? "piloto" : "operacion";
}

/** Portada: la primera captura real de la plataforma entre sus módulos. */
export function portadaDe(p: Proyecto): Captura | undefined {
  for (const { modulo } of modulosDe(p)) if (modulo.capturas[0]) return modulo.capturas[0];
  return undefined;
}

/** Proyecto listo para la vista (todo lo derivado ya resuelto, serializable). */
export type ProyectoVista = Proyecto & {
  estado: EstadoProyecto;
  ciudad: Ciudad;
  sectorNombre: string;
  areas: { id: string; nombre: string; corto: string; color: string }[];
  modulosVista: { id: string; nombre: string; frase: string; areaId: string; area: string; href: string; estado: Modulo["estado"]; notaEstado?: string }[];
  portada?: Captura;
};

export function proyectosVista(): ProyectoVista[] {
  return PROYECTOS.flatMap((p) => {
    const ciudad = ciudadPorId(p.ciudadId);
    if (!ciudad) return [];
    return [
      {
        ...p,
        estado: estadoDe(p),
        ciudad,
        sectorNombre: SECTORES[p.sector],
        areas: areasDe(p).map((a) => ({ id: a.id, nombre: a.nombre, corto: a.corto, color: a.color })),
        modulosVista: modulosDe(p).map(({ area, modulo, href }) => ({
          id: modulo.id,
          nombre: modulo.nombre,
          frase: modulo.frase,
          areaId: area.id,
          area: area.corto,
          href,
          estado: modulo.estado,
          notaEstado: modulo.notaEstado,
        })),
        portada: portadaDe(p),
      },
    ];
  });
}
