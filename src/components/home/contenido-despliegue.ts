/**
 * Copy de la sección «Despliegue y gobernanza de datos» del home (es / en).
 *
 * Fuente única de las afirmaciones:
 *  - Área K del catálogo (`src/data/servicios/catalogo.ts`, id `infraestructura`).
 *  - Interoperabilidad: `src/components/arquitectura/contenido-voz-interop.ts` y los módulos
 *    del catálogo que la documentan (visión, IoT, asistencia, radio, Telegram, interoperador, DIAN).
 * Los estados (vivo / piloto) NO se escriben aquí: se leen del catálogo en build (ver
 * `MODULOS_DESPLIEGUE` y `src/app/page.tsx`). Reglas del área: sin nombres de equipos, IPs,
 * modelos de tarjeta ni dominios internos; sin SLA ni cifras de capacidad; el monitor es de
 * solo lectura y el agente remoto solo hace conexiones salientes. WhatsApp NO es un conector
 * documentado (ARS reemplaza el grupo de WhatsApp con su propio canal), por eso no aparece.
 */
import type { Locale } from "@/lib/i18n/dictionaries";

export type ModoId = "ars" | "cliente" | "sede" | "hibrida";

/** Módulos del catálogo que cita la sección; su nombre, área y estado se leen del catálogo. */
export const MODULOS_DESPLIEGUE = [
  "centro-de-datos-ars",
  "granja-de-gpu-ia-local",
  "monitor-de-infraestructura-en-vivo",
  "cluster-y-nodos",
  "sitios-red-y-dns",
  "ubicaciones-y-agente-remoto",
  "equipo-on-premise",
  "respaldos-verificados",
  "alertas-e-informes-de-infraestructura",
  "vision-artificial",
  "iot-y-domotica",
  "control-de-asistencia-y-relevos",
  "radio-ptt",
  "notificaciones-y-telegram",
  "agente-interoperador-de-datos",
  "facturas-dian-y-radian",
] as const;
export type ModuloDespliegueId = (typeof MODULOS_DESPLIEGUE)[number];

type Modo = {
  id: ModoId;
  nombre: string;
  corto: string;
  frase: string;
  datos: string;
  corre: string;
  administra: string;
  /** Módulo cuyo estado define el del modo (el peor de ellos). */
  clave: ModuloDespliegueId[];
  modulos: ModuloDespliegueId[];
};

type Control = { t: string; d: string; modulo: ModuloDespliegueId };
type Conector = { t: string; items: string[]; modulo: ModuloDespliegueId; nota?: string };

export type CopyDespliegue = {
  eyebrow: string;
  titulo: string;
  lead: string;
  selectorLabel: string;
  labels: { datos: string; corre: string; administra: string; modulos: string; mapa: string };
  modos: Modo[];
  controlEyebrow: string;
  controlTitulo: string;
  controlLead: string;
  control: Control[];
  controlNota: string;
  conectoresEyebrow: string;
  conectoresTitulo: string;
  conectoresLead: string;
  conectores: Conector[];
  conectoresNota: string;
  conectoresCta: string;
  ctaInfra: string;
};

