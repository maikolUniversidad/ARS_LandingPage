/**
 * Contenido de /arquitectura: nodos del diagrama, conexiones, recorridos «Sigue un dato»
 * y todo el copy de la página en español (latino) e inglés.
 *
 * Los módulos se referencian por su id del catálogo (`src/data/servicios`), de donde se
 * leen nombre, frase y ESTADO REAL. Aquí no se declara ningún estado propio, salvo los
 * elementos del laboratorio, que no están en el catálogo y se marcan como demo o en desarrollo.
 */
import {
  AppWindow,
  BrainCircuit,
  Cctv,
  ScrollText,
  Database,
  FileStack,
  FileText,
  FingerprintPattern,
  FlaskConical,
  Footprints,
  Glasses,
  Globe,
  GraduationCap,
  Handshake,
  Landmark,
  Monitor,
  MonitorDot,
  RadioTower,
  Receipt,
  Send,
  Server,
  ShieldCheck,
  Smartphone,
  CalendarClock,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import type { Locale } from "@/lib/i18n/dictionaries";

export type Txt = { es: string; en: string };
export const tx = (t: Txt, l: Locale) => t[l];

export type CapaId = "canales" | "operativa" | "nucleo" | "erp" | "externos";

export type ExtraLab = { titulo: Txt; detalle: Txt; etiqueta: Txt; href: string };

export type Nodo = {
  id: string;
  capa: CapaId;
  /** Color del área del catálogo a la que pertenece (o propio si es transversal). */
  color: string;
  Icon: LucideIcon;
  titulo: Txt;
  /** Una línea para el panel. */
  desc: Txt;
  /** ids de módulos del catálogo. */
  modulos: string[];
  /** Enlace general del nodo (área o página). */
  href: string;
  /** Solo laboratorio: elementos que no están en el catálogo. */
  extras?: ExtraLab[];
};

// Colores de área (iguales a los del catálogo).
const C = {
  campo: "#35e0a1",
  centro: "#5fd8ff",
  comunicacion: "#ffb347",
  monitoreo: "#6b8aff",
  vr: "#b78bff",
  humana: "#ff8fb1",
  formacion: "#ffd166",
  finanzas: "#4fd1c5",
  ia: "#a3e635",
  gobierno: "#cfd8e3",
  infra: "#3fe0c5",
  nucleo: "#2348d4",
  lab: "#7dd3fc",
  externo: "#9eb0c0",
};

export const CAPAS: { id: CapaId; n: string; titulo: Txt; sub: Txt }[] = [
  {
    id: "canales",
    n: "01",
    titulo: { es: "Canales", en: "Channels" },
    sub: { es: "Donde trabaja su gente", en: "Where your people work" },
  },
  {
    id: "operativa",
    n: "02",
    titulo: { es: "Capa operativa", en: "Operations layer" },
    sub: { es: "Lo que se ve: campo, central, cámaras, radio y VR", en: "What you see: field, control room, cameras, radio and VR" },
  },
  {
    id: "nucleo",
    n: "03",
    titulo: { es: "Núcleo de datos e IA", en: "Data & AI core" },
    sub: { es: "Cada hecho entra una vez y queda trazado", en: "Every fact enters once and stays traceable" },
  },
  {
    id: "erp",
    n: "04",
    titulo: { es: "ERP base de ARS", en: "ARS core ERP" },
    sub: { es: "La gestión que lo sostiene todo", en: "The management backbone behind it all" },
  },
  {
    id: "externos",
    n: "05",
    titulo: { es: "Integraciones", en: "Integrations" },
    sub: { es: "Lo que ya tiene, conectado", en: "What you already have, connected" },
  },
];

export const NODOS: Nodo[] = [
  // ── 01 Canales ──
  {
    id: "canal-android",
    capa: "canales",
    color: C.gobierno,
    Icon: Smartphone,
    titulo: { es: "Android", en: "Android" },
    desc: {
      es: "La app del vigilante y el supervisor: marcación, rondas, radio, pánico y GPS, aun sin señal.",
      en: "The guard and supervisor app: clock-in, patrols, radio, panic button and GPS, even offline.",
    },
    modulos: ["app-android", "ingreso-y-doble-factor"],
    href: "/servicios/gobierno-y-seguridad#app-android",
  },
  {
    id: "canal-web",
    capa: "canales",
    color: C.gobierno,
    Icon: Globe,
    titulo: { es: "Web", en: "Web" },
    desc: {
      es: "La operación y la gestión completas desde el navegador, con un solo ingreso.",
      en: "Full operations and management from the browser, with a single sign-in.",
    },
    modulos: ["ingreso-y-doble-factor", "configuracion-multiempresa"],
    href: "/servicios/gobierno-y-seguridad#ingreso-y-doble-factor",
  },
  {
    id: "canal-pwa",
    capa: "canales",
    color: C.gobierno,
    Icon: AppWindow,
    titulo: { es: "PWA", en: "PWA" },
    desc: { es: "Se instala desde el navegador, sin tienda de aplicaciones.", en: "Installs from the browser, no app store needed." },
    modulos: ["app-web-instalable-pwa"],
    href: "/servicios/gobierno-y-seguridad#app-web-instalable-pwa",
  },
  {
    id: "canal-escritorio",
    capa: "canales",
    color: C.gobierno,
    Icon: Monitor,
    titulo: { es: "Escritorio", en: "Desktop" },
    desc: {
      es: "La central siempre abierta en Windows, con alertas del sistema.",
      en: "The control room always open on Windows, with system alerts.",
    },
    modulos: ["app-de-escritorio-para-la-central"],
    href: "/servicios/gobierno-y-seguridad#app-de-escritorio-para-la-central",
  },
  {
    id: "canal-gafas",
    capa: "canales",
    color: C.vr,
    Icon: Glasses,
    titulo: { es: "Gafas VR", en: "VR headset" },
    desc: { es: "La app ARS para Meta Quest: la empresa por dentro, alrededor de usted.", en: "The ARS app for Meta Quest: the company from the inside, all around you." },
    modulos: ["sala-vr-central-viva", "sala-vr-nativa-meta-quest"],
    href: "/servicios/realidad-virtual#sala-vr-central-viva",
  },

  // ── 02 Operativa ──
  {
    id: "op-campo",
    capa: "operativa",
    color: C.campo,
    Icon: Footprints,
    titulo: { es: "Operación en campo", en: "Field operations" },
    desc: {
      es: "Marcación con selfie y verificación facial, relevos, rondas con QR, revistas y portería.",
      en: "Selfie and face-verified clock-in, shift handovers, QR patrols, inspections and front desk.",
    },
    modulos: [
      "control-de-asistencia-y-relevos",
      "rondas-qr",
      "reportes-operativos-y-supervision",
      "visitantes-y-bicicletas",
      "recursos-operativos",
    ],
    href: "/servicios/operacion-en-campo",
  },
  {
    id: "op-centro",
    capa: "operativa",
    color: C.centro,
    Icon: MonitorDot,
    titulo: { es: "Centro de operaciones", en: "Operations center" },
    desc: {
      es: "Sala de Control con mapa en vivo, zonas, recorridos y cumplimiento de cada persona.",
      en: "Control room with a live map, zones, GPS routes and per-person compliance.",
    },
    modulos: ["sala-de-control", "zonas-y-salida-de-zona", "recorridos-y-tiempo-en-el-puesto", "cumplimiento-supervisores-y-vigilantes"],
    href: "/servicios/centro-de-operaciones",
  },
  {
    id: "op-vr",
    capa: "operativa",
    color: C.vr,
    Icon: Glasses,
    titulo: { es: "Realidad virtual", en: "Virtual reality" },
    desc: {
      es: "Central Viva, «Su empresa, por dentro», «La sede del cliente», Academia de vigilantes y Mesa Directiva con IA.",
      en: "Central Viva, «Your company, inside», «The client site», Guard Academy and AI Board Room.",
    },
    modulos: ["sala-vr-central-viva", "su-empresa-por-dentro", "sede-inteligente", "academia-de-vigilantes-vr", "mesa-directiva-con-ia", "vigia-asistente-de-voz", "sala-vr-nativa-meta-quest"],
    href: "/servicios/realidad-virtual",
  },
  {
    id: "op-lab",
    capa: "operativa",
    color: C.lab,
    Icon: FlaskConical,
    titulo: { es: "Laboratorio", en: "Lab" },
    desc: {
      es: "Donde se prueba lo que viene: demos de visión IA en el navegador y la línea de robótica.",
      en: "Where what's next gets tested: in-browser AI vision demos and the robotics line.",
    },
    modulos: ["puertas-reconocimiento-facial", "escaneo-3d-de-sedes"],
    href: "/laboratorio",
    extras: [
      {
        titulo: { es: "Demos de visión IA", en: "AI vision demos" },
        detalle: {
          es: "Pruebe las analíticas con su cámara o un video, en el navegador.",
          en: "Try the analytics with your webcam or a video, right in the browser.",
        },
        etiqueta: { es: "Demo en este sitio", en: "Live demo on this site" },
        href: "/laboratorio",
      },
      {
        titulo: { es: "Robótica", en: "Robotics" },
        detalle: {
          es: "Robots que recorren y verifican con las mismas analíticas de las cámaras. No es un producto comercial.",
          en: "Robots that patrol and verify with the same camera analytics. Not a commercial product.",
        },
        etiqueta: { es: "En desarrollo", en: "In development" },
        href: "/laboratorio",
      },
    ],
  },
  {
    id: "op-comunicacion",
    capa: "operativa",
    color: C.comunicacion,
    Icon: RadioTower,
    titulo: { es: "Comunicación y emergencias", en: "Comms & emergencies" },
    desc: {
      es: "Radio PTT grabado, chat, botón de pánico con ventana de atención y notificaciones.",
      en: "Recorded PTT radio, chat, panic button with response window and notifications.",
    },
    modulos: ["radio-ptt", "chat-corporativo", "conversacion-con-la-central", "consola-de-radio", "reporte-por-sede", "boton-de-panico"],
    href: "/servicios/comunicacion-y-emergencias",
  },
  {
    id: "op-monitoreo",
    capa: "operativa",
    color: C.monitoreo,
    Icon: Cctv,
    titulo: { es: "Monitoreo inteligente", en: "Smart monitoring" },
    desc: {
      es: "Visión artificial sobre sus cámaras, acceso inteligente, IoT y sedes en 2D/3D.",
      en: "Computer vision on your cameras, smart access, IoT and 2D/3D sites.",
    },
    modulos: ["vision-artificial", "acceso-inteligente", "iot-y-domotica", "levantamiento-2d-3d-de-sedes", "puertas-reconocimiento-facial"],
    href: "/servicios/monitoreo-inteligente",
  },

  // ── 03 Núcleo ──
  {
    id: "nucleo-eventos",
    capa: "nucleo",
    color: C.nucleo,
    Icon: Database,
    titulo: { es: "Eventos y evidencia", en: "Events & evidence" },
    desc: {
      es: "Cada marca, ronda, alerta, transmisión y reporte entra una sola vez, con foto, ubicación y hora.",
      en: "Every clock-in, patrol, alert, transmission and report enters once, with photo, location and time.",
    },
    modulos: ["reportes-operativos-y-supervision", "vision-artificial", "boton-de-panico", "consola-de-radio"],
    href: "/servicios",
  },
  {
    id: "nucleo-ia",
    capa: "nucleo",
    color: C.ia,
    Icon: BrainCircuit,
    titulo: { es: "Centro de IA y automatizaciones", en: "AI center & automations" },
    desc: {
      es: "Asistentes con los permisos de quien pregunta, tareas con responsable y procedimientos automáticos.",
      en: "Assistants that respect each user's permissions, tasks with owners and automated procedures.",
    },
    modulos: [
      "centro-de-ia",
      "automatizaciones-y-procedimientos",
      "seguimiento-de-tareas",
      "reuniones-con-transcripcion-ia",
      "formularios-dinamicos",
      "tickets-de-soporte",
    ],
    href: "/servicios/productividad-e-ia",
  },
  {
    id: "nucleo-traza",
    capa: "nucleo",
    color: C.gobierno,
    Icon: ShieldCheck,
    titulo: { es: "Trazabilidad y auditoría", en: "Traceability & audit" },
    desc: {
      es: "Quién hizo qué, cuándo y desde dónde, con el antes y el después.",
      en: "Who did what, when and from where, with before-and-after.",
    },
    modulos: ["auditoria-y-trazabilidad", "torre-de-control"],
    href: "/servicios/gobierno-y-seguridad#auditoria-y-trazabilidad",
  },
  {
    id: "nucleo-infra",
    capa: "nucleo",
    color: C.infra,
    Icon: Server,
    titulo: { es: "Centro de datos en Colombia", en: "Data center in Colombia" },
    desc: {
      es: "En el centro de datos de ARS la información no sale de Colombia y la analítica y la IA corren en tarjetas gráficas propias. Si lo prefiere, en su nube o en un equipo on premise en su sede.",
      en: "In the ARS data center, information never leaves Colombia and analytics and AI run on our own GPUs. If you prefer, in your cloud or on an on-premise unit at your site.",
    },
    modulos: ["centro-de-datos-ars", "granja-de-gpu-ia-local", "monitor-de-infraestructura-en-vivo", "ubicaciones-y-agente-remoto", "equipo-on-premise"],
    href: "/servicios/infraestructura",
  },

  // ── 04 ERP base ──
  {
    id: "erp-contratos",
    capa: "erp",
    color: C.finanzas,
    Icon: ScrollText,
    titulo: { es: "Contratos y clientes", en: "Contracts & clients" },
    desc: {
      es: "Cliente, contrato, plan por módulos y órdenes de servicio que llegan a la operación.",
      en: "Client, contract, module-based plan and service orders that reach operations.",
    },
    modulos: ["clientes-contratos-y-planes", "ordenes-de-servicio-del-erp"],
    href: "/servicios/finanzas-y-erp#clientes-contratos-y-planes",
  },
  {
    id: "erp-turnos",
    capa: "erp",
    color: C.campo,
    Icon: CalendarClock,
    titulo: { es: "Turnos y programación", en: "Shifts & scheduling" },
    desc: {
      es: "El mes de cada puesto sobre Cliente → Sede → Puesto, y lo programado frente a lo realizado.",
      en: "Each post's month over Client → Site → Post, and planned vs. actually worked.",
    },
    modulos: ["turnos-y-programacion", "sala-del-coordinador", "alias-de-clientes-y-sedes"],
    href: "/servicios/operacion-en-campo#turnos-y-programacion",
  },
  {
    id: "erp-gh",
    capa: "erp",
    color: C.humana,
    Icon: Users,
    titulo: { es: "Gestión humana y nómina", en: "HR & payroll" },
    desc: {
      es: "Selección, contratación, ficha del empleado, nómina desde los turnos reales y costos.",
      en: "Recruiting, hiring, employee records, payroll from actual shifts, and costs.",
    },
    modulos: [
      "seleccion-y-contratacion",
      "colaboradores-y-mis-datos",
      "empleados-prestamos-y-contratos",
      "nomina",
      "nomina-de-administrativos-y-ajuste",
      "prima-vacaciones-y-liquidacion",
      "costos-y-comparacion-con-el-erp",
      "juridica-no-conformes-y-descargos",
    ],
    href: "/servicios/gestion-humana",
  },
  {
    id: "erp-documental",
    capa: "erp",
    color: C.humana,
    Icon: FileStack,
    titulo: { es: "Gestión documental", en: "Document management" },
    desc: {
      es: "Cargue con IA, expedientes, vencimientos y un portal para que el cliente consulte.",
      en: "AI-assisted upload, records, expirations and a portal for the client.",
    },
    modulos: [
      "area-documental-inicio",
      "cargue-inteligente-de-documentos",
      "expedientes-y-descargas-masivas",
      "auditoria-de-gestion-humana",
      "arbol-documental-3d",
      "reporte-y-analitica-documental",
      "portal-documental-para-el-cliente",
    ],
    href: "/servicios/gestion-humana#area-documental-inicio",
  },
  {
    id: "erp-formacion",
    capa: "erp",
    color: C.formacion,
    Icon: GraduationCap,
    titulo: { es: "Formación", en: "Training" },
    desc: {
      es: "Cursos por cargo, cliente o puesto, con certificado QR, diseñador con IA y evaluaciones.",
      en: "Courses by role, client or post, QR certificates, AI course designer and assessments.",
    },
    modulos: [
      "capacitacion-virtual",
      "disenador-de-cursos-con-ia",
      "video-por-temas",
      "auditoria-de-capacitacion-y-reglas",
      "evaluaciones-de-conocimiento",
    ],
    href: "/servicios/formacion",
  },
  {
    id: "erp-crm",
    capa: "erp",
    color: C.finanzas,
    Icon: Handshake,
    titulo: { es: "Cotizador y CRM", en: "Quotes & CRM" },
    desc: {
      es: "Cotizaciones, tarifas por modalidad y embudo de ventas dentro de ARS.",
      en: "Quotes, rates by service type and sales pipeline inside ARS.",
    },
    modulos: ["cotizador-y-crm-propios"],
    href: "/servicios/finanzas-y-erp#cotizador-y-crm-propios",
  },
  {
    id: "erp-gobierno",
    capa: "erp",
    color: C.gobierno,
    Icon: ShieldCheck,
    titulo: { es: "Gobierno multiempresa", en: "Multi-company governance" },
    desc: {
      es: "Cada empresa con sus roles, plan, menú y portada; ingreso con doble factor.",
      en: "Each company with its own roles, plan, menu and home; two-factor sign-in.",
    },
    modulos: ["configuracion-multiempresa", "ingreso-y-doble-factor", "torre-de-control"],
    href: "/servicios/gobierno-y-seguridad#configuracion-multiempresa",
  },
  {
    id: "erp-finanzas",
    capa: "erp",
    color: C.finanzas,
    Icon: Landmark,
    titulo: { es: "Finanzas y contabilidad", en: "Finance & accounting" },
    desc: {
      es: "Contabilidad conectada con la operación, asistente contable con IA y su ERP dentro de ARS.",
      en: "Accounting connected to operations, AI accounting assistant and your ERP inside ARS.",
    },
    modulos: ["contabilidad-conectada", "asistente-contable-con-ia", "su-erp-dentro-de-ars"],
    href: "/servicios/finanzas-y-erp#contabilidad-conectada",
  },
  {
    id: "erp-facturacion",
    capa: "erp",
    color: C.finanzas,
    Icon: Receipt,
    titulo: { es: "Facturas DIAN y RADIAN", en: "DIAN & RADIAN invoices" },
    desc: {
      es: "Facturas electrónicas de proveedores ordenadas y cruzadas con la contabilidad.",
      en: "Supplier e-invoices organized and matched against accounting.",
    },
    modulos: ["facturas-dian-y-radian"],
    href: "/servicios/finanzas-y-erp#facturas-dian-y-radian",
  },

  // ── 05 Integraciones ──
  {
    id: "ext-camaras",
    capa: "externos",
    color: C.externo,
    Icon: Cctv,
    titulo: { es: "Sus cámaras y grabadores", en: "Your cameras & recorders" },
    desc: {
      es: "La visión artificial trabaja sobre las cámaras que el cliente ya tiene.",
      en: "Computer vision runs on the cameras the client already has.",
    },
    modulos: ["vision-artificial"],
    href: "/servicios/monitoreo-inteligente#vision-artificial",
  },
  {
    id: "ext-biometricos",
    capa: "externos",
    color: C.externo,
    Icon: FingerprintPattern,
    titulo: { es: "Relojes biométricos", en: "Biometric clocks" },
    desc: {
      es: "Relojes ZKTeco como complemento: la marca llega, no se duplica y se clasifica.",
      en: "ZKTeco clocks as a complement: punches arrive, aren't duplicated and get classified.",
    },
    modulos: ["control-de-asistencia-y-relevos", "iot-y-domotica"],
    href: "/servicios/operacion-en-campo#control-de-asistencia-y-relevos",
  },
  {
    id: "ext-telegram",
    capa: "externos",
    color: C.externo,
    Icon: Send,
    titulo: { es: "Telegram", en: "Telegram" },
    desc: {
      es: "Avisos repartidos a grupos de Telegram por cliente y zona.",
      en: "Alerts routed to Telegram groups by client and zone.",
    },
    modulos: ["notificaciones-y-telegram"],
    href: "/servicios/comunicacion-y-emergencias#notificaciones-y-telegram",
  },
  {
    id: "ext-erp",
    capa: "externos",
    color: C.externo,
    Icon: Workflow,
    titulo: { es: "ERP de la empresa", en: "Your company's ERP" },
    desc: {
      es: "El Agente interoperador conecta el ERP que ya usa —por API, backend o cargas programadas—, completo o por partes.",
      en: "The data interoperability agent connects the ERP you already use —via API, backend or scheduled loads—, fully or in part.",
    },
    modulos: ["agente-interoperador-de-datos", "su-erp-dentro-de-ars", "ordenes-de-servicio-del-erp"],
    href: "/servicios/finanzas-y-erp#agente-interoperador-de-datos",
  },
  {
    id: "ext-dian",
    capa: "externos",
    color: C.externo,
    Icon: FileText,
    titulo: { es: "DIAN · RADIAN", en: "DIAN · RADIAN" },
    desc: {
      es: "La DIAN como referencia para cuadrar las facturas recibidas y sus eventos.",
      en: "DIAN (Colombian tax authority) as the reference to reconcile received invoices and events.",
    },
    modulos: ["facturas-dian-y-radian"],
    href: "/servicios/finanzas-y-erp#facturas-dian-y-radian",
  },
];

export const NODO_POR_ID = new Map(NODOS.map((n) => [n.id, n]));

/** Orden visual de cada capa. En el ERP, dos filas en escritorio. */
export const FILAS = {
  canales: ["canal-android", "canal-web", "canal-pwa", "canal-escritorio", "canal-gafas"],
  operativa: ["op-campo", "op-centro", "op-vr", "op-lab", "op-comunicacion", "op-monitoreo"],
  nucleo: ["nucleo-eventos", "nucleo-ia", "nucleo-traza", "nucleo-infra"],
  erp1: ["erp-contratos", "erp-turnos", "erp-gh", "erp-documental", "erp-formacion"],
  erp2: ["erp-crm", "erp-gobierno", "erp-finanzas", "erp-facturacion"],
  externosOp: ["ext-camaras", "ext-biometricos", "ext-telegram"],
  externosErp: ["ext-erp", "ext-dian"],
} as const;

/** Conexiones estructurales (de → a: «alimenta»). */
export const ARISTAS: [string, string][] = [
  ["canal-android", "op-campo"],
  ["canal-android", "op-comunicacion"],
  ["canal-web", "op-centro"],
  ["canal-pwa", "op-campo"],
  ["canal-escritorio", "op-centro"],
  ["canal-escritorio", "op-comunicacion"],
  ["canal-gafas", "op-vr"],
  ["op-campo", "nucleo-eventos"],
  ["op-centro", "nucleo-eventos"],
  ["op-comunicacion", "nucleo-eventos"],
  ["op-monitoreo", "nucleo-eventos"],
  ["op-vr", "nucleo-ia"],
  ["op-lab", "nucleo-ia"],
  ["op-centro", "nucleo-traza"],
  ["op-monitoreo", "nucleo-infra"],
  ["nucleo-eventos", "erp-turnos"],
  ["nucleo-eventos", "erp-contratos"],
  ["nucleo-ia", "erp-documental"],
  ["nucleo-ia", "erp-formacion"],
  ["nucleo-ia", "erp-finanzas"],
  ["nucleo-traza", "erp-gobierno"],
  ["nucleo-infra", "erp-documental"],
  ["erp-contratos", "erp-turnos"],
  ["erp-turnos", "erp-gh"],
  ["erp-gh", "erp-documental"],
  ["erp-gh", "erp-finanzas"],
  ["erp-crm", "erp-contratos"],
  ["erp-finanzas", "erp-facturacion"],
  ["ext-camaras", "op-monitoreo"],
  ["ext-biometricos", "op-monitoreo"],
  ["ext-telegram", "op-comunicacion"],
  ["ext-erp", "erp-finanzas"],
  ["ext-dian", "erp-facturacion"],
];

export type Vista = "integral" | "operativa" | "corporativa";

export const VISTAS: { id: Vista; titulo: Txt; desc: Txt; capas: CapaId[] }[] = [
  {
    id: "integral",
    titulo: { es: "Integral", en: "Integrated" },
    desc: { es: "Todo conectado, de la cámara a la contabilidad.", en: "Everything connected, from camera to accounting." },
    capas: ["canales", "operativa", "nucleo", "erp", "externos"],
  },
  {
    id: "operativa",
    titulo: { es: "Operativa", en: "Operations" },
    desc: { es: "Lo que se ve en campo y en la central.", en: "What you see in the field and the control room." },
    capas: ["canales", "operativa", "nucleo"],
  },
  {
    id: "corporativa",
    titulo: { es: "Corporativa (ERP)", en: "Corporate (ERP)" },
    desc: { es: "La gestión de la empresa que hay debajo.", en: "The company management underneath." },
    capas: ["nucleo", "erp", "externos"],
  },
];

// ─────────────────────────── Sigue un dato ───────────────────────────

export type Paso = { nodo: string; modulo?: string; texto: Txt };
export type Recorrido = { id: string; color: string; titulo: Txt; resumen: Txt; pasos: Paso[] };

export const RECORRIDOS: Recorrido[] = [
  {
    id: "marcacion-a-contabilidad",
    color: "#35e0a1",
    titulo: { es: "De la marcación a la contabilidad", en: "From clock-in to accounting" },
    resumen: {
      es: "Una marcación con rostro termina, sin re-digitar, en la nómina y en los números de la empresa.",
      en: "A face-verified clock-in ends up, with no re-typing, in payroll and in the company's numbers.",
    },
    pasos: [
      {
        nodo: "canal-android",
        modulo: "app-android",
        texto: { es: "El vigilante abre la app en el puesto, aun sin señal.", en: "The guard opens the app at the post, even offline." },
      },
      {
        nodo: "op-campo",
        modulo: "control-de-asistencia-y-relevos",
        texto: {
          es: "Inicia el turno con selfie, verificación facial, ubicación y hora.",
          en: "Starts the shift with a selfie, face verification, location and time.",
        },
      },
      {
        nodo: "erp-turnos",
        modulo: "turnos-y-programacion",
        texto: {
          es: "La marca queda como turno realizado y se compara con lo programado.",
          en: "The punch becomes a worked shift, compared against the schedule.",
        },
      },
      {
        nodo: "erp-gh",
        modulo: "nomina",
        texto: {
          es: "La nómina se liquida desde los turnos que de verdad se trabajaron, con recargos.",
          en: "Payroll is calculated from the shifts actually worked, with surcharges.",
        },
      },
      {
        nodo: "erp-finanzas",
        modulo: "contabilidad-conectada",
        texto: {
          es: "La contabilidad conectada muestra la nómina frente al gasto de personal.",
          en: "Connected accounting shows payroll against personnel expense.",
        },
      },
      {
        nodo: "ext-erp",
        modulo: "agente-interoperador-de-datos",
        texto: {
          es: "Y cuadra con el ERP contable de la empresa, conectado por el Agente interoperador.",
          en: "And it reconciles with the company's accounting ERP, connected by the interoperability agent.",
        },
      },
    ],
  },
  {
    id: "alerta-a-informe",
    color: "#6b8aff",
    titulo: { es: "De la alerta de cámara al informe", en: "From camera alert to report" },
    resumen: {
      es: "Un evento detectado por la IA se atiende, se coordina y queda como evidencia para el cliente.",
      en: "An AI-detected event is handled, coordinated and kept as evidence for the client.",
    },
    pasos: [
      {
        nodo: "ext-camaras",
        modulo: "vision-artificial",
        texto: { es: "Una cámara que el cliente ya tenía capta el evento.", en: "A camera the client already had captures the event." },
      },
      {
        nodo: "op-monitoreo",
        modulo: "vision-artificial",
        texto: {
          es: "La visión artificial lo convierte en alerta con foto, video y ubicación.",
          en: "Computer vision turns it into an alert with photo, video and location.",
        },
      },
      {
        nodo: "op-centro",
        modulo: "sala-de-control",
        texto: {
          es: "La Sala de Control confirma, resuelve o escala el evento sobre el mapa.",
          en: "The control room confirms, resolves or escalates the event on the map.",
        },
      },
      {
        nodo: "op-comunicacion",
        modulo: "radio-ptt",
        texto: {
          es: "La central despacha al supervisor por radio; la transmisión queda grabada.",
          en: "The control room dispatches the supervisor by radio; the transmission is recorded.",
        },
      },
      {
        nodo: "nucleo-eventos",
        modulo: "vision-artificial",
        texto: {
          es: "La evidencia queda en la galería forense, con reportes por cliente.",
          en: "Evidence lands in the forensic gallery, with per-client reports.",
        },
      },
      {
        nodo: "nucleo-traza",
        modulo: "auditoria-y-trazabilidad",
        texto: {
          es: "Cada acción queda auditada: quién, cuándo y desde dónde.",
          en: "Every action is audited: who, when and from where.",
        },
      },
    ],
  },
  {
    id: "contrato-a-operacion",
    color: "#4fd1c5",
    titulo: { es: "Del contrato nuevo al mes facturado", en: "From new contract to billed month" },
    resumen: {
      es: "Un contrato se vuelve puestos, turnos, personal formado y cifras de lo contratado frente a lo facturado.",
      en: "A contract becomes posts, shifts, trained staff and contracted-vs-billed figures.",
    },
    pasos: [
      {
        nodo: "ext-erp",
        modulo: "ordenes-de-servicio-del-erp",
        texto: {
          es: "La orden de servicio vendida en el ERP de la empresa llega a ARS.",
          en: "The service order sold in the company's ERP reaches ARS.",
        },
      },
      {
        nodo: "erp-contratos",
        modulo: "clientes-contratos-y-planes",
        texto: {
          es: "Se da de alta el cliente con su contrato, ciclo de facturación y plan.",
          en: "The client is set up with its contract, billing cycle and plan.",
        },
      },
      {
        nodo: "erp-turnos",
        modulo: "turnos-y-programacion",
        texto: {
          es: "Programación arma el mes de cada puesto, con festivos y pliego del cliente.",
          en: "Scheduling builds each post's month, with holidays and client rules.",
        },
      },
      {
        nodo: "erp-gh",
        modulo: "seleccion-y-contratacion",
        texto: {
          es: "Gestión humana selecciona y contrata al personal que hace falta.",
          en: "HR recruits and hires the staff that's needed.",
        },
      },
      {
        nodo: "erp-formacion",
        modulo: "capacitacion-virtual",
        texto: {
          es: "Cada persona recibe los cursos de su cargo y puesto, con certificado QR.",
          en: "Each person gets the courses for their role and post, with a QR certificate.",
        },
      },
      {
        nodo: "erp-documental",
        modulo: "portal-documental-para-el-cliente",
        texto: {
          es: "El cliente consulta los documentos de su personal en su portal.",
          en: "The client checks its staff's documents in its own portal.",
        },
      },
      {
        nodo: "erp-finanzas",
        modulo: "contabilidad-conectada",
        texto: {
          es: "Y la contabilidad conectada muestra lo contratado frente a lo facturado por cliente.",
          en: "And connected accounting shows contracted vs. billed, per client.",
        },
      },
    ],
  },
  {
    id: "factura-proveedor",
    color: "#ffd166",
    titulo: { es: "Factura de proveedor: de la DIAN a la contabilidad", en: "Supplier invoice: from DIAN to accounting" },
    resumen: {
      es: "El recorrido que viene: hoy está en «Próximamente» en el catálogo.",
      en: "The path that's coming: currently «Coming soon» in the catalog.",
    },
    pasos: [
      {
        nodo: "ext-dian",
        modulo: "facturas-dian-y-radian",
        texto: { es: "La factura electrónica del proveedor llega desde la DIAN.", en: "The supplier's e-invoice arrives from DIAN." },
      },
      {
        nodo: "erp-facturacion",
        modulo: "facturas-dian-y-radian",
        texto: {
          es: "Se clasifica por concepto y centro de costo, y se registran los eventos RADIAN.",
          en: "It's classified by concept and cost center, and RADIAN events are logged.",
        },
      },
      {
        nodo: "erp-finanzas",
        modulo: "contabilidad-conectada",
        texto: {
          es: "Se compara con lo contabilizado: cuadra, con diferencia o falta en un lado.",
          en: "It's compared with what's booked: matches, differs or is missing on one side.",
        },
      },
      {
        nodo: "ext-erp",
        modulo: "agente-interoperador-de-datos",
        texto: {
          es: "Con el ERP contable de la empresa como libro de referencia.",
          en: "With the company's accounting ERP as the book of record.",
        },
      },
    ],
  },
];

// ─────────────────────────── Copy de la página ───────────────────────────

export const COPY = {
  es: {
    eyebrow: "ARS Intelligence · Arquitectura de soluciones",
    titulo1: "La operación que se ve.",
    titulo2: "El ERP que la sostiene.",
    lead:
      "Cámaras con IA, rondas, radio, IoT y realidad virtual son la parte visible. Debajo, un ERP base propio de ARS lleva contratos, turnos, personal, nómina, documentos, formación y finanzas. Todo comparte los mismos datos: lo que pasa en el puesto llega solo a la gestión.",
    ctaDiagrama: "Explorar la arquitectura",
    ctaDato: "Sigue un dato",
    stats: { gestion: "módulos de gestión", operacion: "módulos operativos", vivos: "en producción hoy", fuente: "fuente de verdad" },
    pila: ["Canales", "Operación", "Datos e IA", "ERP base"],
    diagramaEyebrow: "El mapa completo",
    diagramaTitulo: "Cinco capas,",
    diagramaTitulo2: "un solo sistema.",
    diagramaAyuda: "Toque cualquier bloque para ver sus módulos y su estado real.",
    vistasLabel: "Vista",
    datoLabel: "Sigue un dato",
    leyenda: "Estado de cada módulo",
    externosTitulo: "Integraciones externas",
    modulosN: (n: number) => (n === 1 ? "1 módulo" : `${n} módulos`),
    paso: "Paso",
    de: "de",
    pausar: "Pausar",
    reanudar: "Reanudar",
    anterior: "Paso anterior",
    siguiente: "Paso siguiente",
    repetir: "Repetir",
    cerrarRecorrido: "Cerrar recorrido",
    verEnDiagrama: "Ver en el diagrama",
    panelModulos: "Módulos del catálogo",
    panelVerArea: "Ver en servicios",
    cerrar: "Cerrar",
    enIngles: "",
    datoEyebrow: "Sigue un dato",
    datoTitulo: "Un hecho entra una vez",
    datoTitulo2: "y recorre toda la empresa.",
    datoLead: "Elija un recorrido: el diagrama ilumina el camino de punta a punta, módulo por módulo.",
    proximo: "Incluye módulos que aún no están en producción",
    porQueEyebrow: "Por qué un ERP propio",
    porQueTitulo: "La gestión no es un anexo:",
    porQueTitulo2: "es la base.",
    pilares: [
      {
        t: "Una sola fuente de verdad",
        d: "El puesto, el turno, la persona y el cliente existen una sola vez. Operación, nómina, documentos y finanzas leen lo mismo.",
      },
      {
        t: "Cero doble digitación",
        d: "La marca del vigilante es el turno realizado, el turno realizado es la base de la nómina y la nómina se cruza con la contabilidad.",
      },
      {
        t: "Trazabilidad de punta a punta",
        d: "Cada evento conserva su foto, ubicación, hora y responsable, y cada acción sensible queda auditada con el antes y el después.",
      },
      {
        t: "Multiempresa de verdad",
        d: "Cada empresa con sus clientes, roles, plan, menú y portada. Lo que no se contrató no aparece ni abre.",
      },
    ],
    tablaTitulo: "ARS frente a herramientas sueltas",
    tablaNota:
      "Comparación honesta: la columna de estado sale del catálogo de ARS. Si ya tiene un ERP contable, ARS no le obliga a cambiarlo: el Agente interoperador lo conecta completo o por partes.",
    tablaCols: ["Necesidad", "Con herramientas sueltas", "Con ARS", "Estado hoy"],
    tabla: [
      {
        necesidad: "Turnos y nómina",
        sueltas: "Un Excel de turnos que se vuelve a digitar en el software de nómina.",
        ars: "La nómina sale de los turnos realizados y las marcas reales, con recargos.",
        modulo: "nomina",
      },
      {
        necesidad: "Evidencia de campo",
        sueltas: "Fotos por WhatsApp y minutas en papel.",
        ars: "Reportes con foto, firma, ubicación y hora, convertidos en tableros y PDF.",
        modulo: "reportes-operativos-y-supervision",
      },
      {
        necesidad: "Documentos del personal",
        sueltas: "Carpetas compartidas y correos con adjuntos.",
        ars: "Cargue con IA, expedientes, vencimientos y portal para el cliente.",
        modulo: "cargue-inteligente-de-documentos",
      },
      {
        necesidad: "Formación",
        sueltas: "Una plataforma de cursos sin relación con el cargo ni el puesto.",
        ars: "Cursos asignados por cargo, cliente, sede o puesto, con certificado QR.",
        modulo: "capacitacion-virtual",
      },
      {
        necesidad: "Contabilidad",
        sueltas: "Informes contables que no se cruzan con la operación.",
        ars: "Lo contratado frente a lo facturado y la nómina frente al gasto, leyendo su ERP contable.",
        modulo: "contabilidad-conectada",
      },
      {
        necesidad: "Usuarios y auditoría",
        sueltas: "Un usuario y una clave distinta por herramienta.",
        ars: "Un ingreso con doble factor, roles por módulo y acción, y auditoría con antes y después.",
        modulo: "auditoria-y-trazabilidad",
      },
      {
        necesidad: "Facturas de proveedores",
        sueltas: "Descarga manual desde la DIAN y conciliación en hojas de cálculo.",
        ars: "Bandeja de facturas cruzada con la contabilidad y eventos RADIAN.",
        modulo: "facturas-dian-y-radian",
      },
      {
        necesidad: "Ventas",
        sueltas: "Un CRM aparte.",
        ars: "Cotizador, tarifas por modalidad y embudo dentro de ARS.",
        modulo: "cotizador-y-crm-propios",
      },
    ],
    cierreEyebrow: "Demo guiada",
    cierreTitulo: "Veamos su operación y su gestión, funcionando juntas.",
    cierreCuerpo:
      "En una demo recorremos el camino completo con sus sedes, sus turnos y sus procesos: de la marcación al informe, del contrato a la nómina.",
    cierreDemo: "Solicitar demo",
    cierreServicios: "Ver todos los servicios",
    idioma: "English",
    idiomaAria: "Cambiar a inglés",
    estados: { vivo: "En producción", piloto: "En piloto", proximamente: "Próximamente", "hoja-de-ruta": "Hoja de ruta" },
  },
  en: {
    eyebrow: "ARS Intelligence · Solution architecture",
    titulo1: "The operation you see.",
    titulo2: "The ERP that holds it up.",
    lead:
      "AI cameras, patrols, radio, IoT and virtual reality are the visible part. Underneath, ARS's own core ERP runs contracts, shifts, staff, payroll, documents, training and finance. Everything shares the same data: what happens at the post reaches management on its own.",
    ctaDiagrama: "Explore the architecture",
    ctaDato: "Follow the data",
    stats: { gestion: "management modules", operacion: "operations modules", vivos: "live in production", fuente: "source of truth" },
    pila: ["Channels", "Operations", "Data & AI", "Core ERP"],
    diagramaEyebrow: "The full map",
    diagramaTitulo: "Five layers,",
    diagramaTitulo2: "one system.",
    diagramaAyuda: "Tap any block to see its modules and their real status.",
    vistasLabel: "View",
    datoLabel: "Follow the data",
    leyenda: "Module status",
    externosTitulo: "External integrations",
    modulosN: (n: number) => (n === 1 ? "1 module" : `${n} modules`),
    paso: "Step",
    de: "of",
    pausar: "Pause",
    reanudar: "Resume",
    anterior: "Previous step",
    siguiente: "Next step",
    repetir: "Replay",
    cerrarRecorrido: "Close path",
    verEnDiagrama: "Show on the diagram",
    panelModulos: "Catalog modules",
    panelVerArea: "See in services",
    cerrar: "Close",
    enIngles: "Module names and descriptions are shown in Spanish, as in the product.",
    datoEyebrow: "Follow the data",
    datoTitulo: "A fact enters once",
    datoTitulo2: "and travels the whole company.",
    datoLead: "Pick a path: the diagram lights it up end to end, module by module.",
    proximo: "Includes modules not yet in production",
    porQueEyebrow: "Why its own ERP",
    porQueTitulo: "Management isn't an add-on:",
    porQueTitulo2: "it's the foundation.",
    pilares: [
      {
        t: "One source of truth",
        d: "The post, the shift, the person and the client exist only once. Operations, payroll, documents and finance read the same data.",
      },
      {
        t: "Zero double entry",
        d: "The guard's punch is the worked shift, the worked shift is the basis for payroll, and payroll is matched against accounting.",
      },
      {
        t: "End-to-end traceability",
        d: "Every event keeps its photo, location, time and owner, and every sensitive action is audited with before-and-after.",
      },
      {
        t: "Truly multi-company",
        d: "Each company with its own clients, roles, plan, menu and home. What wasn't contracted doesn't show up or open.",
      },
    ],
    tablaTitulo: "ARS vs. disconnected tools",
    tablaNota:
      "An honest comparison: the status column comes from the ARS catalog. If you already have an accounting ERP, ARS doesn't force you to replace it: the interoperability agent connects it, fully or in part.",
    tablaCols: ["Need", "With disconnected tools", "With ARS", "Status today"],
    tabla: [
      {
        necesidad: "Shifts & payroll",
        sueltas: "A shift spreadsheet re-typed into payroll software.",
        ars: "Payroll comes from worked shifts and real punches, with surcharges.",
        modulo: "nomina",
      },
      {
        necesidad: "Field evidence",
        sueltas: "Photos over WhatsApp and paper logbooks.",
        ars: "Reports with photo, signature, location and time, turned into dashboards and PDFs.",
        modulo: "reportes-operativos-y-supervision",
      },
      {
        necesidad: "Staff documents",
        sueltas: "Shared folders and emails with attachments.",
        ars: "AI-assisted upload, records, expirations and a client portal.",
        modulo: "cargue-inteligente-de-documentos",
      },
      {
        necesidad: "Training",
        sueltas: "A course platform unrelated to role or post.",
        ars: "Courses assigned by role, client, site or post, with QR certificates.",
        modulo: "capacitacion-virtual",
      },
      {
        necesidad: "Accounting",
        sueltas: "Accounting reports that never meet operations.",
        ars: "Contracted vs. billed and payroll vs. expense, reading your accounting ERP.",
        modulo: "contabilidad-conectada",
      },
      {
        necesidad: "Users & audit",
        sueltas: "A different user and password per tool.",
        ars: "One two-factor sign-in, roles per module and action, and before-and-after audit.",
        modulo: "auditoria-y-trazabilidad",
      },
      {
        necesidad: "Supplier invoices",
        sueltas: "Manual downloads from DIAN and spreadsheet reconciliation.",
        ars: "An invoice inbox matched against accounting, with RADIAN events.",
        modulo: "facturas-dian-y-radian",
      },
      {
        necesidad: "Sales",
        sueltas: "A separate CRM.",
        ars: "Quotes, rates by service type and pipeline inside ARS.",
        modulo: "cotizador-y-crm-propios",
      },
    ],
    cierreEyebrow: "Guided demo",
    cierreTitulo: "Let's see your operations and management working together.",
    cierreCuerpo:
      "In a demo we walk the full path with your sites, shifts and processes: from clock-in to report, from contract to payroll.",
    cierreDemo: "Request a demo",
    cierreServicios: "See all services",
    idioma: "Español",
    idiomaAria: "Switch to Spanish",
    estados: { vivo: "Live", piloto: "Pilot", proximamente: "Coming soon", "hoja-de-ruta": "Roadmap" },
  },
} as const;

export type Copy = (typeof COPY)[Locale];

export const COLOR_ESTADO = {
  vivo: "#35e0a1",
  piloto: "#ffb547",
  proximamente: "#6b8aff",
  "hoja-de-ruta": "#9eb0c0",
} as const;
