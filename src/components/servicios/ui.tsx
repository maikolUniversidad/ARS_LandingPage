import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  AppWindow,
  BadgeCheck,
  Bot,
  BrainCircuit,
  Building2,
  Cctv,
  ClipboardList,
  Cloud,
  Cpu,
  Eye,
  Fingerprint,
  Footprints,
  FileText,
  Glasses,
  Globe,
  GraduationCap,
  Headset,
  KeyRound,
  Landmark,
  Layers,
  Lock,
  MapPinned,
  MessagesSquare,
  Monitor,
  MonitorDot,
  MonitorSmartphone,
  Network,
  Plug,
  Radio,
  RadioTower,
  Receipt,
  ScanFace,
  Server,
  Shield,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
  Wallet,
  Workflow,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { EstadoModulo } from "@/data/servicios";
import { cn } from "@/lib/utils";

/** Iconos lucide que el catálogo puede nombrar (`Area.icono`, `Pilar.icono`). Desconocido → Sparkles. */
const ICONOS: Record<string, LucideIcon> = {
  AppWindow,
  BadgeCheck,
  Bot,
  BrainCircuit,
  Building2,
  Cctv,
  ClipboardList,
  Cloud,
  Cpu,
  Eye,
  Fingerprint,
  Footprints,
  FileText,
  Glasses,
  Globe,
  GraduationCap,
  Headset,
  KeyRound,
  Landmark,
  Layers,
  Lock,
  MapPinned,
  MessagesSquare,
  Monitor,
  MonitorDot,
  MonitorSmartphone,
  Network,
  Plug,
  Radio,
  RadioTower,
  Receipt,
  ScanFace,
  Server,
  Shield,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
  Wallet,
  Workflow,
  Zap,
};

export function Icono({ nombre, className }: { nombre: string; className?: string }) {
  const C = ICONOS[nombre] ?? Sparkles;
  return <C className={className} aria-hidden="true" />;
}

export function Eyebrow({ children, tint = "#6b8aff", className }: { children: ReactNode; tint?: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-[#9eb0c0] md:text-[11px]",
        className
      )}
    >
      <span className="inline-block size-2 shrink-0" style={{ background: tint, boxShadow: `0 0 12px ${tint}` }} />
      {children}
    </div>
  );
}

export function CtaLink({
  href,
  children,
  primary = false,
  externo = false,
  className,
}: {
  href: string;
  children: ReactNode;
  primary?: boolean;
  externo?: boolean;
  className?: string;
}) {
  const cls = cn(
    "bevel-btn inline-flex items-center gap-3 px-5 py-3 font-mono text-[10.5px] font-bold uppercase tracking-[0.2em] transition-colors md:px-7 md:py-4 md:text-xs",
    primary
      ? "bg-white text-[#020a18] hover:bg-[#d5e0ff]"
      : "border border-white/25 bg-white/[0.04] text-white hover:border-[#6b8aff] hover:bg-white/10",
    className
  );
  const inner = (
    <>
      <span className={primary ? "text-[#2348d4]" : "text-[#6b8aff]"} aria-hidden="true">
        ▸
      </span>
      {children}
    </>
  );
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <a href={href} className={cls} {...(externo ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      {inner}
    </a>
  );
}

const ESTADOS: Record<EstadoModulo, { texto: string; color: string } | null> = {
  vivo: { texto: "En producción", color: "#35e0a1" },
  piloto: { texto: "En piloto", color: "#ffb547" },
  proximamente: { texto: "Próximamente", color: "#6b8aff" },
  "hoja-de-ruta": { texto: "Hoja de ruta", color: "#9eb0c0" },
};

export function EstadoBadge({ estado, nota, className }: { estado: EstadoModulo; nota?: string; className?: string }) {
  const e = ESTADOS[estado];
  if (!e) return null;
  const sutil = estado === "vivo";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 border px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.2em]",
        sutil ? "border-white/10 text-white/55" : "text-white/90",
        className
      )}
      style={sutil ? undefined : { borderColor: `${e.color}66`, background: `${e.color}14` }}
      title={nota}
    >
      <span className="inline-block size-1.5 rounded-full" style={{ background: e.color }} aria-hidden="true" />
      {e.texto}
      {nota && <span className="normal-case tracking-normal text-white/60">· {nota}</span>}
    </span>
  );
}

export function Pildora({ children, tint }: { children: ReactNode; tint?: string }) {
  return (
    <li className="flex items-center gap-2 border border-white/12 bg-white/[0.03] px-2.5 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-white/85 md:text-[10px]">
      {tint && <span className="inline-block size-1 shrink-0" style={{ background: tint }} aria-hidden="true" />}
      {children}
    </li>
  );
}

export function PieServicios() {
  return (
    <footer className="border-t border-white/10 bg-[#020a18] py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-4 md:flex-row md:px-10">
        <Image
          src="/images/logos/horizontal-blanco.png"
          alt="ARS Intelligence"
          width={1672}
          height={941}
          sizes="50px"
          className="h-7 w-auto opacity-80"
        />
        <p className="font-serif text-sm italic text-foreground/55">La forma simple de hacer que todo funcione.</p>
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/40">
          © {new Date().getFullYear()} ARS Intelligence
        </p>
      </div>
    </footer>
  );
}

/** Convierte "#5fd8ff" en "rgba(95,216,255,a)". */
export function rgba(hex: string, a: number) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.replace(/./g, (c) => c + c) : h.padEnd(6, "0").slice(0, 6);
  const n = Number.parseInt(full, 16);
  if (Number.isNaN(n)) return `rgba(107,138,255,${a})`;
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
