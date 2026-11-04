/**
 * Catálogo de analíticas de video del módulo de Visión (45 analíticas, 4 familias).
 *
 * GENERADO desde las escenas de la presentación «Analíticas en 3D · Vigías»
 * (public/analiticas-3d/escenas.js, escenas2.js y evidencia-publica.js).
 * No editar a mano: `node scripts/generar-analiticas.cjs public/analiticas-3d salida.json` y volcar el JSON acá.
 *
 * - `fases`: la secuencia que recorre la simulación 3D (segundo, estado, texto).
 * - `video`: evidencia real pública (CCTV MEVA CC BY 4.0, Pexels, Mixkit o
 *   laboratorio propio) procesada por los modelos de Vigías. Si falta, la
 *   analítica se muestra solo con su simulación.
 * - `estado`: madurez declarada por el equipo de Visión; se muestra tal cual.
 */

export type EstadoSim = "vigila" | "detecta" | "alerta" | "ok";

export type FamiliaId = "comercial" | "operativo" | "prevencion" | "lite";

export type Familia = {
  id: FamiliaId;
  nombre: string;
  descripcion: string;
  /** Nombre del color en la presentación original (oro, azul, rojo, verde). */
  color: "oro" | "azul" | "rojo" | "verde";
};

export type Fase = { t: number; estado: EstadoSim; texto: string };

export type Evidencia = {
  /** Video real (mp4). Ausente cuando la evidencia es una imagen. */
  src?: string;
  poster?: string;
  /** Imagen real en lugar de video. */
  img?: string;
  /** Procedencia de la evidencia, tal como la declara el equipo. */
  chapa: string;
};

export type Analitica = {
  id: string;
  familia: FamiliaId;
  nombre: string;
  corta: string;
  desc: string;
  estado: string | null;
  /** Duración del ciclo de la simulación, en segundos. */
  dur: number;
  fases: Fase[];
  video: Evidencia | null;
};

export const familias: Familia[] = [
  {
    "id": "comercial",
    "nombre": "Comercial y comportamental",
    "descripcion": "Quién entra, qué mira y cuánto se queda. Las cifras con las que se decide la tienda.",
    "color": "oro"
  },
  {
    "id": "operativo",
    "nombre": "Operativo y de eficiencia",
    "descripcion": "Filas, aforo, parqueadero, personal y piso limpio: la operación del día, medida sola.",
    "color": "azul"
  },
  {
    "id": "prevencion",
    "nombre": "Prevención y riesgo",
    "descripcion": "Lo que tiene que avisar en el acto: intrusos, armas, caídas, peleas, fuego y hurto.",
    "color": "rojo"
  },
  {
    "id": "lite",
    "nombre": "Modelos lite · bajo costo",
    "descripcion": "Analíticas livianas sobre una sola cámara: góndolas, bodega, puertas, autopago.",
    "color": "verde"
  }
];

