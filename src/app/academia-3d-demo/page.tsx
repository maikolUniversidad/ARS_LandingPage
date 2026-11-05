"use client";

// Ruta temporal para probar <EscenaAcademia>. Se borra antes del último commit.

import dynamic from "next/dynamic";
import { useState, useSyncExternalStore } from "react";

const noop = () => () => {};
import { FOCOS_ACADEMIA, type FocoAcademia } from "@/components/academia/escena/focos";
import { RespaldoAcademia } from "@/components/academia/RespaldoAcademia";

// Solo pruebas: con ?raf=timer, rAF se sustituye por un temporizador (el panel oculto no anima).
if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("raf") === "timer") {
  let sig = 1;
  const vivos = new Set<number>();
  window.requestAnimationFrame = (cb) => {
    const id = sig++;
    vivos.add(id);
    const t0 = performance.now();
    const ch = new MessageChannel();
    ch.port1.onmessage = () => {
      if (!vivos.has(id)) return;
      if (performance.now() - t0 < 16) {
        ch.port2.postMessage(0);
        return;
      }
      vivos.delete(id);
      cb(performance.now());
    };
    ch.port2.postMessage(0);
    return id;
  };
  window.cancelAnimationFrame = (id) => {
    vivos.delete(id);
  };
}

// Solo pruebas: con ?quieto, se simula prefers-reduced-motion.
if (typeof window !== "undefined" && new URLSearchParams(window.location.search).has("quieto")) {
  const original = window.matchMedia.bind(window);
  window.matchMedia = (q: string) => (q.includes("prefers-reduced-motion") ? ({ ...original(q), matches: true } as MediaQueryList) : original(q));
}

// Solo pruebas: con ?sinwebgl, el navegador «no tiene» WebGL.
if (typeof window !== "undefined" && new URLSearchParams(window.location.search).has("sinwebgl")) {
  const orig = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, tipo: string, ...r: unknown[]) {
    if (tipo.startsWith("webgl")) return null;
    return (orig as (...a: unknown[]) => RenderingContext | null).call(this, tipo, ...r);
  } as typeof orig;
}

const EscenaAcademia = dynamic(() => import("@/components/academia/EscenaAcademia"), { ssr: false });

export default function Demo() {
  const qFoco = useSyncExternalStore(
    noop,
    () => new URLSearchParams(window.location.search).get("foco"),
    () => null
  );
  const [elegido, setFoco] = useState<FocoAcademia | null>(null);
  const foco: FocoAcademia = elegido ?? ((FOCOS_ACADEMIA as readonly string[]).includes(qFoco ?? "") ? (qFoco as FocoAcademia) : "portal");
  return (
    <main className="min-h-screen bg-[#020a18] p-6 text-[#d5e0ff]">
      <div className="mb-4 flex flex-wrap gap-2">
        {FOCOS_ACADEMIA.map((f) => (
          <button
            key={f}
            type="button"
            data-foco={f}
            onClick={() => setFoco(f)}
            className={`rounded-full border px-3 py-1 text-sm ${f === foco ? "border-[#6b8aff] bg-[#2348d4]" : "border-[#6b8aff]/40"}`}
          >
            {f}
          </button>
        ))}
      </div>
      <EscenaAcademia foco={foco} className="aspect-[16/10] w-full max-w-5xl rounded-2xl" />
      <div className="mt-6 grid max-w-5xl grid-cols-3 gap-3">
        <RespaldoAcademia foco={foco} className="aspect-video rounded-xl" />
      </div>
    </main>
  );
}
