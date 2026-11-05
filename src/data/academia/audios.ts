/**
 * Voces de los personajes de la Academia ARS (clips cortos para los reproductores de /academia).
 * Fuente: docs/research/SALA-VR-ARS-CAPACITACION-PARA-WEB.md §2.5–2.9 (tabla B1 en §2.7).
 * Audio en public/audio/academia/personajes/<id>.mp3, generado con ElevenLabs
 * (ver scripts/generar-audios-academia.mjs, que documenta la voz de cada personaje).
 *
 * `texto` es lo que se oye (sirve de subtítulo). `vigilante-b1-4` es el silencio de la
 * fila 4 de B1: el clip es solo un carraspeo corto con ambiente de portería de noche.
 */
export interface AudioAcademia {
  id: string;
  personaje: string;
  rol: string;
  texto: string;
  src: string;
}

const src = (id: string) => `/audio/academia/personajes/${id}.mp3`;

const OSCAR = { personaje: "Óscar Bermúdez", rol: "Instructor jefe · bogotano, suboficial retirado" };
const VIGILANTE = { personaje: "El vigilante", rol: "Alumno en la portería · escenario B1 «El exesposo»" };
const EDGAR = { personaje: "Edgar", rol: "El exesposo, embriagado en la reja · escenario B1" };

export const AUDIOS_ACADEMIA: AudioAcademia[] = [
  {
    id: "oscar-bienvenida",
    ...OSCAR,
    texto:
      "¡Buenos días, cadetes! Bienvenidos a la escuela. Soy Óscar Bermúdez, su instructor jefe. Aquí hay tres reglas: respeto, seguridad y la verdad en la minuta. ¿Entendido?",
    src: src("oscar-bienvenida"),
  },
  { id: "oscar-canon", ...OSCAR, texto: "¡Cañón al frente!", src: src("oscar-canon") },
  { id: "oscar-dedo", ...OSCAR, texto: "¡Dedo fuera!", src: src("oscar-dedo") },
  { id: "oscar-alto", ...OSCAR, texto: "¡Alto el fuego!", src: src("oscar-alto") },
  { id: "oscar-vacio", ...OSCAR, texto: "¡Muestre vacío!", src: src("oscar-vacio") },
  {
    id: "vigilante-b1-1",
    ...VIGILANTE,
    texto:
      "Buenas noches, don Edgar. Le entiendo, pero no le puedo abrir: la señora no autorizó. ¿Quiere un vaso de agua mientras llamo a alguien que lo recoja?",
    src: src("vigilante-b1-1"),
  },
  { id: "vigilante-b1-2", ...VIGILANTE, texto: "Váyase que está borracho.", src: src("vigilante-b1-2") },
  {
    id: "vigilante-b1-3",
    ...VIGILANTE,
    texto: "Ya llamé a la policía, se va a ir preso.",
    src: src("vigilante-b1-3"),
  },
  {
    id: "vigilante-b1-4",
    ...VIGILANTE,
    texto: "(Silencio, mirando el celular.)",
    src: src("vigilante-b1-4"),
  },
  {
    id: "edgar-b1-1",
    ...EDGAR,
    texto: "…Usted es buena gente, hermano, pero es que ella… ella era todo pa' mí, ¿sí me entiende?",
    src: src("edgar-b1-1"),
  },
  {
    id: "edgar-b1-2",
    ...EDGAR,
    texto: "¿Borracho? ¡Borracho su papá! ¡Ábrame!",
    src: src("edgar-b1-2"),
  },
  {
    id: "edgar-b1-3",
    ...EDGAR,
    texto: "¿Preso? ¿Preso yo? ¡Ah, no, pues ahora sí me abre o me le subo por esta reja!",
    src: src("edgar-b1-3"),
  },
  {
    id: "edgar-b1-4",
    ...EDGAR,
    texto: "¿Me está ignorando? ¡Hey! ¡Hey, le estoy hablando!",
    src: src("edgar-b1-4"),
  },
  {
    id: "yamile-guion",
    personaje: "Yamile Cárdenas",
    rol: "Instructora de servicio y control de acceso · paisa",
    texto:
      "Vea pues, el guion de oro es sencillito: salude bien, pida el documento con cortesía, explique por qué tiene que esperar y, si no puede entrar, niéguelo sin humillar a nadie.",
    src: src("yamile-guion"),
  },
  {
    id: "gloria",
    personaje: "Doña Gloria",
    rol: "Residente de 72 años",
    texto:
      "Ay, mijito, qué pena con usted… es que se me quedaron las llaves adentro, y el celular también. ¿Será que me ayuda a llamar a mi hija?",
    src: src("gloria"),
  },
  {
    id: "zuluaga",
    personaje: "Dr. Zuluaga",
    rol: "Residente impaciente",
    texto: "¿Usted no sabe quién soy yo? Soy el doctor Zuluaga, del seiscientos dos. Ábrame ya, que no tengo tiempo.",
    src: src("zuluaga"),
  },
  {
    id: "kevin",
    personaje: "Kevin",
    rol: "Domiciliario barranquillero",
    texto:
      "¡Ey, mi llave, buenas! Traigo un domicilio pa' la torre tres, el cuatrocientos uno. ¿Lo recibe usted o me deja subir? Que se me enfría, ¡ajá!",
    src: src("kevin"),
  },
  {
    id: "diana-radio",
    personaje: "Diana",
    rol: "La central, por radio",
    texto:
      "Central a portería norte. Recibido el reporte. Patrulla en camino, cinco minutos. Mantenga la posición y no salga del puesto. Cambio.",
    src: src("diana-radio"),
  },
  {
    id: "ramiro",
    personaje: "Ramiro",
    rol: "Supervisor que llega en moto",
    texto:
      "Buenas tardes, compañero. Vengo a pasarle revista. A ver: credencial, radio con batería, linterna… muy bien. Muéstreme la minuta, que se la firmo. ¿Alguna novedad?",
    src: src("ramiro"),
  },
];
