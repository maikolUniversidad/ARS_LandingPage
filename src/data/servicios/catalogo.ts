/**
 * PROVISIONAL: un área de muestra. Se reemplaza por el catálogo completo
 * (10 áreas, 69 módulos) generado desde el inventario del 4-nov-2026.
 */
import type { Area, Pilar } from "./tipos";

export const AREAS: Area[] = [
  {
    id: "monitoreo-inteligente",
    letra: "D",
    nombre: "Monitoreo inteligente",
    corto: "Monitoreo",
    frase: "Sus cámaras, convertidas en alertas con foto, video y ubicación",
    descripcion: "Visión artificial, acceso inteligente, IoT y el modelo 3D de cada sede.",
    esencia: "Las cámaras que ya tiene empiezan a avisar, y cada sede se vuelve un edificio que se entiende de un vistazo.",
    color: "#5fd8ff",
    escena: "edificio",
    icono: "Cctv",
    modulos: [
      {
        id: "vision-artificial",
        ficha: 8,
        nombre: "Visión artificial",
        frase: "Sus cámaras, convertidas en alertas con foto, video y ubicación",
        resumen: "Muro de video en vivo con la cola de alertas de IA lista para atender.",
        innovacion: "Usa los grabadores que ya existen.",
        funciones: [{ titulo: "Muro de video", detalle: "Cámaras en vivo con conteo de cámaras en línea." }],
        estado: "vivo",
        roles: ["Central de monitoreo"],
        canales: ["Web"],
        capturas: [],
        palabrasClave: ["cámaras", "CCTV", "video"],
        foco: "camaras",
      },
    ],
  },
];

export const PILARES: Pilar[] = [
  { titulo: "Multiempresa de verdad", detalle: "Cada empresa con sus clientes, sedes, roles y plan.", icono: "Building2" },
];
