import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Modal } from "../Modal";
import { PRIORITY_META, STATUS_META, TYPE_META } from "../../lib/meta";
import { cn } from "../../lib/utils";
import type {
  Process,
  ProcessPriority,
  ProcessStatus,
  ProcessTreeNode,
  ProcessType,
  Responsible,
  Tool,
} from "../../types";

interface FormState {
  id?: string;
  name: string;
  description: string;
  type: ProcessType;
  status: ProcessStatus;
  priority: ProcessPriority;
  parentId: string | null;
  toolIds: string[];
  responsibleIds: string[];
}

const initialForm: FormState = {
  name: "",
  description: "",
  type: "manual",
  status: "active",
  priority: "medium",
  parentId: null,
  toolIds: [],
  responsibleIds: [],
};

interface Props {
  open: boolean;
  initial: Partial<Process> | null;
  onClose: () => void;
  onSubmit: (
    data: Partial<Process> & { toolIds?: string[]; responsibleIds?: string[] }
  ) => void;
  loading: boolean;
  processes: ProcessTreeNode[];
  tools: Tool[];
  responsibles: Responsible[];
  areaColor: string;
}

export function ProcessForm({
  open,
  initial,
  onClose,
  onSubmit,
  loading,
  processes,
  tools,
  responsibles,
  areaColor,
}: Props) {
  const [form, setForm] = useState<FormState>(initialForm);

  useEffect(() => {
    if (!open) return;
    setForm({
      id: initial?.id,
      name: initial?.name ?? "",
      description: initial?.description ?? "",
      type: (initial?.type as ProcessType) ?? "manual",
      status: (initial?.status as ProcessStatus) ?? "active",
      priority: (initial?.priority as ProcessPriority) ?? "medium",
      parentId: initial?.parentId ?? null,
      toolIds: initial?.tools?.map((t) => t.tool.id) ?? [],
      responsibleIds: initial?.responsibles?.map((r) => r.responsible.id) ?? [],
    });
  }, [open, initial]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: form.id,
      name: form.name,
      description: form.description || null,
      type: form.type,
      status: form.status,
      priority: form.priority,
      parentId: form.parentId,
      toolIds: form.toolIds,
      responsibleIds: form.responsibleIds,
    });
  };

  const toggle = (key: "toolIds" | "responsibleIds", id: string) =>
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(id) ? f[key].filter((x) => x !== id) : [...f[key], id],
    }));

  // só permite escolher pais que não sejam o próprio (auto-ref)
  const possibleParents = processes.filter((p) => p.id !== form.id);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={form.id ? "Editar processo" : "Novo processo"}
      description="Detalhe nome, tipo, prioridade e os recursos relacionados ao processo."
      size="xl"
      footer={
        <>
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="submit"
            form="process-form"
            className="btn-primary"
            disabled={loading || !form.name.trim()}
          >
            Salvar processo
          </button>
        </>
      }
    >
      <form
        id="process-form"
        onSubmit={submit}
        className="grid grid-cols-1 md:grid-cols-2 gap-5"
      >
        <div className="md:col-span-2">
          <label className="label">Nome do processo *</label>
          <input
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            placeholder="Ex.: Recrutamento e Seleção"
          />
        </div>

        <div className="md:col-span-2">
          <label className="label">Descrição</label>
          <textarea
            className="textarea"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Resumo, objetivo, contexto..."
          />
        </div>

        <div>
          <label className="label">Tipo</label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(TYPE_META) as ProcessType[]).map((t) => {
              const m = TYPE_META[t];
              const active = form.type === t;
              return (
                <button
                  type="button"
                  key={t}
                  onClick={() => setForm({ ...form, type: t })}
                  className={cn(
                    "px-2.5 py-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 justify-center transition",
                    active
                      ? cn(m.bg, m.border, m.color, "border-current/40")
                      : "border-line text-muted hover:text-ink"
                  )}
                >
                  <m.icon className="w-3.5 h-3.5" />
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="label">Prioridade</label>
          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(PRIORITY_META) as ProcessPriority[]).map((p) => {
              const m = PRIORITY_META[p];
              const active = form.priority === p;
              return (
                <button
                  type="button"
                  key={p}
                  onClick={() => setForm({ ...form, priority: p })}
                  className={cn(
                    "px-2 py-2 rounded-lg border text-xs font-medium transition",
                    active
                      ? cn(m.bg, m.border, m.color)
                      : "border-line text-muted hover:text-ink"
                  )}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="label">Status</label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(STATUS_META) as ProcessStatus[]).map((s) => {
              const m = STATUS_META[s];
              const active = form.status === s;
              return (
                <button
                  type="button"
                  key={s}
                  onClick={() => setForm({ ...form, status: s })}
                  className={cn(
                    "px-2.5 py-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 justify-center transition",
                    active
                      ? cn(m.bg, m.border, m.color)
                      : "border-line text-muted hover:text-ink"
                  )}
                >
                  <span className={cn("w-1.5 h-1.5 rounded-full", m.dot)} />
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="label">Processo pai (opcional)</label>
          <select
            className="select"
            value={form.parentId ?? ""}
            onChange={(e) =>
              setForm({ ...form, parentId: e.target.value || null })
            }
          >
            <option value="">— Processo raiz —</option>
            {possibleParents.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2 grid md:grid-cols-2 gap-5">
          <MultiSelect
            label="Ferramentas / Sistemas"
            empty="Nenhuma ferramenta disponível. Cadastre em Ferramentas."
            items={tools.map((t) => ({ id: t.id, label: t.name }))}
            value={form.toolIds}
            onToggle={(id) => toggle("toolIds", id)}
            color={areaColor}
          />
          <MultiSelect
            label="Responsáveis"
            empty="Nenhum responsável disponível. Cadastre em Responsáveis."
            items={responsibles.map((r) => ({
              id: r.id,
              label: r.name,
              sub: [r.role, r.team].filter(Boolean).join(" · "),
            }))}
            value={form.responsibleIds}
            onToggle={(id) => toggle("responsibleIds", id)}
            color={areaColor}
          />
        </div>
      </form>
    </Modal>
  );
}

function MultiSelect({
  label,
  empty,
  items,
  value,
  onToggle,
  color,
}: {
  label: string;
  empty: string;
  items: { id: string; label: string; sub?: string }[];
  value: string[];
  onToggle: (id: string) => void;
  color: string;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="max-h-44 overflow-y-auto rounded-lg border border-line bg-panel/60 p-1 space-y-0.5">
        {items.length === 0 && (
          <p className="text-xs text-muted italic p-3">{empty}</p>
        )}
        {items.map((it) => {
          const active = value.includes(it.id);
          return (
            <button
              type="button"
              key={it.id}
              onClick={() => onToggle(it.id)}
              className={cn(
                "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-left transition",
                active ? "bg-card" : "hover:bg-card/60"
              )}
            >
              <div
                className={cn(
                  "w-4 h-4 rounded border grid place-items-center shrink-0",
                  active ? "border-transparent" : "border-line"
                )}
                style={active ? { background: color } : undefined}
              >
                {active && <Check className="w-3 h-3 text-white" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm text-ink truncate">{it.label}</div>
                {it.sub && (
                  <div className="text-[11px] text-muted truncate">{it.sub}</div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
