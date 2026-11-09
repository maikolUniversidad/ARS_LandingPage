import sys, json, numpy as np
E = sys.argv[1]; p = int(sys.argv[2]); f0, f1 = int(sys.argv[3]), int(sys.argv[4])
d = np.load(E + "/salida/trayectoria.npz"); pos = d["cuerpo_pos"]
for f in range(f0, f1, max(1, (f1 - f0) // 12)):
    print(f, "pelvis", np.round(pos[f, p, 0, :2], 2), "pie_i", np.round(pos[f, p, 19], 2), "pie_d", np.round(pos[f, p, 22], 2))
r = json.load(open(E + "/salida/escena_render.json")); print("agarres:", [(a["objeto"], a["cuadro"], a["dist_dedos_mm"], a["contacto_verificado"]) for a in r["agarres"]])
