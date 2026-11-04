/**
 * Store mínimo para el capítulo continuo del scroll. Evita re-renderizar React
 * en cada frame: el canvas se suscribe directo y la UI sólo escucha cambios
 * discretos (capítulo activo, paso de la cadena).
 */
export type ChapterStore = {
  get: () => number;
  set: (value: number) => void;
  subscribe: (fn: (value: number) => void) => () => void;
};

export function createChapterStore(initial = 0): ChapterStore {
  let value = initial;
  const listeners = new Set<(value: number) => void>();
  return {
    get: () => value,
    set: (next) => {
      if (next === value) return;
      value = next;
      listeners.forEach((fn) => fn(value));
    },
    subscribe: (fn) => {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
  };
}
