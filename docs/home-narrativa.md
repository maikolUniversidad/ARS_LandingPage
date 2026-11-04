# Narrativa del nuevo home · ARS Intelligence

> Documento de trabajo para el home 3D con scrollytelling. Reemplaza la narrativa actual «La seguridad en tres capas» (`home.*` en `src/lib/i18n/dictionaries.ts`), centrada en cámaras.
> Fecha: 4-nov-2026. Fuente de verdad de lo que se promete: `src/data/servicios/catalogo.ts` y la «Guía de lo que no se promete» en `src/data/asistente/conocimiento/25-servicios-ars.md`.

---

## 1. Posicionamiento en una línea

ARS es un **laboratorio de tecnología dedicado solo a la seguridad** (Colombia, Latinoamérica e internacional) que lleva a las empresas de seguridad privada a una nueva era: **todas las capas de un lugar protegido —vigilancia física, cámaras con IA, IoT, robótica y central— en una sola plataforma**, donde cada evento deja una traza del puesto a la gerencia.

**Idea fuerza:** ARS no es un conjunto de programas. Es una sola plataforma donde todo fluye y todo queda registrado. **Todo es una traza.**

**Actualización (4-nov-2026) · La base ERP.** ARS no es solo la central ni solo lo operativo (que es «lo wow»): por debajo, todo se apoya en un **ERP de gestión propio de ARS** para el proceso base de una empresa de seguridad —contratos y turnos, personas y nómina, documental, formación, clientes, finanzas y facturación, gobierno multiempresa y auditoría—, alimentado por todas las capas operativas. El laboratorio de tecnología de seguridad está construido sobre esa base. Mensaje: **lo operativo (wow) + ERP integral propio debajo = una sola plataforma.** Ver §6.

### Guardarraíles (qué SÍ y qué NO se dice)

| Capa | Qué se puede decir | Estado en el catálogo | Qué NO se dice |
|---|---|---|---|
| Vigilancia física | Turnos, asistencia y relevos, rondas con QR, minuta y revistas con foto, firma, ubicación y hora; radio PTT y botón de pánico desde el celular; supervisor en campo con GPS | `vivo` (`turnos-y-programacion`, `control-de-asistencia-y-relevos`, `rondas-qr`, `reportes-operativos-y-supervision`, `radio-ptt`, `boton-de-panico`, `recorridos-y-tiempo-en-el-puesto`) | «Antisuplantación»; manos libres y varios perfiles por teléfono solo como piloto |
| IA sobre las cámaras | Intrusión, cruce de línea, merodeo, objetos olvidados, conteo, aforo, mapa de calor, atributos estimados de persona; alerta con evidencia; **el operador decide** | `vivo` (`vision-artificial`) — las analíticas dependen del equipo de cada sede y se activan en piloto | Placas, armas, EPP, térmica, fuego/humo, clasificación vehicular; facial como identificación automática; «tus cámaras» |
| Domótica e IoT | Sensores, accesos, alarmas, relojes biométricos en un solo panel; alarmas de puerta | `piloto` (`iot-y-domotica`); alarmas de puerta en `acceso-inteligente` (`vivo`) | Puertas con reconocimiento facial (solo «próximamente»); marcas de equipos |
| Robótica | Línea del laboratorio: perros robot que verifican con las mismas analíticas; plataforma abierta a nuevos dispositivos | **No está en el catálogo.** Solo aparecen «drones y robots simulados» en la demo `sede-inteligente` | Que sea un producto, fechas, modelos o marcas de robots |
| ERP de gestión (la base) | Contratos y turnos, personas y nómina, documental, formación, clientes, finanzas y facturación, gobierno y auditoría, alimentados por la operación; con un ERP existente, el Agente interoperador lo conecta completo o por partes | Mixto, siempre el real del catálogo: `nomina`, `contabilidad-conectada`, `su-erp-dentro-de-ars`, `agente-interoperador-de-datos`, `auditoria-y-trazabilidad` (`vivo`); `evaluaciones-de-conocimiento` (`piloto`); `facturas-dian-y-radian`, `prima-vacaciones-y-liquidacion` (`proximamente`); `cotizador-y-crm-propios` (`hoja-de-ruta`) | Emisión de factura electrónica DIAN como producto vivo (el módulo DIAN es la bandeja de facturas **recibidas** y está «Próximamente»: se habla de «prefactura»); CRM propio como disponible; que reemplaza cualquier ERP |
| Central y gerencia | Sala de Control con mapa en vivo, despacho por radio, ventana de atención con bitácora, cierre con informe, auditoría con antes y después, reportes por cliente | `vivo` (`sala-de-control`, `boton-de-panico`, `auditoria-y-trazabilidad`, `torre-de-control`) | SLA, porcentajes de disponibilidad, certificaciones, cifras de usuarios o clientes |

