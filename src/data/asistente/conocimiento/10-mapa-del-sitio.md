---
id: mapa-del-sitio
titulo: Mapa del sitio y a dónde llevar al visitante
orden: 10
rutas: ["/", "/diagnostico", "/plataforma", "/vision", "/servicios", "/proyectos", "/laboratorio", "/vision-lab"]
---

Usa siempre rutas relativas del sitio (por ejemplo `/vision#intrusion`). Solo existen las rutas y anclas listadas aquí; no inventes otras.

## `/` — Portada (las capas de la seguridad unidas en una traza)

Recorrido 3D con scroll: en la apertura las cinco capas flotan sobre una sede y caen hasta volverse una sola plataforma; luego cada capa se enciende y un mismo evento las recorre dejando una traza de luz hasta el tablero de gerencia. Anclas:

- `#hero` — «Todas las capas de la seguridad. Una sola traza.»
- `#fisica` — Capa 01 · Vigilancia física (turnos, rondas con QR, minuta, radio, pánico, supervisor). En operación.
- `#vision` — Capa 02 · Visión con IA sobre las cámaras. En operación.
- `#iot` — Capa 03 · Sensores e IoT (accesos, alarmas, relojes biométricos). En operación.
- `#robotica` — Capa 04 · Robótica (perros robot con las mismas analíticas). En desarrollo.
- `#central` — Capa 05 · Central de operaciones y gerencia en tiempo real. En operación.
- `#traza` — «Un evento. Cinco capas. Ningún cabo suelto.»: línea de tiempo de un evento de demostración, de la ronda al cierre en gerencia.
- `#escala` — «La nueva era de la seguridad privada ya opera.»: todas las sedes en la misma plataforma, cifras del catálogo y botones a demo y a `/servicios`.
- `#contacto` — formulario de contacto (nombre, empresa, correo, teléfono, mensaje), WhatsApp y correo. `/#cierre` también lleva aquí.

Enviar aquí: visitante que quiere la visión general, entender cómo se integran las capas o contactar. Para pedir demo, `/#contacto`.

## `/diagnostico` — Diagnóstico de tu empresa

«¿Cómo se vería tu empresa con ARS?» Entrevista de unos 5 minutos con Ars: mientras la persona cuenta cómo opera, se van marcando las áreas de ARS que le sirven; al final los agentes por área arman el diagnóstico, una historia 3D de su operación y un reporte para compartir o descargar. `/diagnostico?ejemplo=1` muestra un diagnóstico de ejemplo. No tiene anclas.

Enviar aquí: quien quiere saber qué le sirve de ARS a su empresa, un plan o un punto de partida antes de hablar con ventas. Es el llamado principal del sitio (botón «Diagnóstico» del menú).

## `/plataforma` — Seguridad integral en una sola plataforma

La plataforma de operación (ERP operativo de seguridad), mostrada en movimiento. Orden de secciones: hero 3D con un muro de capturas reales, «En movimiento» (clips y recorridos con capturas reales), recorrido por los módulos de cada área de campo, Arquitecto IA (arma la plataforma a la medida de la empresa), ciclo operativo, pilares, comparativa antes/con ARS, logos de entidades y empresas, cierre con demo.

Anclas:
- `#en-movimiento` — clips y recorridos de la plataforma con capturas reales.
- `#recorrido` — recorrido por los módulos de cada área (operación en campo, centro de operaciones, comunicación, monitoreo…), con enlace a cada área en `/servicios/<área>`.
- `#arquitecto-ia` — la persona describe su operación y la IA propone los módulos y una ruta de implementación.
- `#pilares` — pilares de la plataforma.
- `#cierre` — Solicitar demo / Hablar con un asesor (WhatsApp).

Las funcionalidades A–N (turnos, rondas, PTT, central, alertas…) no tienen ancla propia: para una funcionalidad concreta usa `/plataforma#recorrido` o el módulo equivalente en `/servicios/<área>#<módulo>`.

Enviar aquí: preguntas sobre turnos, rondas, guardas, central, reportes, multisede, software de gestión u operación.

## `/vision` — Módulo de Visión · Analíticas de video

«Cada analítica, vista funcionando.» 45 analíticas en 4 familias, cada una con simulación 3D y, cuando existe, video o imagen real procesados por los modelos. Botones para abrir la presentación 3D completa y descargar el PowerPoint del portafolio.

