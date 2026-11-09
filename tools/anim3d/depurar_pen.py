import sys, numpy as np
sys.path.insert(0, "/datos2/vigias/anim3d-molde/servidor")
import verificar_fisica as V
d = np.load(sys.argv[1] + "/salida/trayectoria.npz")
pos = d["cuerpo_pos"]; hu = d["huesos"]; hr = d["huesos_radio"]; k = 5
if not len(d["obst_cajas"]): print("sin muebles")
else:
  pass
if len(d["obst_cajas"]):
    pts = V.puntos_capsulas(pos, hu, k); sd = V.dist_caja(pts, d["obst_cajas"]); pen = np.repeat(hr, k)[None, None, :, None] - sd
    t, p, b, c = np.unravel_index(np.argmax(pen), pen.shape)
    print(f"peor pen {pen.max():.3f} m cuadro {t} persona {p} hueso {hu[b // k]} caja {d['obst_cajas'][c]}")
v = np.linalg.norm(np.diff(pos, axis=0), axis=-1) * float(d["fps"]); t, p, j = np.unravel_index(np.argmax(v), v.shape)
print(f"vel max {v.max():.2f} m/s cuadro {t + 1} persona {p} articulacion {j}")