Prohibido en todo el copy: «Tus cámaras», nombres de proveedores, ERPs o productos de terceros, la frase literal «revolución en la seguridad», cifras no respaldadas (las del home actual como «< 48 h», «< 1 s», «97 %», «12+» no tienen respaldo en el catálogo y deben salir).

---

## 2. Cómo comunican los referentes (investigación)

Revisión de cómo se presentan plataformas unificadas y tipo «sistema operativo» de seguridad y operaciones.

| Referente | Patrón de titular | Patrón de estructura |
|---|---|---|
| Verkada | Titular de «una plataforma» + promesa de completitud («One Platform. Complete Security.») | Lista de productos (video, acceso, alarmas…) que convergen en una consola |
| Genetec Security Center | «Plataforma unificada»: varias disciplinas (video, acceso, comunicaciones) en una solución | Módulos con nombre propio que cuelgan de un núcleo común |
| Anduril Lattice | «Sistema operativo» que fusiona miles de sensores en una sola imagen operativa | Sensores → fusión con IA → un operador controla muchos activos; énfasis en ser abierto y agnóstico al hardware |
| Ambient.ai | Categoría nueva («seguridad física agéntica») con urgencia | Capa de razonamiento continuo sobre la infraestructura existente; monitoreo → evaluación → respuesta → investigación |
| Rhombus | «Plataforma unificada en la nube», «un solo panel» | Cámaras, acceso, sensores y alarmas en un panel; recientemente suma robótica de patrulla integrada a la vigilancia |
| Samsara / Motorola Avigilon | «Operaciones conectadas» / ecosistema | Datos de campo que suben a un tablero de gestión |

**Patrones que se repiten**
1. **Titular de convergencia**: «uno» (una plataforma, un panel, una imagen) frente a «muchos» (sistemas, sensores, sedes).
2. **Nombrar una categoría** en lugar de un producto (sistema operativo, seguridad agéntica, operaciones conectadas).
3. **Sensores → inteligencia → acción**: la estructura narrativa casi siempre es una cadena causal.
4. **Agnóstico al hardware y extensible**: el valor está en la capa que integra, no en el aparato.
5. **Humano al mando**: la IA prioriza, la persona decide.

**Hueco que ARS ocupa**: ninguno de los referentes nace del **guardia en el puesto**. Todos parten de la cámara o del sensor. ARS parte de la vigilancia física —turnos, rondas, minuta, radio— y le suma las capas tecnológicas. Esa es la diferencia que el home debe mostrar: la traza empieza en una persona y termina en la gerencia.

