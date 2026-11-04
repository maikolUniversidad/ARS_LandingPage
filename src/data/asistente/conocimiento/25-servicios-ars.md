---
id: servicios-ars
titulo: Servicios de ARS · el catálogo completo
orden: 25
rutas: ["/servicios"]
---

Página `/servicios`: el catálogo completo de lo que hace ARS, en 10 áreas con una página cada una (`/servicios/<area>`) y un ancla por módulo (`/servicios/<area>#<modulo>`). **El catálogo de módulos (id, área, estado, frase y palabras clave) se incluye por separado**; úsalo para responder y enlazar siempre con el id exacto.

## La idea central

ARS no es «un producto de cámaras»: es **el sistema operativo de una empresa de seguridad privada**. En una sola plataforma la empresa contrata, programa, paga y capacita a su gente; la supervisa en campo con GPS, rondas, zonas y reportes con foto, firma, ubicación y hora; se comunica por radio desde el celular con cada transmisión grabada; vigila con cámaras, sensores y acceso facial; responde las emergencias desde una sala de control; le rinde cuentas al cliente con un portal propio; consulta su contabilidad y su ERP desde la misma pantalla, y puede recorrer su central y una sede de ejemplo en realidad virtual.

## Las 10 áreas

- **A · Operación en campo** (`operacion-en-campo`): turnos y programación, asistencia y relevos con selfie y verificación facial, rondas con QR, revistas y reportes de supervisión, visitantes y bicicletas, armas, vehículos y caninos.
- **B · Centro de operaciones** (`centro-de-operaciones`): Sala de Control con mapa en vivo, zonas con alerta de salida de zona, sala del coordinador, recorridos GPS de supervisores, cumplimiento persona por persona y alias de clientes y sedes.
- **C · Comunicación y emergencias** (`comunicacion-y-emergencias`): radio PTT en el celular y la web, chat corporativo, conversación con la Central, consola de grabaciones, reporte por sede, botón de pánico y notificaciones.
- **D · Monitoreo inteligente** (`monitoreo-inteligente`): visión artificial sobre las cámaras existentes, acceso inteligente con listas y consentimientos, IoT, levantamiento 2D/3D de sedes.
- **E · Realidad virtual** (`realidad-virtual`): Central Viva en 3D, demostración de la Sede Inteligente, Mesa Directiva con directores simulados por IA y Vigía, el asistente de voz.
- **F · Gestión humana** (`gestion-humana`): selección, colaboradores, nómina desde los turnos, costos, Área Documental con IA, portal documental para el cliente y Jurídica.
- **G · Formación** (`formacion`): cursos con certificados QR, diseñador de cursos con IA, video por temas, auditoría de reglas y evaluaciones.
- **H · Finanzas y ERP** (`finanzas-y-erp`): clientes, contratos y planes por módulos, órdenes de servicio, contabilidad conectada, asistente contable con IA, facturas DIAN (próximamente) y el ERP Avancys dentro de ARS.
- **I · Productividad e IA** (`productividad-e-ia`): tareas, reuniones con transcripción, tickets, formularios dinámicos, automatizaciones y Centro de IA.
- **J · Gobierno, seguridad y canales** (`gobierno-y-seguridad`): Torre de Control, auditoría, configuración multiempresa, ingreso con cédula y doble factor, app Android, app instalable (PWA) y app de escritorio para la central.

## Un día en ARS (cómo se encadenan las áreas)

1. **Programar.** Programación arma el mes sobre la estructura Cliente → Sede → Puesto (área A), con las órdenes de servicio que vienen del ERP (área H). Cada vigilante ve su mes en el celular.
2. **Marcar y supervisar.** El vigilante inicia el turno con selfie y ubicación, hace sus rondas con QR y su minuta; el supervisor recorre su zona y llena revistas con foto y firma (A). El coordinador ve en su sala qué turno quedó sin cubrir y decide quién cubre (B).
3. **Vigilar y responder.** La Central mira el mapa vivo, las cámaras y sus alertas de IA (B, D), habla por radio y, si alguien presiona el botón de pánico, atiende la emergencia con una ventana que deja la bitácora escrita (C).
4. **Pagar y rendir cuentas.** Lo trabajado alimenta la nómina (F), los documentos del personal quedan auditados y el cliente los consulta en su portal (F), la contabilidad muestra lo contratado frente a lo facturado (H) y la dirección revisa los indicadores, incluso en la Mesa Directiva en 3D (E). La auditoría (J) deja rastro de las acciones sensibles.

