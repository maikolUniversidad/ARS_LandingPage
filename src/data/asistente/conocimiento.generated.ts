// GENERADO por src/data/asistente/generar.mjs a partir de conocimiento/*.md.
// No editar a mano: edite los .md y ejecute `node src/data/asistente/generar.mjs`.
import type { DocumentoKB } from "./tipos";

export const DOCUMENTOS: DocumentoKB[] = [
  {
    id: "que-es-ars",
    titulo: "Qué es ARS Intelligence",
    orden: 0,
    rutas: ["/"],
    contenido: `## En una frase

ARS Intelligence es una plataforma de seguridad integral con IA que conecta la operación completa de seguridad —personas, cámaras, IA, turnos, rondas, alertas, mapas, evidencia y reportes— en una sola plataforma. Lema del sitio: «La forma simple de hacer que todo funcione».

## Propuesta de valor (tal como la comunica el sitio)

- **Seguridad integral, no solo cámaras**: centraliza cámaras, personal, alertas, evidencia y operación para que cada evento tenga contexto, trazabilidad y respuesta. Conecta vigilancia, tecnología, operadores y clientes.
- **Sin reemplazar hardware**: se integra con la operación actual; conecta cámaras, guardas, NVRs y sistemas existentes. El sitio comunica un tiempo de despliegue de **menos de 48 horas** y un tablero único para gerencia, supervisión y respuesta. Los plazos reales de cada proyecto: a confirmar con el equipo comercial.
- **La IA apoya al equipo humano**: detecta y prioriza eventos; la decisión y la respuesta siguen siendo del operador y del personal en campo.
- **Alertas con evidencia**: cada alerta llega con snapshot, clip, ubicación, cámara, hora, responsable y trazabilidad.
- **Multi-cliente, multi-sede, multi-zona**: una sola arquitectura para muchas operaciones.
- Indicadores de confianza mostrados en la web: despliegue «< 48h», operación «24/7», cobertura «LATAM», «12+» modelos de IA.

## Presencia

El sitio indica que ARS opera centrales inteligentes en **Colombia y Perú** (Latinoamérica). El mapa de \`/proyectos\` muestra ciudades de ambos países (ver documento de proyectos).

## Ciclo operativo (8 pasos)

1. **Programación**: turnos, servicios, sedes, zonas y responsables desde una estructura centralizada.
2. **Asignación**: personal según cliente, sede, puesto, horario, rol, disponibilidad y necesidades.
3. **Ejecución en campo**: los guardas ejecutan rondas, tareas, registros y novedades desde móviles o estaciones operativas.
4. **Monitoreo en tiempo real**: la central ve ubicación, estado del personal, cámaras, eventos y actividad en vivo.
5. **Alertas y novedades**: cada evento relevante puede generar una alerta con contexto, prioridad, ubicación y responsable.
6. **Evidencia**: fotos, videos, formularios, hora, ubicación, cámara y usuario quedan asociados al evento.
7. **Reportes**: la operación diaria se convierte en indicadores, bitácoras, auditoría y reportes gerenciales.
8. **Decisiones**: mejorar tiempos de respuesta, cumplimiento, cobertura y calidad del servicio.

Verbos que resumen la plataforma: Opera · Monitorea · Comunica · Evidencia · Reporta · Decide.

## Los dos grandes bloques de producto

- **Plataforma de operación (tipo ERP operativo de seguridad)** en \`/plataforma\`: turnos, personal, rondas, formularios, mapa, PTT, central de monitoreo, alertas, evidencia, reportes, multisede.
- **Módulo de Visión (analíticas de video)** en \`/vision\`: 45 analíticas en 4 familias que corren sobre las cámaras ya instaladas.

Además hay demos interactivas: \`/laboratorio\` (modelos de IA en acción, con cámara o video propio) y \`/vision-lab\` (playground técnico).

## Contacto

- Solicitar demo: formulario y botones en la sección \`#cierre\` de la portada (\`/#cierre\`), de \`/plataforma#cierre\` y de \`/vision#cierre\`.
- WhatsApp de la gerencia comercial: +57 318 0005654.
- Correo: gerencia.comercial@vigiasdecolombia.com (asunto sugerido «Solicitud de demo - ARS Intelligence»).
- Dominio del sitio: arsintelligence.com.

Precios, planes, licencias y condiciones contractuales no están publicados en el sitio: a confirmar con el equipo comercial.`,
  },
  {
    id: "mapa-del-sitio",
    titulo: "Mapa del sitio y a dónde llevar al visitante",
    orden: 10,
    rutas: ["/","/plataforma","/vision","/servicios","/proyectos","/laboratorio","/vision-lab"],
    contenido: `Usa siempre rutas relativas del sitio (por ejemplo \`/vision#intrusion\`). Solo existen las rutas y anclas listadas aquí; no inventes otras.

## \`/\` — Portada (narrativa cinematográfica)

Recorrido con scroll en 8 escenas más un cierre. Anclas:

- \`#integral\` — 01 Seguridad integral conectada en tiempo real.
- \`#terreno\` — 02 Operación en campo: guardas, rondas, accesos, zonas críticas, novedades.
- \`#monitoreo\` — 03 Central de monitoreo que prioriza, interpreta y coordina.
- \`#ia\` — 04 IA para detectar, priorizar y actuar (personas, vehículos, placas, rostros autorizados o restringidos, ROI, cruce de línea, permanencia, EPP, eventos críticos).
- \`#alertas\` — 05 Alertas con contexto: snapshot, clip, historial.
- \`#respuesta\` — 06 Respuesta coordinada: de la alerta a la acción.
- \`#control\` — 07 Una plataforma para múltiples clientes, sedes y zonas.
- \`#decisiones\` — 08 Reportes, indicadores y confianza.
- \`#cierre\` — «Una sola plataforma. Toda tu seguridad.»: botón Solicitar demo (correo), formulario de contacto (nombre, empresa, correo, teléfono, mensaje) e indicadores (< 48h, 24/7, LATAM, 12+ modelos IA).

Enviar aquí: visitante que quiere la visión general o contactar. Para pedir demo, \`/#cierre\`.

## \`/plataforma\` — Seguridad integral en una sola plataforma

La plataforma de operación (ERP operativo de seguridad). Orden de secciones: hero, ciclo operativo de 8 pasos, capturas del producto, funcionalidades (A–N), arquitectura operativa por niveles, flujo de integración (del turno al reporte), casos de uso, comparativa antes/con ARS, testimonios del equipo, logos de entidades y empresas, cierre con demo.

Anclas:
- \`#funcionalidades\` — las 14 funcionalidades agrupadas en Operación, Monitoreo, Inteligencia y Reportes. Cada tarjeta tiene además su ancla \`#feature-<id>\`: \`turnos\`, \`personal\`, \`rondas\`, \`tareas\`, \`formularios\`, \`mapa\`, \`ptt\`, \`pot\`, \`central\`, \`ia\`, \`alertas\`, \`evidencia\`, \`reportes\`, \`multisite\` (p. ej. \`/plataforma#feature-rondas\`).
- \`#capturas\` — capturas: central de monitoreo, IA por cámara, reconocimiento facial, LPR, intrusión/ROI, EPP, alertas con evidencia.
- \`#casos\` — casos de uso: conjunto residencial, universidad o campus, centro logístico, empresa de seguridad.
- \`#cierre\` — Solicitar demo / Hablar con un asesor (WhatsApp).

Enviar aquí: preguntas sobre turnos, rondas, guardas, central, reportes, multisede, software de gestión u operación.

## \`/vision\` — Módulo de Visión · Analíticas de video

«Cada analítica, vista funcionando.» 45 analíticas en 4 familias, cada una con simulación 3D y, cuando existe, video o imagen real procesados por los modelos. Botones para abrir la presentación 3D completa y descargar el PowerPoint del portafolio.

Anclas:
- \`#visor\` — visor lámina por lámina: simulación 3D (se puede girar arrastrando), prueba real al lado, qué hace y «Cómo se activa» paso a paso. Se navega con clic, flechas o teclado.
- \`#indice\` — «Las 45 de un vistazo», agrupadas por familia; un clic abre cada una en el visor.
- \`#cierre\` — «45 analíticas. Las mismas cámaras.»: correo de demo, WhatsApp, presentación y PowerPoint.
- \`#<id-analítica>\` — abre esa analítica directamente en el visor, p. ej. \`/vision#intrusion\`, \`/vision#aforo\`, \`/vision#huecos\`. Si el id no existe se abre la analítica por defecto (Mapa de calor).

Nota técnica: existe una analítica con id \`cierre\` («Cierre de puerta sin autorización»), por eso \`/vision#cierre\` también selecciona esa analítica en el visor además de llevar a la sección de cierre. Para contacto en esta página es preferible decir «baja hasta el final de la página» o usar \`/#cierre\`.

Enviar aquí: preguntas sobre qué detectan las cámaras, analíticas para retail, prevención, operación, modelos de bajo costo.

## \`/proyectos\` — Mapa de proyectos en Latinoamérica

«Una red que ya está operando.» Mapa interactivo (scroll para zoom, arrastrar para mover, clic para ver detalles). Lista «Presencia ARS» con filtros por país, departamento/región y ciudad; cada proyecto abre una ficha con vertical, descripción, integraciones y métricas, y botón «Solicitar información». No tiene anclas.

Enviar aquí: preguntas sobre experiencia, ciudades, países, sectores.

## \`/laboratorio\` — Laboratorio · Modelos de IA

«Probá la IA con tus propios ojos.» Catálogo de 13 capacidades de IA filtrables por categoría (Personas, Vehículos, Industrial, Perímetro, Operación). Al elegir una se abre la demo con tres pestañas: Ejemplo, Cámara en vivo y Subir video. La detección corre en el navegador, sin enviar el video a ningún servidor.

Anclas:
- \`#demo-stage\` — escenario de la demo en vivo.

Al final: «¿Querés probarlo sobre tus cámaras reales?» con botón Solicitar demo guiada.

Enviar aquí: visitante que quiere ver la IA funcionando ya, con su cámara o un video propio.

## \`/servicios\` — Servicios: el sistema operativo de una empresa de seguridad

Catálogo completo de lo que hace ARS, organizado por áreas (operación en campo, centro de operaciones, comunicación, monitoreo inteligente, realidad virtual, gestión humana, formación, finanzas y ERP, productividad e IA, gobierno). El detalle de cada área y módulo está en el «Catálogo de servicios de ARS» al final de esta base de conocimiento.

Anclas del hub \`/servicios\`:
- \`#dia\` — «Un día en ARS»: una jornada que recorre todas las áreas.
- \`#areas\` — tarjetas de las áreas.
- \`#por-que\` — por qué ARS (pilares transversales).
- \`#buscar\` — buscador de servicios.
- \`#cierre\` — solicitar demo / hablar con un asesor.

Cada área tiene su página \`/servicios/<área>\` con una escena 3D que se puede girar y una sección por módulo con ancla \`#<módulo>\` (p. ej. \`/servicios/monitoreo-inteligente#vision-artificial\`). Al mostrar un módulo la escena 3D vuela a su punto (cámaras, puertas, radio, nómina…). En cada módulo hay un botón «Pregúntale a Ars sobre esto».

Enviar aquí: cualquier pregunta por un servicio o módulo concreto (mostrar_servicio), o la persona que quiere entender todo lo que hace ARS (ofrecer «un día en ARS»).

## \`/vision-lab\` — Playground técnico

Herramienta técnica: selector de 14 modelos, fuente (imagen, video, webcam), motor «IA real» en el navegador o «Demo» simulado, reglas (dibujar ROI o línea), panel de eventos, conteo, análisis facial y visor JSON de la respuesta. No tiene anclas. Pensado para perfiles técnicos o integradores.

## Reglas de navegación

- Pedir demo o hablar con alguien → \`/#cierre\` (formulario) o WhatsApp +57 318 0005654.
- Una analítica concreta → \`/vision#<id>\` usando el id exacto del catálogo.
- Una funcionalidad de la plataforma → \`/plataforma#feature-<id>\` o \`/plataforma#funcionalidades\`.
- Ver IA en vivo con su cámara → \`/laboratorio#demo-stage\`.
- Un servicio o módulo de ARS → \`/servicios/<área>#<módulo>\` con la herramienta mostrar_servicio (ids exactos del catálogo de servicios).
- Existe una ruta \`/admin\` interna (edición de datos del mapa); no es para visitantes, no la recomiendes.`,
  },
  {
    id: "plataforma-erp",
    titulo: "Plataforma ARS y ERP operativo",
    orden: 20,
    rutas: ["/plataforma"],
    contenido: `«Seguridad integral en una sola plataforma.» ARS conecta turnos, personal, rondas, cámaras, IA, alertas, comunicación, formularios, mapas y reportes para transformar la operación de seguridad en un sistema trazable, inteligente y en tiempo real. Página: \`/plataforma\`.

## Funcionalidades (A–N) · ancla \`/plataforma#feature-<id>\`

Grupos: **Operación** (gestión humana, programación y ejecución en campo), **Monitoreo** (visualización, central y trazabilidad), **Inteligencia** (IA y alertas con contexto), **Reportes** (indicadores, multisede y arquitectura).

- **A · Control de turnos y programación** (\`turnos\`, Operación): turnos por cliente, sede, zona, puesto y horario; asignación de guardas por puesto; control de horarios; validación de cobertura; ausencias o retrasos; historial; vista calendario/agenda.
- **B · Gestión de personal operativo** (\`personal\`, Operación): perfil del guarda, estado en turno, ubicación en tiempo real, historial de actividad, asignación a zonas o sedes, disponibilidad, relación con reportes, novedades y tareas.
- **C · Rondas inteligentes** (\`rondas\`, Operación): rondas por sede, zona o cliente; puntos de control; tareas por punto; validación por ubicación; evidencia fotográfica; observaciones; control de rondas incompletas; alertas por incumplimiento; historial.
- **D · Rondas con tareas personalizadas** (\`tareas\`, Operación): según instalación o riesgo; p. ej. verificar puerta cerrada, revisar perímetro, confirmar iluminación, reportar vehículos sospechosos, validar personal autorizado, tomar foto del punto, formulario de inspección, novedad con evidencia.
- **E · Formularios dinámicos** (\`formularios\`, Operación): formularios por operación, cliente, ronda o tipo de novedad; campos de texto, selección, fecha, evidencia, firma o ubicación; validaciones obligatorias; enlazados a reportes y auditoría.
- **F · Seguimiento en mapa en tiempo real** (\`mapa\`, Monitoreo): ubicación de guardas, vista por cliente/sede/zona, rutas de ronda, puntos de control, cámaras georreferenciadas, alertas sobre el mapa, historial de recorridos.
- **G · PTT · Push To Talk** (\`ptt\`, Operación): comunicación tipo radio digital entre central, supervisores y campo; canales por cliente, sede, zona o equipo; registro de actividad si aplica; integración con eventos o alertas.
- **H · POT · Acción operativa rápida** (\`pot\`, Operación): botón de acción rápida para reportar novedad o emergencia, solicitar apoyo, confirmar presencia o tarea, activar protocolo; queda asociado a ubicación, usuario y trazabilidad.
- **I · Central de monitoreo** (\`central\`, Monitoreo): video wall, monitoreo de cámaras, alertas en tiempo real, seguimiento de eventos, visualización de personal, comunicación con campo, evidencia, priorización de riesgos.
- **J · Cámaras e IA** (\`ia\`, Inteligencia): personas (detección, reconocimiento facial contra listas autorizadas/restringidas, caídas, merodeo); vehículos (detección, LPR, clasificación por tipo y color); comportamiento y zonas (cruce de línea, intrusión, ROI, objetos abandonados); industrial (EPP, reglas por cámara, aglomeración, fuego y humo). El detalle de analíticas está en \`/vision\`.
- **K · Alertas inteligentes** (\`alertas\`, Inteligencia): llegan con tipo de evento, prioridad, cámara, zona o sede, guarda relacionado, snapshot, video clip, ubicación, estado de atención e historial de seguimiento.
- **L · Evidencia y trazabilidad** (\`evidencia\`, Monitoreo): foto, video, fecha y hora, usuario responsable, ubicación, cámara, historial de cambios, estado y cierre de la novedad, reporte descargable.
- **M · Reportes e indicadores** (\`reportes\`, Reportes): cumplimiento de turnos, rondas completadas y fallidas, tiempo de respuesta, novedades por sede, alertas por tipo, eventos por cámara, actividad por guarda, cobertura por cliente, evidencia generada, riesgos recurrentes, reportes por periodo.
- **N · Multi-cliente · multi-sede · multi-zona** (\`multisite\`, Reportes): Organización → Cliente → Sede/Zona; Puesto → Cámara → Guarda; Turno → Ronda → Tarea; Evento → Evidencia → Reporte.

## Capturas del producto (\`/plataforma#capturas\`)

- Central de monitoreo: tablero único con cámaras, alertas y mapa en vivo; vista multipantalla configurable; priorización automática; asignación de operadores por turno.
- IA por cámara: activar modelos por cámara sin reemplazar hardware; reglas por cámara; varios modelos sobre la misma fuente; edge + cloud según la latencia requerida.
- Reconocimiento facial: listas blancas y negras por sede, búsqueda forense por rostro, confianza configurable.
- LPR: OCR de matrículas con cruce contra listas, soporte para placas LATAM, integración con barreras, reportes por flota o cliente.
- Intrusión/ROI: reglas perimetrales por cámara, cruce de línea con dirección.
- EPP: verificación automática, reporte para auditoría SST, alertas a supervisores.
- Alertas con evidencia: snapshot + clip, estado de atención por operador, cierre con observaciones y firma.

## Arquitectura operativa (niveles)

Raíz: ARS Intelligence (plataforma) → L1 Clientes (empresas y organizaciones) → L2 Sedes/Zonas (puntos físicos) → L3 Cámaras · Puestos · Guardas (recursos) → L4 Turnos · Rondas · Tareas (actividad programada) → L5 Alertas · Novedades · Formularios (eventos en tiempo real) → L6 Evidencia · Mapa · Central (visualización y respaldo) → L7 Reportes · Indicadores · Decisiones.

## Flujo de integración: del turno al reporte

1. Inicio de turno (guarda asociado a sede, puesto y horario). 2. Validación de puesto (biometría, ubicación o token operativo). 3. Ronda asignada (ruta, puntos, tareas, horarios). 4. Tareas en campo. 5. Formulario/novedad. 6. Evidencia (foto, video, ubicación, hora). 7. Alerta o seguimiento priorizado hacia la central. 8. Central de monitoreo en vivo. 9. Cierre del evento con observaciones y trazabilidad. 10. Reporte gerencial (indicadores, KPIs, bitácoras).

Resultado: «Cero desconexión entre operación humana, IA y supervisión».

## Casos de uso (\`/plataforma#casos\`)

- **Conjunto residencial**: porterías, rondas perimetrales, novedades, cámaras por torre o zona, alertas por intrusión, reportes al administrador.
- **Universidad o campus**: múltiples entradas, cámaras por edificio, estudiantes, visitantes y zonas críticas, permanencia o cruce de línea, eventos y reportes.
- **Centro logístico**: acceso vehicular, reconocimiento de placas, rondas en bodegas, EPP, zonas restringidas, evidencia ante incidentes.
- **Empresa de seguridad**: múltiples clientes, programación de turnos, supervisión de guardas, rondas y tareas, reportes automáticos, trazabilidad para facturación o cumplimiento.

## Antes vs. con ARS

Antes: información dispersa entre Excel, WhatsApp y radios; reportes manuales con horas de demora; cámaras desconectadas de la operación; rondas sin trazabilidad; comunicación informal central–campo; poca evidencia ante reclamos; difícil supervisión multisede.
Con ARS: operación centralizada; turnos y rondas con validación automática; cámaras + IA + personal conectados en tiempo real; evidencia automática por evento; mapa con ubicación viva; PTT con trazabilidad; alertas con contexto; reportes ejecutivos.

## Prueba social en la página

- Testimonios del equipo de ARS (gerencia y dirección comercial, dirección de IA): demostrar valor desde la primera reunión, activar sitios en menos de 48 horas sobre la infraestructura del cliente, edge + nube sin reemplazar hardware.
- Sección «Entidades y empresas que confían en nosotros» con logos: UNAD, Universidad de La Sabana, Universidad Militar Nueva Granada, Ministerio de Educación, Ministerio de Transporte, DANE, DIAN, Fiscalía General de la Nación, FNA, Ecopetrol, Repsol, TransMilenio, ALFA, Corferias Bogotá, Mundo Aventura. Puedes mencionar que aparecen en la web; el alcance de cada relación o proyecto es a confirmar con el equipo comercial.

## Lo que no está en el sitio

Integraciones con marcas concretas de cámaras/NVR, app móvil específica, requisitos de red, hosting, SLA formales, precios y licenciamiento: a confirmar con el equipo comercial.`,
  },
  {
    id: "vision-analiticas",
    titulo: "Módulo de Visión · Analíticas de video",
    orden: 30,
    rutas: ["/vision"],
    contenido: `Página \`/vision\`: «Cada analítica, vista funcionando». El catálogo proviene del portafolio «Analíticas en 3D · Vigías». **El catálogo completo de las 45 analíticas (id, nombre, familia, estado, descripción corta) se incluye por separado al final de esta base de conocimiento**; úsalo para responder y enlazar siempre con el id exacto: \`/vision#<id>\`.

## Cómo se presenta cada analítica

- **Simulación 3D**: la cámara ya instalada, lo que ve y el momento exacto en que avisa; cada simulación recorre fases con estados Vigilando → Detectando → Alerta → Resuelto.
- **Prueba real**: cuando existe, video o imagen real procesado por los modelos (CCTV del dataset MEVA bajo CC BY 4.0, Pexels y Mixkit con licencia comercial, o laboratorio propio), «sin retoques». Si no existe, se muestra «Video real en producción».
- **Cómo se activa**: los pasos iluminados al ritmo de la simulación.
- Recursos: presentación 3D completa (\`/analiticas-3d/index.html\`) y PowerPoint descargable del portafolio (\`/analiticas-3d/Portafolio-Analiticas-Vigias.pptx\`).

## Mensaje clave: sin equipo nuevo

«45 analíticas. Las mismas cámaras.» Según la página, todo corre en el propio servidor del sitio, sobre el circuito de cámaras ya instalado («0 equipos nuevos»). La compatibilidad concreta con cada cámara o servidor del cliente se valida en la demo: a confirmar con el equipo comercial.

## Las 4 familias

1. **Comercial y comportamental** (\`comercial\`, 7 analíticas) — «Quién entra, qué mira y cuánto se queda. Las cifras con las que se decide la tienda.» Seguimiento de personas, conteo, demografía, mapa de calor, permanencia, cruce de líneas, comprador activo. Para retail, centros comerciales, marketing y operación de tienda.
2. **Operativo y de eficiencia** (\`operativo\`, 9) — «Filas, aforo, parqueadero, personal y piso limpio: la operación del día, medida sola.» Listas blancas, filas y cajas, aforo, placas y parqueo, detección de personal, derrames, guardián de puestos, apertura de tienda, cierre de puerta sin autorización.
3. **Prevención y riesgo** (\`prevencion\`, 16) — «Lo que tiene que avisar en el acto: intrusos, armas, caídas, peleas, fuego y hurto.» Listas negras, merodeo, intrusión, acceso no autorizado, aglomeración, EPP, caídas, hurto, ocultamiento de producto, armas de fuego, armas blancas, peleas, humo y fuego, abandono de objetos, ocultamiento de rostro, retiro de activos.
4. **Modelos lite · bajo costo** (\`lite\`, 13) — «Analíticas livianas sobre una sola cámara: góndolas, bodega, puertas, autopago.» Verificación de etiqueta, canastillas y cajas, puertas abiertas/cerradas, huecos en góndola, producto vencido, vencimiento y destrucción, bodega, sobrecarga en racks, pasillos libres, exhibición vs. planograma, trazabilidad góndola–caja, validación de autopago, zona ciega.

## Estado de madurez

Cada analítica puede declarar un estado del equipo de Visión, que se muestra tal cual: «funcionando a diario», «funcionando en silencio», «listo para instalar», «con evidencia», «en validación», «en desarrollo». Si no tiene estado declarado, no afirmes madurez: indica que su disponibilidad es a confirmar con el equipo comercial. No prometas fechas de salida.

## Cómo recomendar

- Pregunta el sector y el problema (pérdidas, filas, seguridad perimetral, EPP, inventario…) y propone 2–4 analíticas del catálogo con su enlace \`/vision#<id>\`.
- Retail/tienda: \`calor\`, \`conteo\`, \`permanencia\`, \`filas\`, \`huecos\`, \`hurto\`, \`autopago\`, \`trazabilidad\`.
- Industrial/logística: \`epp\`, \`intrusion\`, \`placas\`, \`racks\`, \`pasillos\`, \`bodega\`, \`fuego\`.
- Perímetro/seguridad física: \`intrusion\`, \`merodeo\`, \`acceso\`, \`negras\`, \`armas\`, \`abandono\`, \`peleas\`.
- Presupuesto ajustado o una sola cámara: familia \`lite\`.
- Para ver modelos funcionando con su propia cámara, sugiere también \`/laboratorio\`.`,
  },
  {
    id: "segun-tamano-empresa",
    titulo: "Cómo opera ARS según el tamaño de la empresa (orientativo)",
    orden: 40,
    rutas: ["/plataforma","/vision","/proyectos"],
    contenido: `**Importante**: el sitio no publica planes ni paquetes por tamaño de empresa. Lo que sigue es una orientación derivada de lo que sí muestra el sitio (casos de uso, familia de modelos lite, arquitectura multisede y escala de los proyectos del mapa). Preséntalo siempre como orientativo y aclara que el alcance, los módulos incluidos y el costo de cada caso son a confirmar con el equipo comercial.

## Principios comunes a cualquier tamaño

- Se parte de la infraestructura existente: cámaras, NVRs, guardas y sistemas actuales, sin reemplazar hardware.
- Los modelos se activan por cámara, con reglas por cámara, y pueden correr en edge o nube según la latencia requerida.
- La IA apoya al equipo humano; las alertas llegan con evidencia a quien opera.
- La misma plataforma escala por niveles: Cliente → Sede/Zona → Cámaras/Puestos/Guardas → Turnos/Rondas → Alertas → Evidencia → Reportes.

## Empresa pequeña (una sede, pocas cámaras) — orientativo

- Punto de entrada natural: **modelos lite · bajo costo**, analíticas livianas sobre una sola cámara (góndola, bodega, puertas, autopago). Ejemplos: \`huecos\`, \`puertas\`, \`fleje\`, \`canastillas\`, \`vencido\`, \`autopago\`, \`zonaCiega\`.
- Analíticas puntuales de alto impacto sobre las cámaras que ya tiene: \`conteo\`, \`intrusion\`, \`apertura\`, \`cierre\`.
- Perfil típico por casos del sitio: tienda, conjunto residencial pequeño, local comercial.
- Plataforma: alertas con evidencia y reportes básicos; turnos y rondas si tiene vigilancia propia o contratada.

## Empresa mediana (varias sedes o una sede grande) — orientativo

- Combinación de plataforma operativa + analíticas por familia: control de turnos, rondas inteligentes con tareas, formularios dinámicos, central de monitoreo, mapa en tiempo real y PTT.
- Analíticas según el negocio: retail (\`calor\`, \`filas\`, \`aforo\`, \`hurto\`), logística (\`placas\`, \`epp\`, \`racks\`, \`pasillos\`), campus (\`acceso\`, \`merodeo\`, \`cruce\`).
- Perfil típico por casos del sitio: universidad o campus, centro logístico, conjunto residencial con varias torres, cadena de tiendas.
- Reportes por sede y comparativos (cumplimiento de rondas, tiempos de respuesta, novedades por sede).

## Empresa grande / multi-cliente — orientativo

- Arquitectura **multi-cliente · multi-sede · multi-zona** completa, central de monitoreo con video wall, priorización de riesgos y operadores por turno.
- Empresas de seguridad que gestionan muchos clientes: programación de turnos, supervisión de guardas, reportes automáticos y trazabilidad para facturación o cumplimiento.
- Analíticas de prevención y riesgo de alto valor: \`negras\`, \`armas\`, \`aglomeracion\`, \`caidas\`, \`fuego\`, \`abandono\`, reconocimiento facial con listas y LPR en accesos.
- Escala de referencia en el mapa de \`/proyectos\`: despliegues de decenas a cientos de cámaras por sitio (aeropuertos, puertos, metro, centros comerciales, torres corporativas). Son datos ilustrativos del mapa; no los presentes como cifras contractuales.

## Qué preguntar al visitante para orientar

1. Sector y tipo de instalación. 2. Número aproximado de sedes y cámaras. 3. Si ya tiene NVR/grabadores y vigilancia física. 4. El problema principal (pérdidas, filas, intrusión, EPP, control de guardas, reportes). 5. Si necesita gestión de turnos y rondas o solo analíticas de video.

Con esas respuestas propone una ruta: analíticas concretas en \`/vision#<id>\`, funcionalidades en \`/plataforma#feature-<id>\` y cierre con demo en \`/#cierre\`.`,
  },
  {
    id: "proyectos",
    titulo: "Proyectos, ciudades y verticales",
    orden: 50,
    rutas: ["/proyectos"],
    contenido: `Página \`/proyectos\`: «Una red que ya está operando». Texto de la página: ARS Intelligence opera centrales inteligentes en Colombia y Perú, conectando cámaras y sensores en una sola red de decisión.

## Cómo se usa el mapa

Botón «Entrar al mapa». Scroll para acercar y alejar, arrastrar para mover, clic en un marcador para ver los proyectos de la ciudad y su ficha. Filtros por país, departamento/región y ciudad; lista «Presencia ARS · Ciudades operativas en Latinoamérica». Cada ficha muestra vertical, descripción, integraciones (facial, LPR, EPP, intrusión, comportamiento, conteo, térmica, guardias, acceso, perímetro, alarmas, IoT), métricas y botón «Solicitar información».

## Ciudades en el mapa

- **Colombia (8)**: Bogotá D.C., Medellín, Cali, Barranquilla (principales); Cartagena, Bucaramanga, Pereira, Cúcuta.
- **Perú (1)**: Lima (incluye Callao y San Isidro/Surco).

En total el mapa muestra 21 proyectos: Bogotá 4, Lima 4, Medellín 3, Cali 3, Barranquilla 2, Cartagena 2, Bucaramanga 1, Pereira 1, Cúcuta 1.

## Verticales representadas

Aeroportuario y movilidad; transporte público (metro); retail y centros comerciales; hospitalidad y hotelería; logística e industrial; puertos y carga; frontera; corporativo y control de acceso; educación (campus); salud (hospital); espacios públicos (malecón).

Patrones típicos por vertical que muestran las fichas:
- Aeropuertos: reconocimiento facial en zonas restringidas, LPR en accesos, conteo en filas.
- Retail: aforo, mapas de calor, comportamiento/hurto, LPR en parqueaderos.
- Puertos y logística: LPR de tracto-camiones, perímetro, ROI en patios, térmica nocturna, EPP.
- Industrial: EPP, zonas peligrosas, perímetro, apoyo a cambios de turno.
- Salud: pasillos críticos, detección de caídas.
- Corporativo/educación: control de acceso facial, LPR en parqueaderos.

## Cautela con las cifras

El archivo de datos del mapa indica que verticales, direcciones, número de cámaras y métricas son **datos de referencia (placeholder) basados en operaciones típicas de ARS**. Por eso:
- Habla de ciudades, países y verticales, que es lo que la página comunica.
- Si preguntan cifras de un proyecto concreto (cámaras, eventos por día, disponibilidad, tiempo de respuesta) o si un aeropuerto, puerto o empresa nombrada es cliente, responde que el detalle es a confirmar con el equipo comercial e invita a ver la ficha en \`/proyectos\` o a pedir información.
- Como orden de magnitud orientativo, las fichas muestran sitios de entre unas 60 y unas 420 cámaras.`,
  },
  {
    id: "laboratorio",
    titulo: "Laboratorio y Vision Lab (demos de IA)",
    orden: 60,
    rutas: ["/laboratorio","/vision-lab"],
    contenido: `## \`/laboratorio\` — «Probá la IA con tus propios ojos»

Cada modelo que ofrece ARS se puede ver en acción: detección de personas, lectura de placas, EPP, caídas, intrusión, fuego, aglomeración y más. Filtro por categoría (Todas, Personas, Vehículos, Industrial, Perímetro, Operación). Al elegir una capacidad, el escenario \`#demo-stage\` ofrece tres pestañas: **Ejemplo** (escena ilustrativa con detecciones animadas), **Cámara en vivo** (webcam del visitante) y **Subir video**. La detección corre en tiempo real en el navegador, sin enviar el video a ningún servidor; en producción los modelos avanzados corren sobre las cámaras conectadas a ARS. Cierre: «¿Querés probarlo sobre tus cámaras reales?» → Solicitar demo guiada (activación en menos de 48 horas, sin reemplazar hardware, según la página).

Las 13 capacidades del laboratorio:
- **Reconocimiento facial** (Personas): listas de interés y búsqueda histórica por rostro; accesos restringidos, watchlist, conteo de visitantes únicos.
- **Lectura de placas (LPR)** (Vehículos): carros, motos y tracto-camiones; listas blancas/negras; entradas y salidas; parqueaderos, patios, puertos.
- **Detección de armas** (Perímetro): pistola, cuchillo, fusil; alerta inmediata con evidencia; accesos, bancos, retail, educación.
- **EPP** (Industrial): casco, chaleco reflectivo, guantes, gafas; auditoría SST y no-conformidades.
- **Intrusión y cruce de línea** (Perímetro): ROI por cámara con horarios, tipos de objeto y severidad; alertas al CCO.
- **Análisis de comportamiento** (Personas): peleas, merodeo, abandono de objetos, aglomeración inusual.
- **Conteo de personas** (Personas): entradas/salidas, mapas de calor, picos, permanencia, reportes históricos.
- **Visión térmica** (Perímetro): perímetros nocturnos, oscuridad total, focos de calor en plantas y subestaciones.
- **Clasificación vehicular** (Vehículos): tipo, marca aproximada, color y dirección; tráfico y forensia.
- **Detección y abandono de objetos** (Operación): mochilas y paquetes en aeropuertos, terminales, plazas, metro.
- **Detección de caídas** (Personas): pasillos, escaleras; hospitales, geriátricos, plantas.
- **Detección de fuego y humo** (Operación): complementa sensores físicos en bodegas, exteriores, túneles.
- **Aglomeración y densidad** (Personas): estaciones, eventos, centros comerciales, estadios.

Las tarjetas muestran una métrica por capacidad (p. ej. precisión, latencia, alcance). Son cifras de presentación de la demo: no las ofrezcas como garantía de rendimiento; el desempeño en cada sitio es a confirmar con el equipo comercial.

## \`/vision-lab\` — Playground técnico

Para perfiles técnicos. Selector de modelo, fuente (imagen, video, webcam), motor **IA real** (inferencia en el navegador, sin servidor ni costo) o **Demo** (predicciones simuladas), dibujo de reglas (ROI con clics y doble clic para cerrar; línea con 2 clics), panel de eventos con «crear alerta» y snapshot, conteo acumulado de personas/objetos distintos, análisis facial y visor JSON de la respuesta.

14 modelos por categoría:
- Personas: detección de personas; malla facial de 478 puntos con 52 acciones faciales (sin identificar a la persona); reconocimiento facial demo contra lista blanca/negra (solo entorno demo controlado); detección de pose (17 puntos corporales); detección de caídas demo (pose + tiempo en horizontal).
- Vehículos: detección de vehículos; detección de placas.
- OCR: OCR de placas (en el navegador).
- Industrial: EPP (casco, chaleco, guantes, botas, gafas).
- Perímetro y reglas: intrusión en ROI, cruce de línea con dirección, merodeo/permanencia, objeto abandonado.
- Experimental: descripción de escena con un modelo visión-lenguaje (VLM), solo para evaluación.

Algunos modelos marcados «API externa / requiere key» pueden no estar activos en la web pública. Los modelos sensibles (rostros, placas) muestran avisos legales.

## Laboratorio vs. Visión

- \`/laboratorio\` y \`/vision-lab\`: probar modelos en vivo con contenido propio.
- \`/vision\`: portafolio comercial de 45 analíticas con simulación 3D y evidencia real.`,
  },
  {
    id: "preguntas-frecuentes",
    titulo: "Preguntas frecuentes",
    orden: 90,
    rutas: ["/","/plataforma","/vision","/laboratorio"],
    contenido: `**¿Tengo que cambiar mis cámaras?**
No según lo que comunica el sitio: ARS se integra con la operación actual sin reemplazar hardware y conecta cámaras, guardas, NVRs y sistemas existentes. El módulo de Visión indica «0 equipos nuevos»: corre sobre el circuito ya instalado. La compatibilidad específica de cada marca o modelo se valida en la demo: a confirmar con el equipo comercial.

**¿Cuánto tarda la implementación?**
El sitio comunica despliegue en menos de 48 horas sobre la infraestructura existente. El plazo de un proyecto concreto depende de su alcance: a confirmar con el equipo comercial.

**¿Cuánto cuesta?**
No hay precios publicados. Existe una familia de «modelos lite · bajo costo» sobre una sola cámara. Cualquier cotización: a confirmar con el equipo comercial.

**¿La IA reemplaza a los guardas o al operador?**
No. La IA detecta y prioriza; opera como apoyo del equipo humano. La central, los supervisores y el personal en campo deciden y responden.

**¿Qué pasa con la privacidad y los datos personales?**
- En \`/laboratorio\` y en el motor «IA real» de \`/vision-lab\` la detección corre en el navegador: el video del visitante no se envía a ningún servidor.
- El reconocimiento facial y la lectura de placas son sensibles: requieren autorización del responsable de datos y, en el caso facial, consentimiento y cumplimiento normativo (el sitio cita Habeas Data en Colombia y la Ley 29733 en Perú). La malla facial del laboratorio analiza geometría y expresión sin identificar a la persona.
- En operación, la evidencia (foto, video, usuario, hora, ubicación) queda registrada para auditoría.
Políticas de retención, alojamiento de datos y certificaciones: a confirmar con el equipo comercial. No afirmes certificaciones.

**¿Funciona en la nube o en sitio?**
El sitio menciona edge + nube según la latencia requerida, y que las analíticas de Visión corren en el propio servidor del sitio. Arquitectura exacta por cliente: a confirmar con el equipo comercial.

**¿Qué detectan las cámaras?**
Personas, vehículos y placas, rostros contra listas, intrusión y cruce de línea, merodeo, aglomeración, EPP, caídas, armas, peleas, fuego y humo, objetos abandonados, hurto, y analíticas comerciales y de inventario. Ver el catálogo completo en \`/vision#indice\`.

**¿Las analíticas están todas disponibles hoy?**
Cada una muestra su estado declarado (p. ej. «funcionando a diario», «en validación», «en desarrollo»). Si no tiene estado o está en desarrollo, la disponibilidad es a confirmar con el equipo comercial.

**¿Sirve para empresas de seguridad con muchos clientes?**
Sí: la plataforma es multi-cliente, multi-sede y multi-zona, con turnos, supervisión de guardas, reportes automáticos y trazabilidad para facturación o cumplimiento. Ver \`/plataforma#casos\`.

**¿Se integra con mis sistemas (barreras, alarmas, control de acceso, ERP)?**
El sitio menciona integración con barreras en LPR y fichas de proyectos con control de acceso, alarmas e IoT. Integraciones específicas con terceros: a confirmar con el equipo comercial.

**¿Dónde operan?**
Colombia y Perú, según el sitio. Ver \`/proyectos\`.

**¿Puedo ver una demo?**
Sí, tres opciones:
1. Probar ya la IA con tu cámara o un video: \`/laboratorio#demo-stage\`.
2. Ver cada analítica funcionando: \`/vision#visor\`.
3. Demo guiada con el equipo: formulario en \`/#cierre\`, WhatsApp +57 318 0005654 o correo gerencia.comercial@vigiasdecolombia.com.

**¿Hay versión en inglés?**
El sitio tiene selector de idioma (ES/EN). El catálogo de analíticas de \`/vision\` se presenta en español.`,
  },
];
