---
id: arquitectura-erp
titulo: Arquitectura de soluciones ARS · la operación sobre un ERP base propio
orden: 26
rutas: ["/arquitectura"]
---

Página `/arquitectura`: la vista corporativa completa de ARS. Mensaje central: **ARS no es solo la central ni solo lo operativo** (cámaras con IA, rondas, radio, IoT, realidad virtual: lo que más se ve). Todo eso se apoya en un **ERP base propio de ARS** que lleva la gestión del proceso base de una empresa de seguridad, y todo comparte los mismos datos: lo que pasa en el puesto llega solo a la gestión.

## Las cinco capas del diagrama (`#diagrama`)

1. **Canales**: web, app Android (vigilante y supervisor, aun sin señal), PWA instalable, app de escritorio para la central (Windows) y gafas VR.
2. **Capa operativa**: operación en campo, centro de operaciones, comunicación y emergencias, monitoreo inteligente (visión artificial e IoT), realidad virtual y el laboratorio (demos de visión IA y la línea de robótica, **en desarrollo, no es un producto comercial**).
3. **Núcleo de datos e IA**: eventos y evidencia (cada marca, ronda, alerta, transmisión y reporte entra una sola vez, con foto, ubicación y hora), Centro de IA y automatizaciones (automatizaciones en piloto, en modo observación), trazabilidad y auditoría, y el centro de datos en Colombia (área K, `/servicios/infraestructura`: la información no sale del país y la IA corre en tarjetas gráficas propias; también en la nube del cliente o en un equipo on premise).
4. **ERP base de ARS**: contratos y clientes, turnos y programación, gestión humana y nómina, gestión documental, formación, cotizador y CRM (**hoja de ruta**), gobierno multiempresa, finanzas y contabilidad, facturas DIAN y RADIAN (**próximamente**).
5. **Integraciones externas**: las cámaras y grabadores que el cliente ya tiene, relojes biométricos ZKTeco (solo como compatibilidad; en piloto), Telegram (avisos por cliente y zona, en piloto), el ERP de la empresa vía el **Agente interoperador de datos** (API, backend o cargas programadas; completo o por partes) y la DIAN.

Vistas del diagrama: **Operativa** (canales, operación y núcleo), **Corporativa (ERP)** (núcleo, ERP e integraciones) e **Integral** (todo). Al tocar un bloque se abre un panel con sus módulos del catálogo, su estado real y el enlace a `/servicios/<area>#<modulo>`.

## Cómo explicarlo con honestidad

- La gestión humana, la nómina (desde los turnos realmente trabajados), lo documental, la formación, los turnos, los contratos y el gobierno multiempresa están en ARS.
- La **contabilidad** es **conectada**: ARS lee el ERP contable de la empresa (copia de solo lectura actualizada cada 15 minutos) y la cruza con la operación —lo contratado frente a lo facturado por cliente, la nómina frente al gasto de personal—. **ARS no obliga a reemplazar el ERP contable**: el Agente interoperador lo conecta.
- **Facturas DIAN y RADIAN** (bandeja de facturas de proveedores cruzada con la contabilidad): **próximamente**. **Cotizador y CRM propios**: **hoja de ruta**. No prometas fechas.
- No inventes cifras de clientes, ahorros ni tiempos.

## Sigue un dato (`#sigue-un-dato`)

Recorridos que se iluminan en el diagrama de punta a punta:

1. **De la marcación a la contabilidad**: app Android → marcación con selfie y verificación facial → turno realizado frente a lo programado → nómina desde los turnos reales → contabilidad conectada (nómina frente al gasto de personal) → cuadre con el ERP contable de la empresa.
2. **De la alerta de cámara al informe**: cámara existente → visión artificial (alerta con foto, video y ubicación) → Sala de Control confirma o escala → radio PTT al supervisor (grabado) → evidencia en la galería forense con reportes por cliente → auditoría.
3. **Del contrato nuevo al mes facturado**: orden de servicio desde el ERP → cliente, contrato y plan → programación del mes → selección y contratación → cursos con certificado QR → portal documental del cliente → lo contratado frente a lo facturado.
4. **Factura de proveedor, de la DIAN a la contabilidad** (próximamente): DIAN → bandeja de facturas y eventos RADIAN → comparación con lo contabilizado → ERP contable como libro de referencia.

## Por qué un ERP propio (`#por-que-erp`)

Una sola fuente de verdad, cero doble digitación, trazabilidad de punta a punta y multiempresa de verdad. La página incluye la tabla **«ARS frente a herramientas sueltas»** con el estado real de cada módulo (incluye las filas que aún no están en producción). Cierre (`#cierre`): solicitar demo en `/#contacto` o ver `/servicios`.
