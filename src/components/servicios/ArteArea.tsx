"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { rgba } from "./ui";

type Props = {
  src?: string;
  alt: string;
  color: string;
  letra: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  /** Opacidad de la imagen (capa atmosférica). */
  imgClassName?: string;
  /** Muestra la letra gigante en el respaldo. */
  letraGrande?: boolean;
};

/**
 * Arte de un área: la imagen generada si carga; si falta o falla, un degradado
 * en el color del área con una retícula y la letra del inventario.
 */
export function ArteArea({ src, alt, color, letra, sizes, priority, className, imgClassName, letraGrande = true }: Props) {
  const [fallo, setFallo] = useState(false);
  const conImagen = Boolean(src) && !fallo;
  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)} aria-hidden={conImagen ? undefined : true}>
      {/* Respaldo siempre debajo: así la imagen aparece sobre algo con carácter */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(120% 90% at 85% 10%, ${rgba(color, 0.45)}, transparent 60%), radial-gradient(90% 80% at 0% 100%, rgba(35,72,212,0.35), transparent 65%), linear-gradient(160deg, #0a1638 0%, #020a18 70%)`,
        }}
      />
      <div className="grid-bg absolute inset-0 opacity-40" />
      {letraGrande && !conImagen && (
        <span
          className="absolute -bottom-[0.18em] right-[0.04em] select-none font-serif text-[min(46vw,16rem)] italic leading-none"
          style={{ color: rgba(color, 0.16) }}
        >
          {letra}
        </span>
      )}
      {conImagen && src && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          onError={() => setFallo(true)}
          className={cn("object-cover", imgClassName)}
        />
      )}
    </div>
  );
}
