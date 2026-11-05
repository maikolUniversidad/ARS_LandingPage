import {
  Activity,
  Car,
  Fence,
  Flame,
  HardHat,
  Package,
  PersonStanding,
  ScanFace,
  ScanText,
  ShieldAlert,
  Thermometer,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import type { DemoType } from "@/data/ai-capabilities";

export const ICONO_DEMO: Record<DemoType, LucideIcon> = {
  face: ScanFace,
  lpr: ScanText,
  weapons: ShieldAlert,
  ppe: HardHat,
  intrusion: Fence,
  behavior: Activity,
  "people-count": Users,
  thermal: Thermometer,
  vehicle: Car,
  object: Package,
  fall: PersonStanding,
  fire: Flame,
  crowd: UsersRound,
};
