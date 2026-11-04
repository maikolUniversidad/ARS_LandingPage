"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { EVENTO_FOCO_SERVICIO } from "./eventos";

/**
 * En el hub, un pedido del asistente para mostrar un módulo navega a su área
 * (la página de área se encarga del scroll y del foco 3D por el #hash).
 */
export function EscuchaFocoHub({ indiceModulos }: { indiceModulos: Record<string, string> }) {
  const router = useRouter();
  useEffect(() => {
    let ultimo = { modulo: "", t: 0 };
    const onFoco = (e: WindowEventMap["ars:foco-servicio"]) => {
      const modulo = e.detail?.modulo;
      const area = modulo ? indiceModulos[modulo] : undefined;
      if (!area || !modulo) return;
      // Idempotente: ignora el mismo pedido repetido en menos de 1 s.
      const ahora = performance.now();
      if (modulo === ultimo.modulo && ahora - ultimo.t < 1000) return;
      ultimo = { modulo, t: ahora };
      router.push(`/servicios/${area}#${modulo}`);
    };
    window.addEventListener(EVENTO_FOCO_SERVICIO, onFoco);
    return () => window.removeEventListener(EVENTO_FOCO_SERVICIO, onFoco);
  }, [indiceModulos, router]);
  return null;
}
