---
id: vision-analiticas
titulo: Módulo de Visión · Analíticas de video
orden: 30
rutas: ["/vision"]
---

Página `/vision`: «Cada analítica, vista funcionando». El catálogo proviene del portafolio «Analíticas en 3D · Vigías». **El catálogo completo de las 45 analíticas (id, nombre, familia, estado, descripción corta) se incluye por separado al final de esta base de conocimiento**; úsalo para responder y enlazar siempre con el id exacto: `/vision#<id>`.

## Cómo se presenta cada analítica

- **Simulación 3D**: la cámara ya instalada, lo que ve y el momento exacto en que avisa; cada simulación recorre fases con estados Vigilando → Detectando → Alerta → Resuelto.
- **Prueba real**: cuando existe, video o imagen real procesado por los modelos (CCTV del dataset MEVA bajo CC BY 4.0, Pexels y Mixkit con licencia comercial, o laboratorio propio), «sin retoques». Si no existe, se muestra «Video real en producción».
- **Cómo se activa**: los pasos iluminados al ritmo de la simulación.
- Recursos: presentación 3D completa (`/analiticas-3d/index.html`) y PowerPoint descargable del portafolio (`/analiticas-3d/Portafolio-Analiticas-Vigias.pptx`).

## Mensaje clave: sin equipo nuevo

«45 analíticas. Las mismas cámaras.» Según la página, todo corre en el propio servidor del sitio, sobre el circuito de cámaras ya instalado («0 equipos nuevos»). La compatibilidad concreta con cada cámara o servidor del cliente se valida en la demo: a confirmar con el equipo comercial.

## Las 4 familias

1. **Comercial y comportamental** (`comercial`, 7 analíticas) — «Quién entra, qué mira y cuánto se queda. Las cifras con las que se decide la tienda.» Seguimiento de personas, conteo, demografía, mapa de calor, permanencia, cruce de líneas, comprador activo. Para retail, centros comerciales, marketing y operación de tienda.
2. **Operativo y de eficiencia** (`operativo`, 9) — «Filas, aforo, parqueadero, personal y piso limpio: la operación del día, medida sola.» Listas blancas, filas y cajas, aforo, placas y parqueo, detección de personal, derrames, guardián de puestos, apertura de tienda, cierre de puerta sin autorización.
3. **Prevención y riesgo** (`prevencion`, 16) — «Lo que tiene que avisar en el acto: intrusos, armas, caídas, peleas, fuego y hurto.» Listas negras, merodeo, intrusión, acceso no autorizado, aglomeración, EPP, caídas, hurto, ocultamiento de producto, armas de fuego, armas blancas, peleas, humo y fuego, abandono de objetos, ocultamiento de rostro, retiro de activos.
4. **Modelos lite · bajo costo** (`lite`, 13) — «Analíticas livianas sobre una sola cámara: góndolas, bodega, puertas, autopago.» Verificación de etiqueta, canastillas y cajas, puertas abiertas/cerradas, huecos en góndola, producto vencido, vencimiento y destrucción, bodega, sobrecarga en racks, pasillos libres, exhibición vs. planograma, trazabilidad góndola–caja, validación de autopago, zona ciega.

## Estado de madurez

Todas las analíticas del portafolio están disponibles. Algunas muestran además un sello del equipo de Visión («funcionando a diario», «funcionando en silencio», «listo para instalar», «con evidencia»). Lo que sí depende de cada sede es el equipo instalado: cámaras, resolución e iluminación se confirman en la visita técnica.

## Cómo recomendar

- Pregunta el sector y el problema (pérdidas, filas, seguridad perimetral, EPP, inventario…) y propone 2–4 analíticas del catálogo con su enlace `/vision#<id>`.
- Retail/tienda: `calor`, `conteo`, `permanencia`, `filas`, `huecos`, `hurto`, `autopago`, `trazabilidad`.
- Industrial/logística: `epp`, `intrusion`, `placas`, `racks`, `pasillos`, `bodega`, `fuego`.
- Perímetro/seguridad física: `intrusion`, `merodeo`, `acceso`, `negras`, `armas`, `abandono`, `peleas`.
- Presupuesto ajustado o una sola cámara: familia `lite`.
- Para ver modelos funcionando con su propia cámara, sugiere también `/laboratorio`.