const ES: CopyDespliegue = {
  eyebrow: "Despliegue y gobernanza de datos",
  titulo: "Sus datos viven donde su política lo exija.",
  lead:
    "ARS opera en nuestro centro de datos en Colombia, en la nube que su empresa ya tiene, en un equipo dentro de su sede o en una mezcla de ellos. Usted elige según su gobierno de datos; la plataforma y el monitor son los mismos.",
  selectorLabel: "Formas de desplegar ARS",
  labels: {
    datos: "Dónde viven los datos",
    corre: "Qué corre dónde",
    administra: "Quién lo administra",
    modulos: "Lo hacen posible",
    mapa: "Mapa del despliegue",
  },
  modos: [
    {
      id: "ars",
      nombre: "Nube ARS en Colombia",
      corto: "Nube ARS",
      frase: "La información de su operación no sale del país.",
      datos:
        "En el centro de datos propio de ARS, en Colombia. Los videos, los documentos del personal y las conversaciones con los asistentes se procesan en servidores propios, sin enviarse a servicios de terceros fuera del país.",
      corre:
        "La plataforma, en microservicios orquestados en un clúster Kubernetes. La analítica de video y los modelos de IA, en nuestra granja de tarjetas gráficas.",
      administra:
        "ARS opera el centro de datos y lo vigila en vivo, con respaldos diarios verificados y copia fuera del sitio.",
      clave: ["centro-de-datos-ars"],
      modulos: ["centro-de-datos-ars", "granja-de-gpu-ia-local", "cluster-y-nodos", "respaldos-verificados"],
    },
    {
      id: "cliente",
      nombre: "Nube del cliente",
      corto: "Su nube",
      frase: "Si ya tiene su nube, ARS se conecta a ella.",
      datos:
        "En la nube que su empresa ya tiene (por ejemplo AWS, Azure o Google Cloud) o en su sala de servidores.",
      corre:
        "ARS opera sobre esa infraestructura. Un agente liviano, para Linux, Windows o Kubernetes, reporta cada minuto la salud de cada equipo: CPU, memoria, discos, red, contenedores, servicios y respaldos.",
      administra:
        "Su nube sigue siendo suya. El agente solo hace conexiones salientes por HTTPS: no abre puertos ni necesita VPN, y cada equipo tiene su propio token revocable.",
      clave: ["ubicaciones-y-agente-remoto"],
      modulos: ["ubicaciones-y-agente-remoto", "monitor-de-infraestructura-en-vivo", "sitios-red-y-dns"],
    },
    {
      id: "sede",
      nombre: "On premise en su sede",
      corto: "En su sede",
      frase: "Si los datos no pueden salir de su edificio, ARS va hasta allá.",
      datos:
        "Dentro de sus instalaciones. El video se procesa cerca de las cámaras, sin subirlo a internet.",
      corre:
        "Un equipo que ARS deja en la sede: ahí corren los servicios de la operación y la analítica en el borde.",
      administra:
        "ARS lo instala y lo vigila desde la central: salud, discos, servicios y DNS, con copias en la sede y fuera de ella, y las mismas alertas que nuestro centro de datos.",
      clave: ["equipo-on-premise"],
      modulos: ["equipo-on-premise", "ubicaciones-y-agente-remoto", "respaldos-verificados"],
    },
    {
      id: "hibrida",
      nombre: "Híbrida",
      corto: "Híbrida",
      frase: "Parte en la sede, parte en la nube, una sola consola.",
      datos:
        "Lo que debe quedarse en la sede se queda en la sede; el resto vive en el centro de datos ARS o en su nube.",
      corre:
        "Servicios y analítica en el equipo de la sede, y la plataforma en la nube. Cada ubicación —oficina, centro de datos o nube— con sus propios equipos y clústeres.",
      administra:
        "Todo aparece en el mismo monitor. Si su empresa ya tiene nube, ARS se conecta a ella sin perder el control desde un solo lugar.",
      clave: ["equipo-on-premise", "ubicaciones-y-agente-remoto"],
      modulos: ["equipo-on-premise", "centro-de-datos-ars", "ubicaciones-y-agente-remoto", "monitor-de-infraestructura-en-vivo"],
    },
  ],
  controlEyebrow: "Un solo plano de control",
  controlTitulo: "Donde sea que corra, se vigila desde la misma consola.",
  controlLead:
    "Nuestro centro de datos, su nube y el equipo de su sede aparecen en el mismo monitor, con las mismas alertas.",
  control: [
    { t: "Monitor en vivo", d: "Servidor, contenedores, servicios, bases de datos, alertas y registros, actualizados sin recargar.", modulo: "monitor-de-infraestructura-en-vivo" },
    { t: "Clúster y nodos", d: "Cada nodo con sus discos, temperatura y red; los equipos nuevos aparecen solos.", modulo: "cluster-y-nodos" },
    { t: "Sitios, red y DNS", d: "Sondas HTTPS, resolución DNS y aviso antes de que venza un certificado.", modulo: "sitios-red-y-dns" },
    { t: "Respaldos 3-2-1 verificados", d: "Tres copias, en dos medios, una fuera del sitio; aviso si un respaldo se vence o quedó incompleto.", modulo: "respaldos-verificados" },
    { t: "Alertas con historia", d: "Un nodo sin métricas, una tarjeta caliente o un respaldo vencido, con sus registros.", modulo: "alertas-e-informes-de-infraestructura" },
    { t: "DevOps", d: "Compilaciones y publicaciones de las apps, con una lista cerrada de acciones y bitácora.", modulo: "alertas-e-informes-de-infraestructura" },
    { t: "Ubicaciones remotas", d: "Su nube, su sala de servidores o su sede, cada una con sus equipos, en línea o caídos.", modulo: "ubicaciones-y-agente-remoto" },
    { t: "Interoperabilidad", d: "Su ERP, su contabilidad o sus hojas de cálculo, sincronizados por API, backend o cargas programadas.", modulo: "agente-interoperador-de-datos" },
  ],
  controlNota:
    "El monitor es de solo lectura por diseño: mira todo, pero no puede apagar ni crear nada. Lo que se ejecuta pasa por una cola y un ejecutor con lista cerrada de acciones, todo con bitácora.",
  conectoresEyebrow: "Conectores",
  conectoresTitulo: "Se conecta a lo que ya tiene.",
  conectoresLead:
    "No tiene que cambiar sus cámaras, sus relojes ni su contabilidad: ARS los suma a la misma traza.",
  conectores: [
    { t: "Cámaras y grabadores", items: ["RTSP", "ONVIF"], modulo: "vision-artificial", nota: "Sobre los grabadores que la sede ya tiene." },
    { t: "Descubrimiento en la sede", items: ["ONVIF", "mDNS", "SNMP"], modulo: "iot-y-domotica" },
    { t: "Accesos, alarmas e IoT", items: ["Controles de acceso", "Alarmas", "Luces", "Riego"], modulo: "iot-y-domotica", nota: "Con adaptadores de protocolo." },
    { t: "Relojes biométricos", items: ["ZKTeco"], modulo: "control-de-asistencia-y-relevos", nota: "Como compatibilidad con lo que ya existe." },
    { t: "Radio PTT", items: ["Android", "Web", "Escritorio", "Tecla PTT física"], modulo: "radio-ptt", nota: "Radio propia de ARS; compatible con la tecla de los celulares rugerizados." },
    { t: "Telegram", items: ["Bots por cliente y zona"], modulo: "notificaciones-y-telegram" },
    { t: "ERP y contabilidad", items: ["Odoo", "SAP Business One", "Dynamics 365", "Siigo", "Alegra", "World Office", "Helisa", "Excel"], modulo: "agente-interoperador-de-datos" },
    { t: "APIs y webhooks", items: ["REST", "OData", "JSON-RPC / XML-RPC", "Webhooks"], modulo: "agente-interoperador-de-datos", nota: "Con credenciales de solo los permisos necesarios." },
    { t: "Cargas programadas", items: ["Excel", "CSV", "XML", "SFTP", "Carpeta compartida", "Correo"], modulo: "agente-interoperador-de-datos" },
    { t: "Facturación electrónica", items: ["DIAN", "RADIAN"], modulo: "facturas-dian-y-radian" },
    { t: "Nubes del cliente", items: ["AWS", "Azure", "Google Cloud"], modulo: "ubicaciones-y-agente-remoto", nota: "Con el agente remoto, solo saliente por HTTPS." },
    { t: "Servidores y clústeres", items: ["Linux", "Windows", "Kubernetes"], modulo: "ubicaciones-y-agente-remoto" },
  ],
  conectoresNota:
    "El camino de cada conexión es el habitual; el definitivo se confirma en el diagnóstico técnico de su instalación.",
  conectoresCta: "Ver interoperabilidad",
  ctaInfra: "Ver infraestructura y centro de datos",
};

