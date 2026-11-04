/**
 * Diagnóstico de ejemplo: permite desarrollar la historia 3D y el reporte sin
 * pasar por la entrevista, y es la base del modo demo de /api/diagnostico.
 * Empresa ficticia.
 */
import type { Diagnostico } from "./tipos";

export const DIAGNOSTICO_EJEMPLO: Diagnostico = {
  id: "demo-andina",
  fecha: "2026-11-04T09:00:00.000Z",
  fuente: "demo",
  perfil: {
    nombre: "Seguridad Andina",
    sector: "Vigilancia privada",
    ciudad: "Medellín",
    tamano: "201-1000",
    sedes: 48,
    dolores: [
      "No sé si los vigilantes hacen las rondas",
      "La nómina se cuadra a mano con Excel",
      "Los clientes piden informes y tardamos días",
    ],
    herramientasActuales: ["Excel", "WhatsApp", "Radio análoga"],
    prioridades: ["control", "costos", "clientes"],
    notas: "Crecieron 30 % este año y el equipo administrativo no da abasto.",
  },
  titular: "De apagar incendios a operar con datos: 48 sedes bajo un mismo tablero",
  resumen:
    "Seguridad Andina creció rápido y su operación sigue en Excel, WhatsApp y radio análoga. " +
    "Eso deja tres huecos: no hay prueba de las rondas, la nómina consume días de trabajo manual y los clientes esperan sus informes. " +
    "Con ARS, la marcación, las rondas y la radio quedan en el teléfono del vigilante, la central ve todo en un mapa vivo y los turnos se convierten solos en nómina. " +
    "La primera mejora visible llega en el primer mes.",
  madurez: { hoy: 34, conArs: 82 },
  hallazgos: [
    {
      titulo: "Rondas sin evidencia",
      hoy: "El supervisor confía en llamadas y en el libro de minuta para saber si se hicieron las rondas.",
      impacto: "Riesgo de perder contratos cuando un cliente reclama y no hay prueba.",
      areas: ["operacion-en-campo", "centro-de-operaciones"],
    },
    {
      titulo: "Nómina manual",
      hoy: "Cada quincena tres personas cruzan turnos, novedades y recargos en hojas de cálculo.",
      impacto: "Errores en pagos y horas extra que no se cobran al cliente.",
      areas: ["gestion-humana", "finanzas-y-erp"],
    },
    {
      titulo: "Comunicación dispersa",
      hoy: "Las novedades viajan por grupos de WhatsApp y radio; nada queda registrado.",
      impacto: "Respuestas lentas ante emergencias y cero trazabilidad.",
      areas: ["comunicacion-y-emergencias"],
    },
  ],
  recomendaciones: [
    {
      areaId: "operacion-en-campo",
      modulos: ["control-de-asistencia-y-relevos", "rondas-qr", "turnos-y-programacion"],
      prioridad: "alta",
      porque: "Su mayor dolor es no tener prueba de lo que pasa en el puesto.",
      cambio: "Cada vigilante marca con selfie y rostro y cada ronda queda con hora y punto QR.",
    },
    {
      areaId: "centro-de-operaciones",
      modulos: ["sala-de-control", "cumplimiento-supervisores-y-vigilantes"],
      prioridad: "alta",
      porque: "Con 48 sedes necesitan ver la operación entera en una sola pantalla.",
      cambio: "La central ve en un mapa vivo quién está, quién falta y qué ronda va atrasada.",
    },
    {
      areaId: "comunicacion-y-emergencias",
      modulos: ["radio-ptt", "boton-de-panico", "reporte-por-sede"],
      prioridad: "alta",
      porque: "La radio análoga y WhatsApp no dejan registro ni ubicación.",
      cambio: "Radio en el teléfono, botón de pánico con ubicación y cada conversación grabada.",
    },
    {
      areaId: "gestion-humana",
      modulos: ["nomina", "colaboradores-y-mis-datos"],
      prioridad: "media",
      porque: "La nómina manual consume días y genera errores.",
      cambio: "Los turnos trabajados alimentan la nómina sin digitar nada.",
    },
    {
      areaId: "finanzas-y-erp",
      modulos: ["contabilidad-conectada", "facturas-dian-y-radian"],
      prioridad: "media",
      porque: "Las horas extra no se están facturando al cliente.",
      cambio: "Lo que se trabaja se factura y se contabiliza en el mismo flujo.",
    },
    {
      areaId: "productividad-e-ia",
      modulos: ["centro-de-ia", "automatizaciones-y-procedimientos"],
      prioridad: "baja",
      porque: "El equipo administrativo no da abasto con el crecimiento.",
      cambio: "Informes para clientes generados automáticamente cada semana.",
    },
  ],
  metricas: [
    { nombre: "Rondas verificadas", unidad: "%", antes: 40, despues: 96, menosEsMejor: false, areaId: "operacion-en-campo" },
    { nombre: "Tiempo de respuesta a incidentes", unidad: "min", antes: 18, despues: 6, menosEsMejor: true, areaId: "comunicacion-y-emergencias" },
    { nombre: "Horas para liquidar nómina", unidad: "h/quincena", antes: 72, despues: 8, menosEsMejor: true, areaId: "gestion-humana" },
    { nombre: "Días para entregar informe al cliente", unidad: "días", antes: 5, despues: 0, menosEsMejor: true, areaId: "productividad-e-ia" },
    { nombre: "Horas extra facturadas", unidad: "%", antes: 55, despues: 98, menosEsMejor: false, areaId: "finanzas-y-erp" },
  ],
  fases: [
    {
      nombre: "Fase 1 · Control del campo",
      semanas: "Semanas 1–4",
      areas: ["operacion-en-campo", "comunicacion-y-emergencias"],
      entregables: ["Marcación con rostro en las 48 sedes", "Rondas QR", "Radio PTT y botón de pánico"],
    },
    {
      nombre: "Fase 2 · Central y nómina",
      semanas: "Semanas 5–10",
      areas: ["centro-de-operaciones", "gestion-humana"],
      entregables: ["Sala de control con mapa vivo", "Nómina conectada a turnos"],
    },
    {
      nombre: "Fase 3 · Finanzas e IA",
      semanas: "Semanas 11–16",
      areas: ["finanzas-y-erp", "productividad-e-ia"],
      entregables: ["Facturación electrónica conectada", "Informes automáticos para clientes"],
    },
  ],
  capitulos: [
    {
      titulo: "Un lunes cualquiera",
      narracion:
        "Son las 6 de la mañana en Seguridad Andina. Cuarenta y ocho sedes abren turno y nadie sabe con certeza quién llegó. El supervisor llama puesto por puesto mientras los mensajes se amontonan en WhatsApp.",
      momento: "antes",
      foco: null,
      activas: [],
    },
    {
      titulo: "El campo se enciende",
      narracion:
        "Ahora cada vigilante marca con su rostro desde el teléfono y recorre sus puntos QR. Las rondas dejan de ser una promesa y se vuelven evidencia.",
      momento: "transicion",
      foco: "operacion-en-campo",
      activas: ["operacion-en-campo"],
    },
    {
      titulo: "Una sola voz",
      narracion:
        "Cuando algo pasa, el botón de pánico envía la ubicación y la radio en el teléfono conecta a la central en segundos. Todo queda grabado.",
      momento: "transicion",
      foco: "comunicacion-y-emergencias",
      activas: ["operacion-en-campo", "comunicacion-y-emergencias"],
    },
    {
      titulo: "La central lo ve todo",
      narracion:
        "En la sala de control, el mapa vivo muestra cada sede en verde. Si una ronda se atrasa, el sistema avisa antes de que el cliente lo note.",
      momento: "transicion",
      foco: "centro-de-operaciones",
      activas: ["operacion-en-campo", "comunicacion-y-emergencias", "centro-de-operaciones"],
    },
    {
      titulo: "La quincena sin Excel",
      narracion:
        "Los turnos trabajados se convierten solos en nómina y las horas extra pasan directo a la factura. Tres días de trabajo manual se vuelven una revisión de una hora.",
      momento: "transicion",
      foco: "gestion-humana",
      activas: ["operacion-en-campo", "comunicacion-y-emergencias", "centro-de-operaciones", "gestion-humana", "finanzas-y-erp"],
    },
    {
      titulo: "Seis meses después",
      narracion:
        "Seguridad Andina opera con datos. Cada mañana el gerente recibe un resumen en su teléfono, los clientes tienen su informe sin pedirlo y el equipo crece sin crecer el caos.",
      momento: "despues",
      foco: null,
      activas: [
        "operacion-en-campo",
        "comunicacion-y-emergencias",
        "centro-de-operaciones",
        "gestion-humana",
        "finanzas-y-erp",
        "productividad-e-ia",
      ],
    },
  ],
  reporteDiario: {
    titulo: "Resumen del martes · Seguridad Andina",
    hora: "6:00 a. m.",
    items: [
      { etiqueta: "Puestos cubiertos", valor: "48/48", tendencia: "igual", bueno: true },
      { etiqueta: "Rondas cumplidas", valor: "96 %", tendencia: "sube", bueno: true },
      { etiqueta: "Incidentes atendidos", valor: "3", tendencia: "baja", bueno: true },
      { etiqueta: "Tiempo medio de respuesta", valor: "6 min", tendencia: "baja", bueno: true },
      { etiqueta: "Horas extra por facturar", valor: "124 h", tendencia: "sube", bueno: false },
    ],
    destacados: [
      "Sede Poblado: ronda nocturna atrasada 12 min, resuelta por el supervisor.",
      "Botón de pánico en Sede Bello a las 2:14 a. m., atendido en 4 min.",
    ],
  },
};
