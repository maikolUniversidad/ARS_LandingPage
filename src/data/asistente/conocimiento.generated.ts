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

ARS Intelligence es un **laboratorio de tecnología dedicado solo al desarrollo y la innovación en seguridad**, desde Colombia para Latinoamérica y el mundo. Trabaja para **empresas de seguridad privada** y las lleva a una nueva era en la que toda la operación es inteligente. Titular de la portada: «Todas las capas de la seguridad. Una sola traza.» Lema del sitio: «La forma simple de hacer que todo funcione».

## Posicionamiento: todas las capas, una sola traza

ARS no es un conjunto de programas separados: une en una sola plataforma con IA todas las capas de lo que pasa en un lugar de seguridad, y hace que todo fluya como debe.

1. **Vigilancia física** (en operación): el vigilante y sus turnos, relevos, rondas con QR, minuta desde el celular, radio PTT y botón de pánico en el mismo teléfono, y el supervisor visible en campo.
2. **Visión con IA sobre las cámaras** (en operación): las analíticas de \`/vision\` sobre las cámaras que la sede ya tiene; cada alerta llega con foto y video y **una persona confirma antes de actuar**. Las analíticas disponibles dependen del equipo de cada sede.
3. **Sensores, domótica e IoT** (en **operación**): sensores, controles de acceso, alarmas y relojes biométricos en el mismo panel que el resto de la operación.
4. **Robótica** (**en desarrollo** en nuestro laboratorio, no es un producto comercial todavía): perros robot que recorren y verifican con las mismas analíticas de las cámaras. La plataforma está pensada para sumar nuevos dispositivos. No prometas fechas, modelos ni disponibilidad; si preguntan, di que es una línea en desarrollo del laboratorio y ofrece hablar con el equipo.
5. **Central de operaciones y gerencia** (en operación): mapa en vivo de cada sede y cada persona, radio, chat y pánico en la misma pantalla; la gerencia ve en tiempo real qué está cubierto, qué falta y qué pasó.

**Todo es una traza**: cada evento queda trazado de punta a punta, del puesto a la gerencia. Ejemplo de la portada (escenario de demostración, ficticio): una ronda reporta una novedad en la cerca norte → la cámara 04 confirma con cruce de línea y el operador valida → el sensor de la puerta de la bodega avisa → el robot del laboratorio verifica → la central despacha al supervisor por radio → el cierre con evidencia, responsable y tiempos llega al tablero de gerencia.

Otras ideas que comunica el sitio:
- **La IA apoya al equipo humano**: multiagentes de IA que proponen y una persona que decide.
- **Alertas con evidencia**: foto, video, ubicación, cámara, hora y responsable asociados al evento.
- **Multi-cliente, multi-sede**: cada sede, cada cliente y cada turno en la misma plataforma.
- Cifras de la portada (salen del catálogo de \`/servicios\`): 10 áreas de servicio, los módulos del catálogo y cuántos están en operación, y 8 analíticas de video. No uses otras cifras (no hay respaldo para «< 48 h», «24/7», «12+ modelos» ni porcentajes de precisión).
- Plazos de despliegue, precios y alcance de cada proyecto: a confirmar con el equipo comercial.

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

- Diagnóstico de la empresa con IA (llamado principal del menú): \`/diagnostico\`.
- Solicitar demo: formulario y botones en la sección \`#contacto\` de la portada (\`/#contacto\`), de \`/plataforma#cierre\` y de \`/vision#cierre\`.
- WhatsApp de la gerencia comercial: +57 318 0005654.
- Correo: gerencia.comercial@vigiasdecolombia.com (asunto sugerido «Solicitud de demo - ARS Intelligence»).
- Dominio del sitio: arsintelligence.com.

Precios, planes, licencias y condiciones contractuales no están publicados en el sitio: a confirmar con el equipo comercial.`,
  },
  {
    id: "mapa-del-sitio",
    titulo: "Mapa del sitio y a dónde llevar al visitante",
    orden: 10,
    rutas: ["/","/diagnostico","/plataforma","/vision","/servicios","/proyectos","/laboratorio","/vision-lab"],
    contenido: `Usa siempre rutas relativas del sitio (por ejemplo \`/vision#intrusion\`). Solo existen las rutas y anclas listadas aquí; no inventes otras.

## \`/\` — Portada (las capas de la seguridad unidas en una traza)

Recorrido 3D con scroll: en la apertura las cinco capas flotan sobre una sede y caen hasta volverse una sola plataforma; luego cada capa se enciende y un mismo evento las recorre dejando una traza de luz hasta el tablero de gerencia. Anclas:

- \`#hero\` — «Todas las capas de la seguridad. Una sola traza.»
- \`#fisica\` — Capa 01 · Vigilancia física (turnos, rondas con QR, minuta, radio, pánico, supervisor). En operación.
- \`#vision\` — Capa 02 · Visión con IA sobre las cámaras. En operación.
- \`#iot\` — Capa 03 · Sensores e IoT (accesos, alarmas, relojes biométricos). En operación.
- \`#robotica\` — Capa 04 · Robótica (perros robot con las mismas analíticas). En desarrollo.
- \`#central\` — Capa 05 · Central de operaciones y gerencia en tiempo real. En operación.
- \`#traza\` — «Un evento. Cinco capas. Ningún cabo suelto.»: línea de tiempo de un evento de demostración, de la ronda al cierre en gerencia.
- \`#escala\` — «La nueva era de la seguridad privada ya opera.»: todas las sedes en la misma plataforma, cifras del catálogo y botones a demo y a \`/servicios\`.
- \`#contacto\` — formulario de contacto (nombre, empresa, correo, teléfono, mensaje), WhatsApp y correo. \`/#cierre\` también lleva aquí.

Enviar aquí: visitante que quiere la visión general, entender cómo se integran las capas o contactar. Para pedir demo, \`/#contacto\`.

## \`/diagnostico\` — Diagnóstico de tu empresa

«¿Cómo se vería tu empresa con ARS?» Entrevista de unos 5 minutos con Ars: mientras la persona cuenta cómo opera, se van marcando las áreas de ARS que le sirven; al final los agentes por área arman el diagnóstico, una historia 3D de su operación y un reporte para compartir o descargar. \`/diagnostico?ejemplo=1\` muestra un diagnóstico de ejemplo. No tiene anclas.

Enviar aquí: quien quiere saber qué le sirve de ARS a su empresa, un plan o un punto de partida antes de hablar con ventas. Es el llamado principal del sitio (botón «Diagnóstico» del menú).

## \`/plataforma\` — Seguridad integral en una sola plataforma

La plataforma de operación (ERP operativo de seguridad), mostrada en movimiento. Orden de secciones: hero 3D con un muro de capturas reales, «En movimiento» (clips y recorridos con capturas reales), recorrido por los módulos de cada área de campo, Arquitecto IA (arma la plataforma a la medida de la empresa), ciclo operativo, pilares, comparativa antes/con ARS, logos de entidades y empresas, cierre con demo.

Anclas:
- \`#en-movimiento\` — clips y recorridos de la plataforma con capturas reales.
- \`#recorrido\` — recorrido por los módulos de cada área (operación en campo, centro de operaciones, comunicación, monitoreo…), con enlace a cada área en \`/servicios/<área>\`.
- \`#arquitecto-ia\` — la persona describe su operación y la IA propone los módulos y una ruta de implementación.
- \`#pilares\` — pilares de la plataforma.
- \`#cierre\` — Solicitar demo / Hablar con un asesor (WhatsApp).

Las funcionalidades A–N (turnos, rondas, PTT, central, alertas…) no tienen ancla propia: para una funcionalidad concreta usa \`/plataforma#recorrido\` o el módulo equivalente en \`/servicios/<área>#<módulo>\`.

Enviar aquí: preguntas sobre turnos, rondas, guardas, central, reportes, multisede, software de gestión u operación.

## \`/vision\` — Módulo de Visión · Analíticas de video

«Cada analítica, vista funcionando.» 45 analíticas en 4 familias, cada una con simulación 3D y, cuando existe, video o imagen real procesados por los modelos. Botones para abrir la presentación 3D completa y descargar el PowerPoint del portafolio.

Anclas:
- \`#visor\` — visor lámina por lámina: simulación 3D (se puede girar arrastrando), prueba real al lado, qué hace y «Cómo se activa» paso a paso. Se navega con clic, flechas o teclado.
- \`#indice\` — «Las 45 de un vistazo», agrupadas por familia; un clic abre cada una en el visor.
- \`#cierre\` — «45 analíticas. Las mismas cámaras.»: correo de demo, WhatsApp, presentación y PowerPoint.
- \`#<id-analítica>\` — abre esa analítica directamente en el visor, p. ej. \`/vision#intrusion\`, \`/vision#aforo\`, \`/vision#huecos\`. Si el id no existe se abre la analítica por defecto (Mapa de calor).

Nota técnica: existe una analítica con id \`cierre\` («Cierre de puerta sin autorización»), por eso \`/vision#cierre\` también selecciona esa analítica en el visor además de llevar a la sección de cierre. Para contacto en esta página es preferible decir «baja hasta el final de la página» o usar \`/#contacto\`.

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

Herramienta técnica: selector de 14 modelos, fuente (imagen, video, webcam), motor «IA real» en el navegador o «Demo» simulado, reglas (dibujar ROI o línea), panel de eventos, conteo, análisis facial y visor JSON de la respuesta. No tiene anclas y no aparece en el menú: solo para perfiles técnicos o integradores; para visitantes, la demo es \`/laboratorio\`.

## Reglas de navegación

- Pedir demo o hablar con alguien → \`/#contacto\` (formulario) o WhatsApp +57 318 0005654.
- Saber qué le sirve de ARS a su empresa / un plan → \`/diagnostico\`.
- Una analítica concreta → \`/vision#<id>\` usando el id exacto del catálogo.
- Una funcionalidad de la plataforma → \`/plataforma#recorrido\`, o \`/plataforma#arquitecto-ia\` para armarla a la medida.
- Ver IA en vivo con su cámara → \`/laboratorio#demo-stage\`.
- Un servicio o módulo de ARS → \`/servicios/<área>#<módulo>\` con la herramienta mostrar_servicio (ids exactos del catálogo de servicios).
- Existe una ruta \`/admin\` interna (edición de datos del mapa); no es para visitantes, no la recomiendes.`,
  },
  {
    id: "plataforma-erp",
    titulo: "Plataforma ARS y ERP operativo",
    orden: 20,
    rutas: ["/plataforma"],
    contenido: `«Seguridad integral en una sola plataforma.» ARS conecta turnos, personal, rondas, cámaras, IA, alertas, comunicación, formularios, mapas y reportes para transformar la operación de seguridad en un sistema trazable, inteligente y en tiempo real. Página: \`/plataforma\`. Mensaje del cierre: «Transforma la seguridad tradicional en una operación inteligente»: conectar la operación humana, tecnológica y gerencial para tener más control, más evidencia y mejores tiempos de respuesta.

## Funcionalidades (A–N) · se recorren en \`/plataforma#recorrido\`

Grupos: **Operación** (gestión humana, programación y ejecución en campo), **Monitoreo** (visualización, central y trazabilidad), **Inteligencia** (IA y alertas con contexto), **Reportes** (indicadores, multisede y arquitectura).

- **A · Control de turnos y programación** (\`turnos\`, Operación): turnos por cliente, sede, zona, puesto y horario; asignación de guardas por puesto; control de horarios; validación de cobertura; ausencias o retrasos; historial; vista calendario/agenda.
- **B · Gestión de personal operativo** (\`personal\`, Operación): perfil del guarda, estado en turno, ubicación en tiempo real, historial de actividad, asignación a zonas o sedes, disponibilidad, relación con reportes, novedades y tareas.
- **C · Rondas inteligentes** (\`rondas\`, Operación): rondas por sede, zona o cliente; puntos de control; tareas por punto; validación por ubicación; evidencia fotográfica; observaciones; control de rondas incompletas; alertas por incumplimiento; historial.
- **D · Rondas con tareas personalizadas** (\`tareas\`, Operación): según instalación o riesgo; p. ej. verificar puerta cerrada, revisar perímetro, confirmar iluminación, reportar vehículos sospechosos, validar personal autorizado, tomar foto del punto, formulario de inspección, novedad con evidencia.
- **E · Formularios dinámicos** (\`formularios\`, Operación): formularios por operación, cliente, ronda o tipo de novedad; campos de texto, selección, fecha, evidencia, firma o ubicación; validaciones obligatorias; enlazados a reportes y auditoría.
- **F · Seguimiento en mapa en tiempo real** (\`mapa\`, Monitoreo): ubicación de guardas, vista por cliente/sede/zona, rutas de ronda, puntos de control, cámaras georreferenciadas, alertas sobre el mapa, historial de recorridos, segmentación por operación.
- **G · PTT · Push To Talk** (\`ptt\`, Operación): comunicación inmediata tipo radio digital entre central, supervisores y campo; canales por cliente, sede, zona o equipo; soporte para supervisores; registro de actividad si aplica; integración con eventos o alertas; apoyo a la respuesta coordinada.
- **H · POT · Acción operativa rápida** (\`pot\`, Operación): botón de acción rápida (el equivalente operativo a un botón de emergencia o de pánico) para reportar novedad o emergencia, activar una alerta, solicitar apoyo, confirmar presencia o una tarea crítica, activar protocolo; queda asociado a ubicación, usuario y trazabilidad.
- **I · Central de monitoreo** (\`central\`, Monitoreo): video wall, monitoreo de cámaras, alertas en tiempo real, seguimiento de eventos, visualización de personal, comunicación con campo, evidencia, priorización de riesgos.
- **J · Cámaras e IA** (\`ia\`, Inteligencia): personas (detección, reconocimiento facial contra listas autorizadas/restringidas, caídas, merodeo); vehículos (detección, LPR, clasificación por tipo y color); comportamiento y zonas (cruce de línea, intrusión, ROI, objetos abandonados); industrial (EPP, reglas por cámara, aglomeración, fuego y humo). El detalle de analíticas está en \`/vision\`.
- **K · Alertas inteligentes** (\`alertas\`, Inteligencia): llegan con tipo de evento, prioridad, cámara, zona o sede, guarda relacionado, snapshot, video clip, ubicación, estado de atención e historial de seguimiento.
- **L · Evidencia y trazabilidad** (\`evidencia\`, Monitoreo): foto, video, fecha y hora, usuario responsable, ubicación, cámara, historial de cambios, estado y cierre de la novedad, reporte descargable.
- **M · Reportes e indicadores** (\`reportes\`, Reportes): cumplimiento de turnos, rondas completadas y fallidas, tiempo de respuesta, novedades por sede, alertas por tipo, eventos por cámara, actividad por guarda, cobertura por cliente, evidencia generada, riesgos recurrentes, reportes por periodo.
- **N · Multi-cliente · multi-sede · multi-zona** (\`multisite\`, Reportes): Organización → Cliente → Sede/Zona; Puesto → Cámara → Guarda; Turno → Ronda → Tarea; Evento → Evidencia → Reporte.

## Capturas del producto (\`/plataforma#en-movimiento\`)

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

## Casos de uso (para armar el tuyo: \`/plataforma#arquitecto-ia\`)

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
    id: "servicios-ars",
    titulo: "Servicios de ARS · el catálogo completo",
    orden: 25,
    rutas: ["/servicios"],
    contenido: `Página \`/servicios\`: el catálogo completo de lo que hace ARS, en 10 áreas con una página cada una (\`/servicios/<area>\`) y un ancla por módulo (\`/servicios/<area>#<modulo>\`). **El catálogo de módulos (id, área, estado, frase y palabras clave) se incluye por separado**; úsalo para responder y enlazar siempre con el id exacto.

## La idea central

ARS no es «un producto de cámaras»: es **el sistema operativo de una empresa de seguridad privada**. En una sola plataforma la empresa contrata, programa, paga y capacita a su gente; la supervisa en campo con GPS, rondas, zonas y reportes con foto, firma, ubicación y hora; se comunica por radio desde el celular con cada transmisión grabada; vigila con cámaras, sensores y acceso facial; responde las emergencias desde una sala de control; le rinde cuentas al cliente con un portal propio; consulta su contabilidad y su ERP desde la misma pantalla, y puede recorrer su central y una sede de ejemplo en realidad virtual.

## Las 10 áreas

- **A · Operación en campo** (\`operacion-en-campo\`): turnos y programación, asistencia y relevos con selfie y verificación facial, rondas con QR, revistas y reportes de supervisión, visitantes y bicicletas, armas, vehículos y caninos.
- **B · Centro de operaciones** (\`centro-de-operaciones\`): Sala de Control con mapa en vivo, zonas con alerta de salida de zona, sala del coordinador, recorridos GPS de supervisores, cumplimiento persona por persona y alias de clientes y sedes.
- **C · Comunicación y emergencias** (\`comunicacion-y-emergencias\`): radio PTT en el celular y la web, chat corporativo, conversación con la Central, consola de grabaciones, reporte por sede, botón de pánico y notificaciones.
- **D · Monitoreo inteligente** (\`monitoreo-inteligente\`): visión artificial sobre las cámaras existentes, acceso inteligente con listas y consentimientos, IoT, levantamiento 2D/3D de sedes.
- **E · Realidad virtual** (\`realidad-virtual\`): Central Viva en 3D, demostración de la Sede Inteligente, Mesa Directiva con directores simulados por IA y Vigía, el asistente de voz.
- **F · Gestión humana** (\`gestion-humana\`): selección, colaboradores, nómina desde los turnos, costos, Área Documental con IA, portal documental para el cliente y Jurídica.
- **G · Formación** (\`formacion\`): cursos con certificados QR, diseñador de cursos con IA, video por temas, auditoría de reglas y evaluaciones.
- **H · Finanzas y ERP** (\`finanzas-y-erp\`): clientes, contratos y planes por módulos, órdenes de servicio, contabilidad conectada, asistente contable con IA, facturas DIAN y RADIAN (en piloto; pasan a producción en los próximos meses), el **Agente interoperador de datos** y el ERP de la empresa dentro de ARS.
- **I · Productividad e IA** (\`productividad-e-ia\`): tareas, reuniones con transcripción, tickets, formularios dinámicos, automatizaciones y Centro de IA.
- **J · Gobierno, seguridad y canales** (\`gobierno-y-seguridad\`): Torre de Control, auditoría, configuración multiempresa, ingreso con cédula y doble factor, app Android, app instalable (PWA) y app de escritorio para la central.

## Un día en ARS (cómo se encadenan las áreas)

1. **Programar.** Programación arma el mes sobre la estructura Cliente → Sede → Puesto (área A), con las órdenes de servicio que vienen del ERP (área H). Cada vigilante ve su mes en el celular.
2. **Marcar y supervisar.** El vigilante inicia el turno con selfie y ubicación, hace sus rondas con QR y su minuta; el supervisor recorre su zona y llena revistas con foto y firma (A). El coordinador ve en su sala qué turno quedó sin cubrir y decide quién cubre (B).
3. **Vigilar y responder.** La Central mira el mapa vivo, las cámaras y sus alertas de IA (B, D), habla por radio y, si alguien presiona el botón de pánico, atiende la emergencia con una ventana que deja la bitácora escrita (C).
4. **Pagar y rendir cuentas.** Lo trabajado alimenta la nómina (F), los documentos del personal quedan auditados y el cliente los consulta en su portal (F), la contabilidad muestra lo contratado frente a lo facturado (H) y la dirección revisa los indicadores, incluso en la Mesa Directiva en 3D (E). La auditoría (J) deja rastro de las acciones sensibles.

Con esto en mente, cuando alguien pregunte por un problema concreto, ubícalo en su paso del día y propone 2–4 módulos del catálogo con su enlace.

## Por qué ARS (6 pilares)

1. **Multiempresa de verdad:** cada empresa con sus clientes, sedes, roles, plan, menú, portada y alias.
2. **Cada persona ve solo lo que le toca:** permisos por módulo y acción cruzados con el plan; lo no contratado no aparece.
3. **Multiagentes de IA en cada área:** contamos con multiagentes de inteligencia artificial trabajando dentro de cada área para complementar sus procesos; proponen, revisan y organizan, y la persona decide. Documentos del personal, reuniones y asistentes de nómina, contabilidad y tareas corren en servidores propios; la IA responde con los permisos de quien pregunta.
4. **Un sistema, cuatro canales y las gafas:** web, app Android (funciona sin señal), app instalable, app de escritorio y Sala VR.
5. **Trazabilidad de punta a punta:** doble factor, sesiones con IP y ubicación, auditoría con antes y después, registro de consultas de datos personales.
6. **Agente interoperador de datos:** conecta cualquier sistema, dato u organización con ARS (ver abajo); además, cámaras y grabadores existentes, Telegram, Excel y PDF.

## Agente interoperador de datos (cómo explicarlo)

Cuando pregunten por integraciones, por el ERP, por migrar información o por «¿funciona con mi sistema?», explica el **Agente interoperador de datos**:

- Es un agente de IA que **recopila los datos y los documentos** de la empresa (su ERP, bases de datos, Excel, CSV, XML, PDF y documentos escaneados), los **analiza, gestiona, organiza y homologa** (clientes, empleados, contratos, sedes, centros de costo) para que cualquier sistema, dato u organización **interopere fácilmente con ARS**.
- **Cómo conecta**, en este orden de preferencia: 1) **por API**, con sincronización continua; 2) **por conexión de backend** (servicios o base de datos con permisos controlados) cuando no hay API; 3) si ninguna es posible, **protocolos de carga** programados y validados, con vista previa antes de aplicar. Así la información **siempre fluye**.
- **Integración completa o parcial:** ARS **se moldea al producto que la empresa ya tiene**. Puede quedar totalmente integrado (el ERP completo operado desde ARS) o participar solo en algunas partes del proceso (por ejemplo turnos, nómina, facturación o contabilidad).
- Enlaza al módulo \`/servicios/finanzas-y-erp#agente-interoperador-de-datos\`.
- **Nunca nombres un ERP, proveedor o producto de terceros concreto** (ni el de un cliente). Habla siempre de «el ERP o sistema que ya usa la empresa».

## Multiagentes por área

ARS cuenta con **multiagentes de inteligencia artificial trabajando dentro de cada una de las áreas** (campo, centro de operaciones, gestión humana, formación, finanzas, productividad…) para **complementar los procesos**: proponen, revisan, organizan y explican; la persona decide. Preséntalos como un complemento del trabajo del equipo, nunca como un reemplazo.

## Cómo hablar de los estados

Cada módulo tiene un estado y a veces una nota; respétalos al pie de la letra:
- **vivo** → en producción, se presenta como funcionalidad.
- **piloto** → «está en piloto»; se puede mostrar en una demo acordada.
- **proximamente** → «próximamente», sin fecha.
- **hoja-de-ruta** → «está en nuestra hoja de ruta», sin fecha ni compromiso.
Si un módulo trae \`notaEstado\` (por ejemplo «con gafas Meta Quest, en piloto»), menciónala cuando sea relevante.

## Guía de lo que no se promete

- **Cámaras:** habla solo de las analíticas del catálogo de servicios (intrusión, cruce de línea, merodeo, objetos olvidados, conteo, aforo, mapa de calor, atributos estimados de persona). No ofrezcas en este catálogo lectura de placas, detección de armas, EPP, visión térmica, clasificación vehicular ni detección de fuego o humo; si preguntan, di que se evalúan caso a caso con el equipo comercial y remite a \`/vision\` para ver su estado. El reconocimiento facial por cámara es una **alerta de personas desconocidas o de una lista, que verifica un operador**, nunca una identificación automática. Las analíticas dependen del equipo instalado en cada sede.
- **Turnos:** la verificación facial del relevo compara con la foto registrada; no hables de «antisuplantación». Los relojes biométricos ZKTeco se mencionan como **compatibilidad**. El relevo entre empresas es para supervisores de un mismo grupo empresarial.
- **Radio:** en el teléfono funciona con la app Android, con varios perfiles en un teléfono y manos libres.
- **Disponibilidad:** no prometas porcentajes de disponibilidad, SLA ni «cero caídas». No menciones certificaciones.
- **Servidores propios:** dilo para documentos del personal, reuniones y datos de personal; no lo generalices a toda la plataforma.
- **Realidad virtual:** la Sede Inteligente es una **demostración con datos simulados**; también se vive con gafas Meta Quest y con la app nativa para Quest. Los directores de la Mesa Directiva son **simulados por IA**: no los asocies con personas reales.
- **Nómina y contabilidad:** trabajan junto al ERP de la empresa, conectado por el Agente interoperador de datos; la contabilidad es una copia de consulta del ERP. No des cifras de coincidencia con el ERP. Incluyen nómina quincenal, prima, vacaciones y liquidación de contratos. Las facturas DIAN y RADIAN están en piloto y pasan a producción en los próximos meses; ARS no emite facturas.
- **Puertas con reconocimiento facial y escaneo 3D de sedes:** disponibles; el reconocimiento facial abre o alerta y una persona verifica.
- **Cifras:** no des números de usuarios, vigilantes, clientes, sedes, documentos ni porcentajes de uso. No nombres clientes.
- Si algo no está en el catálogo, di que se confirma con el equipo comercial y ofrece agendar una demo.`,
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

Todas las analíticas del portafolio están disponibles. Algunas muestran además un sello del equipo de Visión («funcionando a diario», «funcionando en silencio», «listo para instalar», «con evidencia»). Lo que sí depende de cada sede es el equipo instalado: cámaras, resolución e iluminación se confirman en la visita técnica.

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

Con esas respuestas propone una ruta: analíticas concretas en \`/vision#<id>\`, la plataforma en \`/plataforma#recorrido\` (o a su medida en \`/plataforma#arquitecto-ia\`), el diagnóstico completo en \`/diagnostico\` y cierre con demo en \`/#contacto\`.`,
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
    id: "asistente-ars",
    titulo: "Qué puede hacer el asistente Ars por el visitante",
    orden: 70,
    rutas: ["/","/plataforma","/vision","/laboratorio"],
    contenido: `Úsalo para contestar «¿qué puedes hacer?» o «¿cómo me ayudas?». Ofrece una o dos de estas opciones, según la página y lo que la persona ya contó. No las recites todas.

## Capacidades

- **Guiar por el sitio**: llevar a la página, sección o analítica correcta y resaltar lo que se está explicando.
- **Recomendar según el caso**: con el sector, las sedes, las cámaras y el problema principal, proponer funcionalidades de \`/plataforma\` y analíticas de \`/vision\`.
- **Alcance orientativo**: un borrador de alcance con tamaño de la operación, funcionalidades, analíticas, unidades a cotizar, etapas (demo → levantamiento → piloto → despliegue) e indicadores para medir el resultado. No es una cotización y no trae precios; el equipo comercial confirma alcance, compatibilidad, plazos y costo.
- **Comparar analíticas**: una tabla lado a lado (qué detecta, cómo se activa, estado, prueba real, para qué sectores).
- **Analizar una foto o un video propio**: la persona adjunta una foto de su instalación o un clip de cámara. Ars señala zonas ciegas, accesos, EPP o flujos, y qué analíticas lo detectarían y en qué segundo. El archivo se usa solo en esa conversación: no se guarda en el servidor y los videos ni siquiera se suben (el navegador extrae unos fotogramas). No identifica a personas.
- **Leer documentos**: pliegos, términos de referencia o RFP en PDF o texto. Ars resume, cita la página y lo conecta con ARS.
- **Preparar el contacto**: un resumen de la visita (necesidad, tamaño, intereses, plazo) que llega escrito en el formulario. La persona lo revisa, añade su nombre y correo y lo envía ella misma.
- **Voz**: conversación hablada con subtítulos, si el sitio la tiene activa.

## Privacidad del asistente

Lo que la persona cuenta para personalizar (sector, sedes, cámaras…) se guarda solo en su navegador y lo puede ver y borrar en el panel. Las búsquedas en la documentación envían solo el texto de la pregunta a un servicio de búsqueda semántica, nunca los archivos adjuntos.`,
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
Todas están disponibles; algunas muestran además un sello del equipo de Visión (p. ej. «funcionando a diario» o «con evidencia»). Lo que se confirma en la visita técnica es el equipo de cada sede.

**¿Sirve para empresas de seguridad con muchos clientes?**
Sí: la plataforma es multi-cliente, multi-sede y multi-zona, con turnos, supervisión de guardas, reportes automáticos y trazabilidad para facturación o cumplimiento. Ver \`/plataforma#arquitecto-ia\`.

**¿Se integra con mis sistemas (barreras, alarmas, control de acceso, ERP)?**
El sitio menciona integración con barreras en LPR y fichas de proyectos con control de acceso, alarmas e IoT. Integraciones específicas con terceros: a confirmar con el equipo comercial.

**¿Dónde operan?**
Colombia y Perú, según el sitio. Ver \`/proyectos\`.

**¿Puedo ver una demo?**
Sí, cuatro opciones:
1. Probar ya la IA con tu cámara o un video: \`/laboratorio#demo-stage\`.
2. Ver cada analítica funcionando: \`/vision#visor\`.
3. Un diagnóstico de tu empresa con IA (5 minutos): \`/diagnostico\`.
4. Demo guiada con el equipo: formulario en \`/#contacto\`, WhatsApp +57 318 0005654 o correo gerencia.comercial@vigiasdecolombia.com.

**¿Hay versión en inglés?**
El sitio tiene selector de idioma (ES/EN). El catálogo de analíticas de \`/vision\` se presenta en español.

**¿Me pueden dar un estimado?**
Ars puede armar un alcance orientativo (funcionalidades, analíticas, unidades a cotizar y etapas) con el sector, las sedes, las cámaras y el objetivo. No incluye precios. La cotización formal la hace el equipo comercial después de la demo o del levantamiento.

**¿Puedo mostrarle una foto o un video de mis cámaras?**
Sí, se adjunta en el chat. Ars explica qué detectaría ARS y con qué analítica. El archivo se usa solo en esa conversación y no se guarda en el servidor; en un video, el navegador envía solo unos fotogramas. Para ver los modelos corriendo en vivo sobre tu propia cámara está \`/laboratorio#demo-stage\`.

**¿En qué se diferencian dos analíticas parecidas (p. ej. intrusión, merodeo y acceso no autorizado)?**
Ars puede compararlas en una tabla: qué detecta cada una, cómo se activa, estado y prueba real. Resumen rápido: **intrusión** mide qué tan adentro de una zona prohibida está la persona (tres franjas, con aviso según la gravedad); **merodeo** avisa de quien da vueltas sin entrar ni irse; **acceso no autorizado** combina la puerta de una zona interna con el reconocimiento de personal y avisa si cruza alguien que no es del equipo. Ver \`/vision#intrusion\`, \`/vision#merodeo\` y \`/vision#acceso\`.`,
  },
];
