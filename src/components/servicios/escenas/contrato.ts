/**
 * Contrato entre las páginas de /servicios y las escenas 3D (three.js).
 *
 * Cada escena es un módulo `escenas/<id>.ts` que exporta por defecto una
 * `FabricaEscena`. El componente React `<EscenaArea>` (escenas/EscenaArea.tsx)
 * la carga con import dinámico, le pasa un canvas y llama a `setFoco` cuando
 * cambia el módulo visible o cuando el asistente pide mostrar algo.
 *
 * Reglas comunes a todas las escenas:
 *  - Se puede mirar: arrastrar gira la cámara alrededor del objetivo (OrbitControls
 *    con damping, sin zoom con la rueda para no robar el scroll; zoom con pinza sí).
 *  - Siempre hay movimiento sutil (idle) aunque nadie toque nada.
 *  - `setFoco(clave)` vuela la cámara (~1.2 s, easing) al encuadre de esa clave y
 *    resalta los objetos relacionados (brillo/color del acento). `null` = vista general.
 *  - `lowPower`: menos partículas, sin sombras, pixelRatio ≤ 1.5.
 *  - `reducedMotion`: sin animación idle; los cambios de foco son cortes suaves.
 *  - Paleta de marca: fondo #020a18, imperial #142664, french #1d3885, indigo #2348d4,
 *    cool-steel #9eb0c0, más el `color` de acento del área.
 *  - Geometría procedural (sin descargar modelos): estilo holográfico/arquitectónico,
 *    líneas finas, materiales emisivos, niebla, como el home 3D (src/components/home/SecurityScene.ts).
 */

import type { EscenaId } from "@/data/servicios/tipos";

export type OpcionesEscena = {
  canvas: HTMLCanvasElement;
  /** Color de acento del área (hex). */
  acento: string;
  lowPower: boolean;
  reducedMotion: boolean;
  /** Avisa de clics sobre objetos con foco (p. ej. tocar una cámara del edificio). */
  onSeleccion?: (clave: string) => void;
};

export type InstanciaEscena = {
  setFoco(clave: string | null): void;
  /** Ajusta el tamaño (el componente llama en cada resize). */
  resize(ancho: number, alto: number): void;
  /** Pausa el render cuando la escena no está en pantalla. */
  setActiva(activa: boolean): void;
  dispose(): void;
};

export type FabricaEscena = (opciones: OpcionesEscena) => InstanciaEscena;

/**
 * Claves de foco que expone cada escena, con una etiqueta legible (se muestra
 * como chip "estás viendo: …" y como hotspot clicable en la escena).
 * Los módulos de datos (`Modulo.foco`) deben usar una de estas claves.
 */
export const FOCOS_ESCENA: Record<EscenaId, Record<string, string>> = {
  campo: {
    puesto: "Puesto de vigilancia",
    asistencia: "Marcación con selfie y rostro",
    ronda: "Ruta de ronda con puntos QR",
    supervision: "Revista del supervisor",
    porteria: "Portería y visitantes",
    recursos: "Armas, vehículos y caninos",
  },
  centro: {
    ciudad: "Mapa vivo de la ciudad",
    zonas: "Zonas y territorios",
    coordinador: "Sala del coordinador",
    recorridos: "Recorridos GPS",
    cumplimiento: "Cumplimiento por persona",
    alias: "Alias de clientes y sedes",
  },
  comunicacion: {
    radio: "Radio PTT",
    chat: "Chat corporativo",
    central: "Conversación con la Central",
    consola: "Consola y grabaciones",
    reporte: "Reporte por sede",
    panico: "Botón de pánico",
    notificaciones: "Notificaciones y Telegram",
  },
  edificio: {
    fachada: "Edificio inteligente",
    camaras: "Cámaras con visión artificial",
    acceso: "Acceso con reconocimiento facial",
    puertas: "Puertas que reconocen",
    iot: "Sensores IoT y domótica",
    planos: "Levantamiento 2D/3D",
    escaneo: "Escaneo 3D de la sede",
  },
  inmersiva: {
    vestibulo: "Vestíbulo de la central",
    central: "Central Viva en 3D",
    sede: "Sede Inteligente",
    mesa: "Mesa Directiva con IA",
    vigia: "Vigía, asistente de voz",
    gafas: "Gafas Meta Quest",
  },
  humana: {
    seleccion: "Selección y contratación",
    colaboradores: "Colaboradores y fichas",
    nomina: "Nómina desde los turnos",
    costos: "Costos y Avancys",
    documental: "Área documental",
    arbol: "Árbol documental 3D",
    portal: "Portal del cliente",
    juridica: "Jurídica",
  },
  formacion: {
    aula: "Aula virtual",
    disenador: "Diseñador de cursos con IA",
    video: "Video por temas",
    reglas: "Mapa de reglas y auditoría",
    evaluaciones: "Evaluaciones",
    certificado: "Certificado con QR",
  },
  finanzas: {
    clientes: "Clientes, contratos y planes",
    ordenes: "Órdenes de servicio",
    contabilidad: "Contabilidad conectada",
    asistente: "Asistente IA de contabilidad",
    dian: "Facturas DIAN y RADIAN",
    erp: "Avancys dentro de ARS",
  },
  productividad: {
    tareas: "Seguimiento de tareas",
    reuniones: "Reuniones con IA",
    tickets: "Tickets de soporte",
    formularios: "Formularios dinámicos",
    automatizaciones: "Automatizaciones",
    ia: "Centro de IA",
  },
  gobierno: {
    torre: "Torre de Control",
    auditoria: "Auditoría y trazabilidad",
    config: "Configuración multiempresa",
    ingreso: "Ingreso y doble factor",
    android: "App Android",
    pwa: "App instalable (PWA)",
    escritorio: "App de escritorio",
  },
};
