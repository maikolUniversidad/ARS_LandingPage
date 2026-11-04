"use client";

import { Fragment, type ReactNode } from "react";

/**
 * Markdown mínimo y seguro para las respuestas: párrafos, listas, **negrita**,
 * *cursiva*, `código` y enlaces. Los enlaces internos (/ruta) navegan con el
 * asistente; los externos abren en pestaña nueva.
 */
type Props = {
  texto: string;
  alEnlaceInterno: (href: string) => void;
  /** Cursor parpadeante al final mientras llega el texto en streaming. */
  cursor?: boolean;
};

const Cursor = () => (
  <span
    aria-hidden="true"
    className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[3px] rounded-full bg-[#7fa0ff] motion-safe:animate-pulse"
  />
);

function enLinea(t: string, alInterno: Props["alEnlaceInterno"], clave: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g;
  let ultimo = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(t))) {
    if (m.index > ultimo) out.push(t.slice(ultimo, m.index));
    const tok = m[0];
    const k = `${clave}-${i++}`;
    if (tok.startsWith("**")) out.push(<strong key={k} className="font-bold text-foreground">{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith("`")) out.push(<code key={k} className="rounded bg-foreground/10 px-1 font-mono text-[0.85em]">{tok.slice(1, -1)}</code>);
    else if (tok.startsWith("[")) {
      const [, label, href] = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(tok) ?? [];
      if (href?.startsWith("/") || href?.startsWith("#")) {
        out.push(
          <button
            key={k}
            type="button"
            onClick={() => alInterno(href)}
            className="font-semibold text-[#7fa0ff] underline decoration-[#7fa0ff]/40 underline-offset-2 hover:decoration-[#7fa0ff]"
          >
            {label}
          </button>,
        );
      } else if (href && /^https?:\/\//.test(href)) {
        out.push(
          <a key={k} href={href} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#7fa0ff] underline underline-offset-2">
            {label}
          </a>,
        );
      } else out.push(label ?? tok);
    } else out.push(<em key={k}>{tok.slice(1, -1)}</em>);
    ultimo = m.index + tok.length;
  }
  if (ultimo < t.length) out.push(t.slice(ultimo));
  return out;
}

export function TextoRico({ texto, alEnlaceInterno, cursor }: Props) {
  const bloques = texto.trim().split(/\n{2,}/);
  const ultimoBloque = bloques.length - 1;
  return (
    <>
      {bloques.map((b, bi) => {
        const lineas = b.split("\n");
        const esLista = lineas.every((l) => /^\s*([-*•]|\d+[.)])\s+/.test(l));
        if (esLista) {
          const ordenada = /^\s*\d/.test(lineas[0]);
          const Tag = ordenada ? "ol" : "ul";
          return (
            <Tag key={bi} className={`my-1.5 space-y-1 pl-5 ${ordenada ? "list-decimal" : "list-disc"} marker:text-[#7fa0ff]`}>
              {lineas.map((l, li) => (
                <li key={li}>
                  {enLinea(l.replace(/^\s*([-*•]|\d+[.)])\s+/, ""), alEnlaceInterno, `${bi}-${li}`)}
                  {cursor && bi === ultimoBloque && li === lineas.length - 1 && <Cursor />}
                </li>
              ))}
            </Tag>
          );
        }
        return (
          <p key={bi} className="my-1.5 first:mt-0 last:mb-0">
            {lineas.map((l, li) => (
              <Fragment key={li}>
                {li > 0 && <br />}
                {enLinea(l.replace(/^#+\s*/, ""), alEnlaceInterno, `${bi}-${li}`)}
              </Fragment>
            ))}
            {cursor && bi === ultimoBloque && <Cursor />}
          </p>
        );
      })}
    </>
  );
}
