export type Locale = "es" | "en";

type SectionDict = {
  label: string;
  eyebrow: string;
  title1: string;
  title2: string;
  body: string;
  cta: string;
};

export type Dict = {
  nav: {
    login: string;
    menu: string;
    changeLang: string;
    home: string;
    projects: string;
    services: string;
  };
  bottomBar: { sound: string; scroll: string; chat: string };
  sections: {
    integral: SectionDict;
    terreno: SectionDict;
    monitoreo: SectionDict;
    ia: SectionDict;
    alertas: SectionDict;
    respuesta: SectionDict;
    control: SectionDict;
    decisiones: SectionDict;
  };
  closing: {
    eyebrow: string;
    title1: string;
    title2: string;
    body: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  footer: { tagline: string; rights: string };
  projectsPage: {
    title1: string;
    title2: string;
    intro: string;
    howTo: string;
    cards: {
      scroll: { title: string; body: string };
      drag: { title: string; body: string };
      click: { title: string; body: string };
    };
    enter: string;
    listTitle: string;
    listSubtitle: string;
    bottomBar: {
      filters: string;
      openList: string;
      back: string;
    };
    panel: {
      country: string;
      region: string;
      vertical: string;
      scale: string;
      cameras: string;
      requestInfo: string;
    };
  };
  home: HomeDict;
};

type HomeChapterDict = {
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
};

/** Home 3D — "La seguridad en tres capas" (claves `home.*`). */
export type HomeDict = {
  nav: { vision: string; platform: string; lab: string; contact: string };
  hero: {
    eyebrow: string;
    title1: string;
    title2: string;
    body: string;
    ctaPrimary: string;
    ctaSecondary: string;
    scroll: string;
    trust: string[];
  };
  layers: Array<{ tag: string; name: string }>;
  chain: { label: string; steps: string[] };
  chapters: {
    capa1: HomeChapterDict;
    evento: HomeChapterDict;
    capa2: HomeChapterDict;
    alerta: HomeChapterDict;
    capa3: HomeChapterDict;
    escala: HomeChapterDict;
  };
  labels: { intruder: string; core: string; control: string; guard: string };
  evidence: {
    title: string;
    priority: string;
    rows: Array<{ k: string; v: string }>;
    attach: string;
    action: string;
  };
  stats: Array<{ value: string; label: string }>;
  ctas: { vision: string; platform: string; projects: string; services: string };
  recap: {
    eyebrow: string;
    title: string;
    body: string;
    items: Array<{ tag: string; name: string; body: string; cta: string }>;
  };
  contact: {
    eyebrow: string;
    title1: string;
    title2: string;
    body: string;
    formTitle: string;
    whatsapp: string;
    email: string;
  };
  staticNote: string;
};

export const dictionaries: Record<Locale, Dict> = {
  es: {
    nav: {
      login: "Login",
      menu: "Menú",
      changeLang: "Idioma",
      home: "Inicio",
      projects: "Proyectos",
      services: "Servicios",
    },
    bottomBar: {
      sound: "Sonido off",
      scroll: "Scroll para explorar",
      chat: "Hablar con un asesor",
    },
    sections: {
      integral: {
        label: "Plataforma",
        eyebrow: "01 / Seguridad integral",
        title1: "Seguridad integral",
        title2: "conectada en tiempo real.",
        body: "Centraliza cámaras, personal, alertas, evidencia y operación para que cada evento tenga contexto, trazabilidad y respuesta. ARS conecta vigilancia, tecnología, operadores y clientes en una sola plataforma.",
        cta: "Conocer la plataforma",
      },
      terreno: {
        label: "Operación",
        eyebrow: "02 / Operación en campo",
        title1: "Del terreno",
        title2: "a la plataforma.",
        body: "La seguridad empieza en el territorio: guardas, rondas, accesos, zonas críticas y novedades. Cada punto de vigilancia, cámara, zona y operador se convierte en parte activa de la operación.",
        cta: "Ver operación en campo",
      },
      monitoreo: {
        label: "Monitoreo",
        eyebrow: "03 / Central de monitoreo",
        title1: "Una central que",
        title2: "entiende lo que ocurre.",
        body: "La central de monitoreo no solo observa: prioriza, interpreta y coordina. ARS ayuda a los operadores a visualizar eventos, priorizar riesgos y coordinar respuestas con mayor velocidad.",
        cta: "Ver capacidades",
      },
      ia: {
        label: "Inteligencia",
        eyebrow: "04 / IA aplicada a la seguridad",
        title1: "IA para detectar,",
        title2: "priorizar y actuar.",
        body: "La IA detecta eventos relevantes y siempre opera como apoyo del equipo humano. Personas, vehículos, placas, rostros autorizados o restringidos, zonas ROI, cruces de línea, permanencia, EPP y eventos críticos.",
        cta: "Ver capacidades de IA",
      },
      alertas: {
        label: "Alertas",
        eyebrow: "05 / Alertas con evidencia",
        title1: "Alertas que llegan",
        title2: "con contexto.",
        body: "Cada alerta debe tener prueba visual, ubicación, cámara, hora, evento y trazabilidad. Snapshots, clips, historial y datos del evento para actuar con información, no con suposiciones.",
        cta: "Ver alertas en acción",
      },
      respuesta: {
        label: "Respuesta",
        eyebrow: "06 / Respuesta coordinada",
        title1: "De la alerta",
        title2: "a la acción.",
        body: "ARS conecta la central con el personal en campo, supervisores y responsables. Comunicación, seguimiento y respuesta operativa para cerrar el ciclo de seguridad.",
        cta: "Ver flujo de respuesta",
      },
      control: {
        label: "Control",
        eyebrow: "07 / Clientes · sedes · zonas",
        title1: "Una plataforma",
        title2: "para múltiples operaciones.",
        body: "ARS permite operar múltiples clientes, sedes, zonas, cámaras y servicios desde una sola arquitectura. Organiza clientes, sedes, zonas, cámaras, reglas IA, operadores y reportes bajo una estructura clara y escalable.",
        cta: "Ver arquitectura multisede",
      },
      decisiones: {
        label: "Decisiones",
        eyebrow: "08 / Reportes y confianza",
        title1: "Más control. Más evidencia.",
        title2: "Mejores decisiones.",
        body: "La seguridad integral termina en información útil para gerencia, auditoría y mejora continua. Convierte la operación diaria en indicadores, trazabilidad, reportes y decisiones estratégicas.",
        cta: "Ver reportes ejecutivos",
      },
    },
    closing: {
      eyebrow: "Cierre del ciclo",
      title1: "Una sola plataforma.",
      title2: "Toda tu seguridad.",
      body: "ARS Intelligence se integra con tu operación actual sin reemplazar tu hardware. Conectamos cámaras, guardas, NVRs y sistemas existentes en menos de 48 horas y entregamos un tablero único para gerencia, supervisión y respuesta.",
      ctaPrimary: "Solicitar demo",
      ctaSecondary: "Ver capacidades de la plataforma",
    },
    footer: {
      tagline: "La forma simple de hacer que todo funcione.",
      rights: "Todos los derechos reservados.",
    },
    projectsPage: {
      title1: "Una red",
      title2: "que ya está operando.",
      intro:
        "ARS Intelligence opera centrales inteligentes en Colombia y Perú, conectando cámaras y sensores en una sola red de decisión.",
      howTo: "Cómo usar el mapa",
      cards: {
        scroll: { title: "Scroll", body: "Acerca y aleja el mapa" },
        drag: { title: "Arrastra", body: "Mueve el mapa con el mouse" },
        click: { title: "Click", body: "Ver detalles del proyecto" },
      },
      enter: "Entrar al mapa",
      listTitle: "Presencia ARS",
      listSubtitle: "Ciudades operativas en Latinoamérica",
      bottomBar: {
        filters: "Filtros",
        openList: "Abrir lista de proyectos",
        back: "Volver",
      },
      panel: {
        country: "País",
        region: "Departamento / Región",
        vertical: "Verticales",
        scale: "Escala",
        cameras: "cámaras",
        requestInfo: "Solicitar información",
      },
    },
    home: {
      nav: { vision: "Visión IA", platform: "Plataforma", lab: "Laboratorio", contact: "Solicitar demo" },
      hero: {
        eyebrow: "ARS Intelligence · Seguridad con IA",
        title1: "Tus cámaras ya miran.",
        title2: "ARS las hace entender.",
        body: "Convertimos las cámaras que ya tienes en una red de seguridad inteligente: detecta lo que importa, alerta con evidencia y coordina la respuesta de tu equipo. Para pequeñas, medianas y grandes empresas en LATAM.",
        ctaPrimary: "Ver la IA en acción",
        ctaSecondary: "Solicitar demo",
        scroll: "Desliza · así responde ARS cuando algo pasa",
        trust: ["Sobre tu CCTV actual", "Despliegue < 48 h", "Monitoreo 24/7", "Colombia · Perú · LATAM"],
      },
      layers: [
        { tag: "Capa 01", name: "Prevención y presencia" },
        { tag: "Capa 02", name: "Detección con IA" },
        { tag: "Capa 03", name: "Respuesta y operación" },
      ],
      chain: {
        label: "Cuando algo se acciona",
        steps: ["Cámara detecta", "IA analiza", "Alerta con evidencia", "Operador actúa"],
      },
      chapters: {
        capa1: {
          eyebrow: "Capa 01 · Prevención y presencia",
          title: "Cada rincón, cubierto antes de que pase algo.",
          body: "Guardas con rondas inteligentes, puestos validados, zonas críticas definidas y tus cámaras existentes conectadas a una sola plataforma. La operación diaria ya es parte del sistema.",
          points: ["Rondas con puntos de control", "Turnos y puestos validados", "Cámaras CCTV existentes", "Zonas y perímetros definidos"],
        },
        evento: {
          eyebrow: "02:14 a. m. · Algo se acciona",
          title: "Alguien cruza el perímetro.",
          body: "Una persona salta la cerca norte en una zona sin guardas cerca. Ningún operador está mirando esa cámara. Aquí empieza la cadena.",
          points: ["Cerca norte · Zona 3", "Sin personal en el sector"],
        },
        capa2: {
          eyebrow: "Capa 02 · Detección con IA",
          title: "La cámara ve. La IA entiende.",
          body: "La analítica sobre tu CCTV clasifica a la persona, confirma el cruce de línea en la zona restringida y descarta falsos positivos como animales, sombras o lluvia, en menos de un segundo.",
          points: ["Persona · 97 %", "Cruce de línea + ROI", "Detección < 1 s"],
        },
        alerta: {
          eyebrow: "Capa 02 → 03 · Alerta con evidencia",
          title: "Una alerta que llega con prueba.",
          body: "La central recibe snapshot, clip, cámara, zona, hora y prioridad en el mismo instante. El operador no adivina: confirma y decide.",
          points: ["Snapshot + clip", "Prioridad automática", "Trazabilidad completa"],
        },
        capa3: {
          eyebrow: "Capa 03 · Respuesta y operación",
          title: "Del aviso a la acción, en minutos.",
          body: "El operador despacha al guarda más cercano por PTT con la ruta en el mapa. El evento se cierra con observaciones, evidencia y responsable: nada se pierde en un chat.",
          points: ["Despacho por mapa", "PTT · Push To Talk", "Cierre con evidencia"],
        },
        escala: {
          eyebrow: "Una plataforma · todas tus sedes",
          title: "Lo que pasa en una sede, lo sabe toda tu operación.",
          body: "Multi-cliente, multi-sede y multi-zona: cada evento alimenta reportes, indicadores y decisiones para gerencia, auditoría y mejora continua.",
          points: [],
        },
      },
      labels: { intruder: "Persona · 97 %", core: "IA · analizando", control: "Central · alerta P1", guard: "Guarda despachado" },
      evidence: {
        title: "Intrusión perimetral",
        priority: "P1",
        rows: [
          { k: "Cámara", v: "CAM-04 · Cerca norte" },
          { k: "Zona", v: "Zona 3 · Restringida" },
          { k: "Hora", v: "02:14:07" },
          { k: "Confianza", v: "97 %" },
        ],
        attach: "Snapshot + clip 10 s",
        action: "Despachar guarda",
      },
      stats: [
        { value: "< 48 h", label: "Despliegue sobre tu CCTV" },
        { value: "24/7", label: "Monitoreo y respuesta" },
        { value: "12+", label: "Analíticas de IA" },
        { value: "< 1 s", label: "Detección de intrusión" },
      ],
      ctas: { vision: "Ver analíticas en video real", platform: "Conocer la plataforma", projects: "Ver proyectos", services: "Ver todos los servicios" },
      recap: {
        eyebrow: "La seguridad de ARS en tres capas",
        title: "Prevenir, detectar, responder. Conectado.",
        body: "Cada capa funciona sola, pero el valor está en la cadena: lo que la cámara ve se convierte en una acción con responsable y evidencia.",
        items: [
          { tag: "Capa 01", name: "Prevención y presencia", body: "Turnos, rondas inteligentes, puestos validados, formularios dinámicos y cámaras existentes en una sola operación.", cta: "Ver operación" },
          { tag: "Capa 02", name: "Detección con IA", body: "Personas, vehículos, placas, rostros, EPP, intrusión y aglomeraciones sobre tu CCTV, con alertas priorizadas.", cta: "Ver analíticas" },
          { tag: "Capa 03", name: "Respuesta y operación", body: "Central de monitoreo, despacho por mapa, PTT, cierre con evidencia y reportes para gerencia.", cta: "Ver plataforma" },
        ],
      },
      contact: {
        eyebrow: "Hablemos de tu operación",
        title1: "Tus cámaras.",
        title2: "Nuestra inteligencia.",
        body: "Conectamos tus cámaras, guardas y NVRs actuales en menos de 48 horas, sin reemplazar tu hardware. Cuéntanos qué necesitas proteger.",
        formTitle: "Cuéntanos qué necesitas",
        whatsapp: "Escribir por WhatsApp",
        email: "Enviar correo",
      },
      staticNote: "Vista simplificada",
    },
  },
  en: {
    nav: {
      login: "Login",
      menu: "Menu",
      changeLang: "Language",
      home: "Home",
      projects: "Projects",
      services: "Services",
    },
    bottomBar: {
      sound: "Sound off",
      scroll: "Scroll to explore",
      chat: "Talk to an advisor",
    },
    sections: {
      integral: {
        label: "Platform",
        eyebrow: "01 / Integrated security",
        title1: "Integrated security,",
        title2: "connected in real time.",
        body: "Centralize cameras, personnel, alerts, evidence and operations so every event has context, traceability and response. ARS connects surveillance, technology, operators and clients on a single platform.",
        cta: "Discover the platform",
      },
      terreno: {
        label: "Field ops",
        eyebrow: "02 / Field operations",
        title1: "From the ground",
        title2: "to the platform.",
        body: "Security starts on the ground: guards, patrols, access points, critical zones and incidents. Every watch point, camera, zone and operator becomes an active part of the operation.",
        cta: "See field operations",
      },
      monitoreo: {
        label: "Monitoring",
        eyebrow: "03 / Operations center",
        title1: "An operations center",
        title2: "that understands what's happening.",
        body: "The operations center doesn't just watch — it prioritizes, interprets and coordinates. ARS helps operators visualize events, rank risks and coordinate response with greater speed.",
        cta: "See capabilities",
      },
      ia: {
        label: "Intelligence",
        eyebrow: "04 / AI applied to security",
        title1: "AI to detect,",
        title2: "prioritize and act.",
        body: "AI detects relevant events and always operates as support to the human team. People, vehicles, plates, authorized or restricted faces, ROI zones, line-cross, dwell time, PPE and critical events.",
        cta: "See AI capabilities",
      },
      alertas: {
        label: "Alerts",
        eyebrow: "05 / Alerts with evidence",
        title1: "Alerts that arrive",
        title2: "with full context.",
        body: "Every alert needs visual proof, location, camera, time, event and traceability. Snapshots, clips, history and event data so your team acts on information — not assumptions.",
        cta: "See alerts in action",
      },
      respuesta: {
        label: "Response",
        eyebrow: "06 / Coordinated response",
        title1: "From the alert",
        title2: "to the action.",
        body: "ARS connects the operations center with field personnel, supervisors and decision makers. Communication, tracking and operational response to close the security loop.",
        cta: "See response flow",
      },
      control: {
        label: "Control",
        eyebrow: "07 / Clients · sites · zones",
        title1: "One platform",
        title2: "for many operations.",
        body: "ARS lets you operate multiple clients, sites, zones, cameras and services from a single architecture. Organize clients, sites, zones, cameras, AI rules, operators and reports under a clear, scalable structure.",
        cta: "See multi-site architecture",
      },
      decisiones: {
        label: "Decisions",
        eyebrow: "08 / Reports and trust",
        title1: "More control. More evidence.",
        title2: "Better decisions.",
        body: "Integrated security ends in actionable information for management, audit and continuous improvement. Turn daily operations into KPIs, traceability, reports and strategic decisions.",
        cta: "See executive reports",
      },
    },
    closing: {
      eyebrow: "Closing the loop",
      title1: "One platform.",
      title2: "All your security.",
      body: "ARS Intelligence integrates with your existing operation without replacing your hardware. We connect cameras, guards, NVRs and existing systems in under 48 hours and deliver a single dashboard for management, supervision and response.",
      ctaPrimary: "Request demo",
      ctaSecondary: "See platform capabilities",
    },
    footer: {
      tagline: "The simple way to make everything work.",
      rights: "All rights reserved.",
    },
    projectsPage: {
      title1: "A network",
      title2: "already in operation.",
      intro:
        "ARS Intelligence runs intelligent operations centers across Colombia and Peru, connecting cameras and sensors into a single decision network.",
      howTo: "How to use the map",
      cards: {
        scroll: { title: "Scroll", body: "Zoom in and out of the map" },
        drag: { title: "Drag", body: "Move the map around" },
        click: { title: "Click", body: "View project details" },
      },
      enter: "Enter the map",
      listTitle: "ARS presence",
      listSubtitle: "Operating cities across Latin America",
      bottomBar: {
        filters: "Filters",
        openList: "Open project list",
        back: "Back",
      },
      panel: {
        country: "Country",
        region: "Region / State",
        vertical: "Verticals",
        scale: "Scale",
        cameras: "cameras",
        requestInfo: "Request information",
      },
    },
    home: {
      nav: { vision: "AI Vision", platform: "Platform", lab: "Lab", contact: "Request demo" },
      hero: {
        eyebrow: "ARS Intelligence · AI-powered security",
        title1: "Your cameras already watch.",
        title2: "ARS makes them understand.",
        body: "We turn the cameras you already own into an intelligent security network: it detects what matters, alerts with evidence and coordinates your team's response. For small, mid-size and large companies across LATAM.",
        ctaPrimary: "See the AI in action",
        ctaSecondary: "Request demo",
        scroll: "Scroll · this is how ARS responds when something happens",
        trust: ["On your existing CCTV", "Deployed in < 48 h", "24/7 monitoring", "Colombia · Peru · LATAM"],
      },
      layers: [
        { tag: "Layer 01", name: "Prevention & presence" },
        { tag: "Layer 02", name: "AI detection" },
        { tag: "Layer 03", name: "Response & operations" },
      ],
      chain: {
        label: "When something is triggered",
        steps: ["Camera detects", "AI analyzes", "Alert with evidence", "Operator acts"],
      },
      chapters: {
        capa1: {
          eyebrow: "Layer 01 · Prevention & presence",
          title: "Every corner covered before anything happens.",
          body: "Guards on smart patrols, validated posts, defined critical zones and your existing cameras connected to a single platform. Daily operations are already part of the system.",
          points: ["Patrols with checkpoints", "Validated shifts and posts", "Existing CCTV cameras", "Defined zones and perimeters"],
        },
        evento: {
          eyebrow: "2:14 a.m. · Something is triggered",
          title: "Someone crosses the perimeter.",
          body: "A person jumps the north fence in an area with no guards nearby. No operator is watching that camera. This is where the chain begins.",
          points: ["North fence · Zone 3", "No staff in the sector"],
        },
        capa2: {
          eyebrow: "Layer 02 · AI detection",
          title: "The camera sees. The AI understands.",
          body: "Analytics on your CCTV classify the person, confirm the line-cross in the restricted zone and discard false positives such as animals, shadows or rain, in under a second.",
          points: ["Person · 97%", "Line-cross + ROI", "Detection < 1 s"],
        },
        alerta: {
          eyebrow: "Layer 02 → 03 · Alert with evidence",
          title: "An alert that arrives with proof.",
          body: "The control room receives snapshot, clip, camera, zone, time and priority at the same instant. The operator doesn't guess: they confirm and decide.",
          points: ["Snapshot + clip", "Automatic priority", "Full traceability"],
        },
        capa3: {
          eyebrow: "Layer 03 · Response & operations",
          title: "From alert to action, in minutes.",
          body: "The operator dispatches the nearest guard over PTT with the route on the map. The event closes with notes, evidence and an owner: nothing gets lost in a chat.",
          points: ["Map dispatch", "PTT · Push To Talk", "Closed with evidence"],
        },
        escala: {
          eyebrow: "One platform · all your sites",
          title: "What happens at one site, your whole operation knows.",
          body: "Multi-client, multi-site and multi-zone: every event feeds reports, KPIs and decisions for management, audit and continuous improvement.",
          points: [],
        },
      },
      labels: { intruder: "Person · 97%", core: "AI · analyzing", control: "Control room · P1 alert", guard: "Guard dispatched" },
      evidence: {
        title: "Perimeter intrusion",
        priority: "P1",
        rows: [
          { k: "Camera", v: "CAM-04 · North fence" },
          { k: "Zone", v: "Zone 3 · Restricted" },
          { k: "Time", v: "02:14:07" },
          { k: "Confidence", v: "97%" },
        ],
        attach: "Snapshot + 10 s clip",
        action: "Dispatch guard",
      },
      stats: [
        { value: "< 48 h", label: "Deployed on your CCTV" },
        { value: "24/7", label: "Monitoring and response" },
        { value: "12+", label: "AI analytics" },
        { value: "< 1 s", label: "Intrusion detection" },
      ],
      ctas: { vision: "See analytics on real video", platform: "Discover the platform", projects: "See projects", services: "See all services" },
      recap: {
        eyebrow: "ARS security in three layers",
        title: "Prevent, detect, respond. Connected.",
        body: "Each layer works on its own, but the value is in the chain: what the camera sees becomes an action with an owner and evidence.",
        items: [
          { tag: "Layer 01", name: "Prevention & presence", body: "Shifts, smart patrols, validated posts, dynamic forms and existing cameras in a single operation.", cta: "See operations" },
          { tag: "Layer 02", name: "AI detection", body: "People, vehicles, plates, faces, PPE, intrusion and crowding on your CCTV, with prioritized alerts.", cta: "See analytics" },
          { tag: "Layer 03", name: "Response & operations", body: "Control room, map dispatch, PTT, closure with evidence and reports for management.", cta: "See platform" },
        ],
      },
      contact: {
        eyebrow: "Let's talk about your operation",
        title1: "Your cameras.",
        title2: "Our intelligence.",
        body: "We connect your current cameras, guards and NVRs in under 48 hours, without replacing your hardware. Tell us what you need to protect.",
        formTitle: "Tell us what you need",
        whatsapp: "Message on WhatsApp",
        email: "Send an email",
      },
      staticNote: "Simplified view",
    },
  },
};

export const sectionKeys = [
  "integral",
  "terreno",
  "monitoreo",
  "ia",
  "alertas",
  "respuesta",
  "control",
  "decisiones",
] as const;

export type SectionKey = (typeof sectionKeys)[number];
