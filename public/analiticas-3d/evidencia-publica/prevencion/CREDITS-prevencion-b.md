# Créditos de los clips · prevención y riesgo, parte B

Clips en esta carpeta que pertenecen a la parte B: `ocultaProd`, `armas`, `blancas2`, `fuego`, `abandono`, `rostro`, `activos`
(cada uno con su `-poster.jpg`). Todos: 960×540, H.264, sin audio, loop cerrado con un fundido de 0,5 s.

| Clip | Fuente | Autor | Licencia | Detecciones sobre el video |
|---|---|---|---|---|
| `ocultaProd.mp4` | Prueba en el laboratorio propio de Vigías, recorte de `evidencia-publica/hurto-vivo.mp4` (s 6–21, solo la vista de cámara) | Vigías | Material propio | Detector C+ v1 (real), quemado en la grabación original |
| `armas.mp4` | Mixkit · «A robbery in the coffee shop» (#23252), https://mixkit.co/free-stock-video/a-robbery-in-the-coffee-shop-23252/ — reprocesado de `evidencia-publica/armas.mp4` | Mixkit | Mixkit Stock Video Free License | Modelo de armas (real), quemado en `armas.mp4` original |
| `blancas2.mp4` | Cámara propia de la sala de monitoreo, de `evidencia-publica/blancas-vivo.mp4` | Vigías | Material propio | Detector de personas + VLM «cuchillo» (real), quemado en el original |
| `fuego.mp4` | Video público de un incendio urbano (toma aérea), de `evidencia-publica/fuego.mp4` (s 0–16,5). El origen exacto no está registrado en el repo | — | Material ya publicado en el sitio | `yolox_s_fire` (real), quemado en el original |
| `abandono.mp4` | **Generado con IA** (ElevenLabs · Seedance 2.5, texto a video, 14 s, 720p) | Vigías (IA) | Generado para Vigías | Ninguna (solo las marcas del visor) |
| `rostro.mp4` | Mixkit · «Thief creep through house and looks up at camera» (#12830), https://mixkit.co/free-stock-video/thief-creep-through-house-and-looks-up-at-camera-12830/ | Mixkit | Mixkit Stock Video Free License | `public/models/epp/yolox_s_ppe.onnx`, clase «Mask» (real), confirmación tras 0,4 s seguidos ≥ 0,5 |
| `activos.mp4` | Mixkit · «Two thieves recorded on a security camera» (#31372), https://mixkit.co/free-stock-video/two-thieves-recorded-on-a-security-camera-31372/ (s 1,46–21,46) | Mixkit | Mixkit Stock Video Free License | Detección de cambio por zona con OpenCV (real): ámbar si el sitio está tapado, rojo si se ve el fondo vacío ≥ 0,6 s |
