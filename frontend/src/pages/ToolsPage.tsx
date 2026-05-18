import { useEffect, useState } from "react";
import { ExternalLink, Pencil, Plus, Trash2, Wrench } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "../components/PageHeader";
import { Modal } from "../components/Modal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import {
  useDeleteTool,
  useSaveTool,
  useTools,
} from "../lib/queries";
import { cn } from "../lib/utils";
import type { Tool } from "../types";

const TYPE_LABELS: Record<string, string> = {
  software: "Software",
  platform: "Plataforma",
  service: "Serviço",
};

export function ToolsPage() {
  const { data: tools = [], isLoading } = useTools();
  const [editing, setEditing] = useState<Partial<Tool> | null>(null);
  const [deleting, setDeleting] = useState<Tool | null>(null);
  const save = useSaveTool();
  const remove = useDeleteTool();

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">
      <PageHeader
        icon={<Wrench className="w-5 h-5" />}
        title="Ferramentas e Sistemas"
        description="Catálogo de softwares, plataformas e serviços utilizados pela operação."
        actions={
          <button
            className="btn-primary"
            onClick={() => setEditing({ name: "", type: "software", url: "" })}
          >
            <Plus className="w-4 h-4" /> Nova ferramenta
          </button>
        }
      />

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="text-left bg-panel/50 text-muted">
            <tr>
              <th className="px-5 py-3 font-medium">Nome</th>
              <th className="px-5 py-3 font-medium">Tipo</th>
              <th className="px-5 py-3 font-medium">URL</th>
              <th className="px-5 py-3 font-medium">Em uso</th>
              <th className="px-5 py-3 font-medium w-24"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-muted">
                  Carregando...
                </td>
              </tr>
            )}
            {!isLoading && tools.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-muted">
                  Nenhuma ferramenta cadastrada
                </td>
              </tr>
            )}
            {tools.map((t) => (
              <tr
                key={t.id}
                className="border-t border-line hover:bg-panel/40 group"
              >
                <td className="px-5 py-3 font-medium text-ink">{t.name}</td>
                <td className="px-5 py-3">
                  <span
                    className={cn(
                      "badge",
                      t.type === "software" && "bg-cyan-500/10 border-cyan-500/30 text-cyan-300",
                      t.type === "platform" && "bg-violet-500/10 border-violet-500/30 text-violet-300",
                      t.type === "service" && "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    )}
                  >
                    {TYPE_LABELS[t.type] ?? t.type}
                  </span>
                </td>
                <td className="px-5 py-3 text-muted">
                  {t.url ? (
                    <a
                      href={t.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 hover:text-brand-300 truncate max-w-xs"
                    >
                      {t.url}
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-5 py-3 text-muted font-mono text-xs">
                  {t._count?.processes ?? 0} processo(s)
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition">
                    <button
                      className="p-1.5 rounded-md text-muted hover:text-ink hover:bg-card"
                      onClick={() => setEditing(t)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      className="p-1.5 rounded-md text-muted hover:text-red-400 hover:bg-card"
                      onClick={() => setDeleting(t)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      <ToolForm
        open={!!editing}
        initial={editing}
        onClose={() => setEditing(null)}
        onSubmit={async (data) => {
          try {
            await save.mutateAsync({ ...editing!, ...data });
            toast.success(editing?.id ? "Ferramenta atualizada" : "Ferramenta criada");
            setEditing(null);
          } catch (err: any) {
            toast.error(err.userMessage ?? "Erro ao salvar");
          }
        }}
        loading={save.isPending}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Remover ferramenta"
        message={`Remover "${deleting?.name}"? Vínculos com processos serão desfeitos.`}
        confirmLabel="Remover"
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await remove.mutateAsync(deleting.id);
            toast.success("Ferramenta removida");
            setDeleting(null);
          } catch (err: any) {
            toast.error(err.userMessage ?? "Erro ao remover");
          }
        }}
        onClose={() => setDeleting(null)}
        loading={remove.isPending}
      />
    </div>
  );
}

function ToolForm({
  open,
  initial,
  onClose,
  onSubmit,
  loading,
}: {
  open: boolean;
  initial: Partial<Tool> | null;
  onClose: () => void;
  onSubmit: (data: Partial<Tool>) => void;
  loading: boolean;
}) {
  const [form, setForm] = useState<Partial<Tool>>({});

  useEffect(() => {
    if (open && initial) setForm(initial);
    if (!open) setForm({});
  }, [open, initial]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial?.id ? "Editar ferramenta" : "Nova ferramenta"}
      footer={
        <>
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="submit"
            form="tool-form"
            className="btn-primary"
            disabled={loading}
          >
            Salvar
          </button>
        </>
      }
    >
      <form
        id="tool-form"
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit({
            name: form.name,
            type: form.type ?? "software",
            url: form.url || null,
            description: form.description || null,
          });
        }}
      >
        <div>
          <label className="label">Nome *</label>
          <input
            className="input"
            value={form.name ?? ""}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label">Tipo</label>
          <select
            className="select"
            value={form.type ?? "software"}
            onChange={(e) => setForm({ ...form, type: e.target.value as any })}
          >
            <option value="software">Software</option>
            <option value="platform">Plataforma</option>
            <option value="service">Serviço</option>
          </select>
        </div>
        <div>
          <label className="label">URL</label>
          <input
            className="input"
            value={form.url ?? ""}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="https://..."
            type="url"
          />
        </div>
        <div>
          <label className="label">Descrição</label>
          <textarea
            className="textarea"
            rows={2}
            value={form.description ?? ""}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />
        </div>
      </form>
    </Modal>
  );
}