Fuentes: [Verkada · One Integrated Physical Security Platform](https://www.verkada.com/l/verkada_demo), [Verkada · The Modern Physical Security Platform](https://www.verkada.com/l/physical-security-platform/), [Genetec · Security Center](https://www.genetec.com/solutions/all-products/security-center), [Anduril Lattice (ex2)](https://www.ex2.com.au/uncategorized/in-detail-anduril-launches-extended-lattice-os/), [Defense Daily · Lattice en Desert Guardian](https://defensedaily.com/anduril-touts-lattice-integration-with-multiple-sensors-in-centcoms-desert-guardian/advanced-transformational-technology), [Ambient.ai](https://ambient.ai/), [Rhombus · Console](https://www.rhombussystems.com/console), [Security Today · Rhombus robótica](https://securitytoday.com/Articles/2026/03/19/Rhombus-Launches-Autonomous-Mobile-Security-Platform.aspx).

---

## 3. Tres propuestas

### Propuesta A · «Todo es una traza»

- **Eyebrow:** Laboratorio de tecnología para la seguridad privada
- **H1:** Todo es una traza.
- **Subtítulo:** Del guardia en el puesto a la gerencia, cada evento queda trazado de punta a punta. ARS une vigilancia, cámaras con IA, sensores y robótica en una sola plataforma.
- **Capítulos:**
  1. Apertura — un punto de luz: el primer registro de un turno.
  2. Capas — el punto se ramifica: guardia, cámara, sensor, robot, central; cada capa se enciende y se conecta a la misma línea.
  3. Evento — 02:14:07, una línea luminosa recorre las capas y deja timestamps.
  4. Central y gerencia — la línea llega a la sala de control y sube al tablero de gerencia.
  5. Escala/CTA — muchas sedes, muchas trazas, una plataforma.
- **Fuerza:** concepto propio y memorable. **Riesgo:** abstracto; en 3 segundos no dice «plataforma» ni «capas».

### Propuesta B · «Cinco capas. Una plataforma.»

- **Eyebrow:** ARS Intelligence · Seguridad privada con IA
- **H1:** Cinco capas. Una plataforma.
- **Subtítulo:** Vigilancia física, cámaras con IA, IoT, robótica y central de operaciones dejan de ser sistemas sueltos. En ARS todo fluye en una sola plataforma.
- **Capítulos:**
  1. Apertura — cinco piezas flotando separadas (el caos actual de herramientas).
  2. Capas — cada pieza encaja en la pila y se enciende con su etiqueta de estado.
  3. Evento — la alarma atraviesa la pila de abajo hacia arriba.
  4. Central y gerencia — la pila se ve desde arriba: un tablero.
  5. Escala/CTA — la pila se replica en muchas sedes.
- **Fuerza:** se entiende al instante. **Riesgo:** genérico, cercano a lo que dicen todos los referentes; el número «cinco» se vuelve rígido si se suma una capa.

### Propuesta C · «La seguridad, encendida»

- **Eyebrow:** Una nueva era para la seguridad privada
- **H1:** La seguridad privada, encendida.
- **Subtítulo:** ARS es el laboratorio que conecta guardias, cámaras, sensores y robots con inteligencia artificial, para que cada sede piense, avise y responda como un solo sistema.
- **Capítulos:**
  1. Apertura — una sede a oscuras.
  2. Capas — se encienden una a una: puesto, cámaras, sensores, robot, central.
  3. Evento — la sede reacciona como un organismo.
  4. Central y gerencia — la luz converge en la central.
  5. Escala/CTA — la ciudad se enciende sede por sede.
- **Fuerza:** muy visual, transmite «nueva era». **Riesgo:** metáfora sin dato; no comunica trazabilidad, que es la diferencia real del catálogo.

### Elección: híbrido A + B → «Todas las capas. Una sola traza.»

Se elige la **Propuesta A** con el titular reforzado con la claridad de B:

- **H1 ES:** Todas las capas de la seguridad. Una sola traza.
- **H1 EN:** Every layer of security. One trace.

**Por qué:**
1. **Se entiende en segundos**: «todas las capas» dice integración; «una sola traza» dice que todo fluye y queda registrado. Responde al mensaje central sin necesidad de leer el subtítulo.
2. **Es propio**: los referentes dicen «una plataforma» o «un panel»; «traza» es un concepto que nadie más usa y que el catálogo respalda de verdad (rondas con evidencia, bitácora automática del pánico, auditoría con antes y después y huella de integridad, galería forense de visión).
3. **Organiza el scrollytelling**: la traza es literalmente el hilo visual (una línea de luz) que recorre las capas, así el 3D y el copy cuentan la misma historia.
4. **No depende del número de capas**: la robótica y los dispositivos futuros se suman sin cambiar el titular, coherente con un laboratorio que sigue extendiendo la plataforma.
5. **Nueva era sin decir «revolución»**: el eyebrow y el capítulo de escala transmiten el salto («una nueva era», «todo es inteligente») sin la frase prohibida.

---

## 4. Copy final (listo para usar)

### 4.1 Hero (`hero`)

| Campo | ES | EN |
|---|---|---|
| Eyebrow | Laboratorio de tecnología para la seguridad privada | Technology lab for private security |
| H1 | Todas las capas de la seguridad. Una sola traza. | Every layer of security. One trace. |
| Subtítulo | Vigilancia física, cámaras con IA, sensores, robótica y central de operaciones, sobre un ERP propio que gestiona la empresa. Una sola plataforma: cada evento queda trazado, del puesto a la gerencia. | Guarding, AI on cameras, sensors, robotics and the operations center, on top of our own ERP that runs the company. One platform: every event is traced, from the post to management. |
| Chips | Las cinco capas + «La base · ERP de gestión» | The five layers + "The base · Management ERP" |
| CTA primario | Solicitar demo | Request a demo |
| CTA secundario | Ver cómo fluye un evento | See how an event flows |
| Indicador de scroll | Desliza · mira cómo se encienden las capas | Scroll · watch the layers come alive |

> El CTA secundario hace scroll al capítulo `traza`. El primario abre el formulario de contacto.

### 4.2 Capítulos

Etiquetas de estado (ES / EN):
- **En operación** / **Live** → módulos `vivo`.
- **Piloto** / **Pilot** → módulos `piloto`.
- **Laboratorio** / **In the lab** → línea en desarrollo, no es producto.

#### `hero` · Apertura
(ver 4.1)

#### `fisica` · Capa 01 — Vigilancia física
- **Estado:** En operación / Live
- **Kicker ES:** Capa 01 · Vigilancia física
- **Título ES:** Todo empieza en el puesto.
- **Cuerpo ES:** Turnos, relevos, rondas con QR y minuta desde el celular, con foto, firma, ubicación y hora. Radio y botón de pánico en el mismo teléfono, y el supervisor siempre visible en campo.
- **Kicker EN:** Layer 01 · Physical guarding
- **Title EN:** It all starts at the post.
- **Body EN:** Shifts, handovers, QR rounds and logbook from the phone, with photo, signature, location and time. Radio and panic button on the same phone, and the field supervisor always in view.

#### `vision` · Capa 02 — IA sobre las cámaras
- **Estado:** En operación / Live — nota pequeña: «Analíticas según el equipo de cada sede» / «Analytics depend on each site's equipment»
- **Kicker ES:** Capa 02 · Visión con IA
- **Título ES:** Las cámaras ya no solo graban. Avisan.
- **Cuerpo ES:** Intrusión, cruce de línea, merodeo, objetos olvidados, conteo y aforo sobre las cámaras que la sede ya tiene. Cada alerta llega con foto y video, y una persona confirma antes de actuar.
- **Kicker EN:** Layer 02 · AI vision
- **Title EN:** Cameras no longer just record. They alert.
- **Body EN:** Intrusion, line crossing, loitering, left objects, people counting and occupancy on the cameras a site already has. Every alert arrives with photo and video, and a person confirms before acting.

#### `iot` · Capa 03 — Domótica e IoT
- **Estado:** Piloto / Pilot
- **Kicker ES:** Capa 03 · Sensores e IoT
- **Título ES:** El edificio también reporta.
- **Cuerpo ES:** Sensores, controles de acceso, alarmas y relojes biométricos de todas las sedes en un solo panel. Una puerta abierta fuera de horario se vuelve un evento más de la misma traza.
- **Kicker EN:** Layer 03 · Sensors and IoT
- **Title EN:** The building reports too.
- **Body EN:** Sensors, access controls, alarms and biometric clocks from every site in a single panel. A door opened after hours becomes one more event in the same trace.

#### `robotica` · Capa 04 — Robótica
- **Estado:** Laboratorio / In the lab
- **Kicker ES:** Capa 04 · Robótica · Laboratorio
- **Título ES:** La próxima ronda puede tener cuatro patas.
- **Cuerpo ES:** En nuestro laboratorio desarrollamos perros robot que recorren y verifican con las mismas analíticas de las cámaras. La plataforma está pensada para sumar nuevos dispositivos sin cambiar la forma de operar.
- **Kicker EN:** Layer 04 · Robotics · In the lab
- **Title EN:** The next patrol may walk on four legs.
- **Body EN:** In our lab we are developing robot dogs that patrol and verify using the same camera analytics. The platform is built to add new devices without changing the way you operate.

> En el 3D, el robot se muestra con un rótulo visible «Laboratorio» y estética de prototipo (wireframe o translúcido) para que no se lea como producto.

#### `central` · Capa 05 — Central de operaciones y gerencia
- **Estado:** En operación / Live
- **Kicker ES:** Capa 05 · Central y gerencia
- **Título ES:** Una central que ve todo. Una gerencia que lo sabe al instante.
- **Cuerpo ES:** Mapa en vivo de cada sede y cada persona, radio, chat y pánico en la misma pantalla. La gerencia ve en tiempo real qué está cubierto, qué falta y qué pasó.
- **Kicker EN:** Layer 05 · Operations center and management
- **Title EN:** A center that sees everything. Management that knows instantly.
- **Body EN:** A live map of every site and every person, with radio, chat and panic alerts on the same screen. Management sees in real time what is covered, what is missing and what happened.

#### `erp` · La base — ERP de gestión (nuevo)
- **Estado:** mixto (cada módulo con su estado real del catálogo en la sección `#la-base`)
- **Kicker ES:** La base · ERP de gestión
- **Título ES:** Debajo de todo, un ERP hecho para la seguridad.
- **Cuerpo ES:** Lo operativo es lo que se ve. Por debajo, el ERP de ARS administra la empresa de seguridad: contratos y turnos, personas y nómina, documentos, formación, clientes, finanzas y gobierno. Cada capa lo alimenta sola.
- **Conversiones (ES):** Turno cumplido → Nómina · Ronda y evento → Informe al cliente · Servicio prestado → Prefactura · Nómina y facturación → Contabilidad. Nota: «Con el ERP de ARS o con el que ya usa: el Agente interoperador los conecta, completo o por partes.»
- **Kicker EN:** The base · Management ERP
- **Title EN:** Underneath it all, an ERP built for security.
- **Body EN:** Operations is what you see. Underneath, the ARS ERP runs the security company: contracts and shifts, people and payroll, documents, training, clients, finance and governance. Every layer feeds it on its own.
- **Conversions (EN):** Shift worked → Payroll · Patrol and event → Client report · Service delivered → Pre-invoice · Payroll and billing → Accounting.
- **3D:** la cámara baja al cimiento; dentro del perímetro de la sede el suelo queda como retícula transparente, los edificios se vuelven fantasma y aparece la losa holográfica del ERP con siete módulos. Cinco flujos de partículas bajan desde los nodos de las capas (ronda, cámara, sensor, robot, central) a sus módulos y un pulso recorre Contratos y turnos → Personas y nómina → Clientes → Finanzas y facturación → Gobierno y auditoría.

#### `traza` · Un evento recorre las capas
- **Kicker ES:** 02:14 a. m. · Todo es una traza
- **Título ES:** Un evento. Cinco capas. Ningún cabo suelto.
- **Cuerpo ES:** Así fluye una alerta en ARS: cada capa suma su evidencia a la misma línea de tiempo, y nada se pierde entre un radio, un chat y una planilla.
- **Kicker EN:** 2:14 a.m. · Everything is a trace
- **Title EN:** One event. Five layers. No loose ends.
- **Body EN:** This is how an alert flows in ARS: each layer adds its evidence to the same timeline, and nothing gets lost between a radio, a chat and a spreadsheet.

#### `escala` · Escala y CTA
- **Kicker ES:** Operación + gestión · todas las sedes
- **Título ES:** La nueva era de la seguridad privada ya opera.
- **Cuerpo ES:** Cada sede, cada cliente y cada turno en la misma plataforma: la operación encima, el ERP de gestión debajo y multiagentes de IA que proponen mientras una persona decide. Desde Colombia para Latinoamérica y el mundo.
- **CTA ES:** Solicitar demo · Ver todos los servicios
- **Kicker EN:** Operations + management · every site
- **Title EN:** The new era of private security is already running.
- **Body EN:** Every site, every client and every shift on the same platform: operations on top, the management ERP underneath, and AI multi-agents that propose while a person decides. From Colombia to Latin America and the world.
- **CTA EN:** Request a demo · See all services

### 4.3 Evento de ejemplo (línea de tiempo del capítulo `traza`)

Escenario ficticio de demostración (sin nombres de clientes). Cada paso lleva la etiqueta de su capa y su estado.

| Hora | Capa | ES | EN | Respaldo en el catálogo |
|---|---|---|---|---|
| 02:14:07 | Vigilancia física | Ronda: el vigilante escanea el punto 7 de la cerca norte y reporta una novedad con foto. | Patrol: the guard scans checkpoint 7 on the north fence and reports an incident with a photo. | `rondas-qr`, `reportes-operativos-y-supervision` (vivo) |
| 02:14:19 | Visión IA | Cámara 04: la analítica de cruce de línea confirma una persona en zona restringida; el operador valida la alerta. | Camera 04: line-crossing analytics confirms a person in a restricted zone; the operator validates the alert. | `vision-artificial` (vivo) |
| 02:14:31 | Sensores · Piloto | Sensor: puerta de la bodega 2 abierta fuera de horario. | Sensor: warehouse 2 door opened after hours. | `acceso-inteligente` alarmas de puerta (vivo), `iot-y-domotica` (piloto) |
| 02:14:58 | Robótica · Laboratorio | Robot: verifica el sector con las mismas analíticas y envía video a la central. | Robot: checks the area with the same analytics and streams video to the center. | Solo demo simulada en `sede-inteligente` — rotular «Laboratorio» |
| 02:15:24 | Central | Central: despacha por radio al supervisor más cercano desde el mapa en vivo. | Operations center: dispatches the nearest supervisor by radio from the live map. | `sala-de-control`, `radio-ptt` (vivo) |
| 02:31:46 | Gerencia | Cierre: informe con evidencia, responsable y tiempos; la gerencia lo ve en su tablero. | Closure: report with evidence, owner and timings; management sees it on its dashboard. | `boton-de-panico` (cierre con informe y bitácora), `auditoria-y-trazabilidad` (vivo) |

Pie de la línea de tiempo: ES «Escenario de demostración.» / EN «Demo scenario.»

### 4.4 Cifras (solo respaldadas en el repo)

| Cifra | ES | EN | De dónde sale |
|---|---|---|---|
| 10 | áreas de servicio en una plataforma | service areas in one platform | `AREAS` en `src/data/servicios/catalogo.ts` (10 áreas A–J); también «en 10 áreas» en `25-servicios-ars.md` |
| 71 | módulos en el catálogo | modules in the catalog | Conteo de módulos en `src/data/servicios/catalogo.ts` (inventario del 4-nov-2026) |
| 59 | módulos en operación | modules live today | Módulos con `estado: "vivo"` en `src/data/servicios/catalogo.ts` |
| 8 | analíticas de video en el catálogo | video analytics in the catalog | Lista cerrada de la «Guía de lo que no se promete» en `25-servicios-ars.md` y función «Analíticas por cámara» de `vision-artificial` (intrusión, cruce de línea, merodeo, objetos olvidados, conteo, aforo, mapa de calor, atributos estimados) |

> Recomendación de implementación: calcular 10 / 71 / 59 desde `AREAS` en tiempo de build (`AREAS.length`, `AREAS.flatMap(a => a.modulos).length`, filtro por `estado === "vivo"`) para que no queden desactualizadas. Las cifras del home actual («< 48 h», «24/7», «12+», «< 1 s», «97 %») no tienen respaldo en el catálogo y deben retirarse.

### 4.5 SEO

| Campo | ES | EN |
|---|---|---|
| Título (≤ 60) | ARS Intelligence · Operación y ERP de seguridad, una traza | ARS Intelligence · Security operations and ERP, one trace |
| Descripción (≤ 155) | Laboratorio de tecnología para la seguridad privada: vigilancia, cámaras con IA, IoT y central sobre un ERP propio de gestión, en una sola plataforma. | Technology lab for private security: guarding, AI cameras, IoT and an operations center on top of our own management ERP, in one platform. |

Longitudes: título ES 58, descripción ES 150 caracteres. (El sitio publica los metadatos en español.) Cuerpos de capítulo: todos entre 27 y 33 palabras.

---

## 5. Notas para diseño y 3D

- **La traza es el hilo visual**: una línea de luz que nace en el puesto (capítulo `fisica`), atraviesa cada capa al encenderse y en `traza` se convierte en la línea de tiempo con los seis timestamps.
- **Etiqueta de estado siempre visible** junto al nombre de cada capa (chip pequeño). Colores sugeridos: verde «En operación», ámbar «Piloto», violeta o contorno punteado «Laboratorio».
- **Humano al mando**: en `vision` y `traza` debe verse al operador confirmando; nunca una IA que actúa sola.
- **Sin marcas ni clientes** en pantallas, rótulos 3D ni videos. Las capturas de `/public/servicios/capturas` ya están revisadas para esto.
- **Enlaces sugeridos por capa** (en el recap o como enlace bajo cada capítulo): `fisica` → `/servicios/operacion-en-campo`, `vision` → `/vision`, `iot` → `/servicios/monitoreo-inteligente#iot-y-domotica`, `robotica` → `/laboratorio`, `central` → `/servicios/centro-de-operaciones`.

---

## 6. La base: un ERP hecho para la seguridad (4-nov-2026)

**Mensaje:** lo operativo (las cinco capas, «lo wow») + un ERP integral propio debajo = **una sola plataforma**. ARS no es solo la central: la operación alimenta sola la gestión de la empresa.

**Dónde aparece en el home**
1. **Hero:** el subtítulo menciona el ERP propio y los chips suman «La base · ERP de gestión».
2. **Capítulo `erp`** (entre `central` y `traza`): la cámara baja al cimiento 3D y se ve cómo un turno, una ronda o un evento se convierten en nómina, informe al cliente, prefactura y contabilidad (§4.2).
3. **Riel de capas:** debajo de las cinco capas, una fila «La base · ERP de gestión».
4. **Sección `#la-base`** (después de la historia, antes del recap): «La base: un ERP hecho para la seguridad», con dos niveles —**Arriba · Operación** (las cinco capas con su estado) y **Abajo · Gestión** (siete bloques con los módulos reales de `src/data/servicios`, su estado y enlace a `/servicios/<área>#<módulo>`)— y el CTA «Ver la arquitectura completa» → `/arquitectura`.
5. **`escala` y recap:** dejan claro operación + ERP.
6. **Navegación:** «Arquitectura» → `/arquitectura` en el header del home y en el de `/servicios` (escritorio y móvil).

**Bloques del ERP y módulos del catálogo** (definidos en `src/components/home/erp-groups.ts`; nombre y estado se leen del catálogo en build):

| Bloque | Módulos |
|---|---|
| Contratos y turnos | `turnos-y-programacion`, `control-de-asistencia-y-relevos`, `ordenes-de-servicio-del-erp` |
| Personas y nómina | `seleccion-y-contratacion`, `empleados-prestamos-y-contratos`, `nomina`, `prima-vacaciones-y-liquidacion` |
| Documental | `area-documental-inicio`, `cargue-inteligente-de-documentos`, `expedientes-y-descargas-masivas`, `auditoria-de-gestion-humana` |
| Formación | `capacitacion-virtual`, `disenador-de-cursos-con-ia`, `evaluaciones-de-conocimiento` |
| Clientes | `clientes-contratos-y-planes`, `portal-documental-para-el-cliente`, `cotizador-y-crm-propios` |
| Finanzas y facturación | `contabilidad-conectada`, `asistente-contable-con-ia`, `facturas-dian-y-radian`, `su-erp-dentro-de-ars` |
| Gobierno y auditoría | `configuracion-multiempresa`, `auditoria-y-trazabilidad`, `torre-de-control`, `agente-interoperador-de-datos` |

**Honestidad:** el catálogo también describe que ARS trabaja junto al ERP que la empresa ya tenga (Agente interoperador, «Su ERP dentro de ARS»). Por eso el copy dice «con el ERP de ARS o con el que ya usa». No se dice «factura electrónica DIAN» como capacidad viva: la conversión se nombra «prefactura» (facturación masiva: calcular líneas, aprobar, prefacturar y validar).
