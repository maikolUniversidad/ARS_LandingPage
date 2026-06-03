"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export type MobileLink = {
  label: string;
  href: string;
  /** Marca el CTA principal con estilo invertido */
  primary?: boolean;
};

/**
 * Menú de navegación para móvil/tablet. Muestra un botón hamburguesa que
 * despliega un panel a pantalla completa con los links. Se oculta en `md+`
 * donde la navegación inline del header ya es visible.
 */
export function MobileMenu({ links }: { links: MobileLink[] }) {
  const [open, setOpen] = useState(false);

  // Bloquea el scroll del body cuando el menú está abierto
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Cierra con Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={open}
        aria-controls="mobile-menu-panel"
        className="bevel-btn flex size-10 items-center justify-center border border-border bg-background/40 text-foreground/80 backdrop-blur transition-colors hover:bg-background/70 hover:text-foreground"
      >
        <span aria-hidden className="text-lg leading-none">
          {open ? "✕" : "☰"}
        </span>
      </button>

      {open && (
        <div
          id="mobile-menu-panel"
          className="fixed inset-0 top-[68px] z-40 bg-background/95 backdrop-blur"
        >
          <nav className="flex flex-col gap-2 px-6 py-6">
            {links.map((link) =>
              link.href.startsWith("/") ? (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={menuLinkClass(link.primary)}
                >
                  <span className="text-accent">◇</span> {link.label}
                </Link>
              ) : (
                <a
                  key={link.href + link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={menuLinkClass(link.primary)}
                >
                  <span className="text-accent">◇</span> {link.label}
                </a>
              ),
            )}
          </nav>
        </div>
      )}
    </div>
  );
}

function menuLinkClass(primary?: boolean) {
  const base =
    "bevel-btn flex items-center gap-3 border px-5 py-4 font-mono text-sm font-bold uppercase tracking-[0.18em] transition-colors";
  return primary
    ? `${base} border-border/60 bg-foreground text-background`
    : `${base} border-border bg-background/40 text-foreground/85 hover:bg-background/70 hover:text-foreground`;
}
