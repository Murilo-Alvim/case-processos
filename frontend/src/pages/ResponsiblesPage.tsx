import { useEffect, useState } from "react";
import { Mail, Pencil, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "../components/PageHeader";
import { Modal } from "../components/Modal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import {
  useDeleteResponsible,
  useResponsibles,
  useSaveResponsible,
} from "../lib/queries";
import type { Responsible } from "../types";

export function ResponsiblesPage() {
  const { data: items = [], isLoading } = useResponsibles();
  const [editing, setEditing] = useState<Partial<Responsible> | null>(null);
  const [deleting, setDeleting] = useState<Responsible | null>(null);
  const save = useSaveResponsible();
  const remove = useDeleteResponsible();

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader
        icon={<Users className="w-5 h-5" />}
        title="Responsáveis"
        description="Pessoas e equipes responsáveis pelos processos da organização."
        actions={
          <button className="btn-primary" onClick={() => setEditing({ name: "" })}>
            <Plus className="w-4 h-4" /> Novo responsável
          </button>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-5 h-32 animate-pulse opacity-50" />
          ))}

        {items.map((r) => (
          <div key={r.id} className="card p-4 group">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 grid place-items-center text-sm font-bold text-white shrink-0">
                {r.name
                  .split(" ")
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-ink truncate">{r.name}</div>
                <div className="text-xs text-muted truncate">
                  {[r.role, r.team].filter(Boolean).join(" · ") || "—"}
                </div>
                {r.email && (
                  <a
                    href={`mailto:${r.email}`}
                    className="text-xs text-brand-300 hover:underline flex items-center gap-1 mt-1 truncate"
                  >
                    <Mail className="w-3 h-3 shrink-0" />
                    {r.email}
                  </a>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-line text-xs">
              <span className="text-muted">
                <span className="font-mono text-ink">
                  {r._count?.processes ?? 0}
                </span>{" "}
                processo(s)
              </span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={() => setEditing(r)}
                  className="p-1.5 rounded-md text-muted hover:text-ink hover:bg-card"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleting(r)}
                  className="p-1.5 rounded-md text-muted hover:text-red-400 hover:bg-card"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {!isLoading && items.length === 0 && (
          <div className="col-span-full card p-10 text-center text-muted text-sm">
            Nenhum responsável cadastrado.
          </div>
        )}
      </div>

      <ResponsibleForm
        open={!!editing}
        initial={editing}
        onClose={() => setEditing(null)}
        onSubmit={async (data) => {
          try {
            await save.mutateAsync({ ...editing!, ...data });
            toast.success(editing?.id ? "Responsável atualizado" : "Responsável criado");
            setEditing(null);
          } catch (err: any) {
            toast.error(err.userMessage ?? "Erro ao salvar");
          }
        }}
        loading={save.isPending}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Remover responsável"
        message={`Remover "${deleting?.name}"? Vínculos com processos serão desfeitos.`}
        confirmLabel="Remover"
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await remove.mutateAsync(deleting.id);
            toast.success("Responsável removido");
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

function ResponsibleForm({
  open,
  initial,
  onClose,
  onSubmit,
  loading,
}: {
  open: boolean;
  initial: Partial<Responsible> | null;
  onClose: () => void;
  onSubmit: (data: Partial<Responsible>) => void;
  loading: boolean;
}) {
  const [form, setForm] = useState<Partial<Responsible>>({});

  useEffect(() => {
    if (open && initial) setForm(initial);
    if (!open) setForm({});
  }, [open, initial]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial?.id ? "Editar responsável" : "Novo responsável"}
      footer={
        <>
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="submit"
            form="resp-form"
            className="btn-primary"
            disabled={loading}
          >
            Salvar
          </button>
        </>
      }
    >
      <form
        id="resp-form"
        className="grid grid-cols-2 gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit({
            name: form.name,
            email: form.email || null,
            role: form.role || null,
            team: form.team || null,
          });
        }}
      >
        <div className="col-span-2">
          <label className="label">Nome / Equipe *</label>
          <input
            className="input"
            value={form.name ?? ""}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label">Cargo / Função</label>
          <input
            className="input"
            value={form.role ?? ""}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Time</label>
          <input
            className="input"
            value={form.team ?? ""}
            onChange={(e) => setForm({ ...form, team: e.target.value })}
          />
        </div>
        <div className="col-span-2">
          <label className="label">E-mail</label>
          <input
            className="input"
            type="email"
            value={form.email ?? ""}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
      </form>
    </Modal>
  );
}