Anclas:
- `#visor` — visor lámina por lámina: simulación 3D (se puede girar arrastrando), prueba real al lado, qué hace y «Cómo se activa» paso a paso. Se navega con clic, flechas o teclado.
- `#indice` — «Las 45 de un vistazo», agrupadas por familia; un clic abre cada una en el visor.
- `#cierre` — «45 analíticas. Las mismas cámaras.»: correo de demo, WhatsApp, presentación y PowerPoint.
- `#<id-analítica>` — abre esa analítica directamente en el visor, p. ej. `/vision#intrusion`, `/vision#aforo`, `/vision#huecos`. Si el id no existe se abre la analítica por defecto (Mapa de calor).

Nota técnica: existe una analítica con id `cierre` («Cierre de puerta sin autorización»), por eso `/vision#cierre` también selecciona esa analítica en el visor además de llevar a la sección de cierre. Para contacto en esta página es preferible decir «baja hasta el final de la página» o usar `/#contacto`.

Enviar aquí: preguntas sobre qué detectan las cámaras, analíticas para retail, prevención, operación, modelos de bajo costo.

## `/proyectos` — Mapa de proyectos en Latinoamérica

«Una red que ya está operando.» Mapa interactivo (scroll para zoom, arrastrar para mover, clic para ver detalles). Lista «Presencia ARS» con filtros por país, departamento/región y ciudad; cada proyecto abre una ficha con vertical, descripción, integraciones y métricas, y botón «Solicitar información». No tiene anclas.

Enviar aquí: preguntas sobre experiencia, ciudades, países, sectores.

## `/laboratorio` — Laboratorio · Modelos de IA

«Probá la IA con tus propios ojos.» Catálogo de 13 capacidades de IA filtrables por categoría (Personas, Vehículos, Industrial, Perímetro, Operación). Al elegir una se abre la demo con tres pestañas: Ejemplo, Cámara en vivo y Subir video. La detección corre en el navegador, sin enviar el video a ningún servidor.

Anclas:
- `#demo-stage` — escenario de la demo en vivo.

Al final: «¿Querés probarlo sobre tus cámaras reales?» con botón Solicitar demo guiada.

Enviar aquí: visitante que quiere ver la IA funcionando ya, con su cámara o un video propio.

## `/servicios` — Servicios: el sistema operativo de una empresa de seguridad

Catálogo completo de lo que hace ARS, organizado por áreas (operación en campo, centro de operaciones, comunicación, monitoreo inteligente, realidad virtual, gestión humana, formación, finanzas y ERP, productividad e IA, gobierno). El detalle de cada área y módulo está en el «Catálogo de servicios de ARS» al final de esta base de conocimiento.

Anclas del hub `/servicios`:
- `#dia` — «Un día en ARS»: una jornada que recorre todas las áreas.
- `#areas` — tarjetas de las áreas.
- `#por-que` — por qué ARS (pilares transversales).
- `#buscar` — buscador de servicios.
- `#cierre` — solicitar demo / hablar con un asesor.

Cada área tiene su página `/servicios/<área>` con una escena 3D que se puede girar y una sección por módulo con ancla `#<módulo>` (p. ej. `/servicios/monitoreo-inteligente#vision-artificial`). Al mostrar un módulo la escena 3D vuela a su punto (cámaras, puertas, radio, nómina…). En cada módulo hay un botón «Pregúntale a Ars sobre esto».

Enviar aquí: cualquier pregunta por un servicio o módulo concreto (mostrar_servicio), o la persona que quiere entender todo lo que hace ARS (ofrecer «un día en ARS»).

## `/vision-lab` — Playground técnico

Herramienta técnica: selector de 14 modelos, fuente (imagen, video, webcam), motor «IA real» en el navegador o «Demo» simulado, reglas (dibujar ROI o línea), panel de eventos, conteo, análisis facial y visor JSON de la respuesta. No tiene anclas y no aparece en el menú: solo para perfiles técnicos o integradores; para visitantes, la demo es `/laboratorio`.

## Reglas de navegación

- Pedir demo o hablar con alguien → `/#contacto` (formulario) o WhatsApp +57 318 0005654.
- Saber qué le sirve de ARS a su empresa / un plan → `/diagnostico`.
- Una analítica concreta → `/vision#<id>` usando el id exacto del catálogo.
- Una funcionalidad de la plataforma → `/plataforma#recorrido`, o `/plataforma#arquitecto-ia` para armarla a la medida.
- Ver IA en vivo con su cámara → `/laboratorio#demo-stage`.
- Un servicio o módulo de ARS → `/servicios/<área>#<módulo>` con la herramienta mostrar_servicio (ids exactos del catálogo de servicios).
- Existe una ruta `/admin` interna (edición de datos del mapa); no es para visitantes, no la recomiendes.