export const analiticas: Analitica[] = [
  {
    "id": "seguimiento",
    "familia": "comercial",
    "nombre": "Seguimiento de personas",
    "corta": "Cada persona conserva su número mientras está.",
    "desc": "Quien entra recibe un número y lo conserva hasta que se va, aunque se cruce con otra persona o pase a otra cámara. Es la base de todas las demás.",
    "estado": "en validación",
    "dur": 16,
    "fases": [
      {
        "t": 0,
        "estado": "vigila",
        "texto": "Cada persona que entra recibe un número"
      },
      {
        "t": 6,
        "estado": "detecta",
        "texto": "Dos se cruzan y se tapan: el número no se intercambia"
      },
      {
        "t": 11,
        "estado": "ok",
        "texto": "Sale de cuadro, vuelve y recupera su número"
      }
    ],
    "video": {
      "src": "/analiticas-3d/evidencia-publica/seguimiento.mp4",
      "poster": "/analiticas-3d/evidencia-publica/seguimiento-poster.jpg",
      "chapa": "CCTV real · tracker real"
    }
  },
  {
    "id": "conteo",
    "familia": "comercial",
    "nombre": "Conteo de personas",
    "corta": "Cuenta quién entra y quién sale por la puerta.",
    "desc": "Una línea en la puerta cuenta cada cruce y su sentido. Con eso salen las visitas por hora, el pico del día y cuántas personas hay adentro en cada momento.",
    "estado": null,
    "dur": 16,
    "fases": [
      {
        "t": 0,
        "estado": "vigila",
        "texto": "La línea de la puerta espera el primer cruce"
      },
      {
        "t": 3.4,
        "estado": "detecta",
        "texto": "Cruza hacia adentro: suma una entrada"
      },
      {
        "t": 9.4,
        "estado": "ok",
        "texto": "Cruza hacia afuera: suma una salida y ajusta el aforo"
      }
    ],
    "video": {
      "src": "/analiticas-3d/evidencia-publica/conteo.mp4",
      "poster": "/analiticas-3d/evidencia-publica/conteo-poster.jpg",
      "chapa": "video público · modelo real"
    }
  },
  {
    "id": "demografia",
    "familia": "comercial",
    "nombre": "Demografía",
    "corta": "Rango de edad y género de quien visita.",
    "desc": "Estima el rango de edad y el género de cada visitante al entrar, sin guardar caras ni nombres. Sirve para saber a quién le está vendiendo cada hora.",
    "estado": null,
    "dur": 15,
    "fases": [
      {
        "t": 0,
        "estado": "vigila",
        "texto": "La cámara de la entrada ve a cada visitante"
      },
      {
        "t": 3,
        "estado": "detecta",
        "texto": "Estima rango de edad y género, sin guardar la cara"
      },
      {
        "t": 9,
        "estado": "ok",
        "texto": "Arma el perfil de quién visita, hora por hora"
      }
    ],
    "video": null
  },
  {
    "id": "calor",
    "familia": "comercial",
    "nombre": "Mapa de calor",
    "corta": "Dónde se detiene la gente y cuánto rato.",
    "desc": "Acumula sobre el plano del local dónde pasa la gente y dónde se queda. Muestra qué exhibición atrae, qué pasillo nadie recorre y cómo cambia por hora.",
    "estado": null,
    "dur": 18,
    "fases": [
      {
        "t": 0,
        "estado": "vigila",
        "texto": "Cada paso de cada persona se suma al plano"
      },
      {
        "t": 6,
        "estado": "detecta",
        "texto": "Las zonas donde se detienen se encienden"
      },
      {
        "t": 12,
        "estado": "ok",
        "texto": "Queda a la vista qué atrae y qué nadie visita"
      }
    ],
    "video": {
      "src": "/analiticas-3d/evidencia-publica/calor.mp4",
      "poster": "/analiticas-3d/evidencia-publica/calor-poster.jpg",
      "chapa": "CCTV real · modelo real"
    }
  },
  {
    "id": "permanencia",
    "familia": "comercial",
    "nombre": "Tiempo de permanencia",
    "corta": "Cuánto se queda cada persona frente a cada zona.",
    "desc": "Mide cuánto tiempo pasa cada persona en una zona: frente a una góndola, en una exhibición o en una mesa. Separa a quien pasa de largo de quien se detiene a decidir.",
    "estado": null,
    "dur": 16,
    "fases": [
      {
        "t": 0,
        "estado": "vigila",
        "texto": "Se dibuja la zona frente a la exhibición"
      },
      {
        "t": 3.5,
        "estado": "detecta",
        "texto": "Una persona se detiene y el reloj empieza a correr"
      },
      {
        "t": 10,
        "estado": "ok",
        "texto": "Pasa de 3 minutos: cuenta como interés real"
      }
    ],
    "video": {
      "src": "/analiticas-3d/evidencia-publica/permanencia.mp4",
      "poster": "/analiticas-3d/evidencia-publica/permanencia-poster.jpg",
      "chapa": "CCTV real · modelo real"
    }
  },
  {
    "id": "cruce",
    "familia": "comercial",
    "nombre": "Cruce de líneas",
    "corta": "Cuenta pasos por un punto y en qué sentido.",
    "desc": "Una línea dibujada sobre la cámara cuenta cada cruce y su sentido. Sirve para medir flujo entre zonas o para avisar cuando alguien pasa por donde no debe.",
    "estado": null,
    "dur": 15,
    "fases": [
      {
        "t": 0,
        "estado": "vigila",
        "texto": "Se traza la línea y el sentido permitido"
      },
      {
        "t": 3,
        "estado": "detecta",
        "texto": "Cada cruce en el sentido normal suma al flujo"
      },
      {
        "t": 9.5,
        "estado": "alerta",
        "texto": "Alguien cruza en el sentido prohibido: aviso"
      }
    ],
    "video": {
      "src": "/analiticas-3d/evidencia-publica/cruce.mp4",
      "poster": "/analiticas-3d/evidencia-publica/cruce-poster.jpg",
      "chapa": "CCTV real · modelo real"
    }
  },
  {
    "id": "comprador",
    "familia": "comercial",
    "nombre": "Comprador activo",
    "corta": "Separa a quien está comprando de quien pasa.",
    "desc": "Reconoce los gestos de compra: detenerse, recorrer la góndola con la mirada, comparar marcas, tomar un producto. Marca al comprador activo para que el personal lo atienda a tiempo.",
    "estado": null,
    "dur": 17,
    "fases": [
      {
        "t": 0,
        "estado": "vigila",
        "texto": "Varias personas en el pasillo"
      },
      {
        "t": 3,
        "estado": "detecta",
        "texto": "Se detiene y recorre la góndola con la mirada, arriba y abajo, entre varias marcas"
      },
      {
        "t": 8,
        "estado": "detecta",
        "texto": "Toma un producto y lo examina"
      },
      {
        "t": 10,
        "estado": "ok",
        "texto": "Se marca como comprador activo y se avisa al asesor"
      }
    ],
    "video": null
  },
  {
    "id": "blancas",
    "familia": "operativo",
    "nombre": "Listas blancas",
    "corta": "Reconoce a quien tiene acceso y le abre.",
    "desc": "Reconoce a las personas autorizadas en un acceso y habilita el paso sin tarjeta. A quien no está en la lista no le abre y pide validación.",
    "estado": "funcionando a diario",
    "dur": 15,
    "fases": [
      {
        "t": 0,
        "estado": "vigila",
        "texto": "La cámara del acceso ve llegar a alguien"
      },
      {
        "t": 3,
        "estado": "ok",
        "texto": "Está en la lista blanca: la puerta se abre"
      },
      {
        "t": 9,
        "estado": "detecta",
        "texto": "Alguien que no está: la puerta sigue cerrada y pide validación"
      }
    ],
    "video": null
  },
  {
    "id": "filas",
    "familia": "operativo",
    "nombre": "Gestión de filas y cajas",
    "corta": "Avisa cuando la fila crece y hay que abrir otra caja.",
    "desc": "Cuenta cuántas personas hay en cada fila y cuánto llevan esperando. Cuando pasa el umbral avisa para abrir otra caja, antes de que el cliente se vaya.",
    "estado": null,
    "dur": 18,
    "fases": [
      {
        "t": 0,
        "estado": "vigila",
        "texto": "Cuenta la fila de cada caja"
      },
      {
        "t": 6,
        "estado": "alerta",
        "texto": "Cinco personas y más de 6 minutos: abrir otra caja"
      },
      {
        "t": 11,
        "estado": "ok",
        "texto": "Abre la caja 2 y la fila se reparte"
      }
    ],
    "video": null
  },
  {
    "id": "aforo",
    "familia": "operativo",
    "nombre": "Control de aforo",
    "corta": "Lleva cuántos hay adentro y avisa al llegar al límite.",
    "desc": "Suma entradas y resta salidas en todas las puertas para saber cuántas personas hay adentro. Al llegar al límite avisa para frenar el ingreso.",
    "estado": null,
    "dur": 15,
    "fases": [
      {
        "t": 0,
        "estado": "vigila",
        "texto": "Cuenta a quien entra y a quien sale"
      },
      {
        "t": 5,
        "estado": "detecta",
        "texto": "Se acerca al límite: 19 de 20"
      },
      {
        "t": 8,
        "estado": "alerta",
        "texto": "Aforo completo: aviso para frenar el ingreso"
      }
    ],
    "video": {
      "src": "/analiticas-3d/evidencia-publica/aforo.mp4",
      "poster": "/analiticas-3d/evidencia-publica/aforo-poster.jpg",
      "chapa": "CCTV real · modelo real"
    }
  },
  {
    "id": "placas",
    "familia": "operativo",
    "nombre": "Lectura de placas y parqueo",
    "corta": "Placa, tipo, color, cajón y tiempo de cada vehículo.",
    "desc": "Lee la placa al entrar y abre la barrera. Además reconoce si es carro o moto, su color y en qué cajón quedó, y cuenta cuánto lleva cada uno. Si algo lo tapa, el vehículo sigue en el registro: no se pierde ni se cuenta dos veces.",
    "estado": null,
    "dur": 22,
    "fases": [
      {
        "t": 0,
        "estado": "vigila",
        "texto": "Cada vehículo del parqueadero con su placa, tipo, color, cajón y tiempo"
      },
      {
        "t": 3.4,
        "estado": "detecta",
        "texto": "Un carro llega a la barrera: lee KTV 482 · rojo · carro"
      },
      {
        "t": 5,
        "estado": "ok",
        "texto": "Está registrado: entra a un cajón libre y empieza a contar"
      },
      {
        "t": 12.5,
        "estado": "detecta",
        "texto": "Un furgón tapa la fila de autos y motos: los recuadros se mantienen punteados"
      },
      {
        "t": 16,
        "estado": "ok",
        "texto": "Entra una moto al cajón de motos: se suma al registro"
      }
    ],
    "video": {
      "src": "/analiticas-3d/evidencia-publica/placas.mp4",
      "poster": "/analiticas-3d/evidencia-publica/placas-poster.jpg",
      "chapa": "video público · modelo real"
    }
  },
  {
    "id": "staff",
    "familia": "operativo",
    "nombre": "Detección de personal",
    "corta": "Separa al personal de los clientes en sala.",
    "desc": "Decide si quien aparece es del equipo o es un cliente, por el uniforme y sin reconocer a nadie. Así los conteos de clientes no se inflan con el personal.",
    "estado": "listo para instalar",
    "dur": 16,
    "fases": [
      {
        "t": 0,
        "estado": "vigila",
        "texto": "Ve a todas las personas del local"
      },
      {
        "t": 3,
        "estado": "detecta",
        "texto": "Mira el uniforme: personal en amarillo, clientes en azul"
      },
      {
        "t": 7,
        "estado": "ok",
        "texto": "Cuenta cuántos hay de cada uno, en todo momento"
      }
    ],
    "video": null
  },
  {
    "id": "derrames",
    "familia": "operativo",
    "nombre": "Detección de derrames",
    "corta": "Avisa cuando el piso deja de estar limpio.",
    "desc": "Cada cámara aprende cómo se ve su piso limpio. Si aparece un derrame, una mancha o basura y sigue ahí 45 segundos, avisa con el tipo y la ubicación.",
    "estado": "en validación",
    "dur": 16,
    "fases": [
      {
        "t": 0,
        "estado": "vigila",
        "texto": "El piso limpio es la referencia"
      },
      {
        "t": 2.4,
        "estado": "detecta",
        "texto": "Cae un envase y aparece un charco: empieza la espera"
      },
      {
        "t": 6.5,
        "estado": "alerta",
        "texto": "Sigue ahí: aviso de derrame con su foto"
      },
      {
        "t": 12,
        "estado": "ok",
        "texto": "Lo limpian y el evento se cierra solo"
      }
    ],
    "video": {
      "poster": "/analiticas-3d/evidencia-publica/piso-alerta.jpg",
      "img": "/analiticas-3d/evidencia-publica/piso-alerta.jpg",
      "chapa": "laboratorio propio"
    }
  },
  {
    "id": "guardian",
    "familia": "operativo",
    "nombre": "Guardián de puestos",
    "corta": "Vigila que el puesto lo atienda la misma persona.",
    "desc": "Avisa cuando alguien distinto ocupa un puesto con la sesión de otro, cuando la misma persona figura en dos puestos o cuando un puesto queda abierto sin nadie.",
    "estado": "en validación",
    "dur": 16,
    "fases": [
      {
        "t": 0,
        "estado": "vigila",
        "texto": "Cada puesto con su titular y su sesión"
      },
      {
        "t": 4,
        "estado": "detecta",
        "texto": "El titular se levanta: el puesto queda en espera"
      },
      {
        "t": 8,
        "estado": "alerta",
        "texto": "Otra persona se sienta con la sesión abierta: aviso de relevo"
      }
    ],
    "video": {
      "src": "/analiticas-3d/evidencia-publica/guardian.mp4",
      "poster": "/analiticas-3d/evidencia-publica/guardian-poster.jpg",
      "chapa": "CCTV real · modelo real"
    }
  },
  {
    "id": "negras",
    "familia": "prevencion",
    "nombre": "Listas negras",
    "corta": "Avisa en el acto si entra alguien de una lista.",
    "desc": "Compara cada rostro del acceso con una lista corta y avisa al puesto de monitoreo con la foto y el video ya guardados. Solo en accesos.",
    "estado": "funcionando a diario",
    "dur": 14,
    "fases": [
      {
        "t": 0,
        "estado": "vigila",
        "texto": "Cada rostro del acceso se compara con la lista"
      },
      {
        "t": 4,
        "estado": "alerta",
        "texto": "Coincidencia con la lista negra: aviso inmediato"
      },
      {
        "t": 8,
        "estado": "detecta",
        "texto": "Se sigue a la persona dentro del local"
      }
    ],
    "video": null
  },
  {
    "id": "merodeo",
    "familia": "prevencion",
    "nombre": "Merodeo",
    "corta": "Avisa de quien da vueltas sin entrar ni irse.",
    "desc": "Mide cuánto tiempo pasa una persona en una zona y cómo se mueve. Quien va y viene frente a una vitrina, un cajero o una puerta más de lo normal dispara el aviso.",
    "estado": null,
    "dur": 18,
    "fases": [
      {
        "t": 0,
        "estado": "vigila",
        "texto": "Se vigila la zona frente a la vitrina"
      },
      {
        "t": 5,
        "estado": "detecta",
        "texto": "Va y viene sin entrar: el reloj de permanencia corre"
      },
      {
        "t": 11,
        "estado": "alerta",
        "texto": "Pasa el umbral de merodeo: aviso con su recorrido"
      }
    ],
    "video": null
  },
  {
    "id": "intrusion",
    "familia": "prevencion",
    "nombre": "Intrusión",
    "corta": "La alarma suena distinto según cuánto se acercan.",
    "desc": "La zona prohibida se dibuja sobre la cámara en tres franjas. El sistema mide qué tan adentro está la persona y el sonido cambia con ella: el operador entiende la gravedad sin mirar.",
    "estado": "funcionando a diario",
    "dur": 15,
    "fases": [
      {
        "t": 0,
        "estado": "vigila",
        "texto": "El perímetro tiene tres franjas dibujadas"
      },
      {
        "t": 3.5,
        "estado": "detecta",
        "texto": "Toca el borde: nivel 1, dos pitidos"
      },
      {
        "t": 6,
        "estado": "alerta",
        "texto": "Avanza: nivel 2, sirena breve"
      },
      {
        "t": 8.5,
        "estado": "alerta",
        "texto": "Está adentro: nivel 3, sirena continua"
      }
    ],
    "video": {
      "src": "/analiticas-3d/evidencia-publica/intrusion.mp4",
      "poster": "/analiticas-3d/evidencia-publica/intrusion-poster.jpg",
      "chapa": "CCTV real · modelo real"
    }
  },
  {
    "id": "acceso",
    "familia": "prevencion",
    "nombre": "Acceso no autorizado",
    "corta": "Avisa cuando alguien que no es del equipo cruza a una zona interna.",
    "desc": "Combina la puerta de una zona interna con el reconocimiento de personal: el equipo pasa sin aviso, y si cruza alguien que no lo es, avisa al instante.",
    "estado": null,
    "dur": 15,
    "fases": [
      {
        "t": 0,
        "estado": "vigila",
        "texto": "La puerta de bodega solo es para el personal"
      },
      {
        "t": 3,
        "estado": "ok",
        "texto": "Pasa alguien con uniforme: sin aviso"
      },
      {
        "t": 8.4,
        "estado": "alerta",
        "texto": "Cruza un cliente: aviso de acceso no autorizado"
      }
    ],
    "video": null
  },
  {
    "id": "aglomeracion",
    "familia": "prevencion",
    "nombre": "Aglomeración y tumulto",
    "corta": "Avisa cuando se junta demasiada gente en un punto.",
    "desc": "Mide la densidad de personas por zona y qué tan rápido crece. Una concentración repentina o un tumulto disparan el aviso antes de que se salga de control.",
    "estado": null,
    "dur": 15,
    "fases": [
      {
        "t": 0,
        "estado": "vigila",
        "texto": "Densidad normal en la zona"
      },
      {
        "t": 4,
        "estado": "detecta",
        "texto": "La gente converge rápido hacia un punto"
      },
      {
        "t": 8,
        "estado": "alerta",
        "texto": "Pasa de 2 personas por m²: aviso de aglomeración"
      }
    ],
    "video": {
      "src": "/analiticas-3d/evidencia-publica/aglomeracion.mp4",
      "poster": "/analiticas-3d/evidencia-publica/aglomeracion-poster.jpg",
      "chapa": "CCTV real · modelo real"
    }
  },
  {
    "id": "epp",
    "familia": "prevencion",
    "nombre": "Equipo de protección (EPP)",
    "corta": "Avisa si alguien trabaja sin casco o chaleco.",
    "desc": "Revisa casco, chaleco y overol según la regla de cada zona, y emite un aviso por persona y no uno por imagen. Si no ve bien, no opina.",
    "estado": "con evidencia",
    "dur": 15,
    "fases": [
      {
        "t": 0,
        "estado": "vigila",
        "texto": "En esta zona se exige casco y chaleco"
      },
      {
        "t": 4,
        "estado": "ok",
        "texto": "Trabajador con casco y chaleco: en verde"
      },
      {
        "t": 7.5,
        "estado": "alerta",
        "texto": "Otro entra sin casco: aviso por esa persona"
      }
    ],
    "video": {
      "src": "/analiticas-3d/evidencia-publica/epp.mp4",
      "poster": "/analiticas-3d/evidencia-publica/epp-poster.jpg",
      "chapa": "video público · modelo real"
    }
  },
  {
    "id": "caidas",
    "familia": "prevencion",
    "nombre": "Detección de caídas",
    "corta": "Avisa cuando una persona cae y no se levanta.",
    "desc": "Sigue la postura de cada persona. Si cae y se queda en el piso más de unos segundos, avisa con la ubicación para que alguien acuda.",
    "estado": null,
    "dur": 15,
    "fases": [
      {
        "t": 0,
        "estado": "vigila",
        "texto": "Sigue la postura de quien camina"
      },
      {
        "t": 4.2,
        "estado": "detecta",
        "texto": "Pasa de vertical a horizontal: posible caída"
      },
      {
        "t": 8,
        "estado": "alerta",
        "texto": "No se levanta: aviso para que alguien acuda"
      }
    ],
    "video": null
  },
  {
    "id": "hurto",
    "familia": "prevencion",
    "nombre": "Hurto",
    "corta": "Distingue un hurto de una compra normal, y avisa.",
    "desc": "Lee la postura y los gestos de las manos de cada persona y les pone una puntuación. Mirar a los lados, tomar productos pequeños y llevarlos a la ropa en vez de a la canasta la hace subir; cuando cruza el umbral, avisa en el momento.",
    "estado": "en desarrollo",
    "dur": 20,
    "fases": [
      {
        "t": 0,
        "estado": "vigila",
        "texto": "Llega a la góndola de productos pequeños: perfumes y cuchillas"
      },
      {
        "t": 3,
        "estado": "detecta",
        "texto": "Mira a los lados antes de tomar nada"
      },
      {
        "t": 5.2,
        "estado": "detecta",
        "texto": "Toma un producto, abre la chaqueta con la otra mano y lo guarda adentro"
      },
      {
        "t": 10.6,
        "estado": "alerta",
        "texto": "Segundo producto a la chaqueta: la puntuación cruza el umbral y avisa"
      }
    ],
    "video": {
      "src": "/analiticas-3d/evidencia-publica/hurto-vivo.mp4",
      "poster": "/analiticas-3d/evidencia-publica/hurto-vivo-poster.jpg",
      "chapa": "prueba en laboratorio propio"
    }
  },
  {
    "id": "ocultaProd",
    "familia": "prevencion",
    "nombre": "Ocultamiento de producto",
    "corta": "Ve cuando un producto se esconde en la ropa.",
    "desc": "Sigue el producto desde que sale de la góndola. Si desaparece dentro de la ropa o de un bolso en vez de ir al carro o a la canasta, abre un caso.",
    "estado": null,
    "dur": 15,
    "fases": [
      {
        "t": 0,
        "estado": "vigila",
        "texto": "Sigue cada producto que sale de la góndola"
      },
      {
        "t": 3.6,
        "estado": "detecta",
        "texto": "El producto va a la mano"
      },
      {
        "t": 7.4,
        "estado": "alerta",
        "texto": "Desaparece bajo la chaqueta: «manipulación sospechosa · esconde»"
      }
    ],
    "video": null
  },
  {
    "id": "armas",
    "familia": "prevencion",
    "nombre": "Armas de fuego",
    "corta": "Detecta un arma de fuego en menos de medio segundo.",
    "desc": "Pistolas y armas largas, llevadas por alguien o dejadas sobre un mostrador. Toda alerta pide verificación humana; nunca confunde un teléfono con un arma.",
    "estado": "en validación",
    "dur": 13,
    "fases": [
      {
        "t": 0,
        "estado": "vigila",
        "texto": "Vigila manos y objetos en la escena"
      },
      {
        "t": 4,
        "estado": "detecta",
        "texto": "Aparece un arma: espera varios cuadros seguidos"
      },
      {
        "t": 4.3,
        "estado": "alerta",
        "texto": "Confirmada en 0,3 s: «arma de fuego · portada»"
      }
    ],
    "video": {
      "src": "/analiticas-3d/evidencia-publica/armas.mp4",
      "poster": "/analiticas-3d/evidencia-publica/armas-poster.jpg",
      "chapa": "video de banco · modelo real"
    }
  },
  {
    "id": "blancas2",
    "familia": "prevencion",
    "nombre": "Armas blancas",
    "corta": "Cuchillos, machetes y objetos cortantes.",
    "desc": "Cuando un cuchillo, una daga o un machete aparece y se sostiene unos fotogramas, salta la alarma en un tercio de segundo. Además sigue el comportamiento previo: mirar a todos lados y llevarse la mano a la cintura.",
    "estado": "en validación",
    "dur": 15,
    "fases": [
      {
        "t": 0,
        "estado": "vigila",
        "texto": "Entra a la recepción y se detiene"
      },
      {
        "t": 2.6,
        "estado": "detecta",
        "texto": "Mira a todos lados, nervioso, y se lleva la mano a la cintura"
      },
      {
        "t": 6.6,
        "estado": "detecta",
        "texto": "Saca un objeto cortante de entre la ropa"
      },
      {
        "t": 7,
        "estado": "alerta",
        "texto": "Confirmado «cuchillo» en la mano: aviso para verificar"
      }
    ],
    "video": {
      "src": "/analiticas-3d/evidencia-publica/blancas-vivo.mp4",
      "poster": "/analiticas-3d/evidencia-publica/blancas-vivo-poster.jpg",
      "chapa": "laboratorio propio"
    }
  },
  {
    "id": "peleas",
    "familia": "prevencion",
    "nombre": "Peleas",
    "corta": "Avisa cuando dos personas empiezan a pelear.",
    "desc": "Reconoce los movimientos bruscos y repetidos entre dos o más personas: empujones, golpes y caídas. Avisa al puesto de monitoreo mientras está pasando.",
    "estado": null,
    "dur": 16,
    "fases": [
      {
        "t": 0,
        "estado": "vigila",
        "texto": "Dos personas discuten frente a frente"
      },
      {
        "t": 3.4,
        "estado": "detecta",
        "texto": "Empujón: uno retrocede de golpe"
      },
      {
        "t": 5,
        "estado": "alerta",
        "texto": "Golpes repetidos entre los dos: aviso de pelea"
      },
      {
        "t": 10.4,
        "estado": "alerta",
        "texto": "Uno cae al piso: el aviso sube de prioridad"
      }
    ],
    "video": null
  },
  {
    "id": "fuego",
    "familia": "prevencion",
    "nombre": "Humo y fuego",
    "corta": "Avisa de un incendio cuando todavía es una llama chica.",
    "desc": "Busca humo y fuego en la imagen, sin sensores nuevos. En el video, la alarma de humo saltó a los 2 segundos, con la columna todavía subiendo sobre la calle: ese margen es el que importa.",
    "estado": "en validación",
    "dur": 20,
    "fases": [
      {
        "t": 0,
        "estado": "vigila",
        "texto": "Bodega en calma"
      },
      {
        "t": 2.5,
        "estado": "detecta",
        "texto": "Una chispa prende el cartón: llama pequeña y humo claro"
      },
      {
        "t": 5,
        "estado": "alerta",
        "texto": "Humo + fuego confirmados: aviso con 87 s de margen"
      },
      {
        "t": 11,
        "estado": "alerta",
        "texto": "El humo choca con el techo y baja en capa: la cámara empieza a perder la imagen"
      }
    ],
    "video": {
      "src": "/analiticas-3d/evidencia-publica/fuego.mp4",
      "poster": "/analiticas-3d/evidencia-publica/fuego-poster.jpg",
      "chapa": "video público · modelo real"
    }
  },
  {
    "id": "abandono",
    "familia": "prevencion",
    "nombre": "Abandono de objetos",
    "corta": "Avisa del objeto que alguien deja y se va.",
    "desc": "Asocia cada objeto con quien lo traía. Si la persona se aleja y el objeto se queda solo más del tiempo fijado, avisa con la imagen de quién lo dejó: sirve para objetos perdidos y para bultos sospechosos.",
    "estado": null,
    "dur": 16,
    "fases": [
      {
        "t": 0,
        "estado": "vigila",
        "texto": "Una persona lee en la mesa con su maleta y su celular"
      },
      {
        "t": 3,
        "estado": "detecta",
        "texto": "Toma la maleta y se va; el celular se queda en la mesa"
      },
      {
        "t": 6,
        "estado": "detecta",
        "texto": "Ya nadie está cerca: empieza la cuenta de 5 segundos"
      },
      {
        "t": 11,
        "estado": "alerta",
        "texto": "Pasan 5 s: «objeto perdido · celular»"
      }
    ],
    "video": null
  },
  {
    "id": "rostro",
    "familia": "prevencion",
    "nombre": "Ocultamiento de rostro",
    "corta": "Avisa de quien entra con la cara cubierta.",
    "desc": "Detecta caras tapadas con capucha, casco o pasamontañas en los accesos. Es una señal temprana: quien entra así a un local suele no querer ser visto.",
    "estado": null,
    "dur": 13,
    "fases": [
      {
        "t": 0,
        "estado": "vigila",
        "texto": "La cámara de la entrada busca el rostro"
      },
      {
        "t": 3.6,
        "estado": "detecta",
        "texto": "El rostro no se ve: está cubierto"
      },
      {
        "t": 5.4,
        "estado": "alerta",
        "texto": "Casco puesto dentro del local: aviso en el acceso"
      }
    ],
    "video": null
  },
  {
    "id": "activos",
    "familia": "prevencion",
    "nombre": "Retiro de activos",
    "corta": "Cada equipo tiene su sitio, y avisa cuando sale de él.",
    "desc": "Vigila que cada equipo siga en su lugar. Una línea separa el lado del personal del lado del público. Si alguien estira la mano por encima y se lleva el equipo, verifica en ámbar y avisa en rojo, con el video desde 15 segundos antes.",
    "estado": "funcionando en silencio",
    "dur": 16,
    "fases": [
      {
        "t": 0,
        "estado": "ok",
        "texto": "El celular y el monitor vigilados, en verde; la línea magenta separa personal y público"
      },
      {
        "t": 4.2,
        "estado": "detecta",
        "texto": "Alguien del lado del público estira la mano por encima de la línea"
      },
      {
        "t": 5.6,
        "estado": "detecta",
        "texto": "El celular deja de verse: ámbar, verificando retiro"
      },
      {
        "t": 7.6,
        "estado": "alerta",
        "texto": "Sigue sin estar: «activo retirado · celular», con video"
      }
    ],
    "video": null
  },
  {
    "id": "fleje",
    "familia": "lite",
    "nombre": "Verificación de etiqueta",
    "corta": "Revisa que cada producto tenga su fleje y su precio.",
    "desc": "Lee los flejes del borde de la góndola y los cruza con el producto que hay encima. Avisa del fleje que falta, del que no corresponde y del precio que no coincide.",
    "estado": null,
    "dur": 14,
    "fases": [
      {
        "t": 0,
        "estado": "vigila",
        "texto": "Lee cada fleje del borde de la góndola"
      },
      {
        "t": 4,
        "estado": "ok",
        "texto": "Producto y fleje coinciden: en verde"
      },
      {
        "t": 8,
        "estado": "alerta",
        "texto": "Fleje faltante y precio que no coincide: aviso para corregir"
      }
    ],
    "video": null
  },
  {
    "id": "canastillas",
    "familia": "lite",
    "nombre": "Inventario de canastillas y cajas",
    "corta": "Cuenta canastillas y cajas sin que nadie las cuente.",
    "desc": "Cuenta las canastillas, gaveras o cajas apiladas en una zona y lleva el inventario solo. Avisa cuando bajan del mínimo o cuando salen sin registro.",
    "estado": null,
    "dur": 14,
    "fases": [
      {
        "t": 0,
        "estado": "vigila",
        "texto": "Cuenta las canastillas de cada pila"
      },
      {
        "t": 5,
        "estado": "detecta",
        "texto": "Se retiran 3 canastillas: el conteo baja solo"
      },
      {
        "t": 9,
        "estado": "alerta",
        "texto": "Quedan menos del mínimo: aviso para reponer"
      }
    ],
    "video": null
  },
  {
    "id": "puertas",
    "familia": "lite",
    "nombre": "Puertas abiertas o cerradas",
    "corta": "Vigila la puerta de entrada y las neveras: cuál está abierta y desde cuándo.",
    "desc": "Sabe si cada puerta está abierta o cerrada: la de entrada de la tienda (apertura, cierre y horario), las neveras, cuartos fríos, bodegas o salidas de emergencia. Avisa cuando una se queda abierta más de lo permitido o se cierra cuando no debe.",
    "estado": null,
    "dur": 16,
    "fases": [
      {
        "t": 0,
        "estado": "ok",
        "texto": "Puerta de entrada abierta en horario; las cuatro neveras, cerradas"
      },
      {
        "t": 3,
        "estado": "detecta",
        "texto": "Abre la puerta de la nevera 2 y toma una bebida"
      },
      {
        "t": 6,
        "estado": "detecta",
        "texto": "Se va y la deja abierta: empieza a contar"
      },
      {
        "t": 10,
        "estado": "alerta",
        "texto": "Lleva abierta más de lo permitido: aviso de cadena de frío"
      }
    ],
    "video": null
  },
  {
    "id": "huecos",
    "familia": "lite",
    "nombre": "Huecos en góndola",
    "corta": "Cuánto de la góndola está surtido, en vivo.",
    "desc": "Marca los huecos de la estantería y calcula el porcentaje de disponibilidad de cada zona. Un hueco tiene que verse un minuto seguido para reportarse.",
    "estado": "en validación",
    "dur": 15,
    "fases": [
      {
        "t": 0,
        "estado": "ok",
        "texto": "Góndola surtida: disponibilidad alta"
      },
      {
        "t": 4,
        "estado": "detecta",
        "texto": "Se van abriendo huecos: candidatos en naranja"
      },
      {
        "t": 9,
        "estado": "alerta",
        "texto": "Confirmados: la disponibilidad baja y avisa para reponer"
      }
    ],
    "video": {
      "src": "/analiticas-3d/evidencia-publica/huecos.mp4",
      "poster": "/analiticas-3d/evidencia-publica/huecos-poster.jpg",
      "chapa": "video público (Pexels) · modelo real v3"
    }
  },
  {
    "id": "vencido",
    "familia": "lite",
    "nombre": "Producto vencido o por vencer",
    "corta": "Lee la fecha y avisa lo que vence pronto.",
    "desc": "Lee la fecha de vencimiento de los productos en exhibición. Marca en ámbar lo que vence en los próximos días y en rojo lo que ya venció, para retirarlo a tiempo.",
    "estado": null,
    "dur": 14,
    "fases": [
      {
        "t": 0,
        "estado": "vigila",
        "texto": "Lee la fecha de cada producto visible"
      },
      {
        "t": 4.5,
        "estado": "detecta",
        "texto": "Tres productos vencen esta semana"
      },
      {
        "t": 8.5,
        "estado": "alerta",
        "texto": "Uno ya está vencido: aviso para retirarlo"
      }
    ],
    "video": null
  },
  {
    "id": "destruccion",
    "familia": "lite",
    "nombre": "Vencimiento y destrucción",
    "corta": "Registra el producto que se bota, y cuadra la pérdida.",
    "desc": "Fija el contenedor de destrucción y sigue las manos. Cada producto que alguien bota queda registrado con su hora y su lote. Así la pérdida de mercancía deja de ser un faltante sin explicar: se sabe cuánto se destruyó y cuándo.",
    "estado": "en desarrollo",
    "dur": 15,
    "fases": [
      {
        "t": 0,
        "estado": "vigila",
        "texto": "El contenedor de destrucción y su boca quedan fijados"
      },
      {
        "t": 3,
        "estado": "detecta",
        "texto": "Toma un producto vencido del carro"
      },
      {
        "t": 5.5,
        "estado": "detecta",
        "texto": "Lo bota al contenedor: la mano entra cargada y sale vacía"
      },
      {
        "t": 6.4,
        "estado": "ok",
        "texto": "Se registra la destrucción y la tabla de pérdida suma uno: 3 → 4 de 25"
      }
    ],
    "video": {
      "src": "/analiticas-3d/evidencia-publica/destruccion.mp4",
      "poster": "/analiticas-3d/evidencia-publica/destruccion-poster.jpg",
      "chapa": "cámara de seguridad real · modelo real"
    }
  },
  {
    "id": "bodega",
    "familia": "lite",
    "nombre": "Almacenamiento en bodega",
    "corta": "Ocupación de racks y mercancía fuera de su lugar.",
    "desc": "Calcula cuánto de cada rack está ocupado y avisa de la estiba que queda en un pasillo o en una zona que no le corresponde.",
    "estado": null,
    "dur": 15,
    "fases": [
      {
        "t": 0,
        "estado": "vigila",
        "texto": "Mide la ocupación de cada rack"
      },
      {
        "t": 5,
        "estado": "detecta",
        "texto": "Una estiba queda fuera de su zona"
      },
      {
        "t": 9.5,
        "estado": "alerta",
        "texto": "Sigue en el pasillo de circulación: aviso"
      }
    ],
    "video": null
  },
  {
    "id": "racks",
    "familia": "lite",
    "nombre": "Sobrecarga en racks",
    "corta": "Avisa cuando un rack queda sobrecargado.",
    "desc": "Cajas apiladas por encima del último nivel o que sobresalen por los costados. La zona de cada rack se dibuja una vez y el sistema la vigila solo.",
    "estado": "en validación",
    "dur": 14,
    "fases": [
      {
        "t": 0,
        "estado": "ok",
        "texto": "Racks con carga en orden"
      },
      {
        "t": 4,
        "estado": "detecta",
        "texto": "Se apilan cajas encima del último nivel"
      },
      {
        "t": 7.5,
        "estado": "alerta",
        "texto": "Invaden la franja prohibida bajo el techo: aviso"
      }
    ],
    "video": null
  },
  {
    "id": "pasillos",
    "familia": "lite",
    "nombre": "Pasillos libres",
    "corta": "Avisa de lo que se queda estorbando el paso.",
    "desc": "Separa a las personas de los objetos y solo avisa de lo que se queda: cajas, carros o canastas en el suelo. Espera 30 segundos antes de confirmar.",
    "estado": "en validación",
    "dur": 16,
    "fases": [
      {
        "t": 0,
        "estado": "vigila",
        "texto": "El pasillo está libre"
      },
      {
        "t": 3.4,
        "estado": "detecta",
        "texto": "Dejan una caja: candidato con su cuenta atrás"
      },
      {
        "t": 8.4,
        "estado": "alerta",
        "texto": "Pasan 30 s: obstáculo confirmado"
      },
      {
        "t": 13,
        "estado": "ok",
        "texto": "La retiran y el evento se cierra solo"
      }
    ],
    "video": {
      "src": "/analiticas-3d/evidencia-publica/pasillos.mp4",
      "poster": "/analiticas-3d/evidencia-publica/pasillos-poster.jpg",
      "chapa": "video público · modelo real"
    }
  },
  {
    "id": "exhibicion",
    "familia": "lite",
    "nombre": "Verificación de exhibición",
    "corta": "Compara la exhibición con el planograma.",
    "desc": "Compara cómo está armada la exhibición con la foto de referencia acordada: orden, frentes y material de punto de venta. Avisa de lo que no cumple.",
    "estado": null,
    "dur": 14,
    "fases": [
      {
        "t": 0,
        "estado": "vigila",
        "texto": "Se carga el planograma acordado"
      },
      {
        "t": 4,
        "estado": "ok",
        "texto": "Frentes y orden coinciden"
      },
      {
        "t": 8,
        "estado": "alerta",
        "texto": "Un producto está fuera de su lugar y falta el aviso de precio: no cumple"
      }
    ],
    "video": null
  },
  {
    "id": "trazabilidad",
    "familia": "lite",
    "nombre": "Trazabilidad góndola–caja",
    "corta": "Cruza lo que se tomó con lo que se pagó.",
    "desc": "Sigue a la persona desde la góndola hasta la caja: cuenta los productos que tomó y los compara con los que pasaron por el registro.",
    "estado": null,
    "dur": 18,
    "fases": [
      {
        "t": 0,
        "estado": "vigila",
        "texto": "Toma productos en la góndola: se cuentan"
      },
      {
        "t": 8,
        "estado": "detecta",
        "texto": "Llega a la caja con lo que tomó"
      },
      {
        "t": 12,
        "estado": "alerta",
        "texto": "Se registran 2 de 3: aviso de diferencia"
      }
    ],
    "video": null
  },
  {
    "id": "autopago",
    "familia": "lite",
    "nombre": "Validación de autopago",
    "corta": "Verifica que todo lo que pasa por el autopago se escanee.",
    "desc": "Mira cada producto que pasa por la zona de escaneo del autopago y lo cruza con lo que registró la máquina. El que pasa sin escanear dispara el aviso.",
    "estado": null,
    "dur": 15,
    "fases": [
      {
        "t": 0,
        "estado": "vigila",
        "texto": "Cada producto que pasa por el lector se cruza con el registro"
      },
      {
        "t": 4,
        "estado": "ok",
        "texto": "Escaneados: coinciden"
      },
      {
        "t": 8.6,
        "estado": "alerta",
        "texto": "Un producto pasa por fuera del lector: aviso al supervisor"
      }
    ],
    "video": null
  },
  {
    "id": "zonaCiega",
    "familia": "lite",
    "nombre": "Zona ciega",
    "corta": "Muestra lo que ninguna cámara ve, y quién entra ahí.",
    "desc": "Arma el mapa de cobertura de todas las cámaras sobre el plano y marca los puntos ciegos. Cuando alguien entra a uno, lo sigue por estimación y avisa si tarda en reaparecer.",
    "estado": null,
    "dur": 16,
    "fases": [
      {
        "t": 0,
        "estado": "vigila",
        "texto": "Se proyecta lo que cubre cada cámara"
      },
      {
        "t": 4,
        "estado": "detecta",
        "texto": "Queda a la vista el punto que nadie ve"
      },
      {
        "t": 10,
        "estado": "alerta",
        "texto": "Alguien entra y no reaparece: aviso de zona ciega"
      }
    ],
    "video": null
  },
  {
    "id": "apertura",
    "familia": "operativo",
    "nombre": "Apertura de tienda",
    "corta": "Registra a qué hora abre cada tienda y si fue puntual.",
    "desc": "La cámara de la entrada sabe si la puerta está cerrada o abierta y a qué hora cambia. Cada mañana registra la hora real de apertura, la compara con la meta de la tienda y guarda el video del momento; si a la hora pactada sigue cerrada, avisa.",
    "estado": null,
    "dur": 16,
    "fases": [
      {
        "t": 0,
        "estado": "vigila",
        "texto": "06:55 · puerta cerrada; la meta de apertura es 07:00"
      },
      {
        "t": 3,
        "estado": "detecta",
        "texto": "Llega el encargado y abre la puerta"
      },
      {
        "t": 5.5,
        "estado": "ok",
        "texto": "Apertura registrada a las 06:58 · puntual"
      },
      {
        "t": 10,
        "estado": "ok",
        "texto": "Entran los primeros clientes: la tienda opera"
      }
    ],
    "video": null
  },
  {
    "id": "cierre",
    "familia": "operativo",
    "nombre": "Cierre de puerta sin autorización",
    "corta": "Avisa si la puerta se cierra en horario comercial.",
    "desc": "Dentro del horario de atención la puerta debe estar abierta. Si se cierra y nadie lo autorizó, cuenta cuánto lleva cerrada, muestra a quién la cerró y avisa; además registra a los clientes que llegaron y no pudieron entrar.",
    "estado": null,
    "dur": 16,
    "fases": [
      {
        "t": 0,
        "estado": "ok",
        "texto": "15:18 · horario comercial, puerta abierta"
      },
      {
        "t": 4,
        "estado": "detecta",
        "texto": "Un empleado cierra la puerta sin autorización"
      },
      {
        "t": 8,
        "estado": "detecta",
        "texto": "Llega un cliente y no puede entrar"
      },
      {
        "t": 11,
        "estado": "alerta",
        "texto": "Lleva 3 min cerrada en horario comercial: aviso al supervisor"
      }
    ],
    "video": null
  }
];

export const ESTADO_LABEL: Record<EstadoSim, string> = {
  vigila: "Vigilando",
  detecta: "Detectando",
  alerta: "Alerta",
  ok: "Resuelto",
};

/** URL de la simulación 3D embebible de una analítica. */
export function simUrl(id: string, opts: { pip?: boolean } = {}) {
  const q = new URLSearchParams({ id });
  if (opts.pip === false) q.set("pip", "0");
  return `/analiticas-3d/sim.html?${q.toString()}`;
}

export const PRESENTACION_URL = "/analiticas-3d/index.html";
export const PPTX_URL = "/analiticas-3d/Portafolio-Analiticas-Vigias.pptx";
