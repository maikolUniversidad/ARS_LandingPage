# Alineación 3D ↔ video · /vision

Auditoría y resultado del emparejamiento de las 45 analíticas (nov-2026). El detalle por familia, con el método de calibración, los cuadros comparados y los pendientes, está en `docs/vision-alineacion/<familia>.md`.

## Resumen

- **41 de 45** tienen clip en loop (8–20 s) emparejado: **30 reales** (MEVA CC BY 4.0, Pixabay, Mixkit, Pexels, laboratorio propio) y **11 generados con IA** (ElevenLabs), rotulados «video generado con IA · referencia» y sin decir «modelo real».
- **4 sin clip**: peleas, canastillas, exhibicion y trazabilidad (ver abajo). Se muestran solo con la simulación.
- Antes: 15 videos y 1 imagen. Casi ninguno se parecía a su escena 3D: la puerta de tienda frente a un cruce de calle, la cerca perimetral frente a una sala de espera, etc. Puntaje típico 0–1 sobre 3.
- Después: puntaje típico 2–3 en cada eje. El encuadre sale de calibrar la cámara 3D (altura, inclinación y FOV) contra personas y estructuras del video. Los recorridos, muebles y zonas se escriben en coordenadas del cuadro y se proyectan al piso.

## Cómo quedan emparejados

1. **Misma cámara.** El visor arranca el 3D en «Vista cámara» (`sim.html?vista=cctv`): la escena se dibuja desde la `K.camara` calibrada, a 16:9, igual que el video. «Maqueta 3D» deja girarla.
2. **Un solo reloj.** El video manda: el visor envía su segundo al 3D (`vigias-sim-t`). La duración de la escena es la del clip y los segundos de `fases` son los del clip, así que pastilla de estado, pasos y evento cambian juntos en ambos lados, también al pausar, saltar o hacer loop.
3. **Mismo lenguaje visual.** Zonas y líneas se dibujan sobre el video con los colores exactos del motor y la misma etiqueta que en el 3D. El estado (Vigilando / Detectando / Alerta / Resuelto) aparece en los dos paneles. El «evento» se marca en la línea de tiempo común y enciende un borde rojo en ambos paneles.

## Las 45

Puntajes 0–3 en el orden encuadre · espacio · actores · objetos · momento. «—» = no había video.

