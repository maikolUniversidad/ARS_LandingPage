/**
 * Contrato de datos de la sección /servicios (catálogo completo de ARS).
 *
 * Fuente: inventario de servicios del 4-nov-2026 (69 fichas en 10 áreas).
 * Solo contenido publicable: nada de las «Notas internas — NO publicar».
 *
 * Lo consumen:
 *  - las páginas /servicios y /servicios/[area]
 *  - las escenas 3D (por `escena` y los `foco` de cada módulo)
 *  - el asistente «Ars» (catálogo compacto en su prompt + herramienta mostrar_servicio)
 */

/** Estado público del módulo (mapea las marcas del inventario). */
export type EstadoModulo =
  /** ✅ vivo en producción → se muestra como funcionalidad */
  | "vivo"
  /** 🧪 funciona, en piloto → se muestra con la etiqueta «En piloto» */
  | "piloto"
  /** 🛠️ construido, sin activar → «Próximamente» */
  | "proximamente"
  /** 🔜 no existe → «Hoja de ruta» (sin fecha) */
  | "hoja-de-ruta";

/** Escenas 3D disponibles. Cada área usa una; un área puede compartir escena. */
export type EscenaId =
  | "campo" // A · operación en campo: puesto, vigilante, ruta de ronda con puntos QR, portería
  | "centro" // B · centro de operaciones: mapa-ciudad holográfico con sedes, zonas y recorridos GPS
  | "comunicacion" // C · comunicación: ondas de radio PTT entre torres/teléfonos, botón de pánico
  | "edificio" // D · monitoreo: EDIFICIO INTELIGENTE por pisos, cámaras, sensores IoT, puertas faciales
  | "inmersiva" // E · realidad virtual: Central Viva (sala circular con tableros) y gafas
  | "humana" // F · gestión humana: árbol documental 3D, expedientes que se ordenan solos
  | "formacion" // G · formación: aula holográfica, módulos de curso, certificado con QR
  | "finanzas" // H · finanzas y ERP: flujo de datos entre bloques (turnos → nómina → contabilidad → ERP)
  | "productividad" // I · productividad e IA: red neuronal/grafo de tareas y automatizaciones
  | "gobierno"; // J · gobierno: torre de control, escudo, capas de permisos y canales (web, Android, PWA, escritorio, gafas)

export type Captura = {
  /** Ruta pública, p. ej. "/servicios/capturas/40-sala-de-control.jpg" */
  src: string;
  alt: string;
  /** Pie de foto corto, qué se ve. */
  pie: string;
  ancho: number;
  alto: number;
};

export type Clip = {
  /** Ruta pública del MP4, p. ej. "/servicios/clips/clip-sala-de-control.mp4" */
  mp4: string;
  /** Póster JPG (primer cuadro). */
  poster: string;
  titulo: string;
  descripcion: string;
};

export type Funcion = {
  titulo: string;
  detalle: string;
  /** 🆕 en el inventario (nuevo o muy ampliado). Se puede mostrar como «Nuevo». */
  nuevo?: boolean;
};

export type Modulo = {
  /** kebab-case, único en TODO el catálogo (se usa como ancla: /servicios/<area>#<id>). */
  id: string;
  /** Número de ficha dentro del archivo de detalle (para trazabilidad). */
  ficha: number;
  nombre: string;
  /** Frase de venta (una línea). */
  frase: string;
  /** 2–4 frases: qué resuelve y cómo, en tono comercial y honesto. */
  resumen: string;
  /** La esencia de la innovación: qué hace distinto a ARS aquí (1–2 frases). */
  innovacion: string;
  funciones: Funcion[];
  estado: EstadoModulo;
  /** Matiz del estado si hace falta, p. ej. "Relojes biométricos en piloto". */
  notaEstado?: string;
  roles: string[];
  /** Canales: "Web", "App Android", "PWA", "Escritorio", "Gafas VR". */
  canales: string[];
  capturas: Captura[];
  clip?: Clip;
  /** Términos con los que la gente lo busca (para el asistente): "ZKTeco", "facial", "nómina"... */
  palabrasClave: string[];
  /**
   * Punto de la escena 3D del área al que vuela la cámara cuando el módulo está en foco.
   * Debe ser una de las claves que expone la escena (ver FOCOS_ESCENA en escenas/contrato.ts).
   */
  foco: string;
};

export type Cifra = { valor: string; etiqueta: string };

export type Area = {
  /** slug de la URL: /servicios/<id> */
  id: string;
  /** Letra del inventario (A–J). */
  letra: string;
  nombre: string;
  /** Nombre corto para menús. */
  corto: string;
  /** Frase de venta del área. */
  frase: string;
  descripcion: string;
  /** Párrafo de «esencia de la innovación» del área (lo que solo ARS hace así). */
  esencia: string;
  /** Color de acento (hex) para escena, halos y detalles. */
  color: string;
  escena: EscenaId;
  /** Imagen de arte generada para el hero/tarjeta, si existe. */
  arte?: string;
  /** Pista de ambiente (MP3) del área, si existe. */
  ambiente?: string;
  /** Icono lucide-react (nombre del export, p. ej. "Radio"). */
  icono: string;
  modulos: Modulo[];
};

/** Franja transversal «Por qué ARS». */
export type Pilar = { titulo: string; detalle: string; icono: string };
