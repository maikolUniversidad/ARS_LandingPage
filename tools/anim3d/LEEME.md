# Animación 3D con física para la landing /vision (9-nov-2026)

Sistema local (sin nube) que reemplaza los gráficos three.js de `/vision` por videos renderizados a partir de
trayectorias **verificadas físicamente**, siguiendo `~/Molde Animacion 3D Fisica/`.

## Dónde corre
- **QA .103** (`ssh qa`): instalación del molde en `/datos2/vigias/anim3d` (envs, escenas, render, logs) y copia del molde en
  `/datos2/vigias/anim3d-molde` (lanzador `anim3d.sh`). Las GPU de la sede .250 no se tocan.
- **Sede** (maestro del código): esta carpeta. Cambios → `rsync` a `qa:/datos2/vigias/anim3d-molde/servidor/{adaptadores,render}/`.

## Piezas
| Archivo | Qué hace |
|---|---|
| `guiones.py` | Genera `escenas/<id>/guion.json` (45) desde `ARS_LandingPage/src/data/analiticas.ts`: mismas fases y tiempos; rutas, muebles, objetos, eventos, cámara. |
| `sim_cinematica.py` | Adaptador real del molde (método A): esqueleto de 23 articulaciones, pasos sin deslizar, agarre con contacto pulgar+índice <5 mm, caída libre al soltar, evitación de personas/muebles, góndolas con bandejas. Escribe `salida/trayectoria.npz` (contrato del verificador), `extras.npz` (objetos/vehículos) y `escena_render.json`. |
| `correr_todas.sh` | Adaptador + verificador en las 45 escenas (semilla 1), resumen. ⚠️ No correr mientras hay un render (rompe los archivos que lee). |
| `render/render_bpy.py` | Blender 5 headless (Cycles CUDA; OptiX falla 7804 con el driver 595): piso, paredes, góndolas, puertas animadas, personas por cápsulas, objetos; exporta PNG, `overlay.json` (cajas 2D por cuadro) y MP4. Solo dibuja la trayectoria: no decide contactos. |
| `render_todas.sh` | Lote en 2 GPU de las escenas con `certificado.json` ENTREGABLE (`SOLO_CERTIFICADAS=1`). Salida `render/lote/<id>/`. |
| `publicar_landing.py` | Copia mp4 + overlay + poster a `ARS_LandingPage/public/analiticas-3d/fisica/` y arma `manifest.json`. |
| `depurar*.py` | Diagnóstico: peor penetración/velocidad, pies, agarre. |

## Flujo
1. `python3 guiones.py` → `rsync escenas/ qa:/datos2/vigias/anim3d/escenas/`
2. En QA: `anim3d.sh cola /datos2/vigias/anim3d/escenas/*/` (simula, verifica, corrige, confirma con 2 semillas → `certificado.json`).
3. En QA: `SOLO_CERTIFICADAS=1 nohup bash .../adaptadores/render_todas.sh 1280x720 32 &` (~15 min por escena y GPU).
4. En la sede: `rsync -a qa:/datos2/vigias/anim3d/render/lote/ ~/landing-vigias/anim3d/lote/` → `python3 publicar_landing.py ~/landing-vigias/anim3d/lote`
5. Build/deploy de la landing como siempre (`../PUBLICAR-POR-TUNEL.md`). `Anim3D.tsx` usa el mp4 si está en `manifest.json`; si no, cae al three.js.

## Honestidad
- "Física real" aquí = cinemática con contactos verificados (pies, agarre, penetraciones, velocidades) + caída libre con gravedad. Genesis está instalado pero aún no se usa.
- Parámetros que el orquestador puede tocar: los de `PARAMS_DEFECTO` en `sim_cinematica.py` (declarados en `parametros.json`).
- Reglas aprendidas: `~/Molde Animacion 3D Fisica/APRENDIZAJES.md` (entradas 9-nov).
