---
id: segun-tamano-empresa
titulo: Cómo opera ARS según el tamaño de la empresa (orientativo)
orden: 40
rutas: ["/plataforma", "/vision", "/proyectos"]
---

**Importante**: el sitio no publica planes ni paquetes por tamaño de empresa. Lo que sigue es una orientación derivada de lo que sí muestra el sitio (casos de uso, familia de modelos lite, arquitectura multisede y proyectos de referencia por sector). Preséntalo siempre como orientativo y aclara que el alcance, los módulos incluidos y el costo de cada caso son a confirmar con el equipo comercial.

## Principios comunes a cualquier tamaño

- Se parte de la infraestructura existente: cámaras, NVRs, guardas y sistemas actuales, sin reemplazar hardware.
- Los modelos se activan por cámara, con reglas por cámara, y pueden correr en edge o nube según la latencia requerida.
- La IA apoya al equipo humano; las alertas llegan con evidencia a quien opera.
- La misma plataforma escala por niveles: Cliente → Sede/Zona → Cámaras/Puestos/Guardas → Turnos/Rondas → Alertas → Evidencia → Reportes.

## Empresa pequeña (una sede, pocas cámaras) — orientativo

- Punto de entrada natural: **modelos lite · bajo costo**, analíticas livianas sobre una sola cámara (góndola, bodega, puertas, autopago). Ejemplos: `huecos`, `puertas`, `fleje`, `canastillas`, `vencido`, `autopago`, `zonaCiega`.
- Analíticas puntuales de alto impacto sobre las cámaras que ya tiene: `conteo`, `intrusion`, `apertura`, `cierre`.
- Perfil típico por casos del sitio: tienda, conjunto residencial pequeño, local comercial.
- Plataforma: alertas con evidencia y reportes básicos; turnos y rondas si tiene vigilancia propia o contratada.

## Empresa mediana (varias sedes o una sede grande) — orientativo

- Combinación de plataforma operativa + analíticas por familia: control de turnos, rondas inteligentes con tareas, formularios dinámicos, central de monitoreo, mapa en tiempo real y PTT.
- Analíticas según el negocio: retail (`calor`, `filas`, `aforo`, `hurto`), logística (`placas`, `epp`, `racks`, `pasillos`), campus (`acceso`, `merodeo`, `cruce`).
- Perfil típico por casos del sitio: universidad o campus, centro logístico, conjunto residencial con varias torres, cadena de tiendas.
- Reportes por sede y comparativos (cumplimiento de rondas, tiempos de respuesta, novedades por sede).

## Empresa grande / multi-cliente — orientativo

- Arquitectura **multi-cliente · multi-sede · multi-zona** completa, central de monitoreo con video wall, priorización de riesgos y operadores por turno.
- Empresas de seguridad que gestionan muchos clientes: programación de turnos, supervisión de guardas, reportes automáticos y trazabilidad para facturación o cumplimiento.
- Analíticas de prevención y riesgo de alto valor: `negras`, `armas`, `aglomeracion`, `caidas`, `fuego`, `abandono`, y alertas de rostros contra listas que verifica un operador (la lectura de placas se evalúa caso a caso con el equipo comercial).
- Proyectos de referencia en `/proyectos`: redes de sedes públicas, transporte masivo, energía, recintos de eventos y back-office de empresas de seguridad. Son casos de referencia sin cifras; no inventes escalas ni cantidades.

## Qué preguntar al visitante para orientar

1. Sector y tipo de instalación. 2. Número aproximado de sedes y cámaras. 3. Si ya tiene NVR/grabadores y vigilancia física. 4. El problema principal (pérdidas, filas, intrusión, EPP, control de guardas, reportes). 5. Si necesita gestión de turnos y rondas o solo analíticas de video.

Con esas respuestas propone una ruta: analíticas concretas en `/vision#<id>`, la plataforma en `/plataforma#recorrido` (o a su medida en `/plataforma#arquitecto-ia`), el diagnóstico completo en `/diagnostico` y cierre con demo en `/#contacto`.
