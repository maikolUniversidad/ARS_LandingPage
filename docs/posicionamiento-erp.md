# Posicionamiento: ARS es un ERP, y además se adapta

*2026-11-04 · decisión del dueño del producto*

## El mensaje

**ARS es un ERP completo para la empresa de seguridad**: clientes, contratos y planes, órdenes de servicio, nómina (con prima, vacaciones y liquidación de contratos), costos por centro de costo, facturación, contabilidad con asistente de IA, cotizador y CRM, además de toda la operación.

**Y además se adapta**: tenga la empresa su propio sistema o ya tenga otros contratados, creamos los mecanismos (Agente interoperador de datos, integraciones, sincronización) para que todo se **centralice en ARS** o **fluya** entre sistemas durante el proceso, según los módulos que contrate.

Ya no se dice: «ARS no reemplaza el ERP», «se moldea al sistema que ya existe, no al revés», «trabaja junto al ERP de la empresa», «su ERP dentro de ARS».

Reglas que siguen vigentes: no se nombran ERPs ni proveedores de terceros; los estados del catálogo se respetan (facturas DIAN y RADIAN siguen **en piloto**); no se inventan funciones; usted en /servicios y /plataforma, tú en la home.

## Qué cambió

| Archivo | Cambio |
|---|---|
| `src/data/servicios/catalogo.ts` · área H «Finanzas y ERP» | `descripcion` y `esencia` reescritas con el mensaje nuevo. Módulos: «Órdenes de servicio, de la venta al puesto» (antes «…desde su ERP»), «Contabilidad conectada» (contabilidad centralizada en ARS; si se lleva en otro sistema, copia de solo lectura cada 15 min), «Facturas DIAN y RADIAN» (se compara con «la contabilidad», no con «el ERP»), «Agente interoperador de datos» (centraliza o hace fluir; nueva `innovacion`), «Todo su ERP en una sola puerta» (antes «Su ERP dentro de ARS»; sin «no lo reemplaza»), «Cotizador, CRM y embudo propios» (primero lo propio, luego el sistema externo). |
| `catalogo.ts` · área F «Gestión humana» | Empleados, Nómina (nueva `notaEstado`: «Si la empresa ya liquida en otro sistema, la información se centraliza en ARS o fluye entre los dos»), Nómina de administrativos, Prima/vacaciones/liquidación, «Costos y cuadre entre sistemas» (antes «Costos y comparación con el ERP»), Auditoría documental: «el ERP» → «el sistema conectado / de origen / la nómina». |
| `catalogo.ts` · áreas A y E | Estructura Cliente → Sede → Puesto («se crea en ARS, se carga desde Excel o se sincroniza con otro sistema»); Mesa Directiva: «Cuadres con el ERP» → «Cuadres financieros». |
| `src/data/asistente/conocimiento/25-servicios-ars.md` | Nueva sección «ARS es un ERP, y además se adapta (posicionamiento)»; Agente interoperador y la guía de nómina/contabilidad reescritos (fuera «se moldea» y «trabaja junto al ERP»). |
| `00-que-es-ars.md`, `20-plataforma-erp.md`, `90-preguntas-frecuentes.md` | Bloque de producto «Plataforma de operación y ERP»; párrafo de posicionamiento en /plataforma; nueva FAQ «¿ARS es un ERP? ¿Tengo que dejar el sistema que ya uso?». |
| `conocimiento.generated.ts`, `indice.generated.ts` | Regenerados con `node src/data/asistente/generar.mjs`. |
| `src/lib/asistente/prompt.ts` | Nueva regla «Posicionamiento ERP» en la guía de servicios. |
| `src/data/narracion/guiones-servicios-areas.ts` | 11 guiones (6 de Finanzas, 5 de Gestión humana) + MP3 regenerados. |
| `src/data/narracion/guiones-plataforma.ts` | `plataforma/recorrido/finanzas-y-erp` + MP3 regenerado. |
| `docs/audio/NARRACION-*.md` | Duraciones y lista de clips regenerados (≈2.837 créditos, ≈ USD 0,51). |

Revisados y sin cambios (no contradicen el mensaje): `src/lib/i18n/dictionaries.ts`, `src/data/integral-security.ts`, `docs/home-narrativa.md`, `guiones-home.ts`. Sus «sin reemplazar hardware» hablan de cámaras, no del ERP.

## Puntos para confirmar con el dueño

1. **Contabilidad propia.** El catálogo describe el módulo de contabilidad como consulta del sistema contable que la empresa conecta (copia cada 15 min). El copy dice «contabilidad centralizada en ARS» y conserva esa nota de estado. Si ARS ya registra asientos de forma nativa, conviene decirlo en el catálogo.
2. **Factura electrónica.** El catálogo tiene facturación (líneas, aprobación, prefacturación) y la bandeja de facturas **recibidas** DIAN/RADIAN en piloto. Se quitó «ARS no emite facturas», pero el asistente tiene instrucción de no afirmar que ARS transmite facturas electrónicas a la DIAN sin confirmarlo con el equipo comercial.
3. **Embeddings.** No había `OPENAI_API_KEY` al regenerar: los trozos que cambiaron quedaron sin vector y se buscan por palabras clave hasta la próxima regeneración con la clave.
