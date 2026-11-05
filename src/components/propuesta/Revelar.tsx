"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useVisible } from "./util";

/** Aparece (fade + subida) cuando entra en pantalla; sin animación si se pidió reducir movimiento. */
export function Revelar({ children, className, retraso = 0, as: Tag = "div" }: { children: ReactNode; className?: string; retraso?: number; as?: "div" | "li" | "section" }) {
  const [ref, visible] = useVisible<HTMLDivElement>();
  return (
    <Tag
      ref={ref as never}
      className={cn(visible ? "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-6 motion-safe:duration-700 motion-safe:fill-mode-both" : "motion-safe:opacity-0", className)}
      style={retraso ? { animationDelay: `${retraso}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
