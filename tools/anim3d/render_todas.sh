#!/bin/bash
# Renderiza en lote las escenas APROBADAS (informe.json sin fallas) repartidas en 2 GPU. Uso: render_todas.sh [res] [muestras]
RES=${1:-1280x720}; MU=${2:-32}
BASE=/datos2/vigias/anim3d; PY=$BASE/envs/render/bin/python; SRV=/datos2/vigias/anim3d-molde/servidor
mkdir -p $BASE/render/lote $BASE/logs
if pgrep -f "correr_todas.sh|orquestador.py" >/dev/null; then echo "hay simulaciones corriendo (correr_todas/orquestador): no se renderiza sobre archivos que cambian"; exit 2; fi
lista=()
for E in $BASE/escenas/*/; do
  s=$(basename $E)
  if [ -f $E/certificado.json ]; then
    grep -q '"veredicto": "ENTREGABLE' $E/certificado.json && lista+=("$s") || echo "sin certificado limpio: $s"
  elif [ -f $E/salida/informe.json ] && [ "$SOLO_CERTIFICADAS" != "1" ]; then
    python3 -c "import json,sys; i=json.load(open('$E/salida/informe.json')); sys.exit(0 if i.get('pasa') else 1)" 2>/dev/null && lista+=("$s")
  fi
done
echo "escenas a renderizar: ${#lista[@]}: ${lista[*]}"
render_gpu() {  # $1 gpu, resto escenas
  gpu=$1; shift
  for s in "$@"; do
    out=$BASE/render/lote/$s
    if [ -f $out/$s.mp4 ]; then echo "[$gpu] $s ya hecho"; continue; fi
    echo "[$gpu] $(date +%H:%M:%S) inicio $s"
    CUDA_VISIBLE_DEVICES=$gpu OMP_NUM_THREADS=6 nice -n 10 $PY $SRV/render/render_bpy.py --escena $BASE/escenas/$s --out $out --res $RES --muestras $MU --gpu > $BASE/logs/render-$s.log 2>&1
    echo "[$gpu] $(date +%H:%M:%S) fin $s: $(grep -c Saved $BASE/logs/render-$s.log) cuadros, mp4 $( [ -f $out/$s.mp4 ] && echo ok || echo NO)"
  done
}
a=(); b=()
for i in "${!lista[@]}"; do if (( i % 2 == 0 )); then a+=("${lista[$i]}"); else b+=("${lista[$i]}"); fi; done
render_gpu 1 "${a[@]}" &
render_gpu 0 "${b[@]}" &
wait
echo "lote terminado $(date)"
