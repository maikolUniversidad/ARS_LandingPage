"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { seccionVisible } from "@/lib/asistente/contexto-pagina";

export type Pista = { id: string; titulo: string };

type Opciones = {
  /** Solo sigue el scroll mientras el asistente está acoplado y sin recorrido. */
  activo: boolean;
  /** true si la persona escribe, Ars responde o habla: no se interrumpe. */
  ocupado: () => boolean;
  ruta: string;
};

/** Espera tras el último scroll antes de mirar qué sección quedó a la vista. */
const QUIETO_MS = 1200;
/** Tiempo mínimo entre dos pistas, para no ser insistente. */
const ENFRIAR_MS = 14_000;
/** La pista se retira sola si nadie la usa. */
const VIDA_MS = 10_000;

/**
 * Acompañamiento: mientras el asistente está acoplado, mira qué sección deja
 * la persona a la vista al detener el scroll y ofrece explicarla. Como mucho
 * una pista por sección y por página, con enfriamiento entre pistas, y nunca
 * mientras la persona escribe o Ars responde o habla.
 */
export function useSeguirSeccion({ activo, ocupado, ruta }: Opciones) {
  // La pista recuerda su página: al navegar o desacoplar deja de mostrarse sola.
  const [interna, setPista] = useState<(Pista & { ruta: string }) | null>(null);
  const pista = activo && interna?.ruta === ruta ? interna : null;
  const vistas = useRef(new Set<string>());
  const ultima = useRef(0);
  const ocupadoRef = useRef(ocupado);
  const pistaRef = useRef(pista);

  useEffect(() => {
    ocupadoRef.current = ocupado;
  }, [ocupado]);
  useEffect(() => {
    pistaRef.current = pista;
  }, [pista]);

  // Cada página empieza de cero.
  useEffect(() => {
    vistas.current = new Set();
  }, [ruta]);

  /** Marca una sección como ya tratada (Ars la mostró o la explicó). */
  const marcar = useCallback((id: string) => {
    vistas.current.add(id);
    setPista((p) => (p?.id === id ? null : p));
  }, []);

  const descartar = useCallback(() => setPista(null), []);

  useEffect(() => {
    if (!activo) return;
    let espera = 0;
    let vida = 0;
    const mirar = () => {
      const s = seccionVisible();
      if (!s?.titulo || vistas.current.has(s.id)) return;
      if (ocupadoRef.current() || Date.now() - ultima.current < ENFRIAR_MS) return;
      vistas.current.add(s.id);
      ultima.current = Date.now();
      setPista({ id: s.id, titulo: s.titulo, ruta });
      window.clearTimeout(vida);
      vida = window.setTimeout(() => setPista((p) => (p?.id === s.id ? null : p)), VIDA_MS);
    };
    const alDesplazar = () => {
      window.clearTimeout(espera);
      espera = window.setTimeout(mirar, QUIETO_MS);
      // Si la sección de la pista ya no está a la vista, se retira (al quedar quieto).
      const p = pistaRef.current;
      if (p) {
        window.clearTimeout(vida);
        vida = window.setTimeout(() => {
          if (seccionVisible()?.id !== p.id) setPista((x) => (x?.id === p.id ? null : x));
          else vida = window.setTimeout(() => setPista((x) => (x?.id === p.id ? null : x)), VIDA_MS);
        }, 400);
      }
    };
    // La sección donde arranca el acompañamiento no merece pista.
    const inicial = seccionVisible();
    if (inicial) vistas.current.add(inicial.id);
    window.addEventListener("scroll", alDesplazar, { passive: true });
    return () => {
      window.removeEventListener("scroll", alDesplazar);
      window.clearTimeout(espera);
      window.clearTimeout(vida);
    };
  }, [activo, ruta]);

  return { pista, marcar, descartar };
}
