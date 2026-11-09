import sys, numpy as np
E, p, j, f0, f1 = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5])
d = np.load(E + "/salida/trayectoria.npz"); pos = d["cuerpo_pos"]
for f in range(f0, f1): print(f, "j", np.round(pos[f, p, j], 3), "muneca", np.round(pos[f, p, 7], 3), "hombro", np.round(pos[f, p, 5], 3), "pelvis", np.round(pos[f, p, 0, :2], 3))