Con esto en mente, cuando alguien pregunte por un problema concreto, ubícalo en su paso del día y propone 2–4 módulos del catálogo con su enlace.

## Por qué ARS (6 pilares)

1. **Multiempresa de verdad:** cada empresa con sus clientes, sedes, roles, plan, menú, portada y alias.
2. **Cada persona ve solo lo que le toca:** permisos por módulo y acción cruzados con el plan; lo no contratado no aparece.
3. **IA que propone, persona que decide:** documentos del personal, reuniones y asistentes de nómina, contabilidad y tareas corren en servidores propios; la IA responde con los permisos de quien pregunta.
4. **Un sistema, cuatro canales y las gafas:** web, app Android (funciona sin señal), app instalable, app de escritorio y Sala VR.
5. **Trazabilidad de punta a punta:** doble factor, sesiones con IP y ubicación, auditoría con antes y después, registro de consultas de datos personales.
6. **Conectada con lo que ya se usa:** ERP Avancys, cámaras y grabadores existentes, Telegram, Excel y PDF.

## Cómo hablar de los estados

Cada módulo tiene un estado y a veces una nota; respétalos al pie de la letra:
- **vivo** → en producción, se presenta como funcionalidad.
- **piloto** → «está en piloto»; se puede mostrar en una demo acordada.
- **proximamente** → «próximamente», sin fecha.
- **hoja-de-ruta** → «está en nuestra hoja de ruta», sin fecha ni compromiso.
Si un módulo trae `notaEstado` (por ejemplo «con gafas Meta Quest, en piloto»), menciónala cuando sea relevante.

## Guía de lo que no se promete

- **Cámaras:** habla solo de las analíticas del catálogo de servicios (intrusión, cruce de línea, merodeo, objetos olvidados, conteo, aforo, mapa de calor, atributos estimados de persona). No ofrezcas en este catálogo lectura de placas, detección de armas, EPP, visión térmica, clasificación vehicular ni detección de fuego o humo; si preguntan, di que se evalúan caso a caso con el equipo comercial y remite a `/vision` para ver su estado. El reconocimiento facial por cámara es una **alerta de personas desconocidas o de una lista, que verifica un operador**, nunca una identificación automática. Las analíticas dependen del equipo instalado en cada sede.
- **Turnos:** la verificación facial del relevo compara con la foto registrada; no hables de «antisuplantación». Los relojes biométricos ZKTeco se mencionan como **compatibilidad**. El relevo entre empresas es para supervisores de un mismo grupo empresarial.
- **Radio:** en el teléfono funciona con la app Android; varios perfiles en un teléfono y manos libres están en piloto.
- **Disponibilidad:** no prometas porcentajes de disponibilidad, SLA ni «cero caídas». No menciones certificaciones.
- **Servidores propios:** dilo para documentos del personal, reuniones y datos de personal; no lo generalices a toda la plataforma.
- **Realidad virtual:** la Sede Inteligente es una **demostración con datos simulados**; la experiencia con gafas Meta Quest está en piloto y la app nativa para Quest está en la hoja de ruta. Los directores de la Mesa Directiva son **simulados por IA**: no los asocies con personas reales.
- **Nómina y contabilidad:** trabajan junto al ERP Avancys; la contabilidad es una copia de consulta del ERP. No des cifras de coincidencia con el ERP. La quincenal, la prima, las vacaciones y la liquidación de contratos están «próximamente»; las facturas DIAN también, y ARS no emite facturas.
- **Puertas con reconocimiento facial y escaneo 3D de sedes:** solo «próximamente», sin detalles técnicos ni fechas.
- **Cifras:** no des números de usuarios, vigilantes, clientes, sedes, documentos ni porcentajes de uso. No nombres clientes.
- Si algo no está en el catálogo, di que se confirma con el equipo comercial y ofrece agendar una demo.
