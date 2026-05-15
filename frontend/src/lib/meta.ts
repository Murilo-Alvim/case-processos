import {
  AlertTriangle,
  Bot,
  Building2,
  Cog,
  Cpu,
  CheckCircle2,
  DollarSign,
  FileText,
  Flame,
  Hand,
  HelpCircle,
  Layers,
  Megaphone,
  ShieldCheck,
  Sparkles,
  Truck,
  Users,
  Briefcase,
  LucideIcon,
} from "lucide-react";
import type { ProcessPriority, ProcessStatus, ProcessType } from "../types";

export const AREA_ICONS: Record<string, LucideIcon> = {
  Building2,
  Users,
  Cpu,
  DollarSign,
  Briefcase,
  Megaphone,
  Truck,
  ShieldCheck,
  Sparkles,
  Layers,
};

export const AREA_ICON_OPTIONS = Object.keys(AREA_ICONS);

export const AREA_COLORS = [
  "#5F6BE5",
  "#8B5CF6",
  "#06B6D4",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#EC4899",
  "#14B8A6",
  "#84CC16",
  "#A855F7",
];

export const TYPE_META: Record<
  ProcessType,
  { label: string; icon: LucideIcon; color: string; bg: string; border: string }
> = {
  system: {
    label: "Sistêmico",
    icon: Bot,
    color: "text-cyan-300",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
  },
  manual: {
    label: "Manual",
    icon: Hand,
    color: "text-amber-300",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
  },
  hybrid: {
    label: "Híbrido",
    icon: Cog,
    color: "text-violet-300",
    bg: "bg-violet-500/10",
    border: "border-violet-500/30",
  },
};

export const STATUS_META: Record<
  ProcessStatus,
  { label: string; color: string; bg: string; border: string; dot: string; icon: LucideIcon }
> = {
  active: {
    label: "Ativo",
    color: "text-emerald-300",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    dot: "bg-emerald-400",
    icon: CheckCircle2,
  },
  draft: {
    label: "Rascunho",
    color: "text-slate-300",
    bg: "bg-slate-500/10",
    border: "border-slate-500/30",
    dot: "bg-slate-400",
    icon: HelpCircle,
  },
  deprecated: {
    label: "Obsoleto",
    color: "text-rose-300",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    dot: "bg-rose-400",
    icon: AlertTriangle,
  },
};

export const PRIORITY_META: Record<
  ProcessPriority,
  { label: string; color: string; bg: string; border: string; icon: LucideIcon }
> = {
  low: {
    label: "Baixa",
    color: "text-slate-300",
    bg: "bg-slate-500/10",
    border: "border-slate-500/30",
    icon: FileText,
  },
  medium: {
    label: "Média",
    color: "text-sky-300",
    bg: "bg-sky-500/10",
    border: "border-sky-500/30",
    icon: FileText,
  },
  high: {
    label: "Alta",
    color: "text-amber-300",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    icon: Flame,
  },
  critical: {
    label: "Crítica",
    color: "text-rose-300",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    icon: AlertTriangle,
  },
};

export function getAreaIcon(name: string): LucideIcon {
  return AREA_ICONS[name] ?? Building2;
}
