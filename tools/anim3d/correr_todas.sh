#!/bin/bash
cd /datos2/vigias/anim3d-molde/servidor || exit 1
if pgrep -f "render_todas.sh|render_bpy.py" | grep -v -w -e $$ -e $PPID | grep -q .; then echo "hay un render en curso: no se re-simula (rompe los archivos que lee)"; exit 2; fi
PY=/datos2/vigias/anim3d/envs/nucleo/bin/python
export OMP_NUM_THREADS=2
ok=0; tot=0
for E in /datos2/vigias/anim3d/escenas/*/; do
  s=$(basename $E); tot=$((tot+1))
  [ -f $E/parametros.json ] || $PY -c "import json;json.dump({'semilla':1,'ruta_holgura_m':0.0,'friccion_pie':0.9,'agarre_cierre_dedos':1.0,'colision_margen_m':0.0,'suavizado_pose':0.0,'union_mano_objeto':1,'paso_largo_m':0.6,'paso_dur_s':0.3,'altura_paso_m':0.1,'separacion_personas_m':0.0},open('$E/parametros.json','w'),indent=1)"
  out=$(nice $PY adaptadores/sim_cinematica.py --guion $E/guion.json --params $E/parametros.json --out $E/salida 2>&1 | tail -1)
  ver=$(nice $PY verificar_fisica.py $E 2>&1 | tail -1)
  if [ "$ver" = "APRUEBA" ]; then ok=$((ok+1)); printf "%-14s OK  %s\n" "$s" "$(echo $out | sed 's/.*cuadros, //')"; else
    fall=$(grep FALLA $E/salida/informe.md 2>/dev/null | awk -F'|' '{printf "%s=%s ", $2, $3}')
    printf "%-14s %s  %s | %s\n" "$s" "$ver" "$(echo $out | sed 's/.*agarres/agarres/')" "$fall"
    $PY adaptadores/depurar.py $E 2>&1 | grep -v "^  PATINA max 0.000"
  fi
done
echo "APRUEBAN $ok de $tot"
