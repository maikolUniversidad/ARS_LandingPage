import sys, numpy as np
E, a, b, f0, f1 = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5])
d = np.load(E + "/salida/trayectoria.npz"); pos = d["cuerpo_pos"]
for f in range(f0, f1, 2):
    print(f, "A pel", np.round(pos[f, a, 0, :2], 2), "piesA", np.round(pos[f, a, 19, :2], 2), np.round(pos[f, a, 22, :2], 2), "| B pel", np.round(pos[f, b, 0, :2], 2), "piesB", np.round(pos[f, b, 19, :2], 2), np.round(pos[f, b, 22, :2], 2), "rodillas A", np.round(pos[f, a, 18, :2], 2), np.round(pos[f, a, 21, :2], 2), "B", np.round(pos[f, b, 18, :2], 2), np.round(pos[f, b, 21, :2], 2))
