/**
 * Datos del mapa de despliegue.
 *
 * Los textos salen del área K «Infraestructura y centro de datos» de
 * `src/data/servicios/catalogo.ts` (módulos centro-de-datos-ars, granja-de-gpu-ia-local,
 * monitor-de-infraestructura-en-vivo, ubicaciones-y-agente-remoto, equipo-on-premise,
 * respaldos-verificados y alertas-e-informes-de-infraestructura), abreviados para caber
 * como etiquetas. Regla del área: sin nombres de equipos, IPs, modelos de tarjeta ni
 * cifras de capacidad; el agente remoto solo hace conexiones salientes.
 */

export type ModoDespliegue = "ars" | "cliente" | "sede" | "hibrida";

/** Lugares del diagrama. `sede` es el edificio; `onprem`, el equipo que ARS deja dentro. */
export type SitioId = "consola" | "dc" | "nube" | "sede" | "onprem";

/** Trazos del diagrama: `f-*` son flujos de datos; `c-*`, el canal hacia la consola. */
export type FlujoId =
  | "f-sede-dc"
  | "f-sede-nube"
  | "f-sede-onprem"
  | "f-dc-nube"
  | "f-nube-dc"
  | "c-dc"
  | "c-nube"
  | "c-onprem";

export type TipoFlujo = "datos" | "sincronia" | "control";

export const TIPO_FLUJO: Record<FlujoId, TipoFlujo> = {
  "f-sede-dc": "datos",
  "f-sede-nube": "datos",
  "f-sede-onprem": "datos",
  "f-dc-nube": "sincronia",
  "f-nube-dc": "sincronia",
  "c-dc": "control",
  "c-nube": "control",
  "c-onprem": "control",
};

export const COLOR = {
  fondo: "#020a18",
  datos: "#5fd8ff",
  sincronia: "#6b8aff",
  control: "#a88bff",
  borde: "#35e0a1",
  ia: "#ffb547",
} as const;

export const COLOR_FLUJO: Record<TipoFlujo, string> = {
  datos: COLOR.datos,
  sincronia: COLOR.sincronia,
  control: COLOR.control,
};

/** Acento de cada lugar cuando está activo. */
export const COLOR_SITIO: Record<SitioId, string> = {
  consola: COLOR.control,
  dc: COLOR.datos,
  nube: COLOR.sincronia,
  sede: "#9eb0c0",
  onprem: COLOR.borde,
};

export type IconoId =
  | "camaras"
  | "biometricos"
  | "sensores"
  | "vigilantes"
  | "monitor"
  | "devops"
  | "respaldos"
  | "alertas"
  | "gpu"
  | "plataforma"
  | "nube"
  | "agente"
  | "equipo";

export const ETIQUETAS = {
  consola: {
    titulo: "Consola única ARS",
    sub: "Ve y administra todo",
    // monitor-de-infraestructura-en-vivo · respaldos-verificados · alertas-e-informes-de-infraestructura
    piezas: [
      { icono: "monitor", texto: "Monitor" },
      { icono: "devops", texto: "DevOps" },
      { icono: "respaldos", texto: "Respaldos" },
      { icono: "alertas", texto: "Alertas" },
    ],
  },
  dc: {
    titulo: "Centro de datos ARS",
    tituloCorto: "Centro de datos",
    sub: "Colombia · soberanía de datos",
    subCorto: "ARS · Colombia",
    // granja-de-gpu-ia-local · centro-de-datos-ars («Plataforma en contenedores»)
    piezas: [
      { icono: "gpu", texto: "Granja de GPU · IA", corto: "GPU · IA" },
      { icono: "plataforma", texto: "Plataforma en clúster", corto: "Clúster" },
    ],
  },
  nube: {
    titulo: "Nube del cliente",
    sub: "AWS · Azure · Google Cloud",
    subLineas: ["AWS · Azure", "Google Cloud"],
    // ubicaciones-y-agente-remoto
    piezas: [
      { icono: "agente", texto: "Agente ARS · solo salida HTTPS", corto: "Agente ARS" },
    ],
    nota: "Sin puertos abiertos ni VPN",
    notaCorta: "Solo HTTPS",
  },
  sede: {
    titulo: "Sede del cliente",
    sub: "Lo que se vigila",
    piezas: [
      { icono: "camaras", texto: "Cámaras" },
      { icono: "biometricos", texto: "Biométricos" },
      { icono: "sensores", texto: "Sensores" },
      { icono: "vigilantes", texto: "Vigilantes" },
    ],
  },
  onprem: {
    // equipo-on-premise
    titulo: "Equipo on premise",
    sub: "Analítica en el borde",
    nota: "Solo telemetría de salud sale a la consola",
    notaCorta: "Solo sale la salud",
  },
  insignias: { datos: "Datos", ia: "IA" },
} as const;

export interface ConfigModo {
  /** Lugares encendidos (la consola y la sede siempre lo están). */
  activos: SitioId[];
  /** Dónde viven los datos. */
  datos: SitioId[];
  /** Dónde corre la IA / la analítica. */
  ia: SitioId[];
  flujos: FlujoId[];
  aria: string;
}

const CONTROL =
  "La consola única ARS ve y administra todo: monitor, DevOps, respaldos y alertas.";

export const MODOS: Record<ModoDespliegue, ConfigModo> = {
  ars: {
    activos: ["consola", "sede", "dc"],
    datos: ["dc"],
    ia: ["dc"],
    flujos: ["f-sede-dc", "c-dc"],
    aria:
      "Mapa de despliegue en la nube propia de ARS: las cámaras, biométricos, sensores y vigilantes de la sede envían la información al centro de datos ARS en Colombia, donde se guardan los datos y la granja de GPU procesa la analítica y la IA. " +
      CONTROL,
  },
  cliente: {
    activos: ["consola", "sede", "nube"],
    datos: ["nube"],
    ia: ["nube"],
    flujos: ["f-sede-nube", "c-nube"],
    aria:
      "Mapa de despliegue en la nube del cliente (AWS, Azure o Google Cloud): la información de la sede se guarda y se procesa en la nube del propio cliente, y un agente ARS la conecta a la consola solo con conexiones salientes por HTTPS, sin abrir puertos ni usar VPN. " +
      CONTROL,
  },
  sede: {
    activos: ["consola", "sede", "onprem"],
    datos: ["onprem"],
    ia: ["onprem"],
    flujos: ["f-sede-onprem", "c-onprem"],
    aria:
      "Mapa de despliegue on premise: todo queda en el equipo que ARS deja dentro del edificio del cliente; el video se analiza en el borde, cerca de las cámaras, y hacia la consola solo sale la telemetría de salud del equipo. " +
      CONTROL,
  },
  hibrida: {
    activos: ["consola", "sede", "dc", "nube", "onprem"],
    datos: ["dc", "nube"],
    ia: ["dc", "onprem"],
    flujos: ["f-sede-dc", "f-sede-onprem", "f-dc-nube", "f-nube-dc", "c-dc", "c-nube", "c-onprem"],
    aria:
      "Mapa de despliegue híbrido: la información se reparte entre el centro de datos ARS en Colombia y la nube del cliente, que se sincronizan; la IA corre en la granja de GPU de ARS y la analítica de video en el equipo on premise de la sede. " +
      CONTROL,
  },
};