| id | familia | video antes | puntaje antes | clip ahora | fuente · licencia | dur | puntaje después | detalle |
|---|---|---|---|---|---|---|---|---|
| seguimiento | comercial | CCTV MEVA (otro encuadre) | 0·0·1·0·0 | real | MEVA · Multiview Extended Video with Activities (cámara 0421, vestíbulo) · CC BY 4.0 | 16 s | 3·3·2·2·3 | [comercial](vision-alineacion/comercial.md) |
| conteo | comercial | calle (3D era puerta de tienda) | 0·0·0·0·0 | real | Pexels · video 30138510 (cruce peatonal, Ciudad de México) · Pexels License | 10 s | 3·2·2·2·3 | [comercial](vision-alineacion/comercial.md) |
| demografia | comercial | — | — | IA (rotulado) | Generado con IA (ElevenLabs · Seedance 2.5, texto a video) para esta lámina · Contenido generado para uso propio | 9.5 s | 3·2·2·2·3 | [comercial](vision-alineacion/comercial.md) |
| calor | comercial | CCTV MEVA | 0·0·0·0·0 | real | MEVA · Multiview Extended Video with Activities (cámara 0421, vestíbulo) · CC BY 4.0 | 16 s | 3·3·2·2·2 | [comercial](vision-alineacion/comercial.md) |
| permanencia | comercial | CCTV MEVA | 0·1·1·0·0 | real | MEVA · Multiview Extended Video with Activities (cámara G507, sala de espera) · CC BY 4.0 | 16 s | 3·3·2·2·3 | [comercial](vision-alineacion/comercial.md) |
| cruce | comercial | CCTV MEVA | 1·1·1·0·0 | real | MEVA · Multiview Extended Video with Activities (cámara G423, pasillo) · CC BY 4.0 | 16 s | 3·2·2·2·3 | [comercial](vision-alineacion/comercial.md) |
| comprador | comercial | — | — | IA (rotulado) | Generado con IA (ElevenLabs · Seedance 2.5, texto a video) para esta lámina · Contenido generado para uso propio | 9.5 s | 3·3·2·2·3 | [comercial](vision-alineacion/comercial.md) |
| blancas | operativo | — | — | real | MEVA, cámara G326 (acceso del edificio administrativo), 2018-03-07 11:05, s 98–114 · CC BY 4.0 | 16 s | 2·2·2·2·3 | [operativo](vision-alineacion/operativo.md) |
| filas | operativo | — | — | real | MEVA (Multiview Extended Video with Activities), cámara G421, 2018-03-07 16:50, s 0–18 · CC BY 4.0 | 18 s | 2·2·2·2·3 | [operativo](vision-alineacion/operativo.md) |
| aforo | operativo | CCTV MEVA | 0·0·1·0·0 | real | MEVA, cámara G421, 2018-03-13 17:35, s 167.9–185.9 (recorte del clip anterior con el detector D-FINE-S quemado) · CC BY 4.0 | 18 s | 2·2·2·2·3 | [operativo](vision-alineacion/operativo.md) |
| placas | operativo | Pexels | 0·0·0·1·0 | real | Pexels, video 37508953 (salida de parqueadero, Berlín); detecciones de lpr_v2 (YOLOv9-t + CCT-S) quemadas · Pexels License | 11.5 s | 2·2·2·2·2 | [operativo](vision-alineacion/operativo.md) |
| staff | operativo | — | — | real | MEVA, cámara G421, 2018-03-07 16:50, s 24–42 (roles personal/cliente asignados a mano sobre las pistas del detector) · CC BY 4.0 | 18 s | 2·2·2·2·3 | [operativo](vision-alineacion/operativo.md) |
| derrames | operativo | solo imagen | 0·0·0·1·0 | IA (rotulado) | Generado con IA (ElevenLabs · Seedance 2.5, texto a video); el 3D se ajustó a su cámara y a sus tiempos · uso propio | 15 s | 3·2·2·2·3 | [operativo](vision-alineacion/operativo.md) |
| guardian | operativo | CCTV MEVA | 0·0·1·0·0 | real | MEVA, cámara G421, 2018-03-07 11:05, s 282–300 (recorte del clip anterior con Guardián v2 quemado) · CC BY 4.0 | 18 s | 2·1·2·1·3 | [operativo](vision-alineacion/operativo.md) |
| negras | prevencion | — | — | IA (rotulado) | ElevenLabs (generación de video) · uso propio · referencia | 11.4 s | 2·2·2·2·3 | [prevencion](vision-alineacion/prevencion.md) |
| merodeo | prevencion | — | — | IA (rotulado) | ElevenLabs (generación de video) · uso propio · referencia | 11.6 s | 2·2·2·2·2 | [prevencion](vision-alineacion/prevencion.md) |
| intrusion | prevencion | CCTV MEVA (3D era cerca perimetral) | 0·0·1·0·0 | real | MEVA · Multiview Extended Video with Activities (Kitware / IARPA DIVA) · CC BY 4.0 | 18 s | 2·2·3·2·3 | [prevencion](vision-alineacion/prevencion.md) |
| acceso | prevencion | — | — | IA (rotulado) | ElevenLabs (generación de video) · uso propio · referencia | 11.4 s | 2·2·2·2·3 | [prevencion](vision-alineacion/prevencion.md) |
| aglomeracion | prevencion | CCTV MEVA (3D era plazoleta) | 0·0·1·0·0 | real | MEVA · Multiview Extended Video with Activities (Kitware / IARPA DIVA) · CC BY 4.0 | 18 s | 2·2·2·2·3 | [prevencion](vision-alineacion/prevencion.md) |
| epp | prevencion | video público (3D era bodega) | 0·0·1·0·0 | real | video público de obra (recorte de evidencia-publica/epp.mp4) · por confirmar | 13 s | 2·2·2·1·3 | [prevencion](vision-alineacion/prevencion.md) |
| caidas | prevencion | — | — | IA (rotulado) | ElevenLabs (generación de video) · uso propio · referencia | 9.7 s | 2·2·3·2·3 | [prevencion](vision-alineacion/prevencion.md) |
| hurto | prevencion | laboratorio (3D era perfumería) | 0·0·1·0·0 | real | grabación propia del laboratorio Vigías (visor en vivo) · propia | 16 s | 2·2·2·2·3 | [prevencion](vision-alineacion/prevencion.md) |
| ocultaProd | prevencion | — | — | real | Prueba en laboratorio propio de Vigías (detector C+ v1) · Material propio | 14.5 s | 2·2·2·2·3 | [prevencion-b](vision-alineacion/prevencion-b.md) |
| armas | prevencion | Mixkit (3D era tienda) | 0·0·1·1·1 | real | Mixkit · «A robbery in the coffee shop» (#23252), con detecciones del modelo de armas · Mixkit Stock Video Free License | 9.56 s | 2·2·2·2·3 | [prevencion-b](vision-alineacion/prevencion-b.md) |
| blancas2 | prevencion | laboratorio | 1·1·1·1·1 | real | Cámara propia de Vigías (sala de monitoreo) · Material propio | 15.7 s | 2·2·2·2·3 | [prevencion-b](vision-alineacion/prevencion-b.md) |
| peleas | prevencion | — | — | **sin clip** | — | — | — | [prevencion-b](vision-alineacion/prevencion-b.md) |
| fuego | prevencion | video público (3D era bodega) | 0·0·0·1·1 | real | Video público de un incendio urbano, con detecciones del modelo de humo y fuego (yolox_s_fire) · Material de archivo ya publicado en el sitio | 16 s | 2·2·1·2·3 | [prevencion-b](vision-alineacion/prevencion-b.md) |
| abandono | prevencion | — | — | IA (rotulado) | Video generado con IA (Seedance 2.5, ElevenLabs) para ilustrar la analítica · Generado con IA para Vigías | 13.54 s | 2·2·2·2·3 | [prevencion-b](vision-alineacion/prevencion-b.md) |
| rostro | prevencion | — | — | real | Mixkit · «Thief creep through house and looks up at camera» (#12830), con detecciones del modelo EPP (clase Mask) · Mixkit Stock Video Free License | 15.08 s | 2·2·2·2·3 | [prevencion-b](vision-alineacion/prevencion-b.md) |
| activos | prevencion | — | — | real | Mixkit · «Two thieves recorded on a security camera» (#31372), con detección de cambio por zona (OpenCV) · Mixkit Stock Video Free License | 19.46 s | 2·2·2·2·3 | [prevencion-b](vision-alineacion/prevencion-b.md) |
| fleje | lite | — | — | real | Pixabay · Pixabay Content License | 12.9 s | 2·2·2·2·3 | [lite](vision-alineacion/lite.md) |
| canastillas | lite | — | — | **sin clip** | — | — | — | [lite](vision-alineacion/lite.md) |
| puertas | lite | — | — | real | Mixkit · Mixkit Stock Video Free License | 11 s | 2·2·2·2·3 | [lite](vision-alineacion/lite.md) |
| huecos | lite | Pixabay (3D era góndola de súper) | 0·0·1·1·0 | real | Pixabay · Pixabay Content License | 12.9 s | 2·2·2·2·3 | [lite](vision-alineacion/lite.md) |
| vencido | lite | — | — | real | Pixabay · Pixabay Content License | 12.9 s | 2·2·2·2·2 | [lite](vision-alineacion/lite.md) |
| destruccion | lite | cámara de seguridad | 0·0·1·1·1 | real | clip ya existente en evidencia-publica/destruccion.mp4 (recortado) · la del clip original (procedencia no documentada en el repo) | 14 s | 2·2·2·2·3 | [lite](vision-alineacion/lite.md) |
| bodega | lite | — | — | real | Pixabay · Pixabay Content License | 16 s | 2·2·2·2·2 | [lite](vision-alineacion/lite.md) |
| racks | lite | — | — | IA (rotulado) | ElevenLabs · LTX-2 Fast (texto a video) · contenido generado; uso como referencia ilustrativa | 8.5 s | 2·2·2·2·2 | [lite-b](vision-alineacion/lite-b.md) |
| pasillos | lite | video público vertical | 0·1·0·1·0 | real | Clip público ya publicado en evidencia-publica/pasillos.mp4 (procesado con el modelo de pasillos) · ver CREDITS-lite-b.md | 9.5 s | 2·2·2·2·3 | [lite-b](vision-alineacion/lite-b.md) |
| exhibicion | lite | — | — | **sin clip** | — | — | — | [lite-b](vision-alineacion/lite-b.md) |
| trazabilidad | lite | — | — | **sin clip** | — | — | — | [lite-b](vision-alineacion/lite-b.md) |
| autopago | lite | — | — | IA (rotulado) | ElevenLabs · LTX-2 Fast (texto a video) · contenido generado; uso como referencia ilustrativa | 9.5 s | 2·2·2·2·3 | [lite-b](vision-alineacion/lite-b.md) |
| zonaCiega | lite | — | — | IA (rotulado) | ElevenLabs · LTX-2 Fast (texto a video) · contenido generado; uso como referencia ilustrativa | 7.5 s | 2·2·2·2·2 | [lite-b](vision-alineacion/lite-b.md) |
| apertura | operativo | — | — | real | MEVA, cámara G506 (entrada de la terminal), 2018-03-07 17:00, s 26–42; la hora del rótulo es la del ejemplo, no la del video · CC BY 4.0 | 16 s | 2·2·2·2·3 | [operativo](vision-alineacion/operativo.md) |
| cierre | operativo | — | — | real | MEVA, cámara G326, 2018-03-07 11:05, s 254–272 · CC BY 4.0 | 18 s | 2·2·1·2·3 | [operativo](vision-alineacion/operativo.md) |

## Sin clip y por qué

- **peleas**: no hay stock libre con toma fija; Mixkit y Pexels solo tienen boxeo o cine. ElevenLabs bloqueó la generación por su política de contenido.
- **canastillas, exhibicion, trazabilidad**: no hay stock libre de cámara fija que muestre el hecho. Pexels responde 403 a la descarga automática, y los créditos de ElevenLabs se agotaron. Basta con un clip de cámara fija de 10–15 s por cada una para emparejarlas con el mismo método.

## Pendientes antes de publicar

- **Licencias sin documentar** de clips heredados del repo: `epp`, `fuego` y `destruccion` (no tienen autor, URL ni licencia registrados). Del clip de Pexels de `conteo` falta confirmar el autor.
- **Contenido**: el clip de `activos` (Mixkit 31372) muestra un revólver sobre un sofá y a una persona que lo toma. Hay que decidir si es apto para la web. El de `comprador` (IA) muestra empaques parecidos a marcas reales.
- **Historia cambiada para calzar con el video**: en `puertas`, la nevera ahora se abre 5 s y se cierra sin aviso (antes quedaba abierta y alertaba). `fleje` y `vencido` comparten la toma de `huecos`; sus marcas son ilustrativas, porque ningún modelo leyó flejes ni fechas.
- **Limitaciones del motor**: el maniquí no tiene pose sentada (se simula agachado o con huesos), los lentes ojo de pez de MEVA G326 no se reproducen exactos y hay más gente en algunos videos que en el 3D, porque el detector local ve menos personas.