const EN: CopyDespliegue = {
  eyebrow: "Deployment and data governance",
  titulo: "Your data lives wherever your policy requires.",
  lead:
    "ARS runs in our data center in Colombia, in the cloud your company already has, on equipment inside your site, or in a mix of them. You choose according to your data governance; the platform and the monitor stay the same.",
  selectorLabel: "Ways to deploy ARS",
  labels: {
    datos: "Where the data lives",
    corre: "What runs where",
    administra: "Who manages it",
    modulos: "Made possible by",
    mapa: "Deployment map",
  },
  modos: [
    {
      ...ES.modos[0],
      nombre: "ARS cloud in Colombia",
      corto: "ARS cloud",
      frase: "Your operation's information doesn't leave the country.",
      datos:
        "In ARS's own data center, in Colombia. Videos, staff documents and conversations with the assistants are processed on our own servers, without being sent to third-party services abroad.",
      corre:
        "The platform, as microservices orchestrated on a Kubernetes cluster. Video analytics and AI models, on our own GPU farm.",
      administra: "ARS runs the data center and monitors it live, with verified daily backups and an off-site copy.",
    },
    {
      ...ES.modos[1],
      nombre: "Your own cloud",
      corto: "Your cloud",
      frase: "If you already have a cloud, ARS connects to it.",
      datos: "In the cloud your company already has (for example AWS, Azure or Google Cloud) or in your server room.",
      corre:
        "ARS runs on that infrastructure. A lightweight agent for Linux, Windows or Kubernetes reports each machine's health every minute: CPU, memory, disks, network, containers, services and backups.",
      administra:
        "Your cloud stays yours. The agent only makes outbound HTTPS connections: no open ports, no VPN, and each machine has its own revocable token.",
    },
    {
      ...ES.modos[2],
      nombre: "On premise at your site",
      corto: "At your site",
      frase: "If data can't leave your building, ARS goes there.",
      datos: "Inside your facilities. Video is processed close to the cameras, without uploading it to the internet.",
      corre: "Equipment that ARS leaves on site runs the operation's services and edge analytics.",
      administra:
        "ARS installs it and monitors it from the central: health, disks, services and DNS, with copies on site and off site, and the same alerts as our data center.",
    },
    {
      ...ES.modos[3],
      nombre: "Hybrid",
      corto: "Hybrid",
      frase: "Part on site, part in the cloud, one console.",
      datos: "What must stay on site stays on site; the rest lives in the ARS data center or in your cloud.",
      corre:
        "Services and analytics on the on-site equipment, the platform in the cloud. Each location —office, data center or cloud— with its own machines and clusters.",
      administra:
        "Everything shows up in the same monitor. If your company already has a cloud, ARS connects to it without losing control from one place.",
    },
  ],
  controlEyebrow: "One control plane",
  controlTitulo: "Wherever it runs, it's watched from the same console.",
  controlLead: "Our data center, your cloud and your on-site equipment show up in the same monitor, with the same alerts.",
  control: [
    { t: "Live monitor", d: "Server, containers, services, databases, alerts and logs, updated without reloading.", modulo: "monitor-de-infraestructura-en-vivo" },
    { t: "Cluster and nodes", d: "Each node with its disks, temperature and network; new machines show up on their own.", modulo: "cluster-y-nodos" },
    { t: "Sites, network and DNS", d: "HTTPS probes, DNS resolution and a warning before a certificate expires.", modulo: "sitios-red-y-dns" },
    { t: "Verified 3-2-1 backups", d: "Three copies, on two media, one off site; a warning if a backup is overdue or incomplete.", modulo: "respaldos-verificados" },
    { t: "Alerts with history", d: "A node without metrics, a hot GPU or an overdue backup, with its logs.", modulo: "alertas-e-informes-de-infraestructura" },
    { t: "DevOps", d: "App builds and releases, with a closed list of actions and an audit log.", modulo: "alertas-e-informes-de-infraestructura" },
    { t: "Remote locations", d: "Your cloud, your server room or your site, each with its machines, online or down.", modulo: "ubicaciones-y-agente-remoto" },
    { t: "Interoperability", d: "Your ERP, your accounting or your spreadsheets, synced by API, backend or scheduled loads.", modulo: "agente-interoperador-de-datos" },
  ],
  controlNota:
    "The monitor is read-only by design: it sees everything but can't shut down or create anything. Whatever gets executed goes through a queue and an executor with a closed list of actions, all logged.",
  conectoresEyebrow: "Connectors",
  conectoresTitulo: "It connects to what you already have.",
  conectoresLead: "You don't have to replace your cameras, your clocks or your accounting: ARS adds them to the same trace.",
  conectores: [
    { ...ES.conectores[0], t: "Cameras and recorders", nota: "On top of the recorders your site already has." },
    { ...ES.conectores[1], t: "On-site discovery" },
    { ...ES.conectores[2], t: "Access, alarms and IoT", items: ["Access control", "Alarms", "Lights", "Irrigation"], nota: "With protocol adapters." },
    { ...ES.conectores[3], t: "Biometric clocks", nota: "As compatibility with what's already there." },
    { ...ES.conectores[4], t: "PTT radio", items: ["Android", "Web", "Desktop", "Physical PTT key"], nota: "ARS's own radio; works with the key on rugged phones." },
    { ...ES.conectores[5], items: ["Bots per client and zone"] },
    { ...ES.conectores[6], t: "ERP and accounting" },
    { ...ES.conectores[7], t: "APIs and webhooks", nota: "With credentials limited to the permissions needed." },
    { ...ES.conectores[8], t: "Scheduled loads", items: ["Excel", "CSV", "XML", "SFTP", "Shared folder", "Email"] },
    { ...ES.conectores[9], t: "E-invoicing" },
    { ...ES.conectores[10], t: "Client clouds", nota: "With the remote agent, outbound HTTPS only." },
    { ...ES.conectores[11], t: "Servers and clusters" },
  ],
  conectoresNota: "Each connection's route is the usual one; the final one is confirmed in the technical assessment of your installation.",
  conectoresCta: "See interoperability",
  ctaInfra: "See infrastructure and data center",
};

export const COPY_DESPLIEGUE: Record<Locale, CopyDespliegue> = { es: ES, en: EN };
