---
id: proyectos
titulo: Proyectos por sector y ciudad
orden: 50
rutas: ["/proyectos"]
---

Página `/proyectos`: «La plataforma, operando en terreno». Muestra cómo se combina el catálogo de servicios según el tipo de cliente, con un mapa de Colombia y Perú, filtros y una ficha por proyecto. Los datos viven en `src/data/proyectos`.

## Cómo se usa

- **Mapa** (`#mapa`): un marcador por ciudad con su número de proyectos; tocar una ciudad filtra los casos y volver a tocarla quita el filtro.
- **Filtros**: estado (En operación, Piloto, En desarrollo), país (Colombia, Perú) y área de servicio (las 10 áreas del catálogo).
- **Ficha**: se abre desde cada tarjeta y tiene enlace propio (`/proyectos#<id>`). Muestra cliente (tipo, sin nombre), sector, ciudad, escala, el reto, cómo se resolvió, lo que cambia y la lista de **módulos del catálogo**, cada uno enlazado a `/servicios/<area>#<modulo>`. Cierra con «Hacer el diagnóstico» (`/diagnostico`), «Quiero algo así» (WhatsApp) y «Ver la plataforma» (`/plataforma`).
- **Cómo empieza un proyecto** (`#como-empieza`): diagnóstico → piloto en una sede → operación y escala.

## Los proyectos

- `campus-universitario` · Universidad privada · Bogotá · En operación: rondas con QR, asistencia y relevos, visitantes y bicicletas, visión artificial, Sala de Control, botón de pánico.
- `red-de-sedes-publicas` · Entidad pública del orden nacional · Bogotá · En operación: programación, acceso inteligente, reporte por sede, portal documental para el cliente, auditoría.
- `instalaciones-industriales` · Compañía del sector energético · Medellín · En operación: recorridos y tiempo en el puesto, zonas y salida de zona, radio PTT, botón de pánico, recursos operativos.
- `estaciones-de-transporte` · Sistema de transporte masivo · Bogotá · En operación: sala del coordinador, cumplimiento, radio PTT, consola de radio, visión artificial (conteo y aforo), notificaciones.
- `recinto-de-eventos` · Recinto ferial y de eventos · Bogotá · En operación: programación, visitantes, visión artificial (aforo y mapa de calor), chat corporativo, reportes con foto.
- `oficinas-corporativas` · Grupo corporativo · Lima · En operación: puertas con reconocimiento facial, acceso inteligente, IoT, Sala de Control, app de escritorio.
- `back-office-conectado` · Empresa de seguridad privada · Cali · **Piloto** (incluye Facturas DIAN y RADIAN, en piloto): nómina, Agente interoperador de datos, contabilidad conectada, auditoría de Gestión Humana.
- `formacion-del-personal` · Empresa de seguridad privada · Barranquilla · En operación: capacitación virtual con certificados QR, diseñador de cursos con IA, evaluaciones, Central Viva y Academia de vigilantes en VR (piloto).
- `verificacion-con-robot` · Laboratorio ARS · Bogotá · **En desarrollo**: perros robot que verifican con las mismas analíticas y envían video a la central. No es un producto: no des fechas, modelos ni marcas.

## Cautela

- Todas las fichas están marcadas como **«Caso de referencia»**: describen operaciones reales de la plataforma, pero el cliente, la ciudad y la escala están pendientes de validación. No nombres clientes ni digas que una entidad concreta es cliente.
- No hay cifras de proyectos (cámaras, sedes, vigilantes, disponibilidad). Si las piden, di que el detalle se confirma con el equipo comercial e invita al diagnóstico o a una demo.
- Si preguntan por su sector, recomienda la ficha más parecida con su enlace (`/proyectos#<id>`) y 2–4 módulos del catálogo.
