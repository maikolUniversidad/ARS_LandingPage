/** Escena provisional (se reemplaza por la escena real de cada área). */
import * as THREE from "three";
import type { FabricaEscena } from "./contrato";

export const escenaProvisional: FabricaEscena = ({ canvas, acento, reducedMotion }) => {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 1.5, 6);
  const malla = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.6, 1),
    new THREE.MeshBasicMaterial({ color: acento, wireframe: true }),
  );
  scene.add(malla);
  let activa = true;
  let raf = 0;
  const loop = () => {
    raf = requestAnimationFrame(loop);
    if (!activa) return;
    if (!reducedMotion) malla.rotation.y += 0.003;
    renderer.render(scene, camera);
  };
  loop();
  return {
    setFoco() {},
    resize(w, h) {
      renderer.setSize(w, h, false);
      camera.aspect = w / Math.max(1, h);
      camera.updateProjectionMatrix();
    },
    setActiva(a) {
      activa = a;
    },
    dispose() {
      cancelAnimationFrame(raf);
      malla.geometry.dispose();
      (malla.material as THREE.Material).dispose();
      renderer.dispose();
    },
  };
};
