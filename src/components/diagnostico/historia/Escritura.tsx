"use client";

import { useEffect, useRef, useState } from "react";

/** Texto con efecto de máquina de escribir. Reserva el alto final para no saltar. */
export function Escritura({
  texto,
  instantaneo,
  onFin,
  className,
  msPorLetra = 26,
}: {
  texto: string;
  instantaneo: boolean;
  onFin?: () => void;
  className?: string;
  msPorLetra?: number;
}) {
  const [n, setN] = useState(instantaneo ? texto.length : 0);
  const finRef = useRef(onFin);

  useEffect(() => {
    finRef.current = onFin;
  }, [onFin]);

  useEffect(() => {
    if (instantaneo) {
      const id = requestAnimationFrame(() => {
        setN(texto.length);
        finRef.current?.();
      });
      return () => cancelAnimationFrame(id);
    }
    let raf = 0;
    const t0 = performance.now();
    const paso = (ahora: number) => {
      const k = Math.min(texto.length, Math.floor((ahora - t0) / msPorLetra));
      setN(k);
      if (k < texto.length) raf = requestAnimationFrame(paso);
      else finRef.current?.();
    };
    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [texto, instantaneo, msPorLetra]);

  const escribiendo = n < texto.length;
  return (
    <p className={className} aria-hidden="true">
      <span>{texto.slice(0, n)}</span>
      {escribiendo && <span className="ml-px inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse bg-[#7cf0c4]" />}
      <span className="opacity-0">{texto.slice(n)}</span>
    </p>
  );
}
