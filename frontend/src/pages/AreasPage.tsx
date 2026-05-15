import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Network, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "../components/PageHeader";
import { useAreas, useDeleteArea, useSaveArea } from "../lib/queries";
import { Modal } from "../components/Modal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { AREA_COLORS, AREA_ICON_OPTIONS, getAreaIcon } from "../lib/meta";
import { cn } from "../lib/utils";
import type { Area } from "../types";

export function AreasPage() {
  const { data: areas = [], isLoading } = useAreas();
  const [editing, setEditing] = useState<Partial<Area> | null>(null);
  const [deleting, setDeleting] = useState<Area | null>(null);

  const save = useSaveArea();
  const remove = useDeleteArea();

  const onSave = async (data: Partial<Area>) => {
    try {
      await save.mutateAsync({ ...editing!, ...data });
      toast.success(editing?.id ? "Área atualizada" : "Área criada");
      setEditing(null);
    } catch (err: any) {
      toast.error(err.userMessage ?? "Erro ao salvar");
    }
  };

  const onDelete = async () => {
    if (!deleting) return;
    try {
      await remove.mutateAsync(deleting.id);
      toast.success("Área removida");
      setDeleting(null);
    } catch (err: any) {
      toast.error(err.userMessage ?? "Erro ao remover");
    }
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader
        icon={<Building2 className="w-5 h-5" />}
        title="Áreas"
        description="Organize departamentos e setores como containers de processos."
        actions={
          <button
            className="btn-primary"
            onClick={() =>
              setEditing({
                name: "",
                description: "",
                color: AREA_COLORS[0],
                icon: AREA_ICON_OPTIONS[0],
              })
            }
          >
            <Plus className="w-4 h-4" /> Nova área
          </button>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-5 h-36 animate-pulse opacity-50" />
          ))}

        {areas.map((area) => {
          const Icon = getAreaIcon(area.icon);
          return (
            <div
              key={area.id}
              className="card p-5 group hover:border-brand-500/40 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-11 h-11 rounded-xl grid place-items-center shrink-0 border"
                  style={{
                    background: `${area.color}1a`,
                    color: area.color,
                    borderColor: `${area.color}33`,
                  }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-ink truncate">{area.name}</h3>
                  <p className="text-xs text-muted mt-1 line-clamp-2 min-h-[2rem]">
                    {area.description || "Sem descrição"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-line">
                <span className="text-xs text-muted">
                  <span className="font-mono text-ink">
                    {area._count?.processes ?? 0}
                  </span>{" "}
                  processo(s)
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  <Link
                    to={`/mapa/${area.id}`}
                    className="p-1.5 rounded-md text-muted hover:text-brand-300 hover:bg-card"
                    title="Ver mapa"
                  >
                    <Network className="w-4 h-4" />
                  </Link>
                  <button
                    className="p-1.5 rounded-md text-muted hover:text-ink hover:bg-card"
                    onClick={() => setEditing(area)}
                    title="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    className="p-1.5 rounded-md text-muted hover:text-red-400 hover:bg-card"
                    onClick={() => setDeleting(area)}
                    title="Remover"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {!isLoading && areas.length === 0 && (
          <div className="col-span-full">
            <div className="card p-10 text-center">
              <h3 className="font-semibold text-ink">Nenhuma área cadastrada</h3>
              <p className="text-sm text-muted mt-1">
                Comece criando uma área para organizar seus processos.
              </p>
            </div>
          </div>
        )}
      </div>

      <AreaForm
        open={!!editing}
        initial={editing}
        onClose={() => setEditing(null)}
        onSubmit={onSave}
        loading={save.isPending}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Remover área"
        message={`Tem certeza que deseja remover a área "${deleting?.name}"? Todos os processos associados também serão removidos.`}
        confirmLabel="Remover"
        onConfirm={onDelete}
        onClose={() => setDeleting(null)}
        loading={remove.isPending}
      />
    </div>
  );
}

function AreaForm({
  open,
  initial,
  onClose,
  onSubmit,
  loading,
}: {
  open: boolean;
  initial: Partial<Area> | null;
  onClose: () => void;
  onSubmit: (data: Partial<Area>) => void;
  loading: boolean;
}) {
  const [form, setForm] = useState<Partial<Area>>({});

  useEffect(() => {
    if (open && initial) setForm(initial);
    if (!open) setForm({});
  }, [open, initial]);

  const handleClose = () => onClose();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: form.name,
      description: form.description,
      color: form.color,
      icon: form.icon,
    });
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={initial?.id ? "Editar área" : "Nova área"}
      description="Áreas agrupam processos por departamento ou setor."
      size="md"
      footer={
        <>
          <button type="button" className="btn-ghost" onClick={handleClose}>
            Cancelar
          </button>
          <button
            type="submit"
            form="area-form"
            className="btn-primary"
            disabled={loading}
          >
            Salvar
          </button>
        </>
      }
    >
      <form id="area-form" onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Nome *</label>
          <input
            className="input"
            value={form.name ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
            placeholder="Ex.: Pessoas, Tecnologia, Financeiro..."
          />
        </div>
        <div>
          <label className="label">Descrição</label>
          <textarea
            className="textarea"
            rows={3}
            value={form.description ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            placeholder="Resumo do escopo da área"
          />
        </div>

        <div>
          <label className="label">Cor</label>
          <div className="flex flex-wrap gap-2">
            {AREA_COLORS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setForm((f) => ({ ...f, color: c }))}
                className={cn(
                  "w-7 h-7 rounded-lg border-2 transition-all",
                  form.color === c
                    ? "border-ink scale-110"
                    : "border-transparent hover:scale-105"
                )}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="label">Ícone</label>
          <div className="grid grid-cols-6 gap-2">
            {AREA_ICON_OPTIONS.map((iconName) => {
              const Ic = getAreaIcon(iconName);
              return (
                <button
                  type="button"
                  key={iconName}
                  onClick={() => setForm((f) => ({ ...f, icon: iconName }))}
                  className={cn(
                    "h-10 rounded-lg border grid place-items-center transition-all",
                    form.icon === iconName
                      ? "border-brand-500 bg-brand-500/10 text-brand-200"
                      : "border-line text-muted hover:text-ink hover:border-line/70"
                  )}
                >
                  <Ic className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>
      </form>
    </Modal>
  );
}
