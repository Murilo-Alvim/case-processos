import {
  Activity,
  Building2,
  FileText,
  LayoutDashboard,
  Network,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { useStats } from "../lib/queries";
import { TYPE_META, PRIORITY_META, STATUS_META, getAreaIcon } from "../lib/meta";
import { cn } from "../lib/utils";

export function DashboardPage() {
  const { data: stats, isLoading } = useStats();

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader
        icon={<LayoutDashboard className="w-5 h-5" />}
        title="Visão Geral"
        description="Panorama completo dos processos mapeados na organização."
      />

      {/* totals */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <StatCard
          label="Áreas"
          value={stats?.totals.areas ?? 0}
          icon={<Building2 className="w-4 h-4" />}
          tone="violet"
          loading={isLoading}
        />
        <StatCard
          label="Processos"
          value={stats?.totals.processes ?? 0}
          icon={<Network className="w-4 h-4" />}
          tone="indigo"
          loading={isLoading}
        />
        <StatCard
          label="Ferramentas"
          value={stats?.totals.tools ?? 0}
          icon={<Wrench className="w-4 h-4" />}
          tone="cyan"
          loading={isLoading}
        />
        <StatCard
          label="Responsáveis"
          value={stats?.totals.responsibles ?? 0}
          icon={<Users className="w-4 h-4" />}
          tone="amber"
          loading={isLoading}
        />
        <StatCard
          label="Documentos"
          value={stats?.totals.documents ?? 0}
          icon={<FileText className="w-4 h-4" />}
          tone="emerald"
          loading={isLoading}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* processes by area */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-ink">Processos por Área</h3>
              <p className="text-xs text-muted mt-0.5">
                Inclui processos e subprocessos em qualquer nível.
              </p>
            </div>
            <Activity className="w-4 h-4 text-muted" />
          </div>

          <div className="space-y-3">
            {stats?.byArea.length ? (
              stats.byArea.map((a) => {
                const max = Math.max(...stats.byArea.map((x) => x.total), 1);
                const pct = (a.total / max) * 100;
                const Icon = getAreaIcon(a.icon);
                return (
                  <Link
                    to={`/mapa/${a.id}`}
                    key={a.id}
                    className="block group"
                  >
                    <div className="flex items-center gap-3 text-sm mb-1.5">
                      <div
                        className="w-7 h-7 rounded-lg grid place-items-center"
                        style={{ background: `${a.color}22`, color: a.color }}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-medium text-ink group-hover:text-brand-300 transition">
                        {a.name}
                      </span>
                      <span className="ml-auto font-mono text-xs text-muted">
                        {a.total}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-panel overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, background: a.color }}
                      />
                    </div>
                  </Link>
                );
              })
            ) : (
              <p className="text-sm text-muted py-8 text-center">
                Nenhuma área cadastrada ainda.
              </p>
            )}
          </div>
        </div>

        {/* breakdown panels */}
        <div className="space-y-4">
          <BreakdownPanel
            title="Por Tipo"
            items={Object.entries(stats?.byType ?? {}).map(([key, value]) => ({
              key,
              value,
              label: TYPE_META[key as keyof typeof TYPE_META]?.label ?? key,
              color: TYPE_META[key as keyof typeof TYPE_META]?.color ?? "text-ink",
              bg: TYPE_META[key as keyof typeof TYPE_META]?.bg ?? "bg-card",
              border:
                TYPE_META[key as keyof typeof TYPE_META]?.border ?? "border-line",
            }))}
          />
          <BreakdownPanel
            title="Por Status"
            items={Object.entries(stats?.byStatus ?? {}).map(([key, value]) => ({
              key,
              value,
              label: STATUS_META[key as keyof typeof STATUS_META]?.label ?? key,
              color: STATUS_META[key as keyof typeof STATUS_META]?.color ?? "text-ink",
              bg: STATUS_META[key as keyof typeof STATUS_META]?.bg ?? "bg-card",
              border:
                STATUS_META[key as keyof typeof STATUS_META]?.border ?? "border-line",
            }))}
          />
          <BreakdownPanel
            title="Por Prioridade"
            items={Object.entries(stats?.byPriority ?? {}).map(([key, value]) => ({
              key,
              value,
              label: PRIORITY_META[key as keyof typeof PRIORITY_META]?.label ?? key,
              color: PRIORITY_META[key as keyof typeof PRIORITY_META]?.color ?? "text-ink",
              bg: PRIORITY_META[key as keyof typeof PRIORITY_META]?.bg ?? "bg-card",
              border:
                PRIORITY_META[key as keyof typeof PRIORITY_META]?.border ?? "border-line",
            }))}
          />
        </div>
      </div>

      {/* CTA */}
      <div className="mt-6 card p-6 bg-gradient-to-br from-brand-700/20 via-card to-card border-brand-500/20 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-500/20 grid place-items-center text-brand-300 border border-brand-500/30">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-ink">
              Explore a hierarquia de processos
            </h3>
            <p className="text-sm text-muted mt-0.5 max-w-lg">
              Visualize fluxos completos em formato de árvore interativa, com
              detalhamento de ferramentas, responsáveis e documentação.
            </p>
          </div>
        </div>
        <Link to="/mapa" className="btn-primary">
          <Network className="w-4 h-4" />
          Abrir Mapa de Processos
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  tone,
  loading,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: "violet" | "indigo" | "cyan" | "amber" | "emerald";
  loading?: boolean;
}) {
  const tones: Record<string, string> = {
    violet: "from-violet-500/20 to-violet-700/0 text-violet-300 border-violet-500/20",
    indigo: "from-indigo-500/20 to-indigo-700/0 text-indigo-300 border-indigo-500/20",
    cyan: "from-cyan-500/20 to-cyan-700/0 text-cyan-300 border-cyan-500/20",
    amber: "from-amber-500/20 to-amber-700/0 text-amber-300 border-amber-500/20",
    emerald: "from-emerald-500/20 to-emerald-700/0 text-emerald-300 border-emerald-500/20",
  };
  return (
    <div
      className={cn(
        "card relative overflow-hidden p-4 bg-gradient-to-br border",
        tones[tone]
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs uppercase tracking-wider text-muted font-medium">
          {label}
        </span>
        <span className="opacity-80">{icon}</span>
      </div>
      <div className="text-3xl font-bold text-ink mt-3 font-mono tabular-nums">
        {loading ? <span className="opacity-30">—</span> : value}
      </div>
    </div>
  );
}

function BreakdownPanel({
  title,
  items,
}: {
  title: string;
  items: {
    key: string;
    value: number;
    label: string;
    color: string;
    bg: string;
    border: string;
  }[];
}) {
  return (
    <div className="card p-4">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
        {title}
      </h4>
      <div className="space-y-1.5">
        {items.length === 0 && (
          <p className="text-xs text-muted">Sem dados</p>
        )}
        {items.map((it) => (
          <div key={it.key} className="flex items-center justify-between gap-2 text-sm">
            <span
              className={cn(
                "badge",
                it.bg,
                it.border,
                it.color
              )}
            >
              {it.label}
            </span>
            <span className="font-mono text-ink tabular-nums">{it.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
