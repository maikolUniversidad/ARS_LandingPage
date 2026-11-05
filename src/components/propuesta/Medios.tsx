"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type VideoHTMLAttributes } from "react";
import type { AreaId, Escenario } from "@/data/propuesta/tipos";
import { imagenPropuesta, type TipoImagen } from "@/data/propuesta/imagenes";
import { cn } from "@/lib/utils";
import { useMenosMovimiento } from "./util";

/** Rutas candidatas para una imagen del escenario; si falta, el arte del área. */
export function rutasEscenario(escenario: Escenario | undefined, tipo: TipoImagen, area?: AreaId): string[] {
  const out: string[] = [];
  if (escenario) out.push(imagenPropuesta(escenario, tipo));
  if (area) out.push(`/servicios/arte/${area}.jpg`);
  return out;
}

/** Imagen de fondo con respaldo: prueba cada ruta y, si ninguna existe, no pinta nada. */
export function ImagenRespaldo({
  rutas,
  alt = "",
  className,
  sizes = "100vw",
  prioridad,
}: {
  rutas: string[];
  alt?: string;
  className?: string;
  sizes?: string;
  prioridad?: boolean;
}) {
  const [i, setI] = useState(0);
  const [lista, setLista] = useState(rutas);
  if (rutas.join("|") !== lista.join("|")) {
    setLista(rutas);
    setI(0);
  }
  const src = lista[i];
  if (!src) return null;
  return (
    <Image
      key={src}
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={prioridad}
      onError={() => setI((n) => n + 1)}
      className={cn("object-cover", className)}
    />
  );
}

/** Video silenciado en bucle que solo se reproduce cuando está en pantalla (y nunca solo si se pidió reducir movimiento). */
export function VideoEnVista({ className, ...props }: VideoHTMLAttributes<HTMLVideoElement> & { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const quieto = useMenosMovimiento();
  useEffect(() => {
    const v = ref.current;
    if (!v || quieto || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(v);
    return () => {
      io.disconnect();
      v.pause();
    };
  }, [quieto]);
  return <video ref={ref} muted loop playsInline preload="none" controls={quieto} className={className} {...props} />;
}
