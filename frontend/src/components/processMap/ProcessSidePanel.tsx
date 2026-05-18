import { useState } from "react";
import {
  ExternalLink,
  FileText,
  Pencil,
  Plus,
  Trash2,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { PRIORITY_META, STATUS_META, TYPE_META } from "../../lib/meta";
import { cn } from "../../lib/utils";
import {
  useAddDocument,
  useDeleteDocument,
} from "../../lib/queries";
import type { Doc, ProcessTreeNode } from "../../types";

interface Props {
  process: ProcessTreeNode;
  onClose: () => void;
  onEdit: () => void;
  onAddChild: () => void;
  onDelete: () => void;
}

export function ProcessSidePanel({
  process,
  onClose,
  onEdit,
  onAddChild,
  onDelete,
}: Props) {
  const Tp = TYPE_META[process.type];
  const St = STATUS_META[process.status];
  const Pr = PRIORITY_META[process.priority];

  return (
    <aside className="absolute inset-0 z-20 lg:relative lg:inset-auto w-full lg:w-[380px] shrink-0 border-l border-line bg-panel lg:bg-panel/70 backdrop-blur-xl flex flex-col animate-fade-in">
      <div className="px-5 py-4 border-b border-line">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <span className="text-[10px] uppercase tracking-widest text-muted">
              {process.area?.name ?? "Processo"}
            </span>
            <h2 className="font-semibold text-ink leading-tight mt-0.5 text-lg">
              {process.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-ink p-1.5 rounded-lg hover:bg-card"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 mt-3">
          <span className={cn("badge", Tp.bg, Tp.border, Tp.color)}>
            <Tp.icon className="w-3 h-3" />
            {Tp.label}
          </span>
          <span className={cn("badge", St.bg, St.border, St.color)}>
            <span className={cn("w-1.5 h-1.5 rounded-full", St.dot)} />
            {St.label}
          </span>
          <span className={cn("badge", Pr.bg, Pr.border, Pr.color)}>
            <Pr.icon className="w-3 h-3" />
            {Pr.label}
          </span>
        </div>

        <div className="flex items-center gap-1.5 mt-3">
          <button className="btn-ghost text-xs flex-1" onClick={onEdit}>
            <Pencil className="w-3.5 h-3.5" /> Editar
          </button>
          <button className="btn-ghost text-xs flex-1" onClick={onAddChild}>
            <Plus className="w-3.5 h-3.5" /> Sub
          </button>
          <button
            className="btn-danger text-xs"
            onClick={onDelete}
            title="Remover"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {process.description && (
          <Section title="Descrição">
            <p className="text-sm text-ink/80 leading-relaxed whitespace-pre-wrap">
              {process.description}
            </p>
          </Section>
        )}

        <Section
          title="Ferramentas"
          icon={<Wrench className="w-3.5 h-3.5" />}
          count={process.tools?.length}
        >
          {process.tools?.length ? (
            <div className="flex flex-wrap gap-1.5">
              {process.tools.map(({ tool }) => (
                <a
                  key={tool.id}
                  href={tool.url ?? "#"}
                  target={tool.url ? "_blank" : undefined}
                  rel="noreferrer"
                  className="badge border-line bg-card text-ink hover:border-brand-500/40 hover:text-brand-200 transition"
                >
                  {tool.name}
                  {tool.url && <ExternalLink className="w-3 h-3 opacity-60" />}
                </a>
              ))}
            </div>
          ) : (
            <Empty>Nenhuma ferramenta vinculada</Empty>
          )}
        </Section>

        <Section
          title="Responsáveis"
          icon={<Users className="w-3.5 h-3.5" />}
          count={process.responsibles?.length}
        >
          {process.responsibles?.length ? (
            <div className="space-y-1.5">
              {process.responsibles.map(({ responsible }) => (
                <div
                  key={responsible.id}
                  className="flex items-center gap-2.5 p-2 rounded-lg bg-card border border-line"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 grid place-items-center text-xs font-semibold text-white shrink-0">
                    {responsible.name
                      .split(" ")
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm text-ink font-medium truncate">
                      {responsible.name}
                    </div>
                    <div className="text-[11px] text-muted truncate">
                      {[responsible.role, responsible.team]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty>Nenhum responsável vinculado</Empty>
          )}
        </Section>

        <Section
          title="Documentação"
          icon={<FileText className="w-3.5 h-3.5" />}
          count={process.documents?.length}
        >
          <DocsList processId={process.id} docs={process.documents ?? []} />
        </Section>
      </div>
    </aside>
  );
}

function Section({
  title,
  icon,
  count,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
          {icon} {title}
        </h4>
        {!!count && (
          <span className="text-[10px] font-mono text-muted bg-card px-1.5 rounded">
            {count}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs text-muted/80 italic py-2 px-3 rounded border border-dashed border-line">
      {children}
    </div>
  );
}

function DocsList({ processId, docs }: { processId: string; docs: Doc[] }) {
  const add = useAddDocument();
  const remove = useDeleteDocument();
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  const submit = async () => {
    if (!title.trim()) return;
    try {
      await add.mutateAsync({ processId, title, url: url || undefined });
      toast.success("Documento adicionado");
      setTitle("");
      setUrl("");
      setCreating(false);
    } catch (err: any) {
      toast.error(err.userMessage ?? "Erro ao adicionar");
    }
  };

  return (
    <div className="space-y-1.5">
      {docs.length === 0 && !creating && <Empty>Nenhum documento</Empty>}
      {docs.map((d) => (
        <div
          key={d.id}
          className="flex items-center justify-between gap-2 p-2 rounded-lg bg-card border border-line group/doc"
        >
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-3.5 h-3.5 text-brand-300 shrink-0" />
            {d.url ? (
              <a
                href={d.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-ink hover:text-brand-300 truncate"
              >
                {d.title}
              </a>
            ) : (
              <span className="text-sm text-ink truncate">{d.title}</span>
            )}
          </div>
          <button
            onClick={async () => {
              try {
                await remove.mutateAsync({ processId, docId: d.id });
                toast.success("Documento removido");
              } catch (err: any) {
                toast.error(err.userMessage ?? "Erro ao remover");
              }
            }}
            className="text-muted hover:text-red-400 p-1 opacity-0 group-hover/doc:opacity-100"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}

      {creating ? (
        <div className="space-y-1.5 p-2 rounded-lg bg-card border border-brand-500/30">
          <input
            className="input"
            placeholder="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
          <input
            className="input"
            placeholder="URL (opcional)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <div className="flex gap-1.5">
            <button
              className="btn-ghost text-xs flex-1"
              onClick={() => setCreating(false)}
            >
              Cancelar
            </button>
            <button
              className="btn-primary text-xs flex-1"
              onClick={submit}
              disabled={add.isPending}
            >
              Salvar
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setCreating(true)}
          className="w-full text-xs text-muted hover:text-brand-300 border border-dashed border-line hover:border-brand-500/40 py-2 rounded-lg flex items-center justify-center gap-1.5 transition"
        >
          <Plus className="w-3.5 h-3.5" /> Adicionar documento
        </button>
      )}
    </div>
  );
}
