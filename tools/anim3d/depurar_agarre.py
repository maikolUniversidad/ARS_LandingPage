import sys, numpy as np
d = np.load(sys.argv[1] + "/salida/trayectoria.npz"); pos = d["cuerpo_pos"]; f0 = int(d["evento_tomar"]); pe = int(d["agarre_persona"]); di = d["dedos_idx"]; obj = d["obj_pos"]; r = float(d["obj_radio"])
for f in range(f0 - 3, f0 + 4):
    dd = np.linalg.norm(pos[f, pe, di] - obj[f], axis=-1) - r
    print(f, "dedos mm", np.round(dd * 1000, 1), "palma", np.round(pos[f, pe, int(d["palma_idx"])], 3), "obj", np.round(obj[f], 3))
