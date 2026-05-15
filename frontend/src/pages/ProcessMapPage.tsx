import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
} from "@xyflow/react";
import { Filter, Network, Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "../components/PageHeader";
import {
  useAreas,
  useDeleteProcess,
  useProcessTree,
  useResponsibles,
  useSaveProcess,
  useTools,
} from "../lib/queries";
import { ProcessNode } from "../components/processMap/ProcessNode";
import { ProcessSidePanel } from "../components/processMap/ProcessSidePanel";
import { ProcessForm } from "../components/processMap/ProcessForm";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { layoutTree } from "../components/processMap/layout";
import { getAreaIcon } from "../lib/meta";
import { cn } from "../lib/utils";
import type { Process, ProcessTreeNode } from "../types";

const nodeTypes = { process: ProcessNode };

export function ProcessMapPage() {
  return (
    <ReactFlowProvider>
      <ProcessMapInner />
    </ReactFlowProvider>
  );
}

function ProcessMapInner() {
  const { areaId: routeAreaId } = useParams();
  const navigate = useNavigate();
  const { data: areas = [] } = useAreas();

  const [areaId, setAreaId] = useState<string | undefined>(routeAreaId);

  useEffect(() => {
    if (!areaId && areas.length) setAreaId(areas[0].id);
  }, [areas, areaId]);

  useEffect(() => {
    if (areaId && areaId !== routeAreaId) {
      navigate(`/mapa/${areaId}`, { replace: true });
    }
  }, [areaId, routeAreaId, navigate]);

  const { data: tree = [], isLoading } = useProcessTree(areaId);
  const { data: tools = [] } = useTools();
  const { data: responsibles = [] } = useResponsibles();

  const [selected, setSelected] = useState<ProcessTreeNode | null>(null);
  const [editing, setEditing] = useState<Partial<Process> | null>(null);
  const [deleting, setDeleting] = useState<Process | null>(null);

  const saveProcess = useSaveProcess();
  const removeProcess = useDeleteProcess();

  const flatProcesses = useMemo(() => {
    const out: ProcessTreeNode[] = [];
    const walk = (nodes: ProcessTreeNode[]) => {
      for (const n of nodes) {
        out.push(n);
        if (n.children?.length) walk(n.children);
      }
    };
    walk(tree);
    return out;
  }, [tree]);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    const { nodes: n, edges: e } = layoutTree(tree, {
      onAddChild: (parent) =>
        setEditing({
          areaId,
          parentId: parent.id,
          type: "manual",
          status: "active",
          priority: "medium",
        }),
      onOpen: (proc) => setSelected(proc),
    });
    setNodes(n);
    setEdges(e);
  }, [tree, areaId, setNodes, setEdges]);

  const onSaveProcess = async (data: Partial<Process> & { toolIds?: string[]; responsibleIds?: string[] }) => {
    try {
      await saveProcess.mutateAsync({ ...editing!, ...data, areaId: areaId! });
      toast.success(editing?.id ? "Processo atualizado" : "Processo criado");
      setEditing(null);
    } catch (err: any) {
      toast.error(err.userMessage ?? "Erro ao salvar processo");
    }
  };

  const onDelete = async () => {
    if (!deleting) return;
    try {
      await removeProcess.mutateAsync(deleting.id);
      toast.success("Processo removido");
      setDeleting(null);
      if (selected?.id === deleting.id) setSelected(null);
    } catch (err: any) {
      toast.error(err.userMessage ?? "Erro ao remover");
    }
  };

  const currentArea = areas.find((a) => a.id === areaId);

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 pb-3">
        <PageHeader
          icon={<Network className="w-5 h-5" />}
          title="Mapa de Processos"
          description="Visualize hierarquias de processos como um fluxograma navegável. Clique em um nó para ver detalhes."
          actions={
            <button
              className="btn-primary"
              disabled={!areaId}
              onClick={() =>
                setEditing({
                  areaId,
                  type: "manual",
                  status: "active",
                  priority: "medium",
                })
              }
            >
              <Plus className="w-4 h-4" /> Novo processo
            </button>
          }
        />

        <div className="card p-2 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted px-2">
            <Filter className="w-3.5 h-3.5" /> Área:
          </div>
          {areas.map((a) => {
            const Icon = getAreaIcon(a.icon);
            const active = a.id === areaId;
            return (
              <button
                key={a.id}
                onClick={() => setAreaId(a.id)}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-md flex items-center gap-2 border transition-all",
                  active
                    ? "border-transparent text-white"
                    : "border-line text-muted hover:text-ink hover:border-line/70"
                )}
                style={
                  active
                    ? {
                        background: `linear-gradient(135deg, ${a.color}, ${a.color}cc)`,
                        boxShadow: `0 0 0 1px ${a.color}66, 0 6px 18px -8px ${a.color}99`,
                      }
                    : undefined
                }
              >
                <Icon className="w-3.5 h-3.5" />
                {a.name}
                <span className="text-[10px] opacity-70 font-mono">
                  ({a._count?.processes ?? 0})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 px-6 pb-6 overflow-hidden">
        <div className="card h-full overflow-hidden flex">
          <div className="flex-1 relative">
            {isLoading && (
              <div className="absolute inset-0 grid place-items-center text-muted text-sm">
                Carregando árvore...
              </div>
            )}
            {!isLoading && tree.length === 0 && (
              <div className="absolute inset-0 grid place-items-center text-center px-6">
                <div>
                  <div className="w-14 h-14 rounded-full bg-brand-500/10 border border-brand-500/20 grid place-items-center text-brand-300 mx-auto mb-4">
                    <Network className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-ink">
                    Nenhum processo nesta área
                  </h3>
                  <p className="text-sm text-muted mt-1 max-w-sm">
                    Crie o primeiro processo para começar a mapear o fluxo.
                  </p>
                  <button
                    className="btn-primary mt-4"
                    onClick={() =>
                      setEditing({
                        areaId,
                        type: "manual",
                        status: "active",
                        priority: "medium",
                      })
                    }
                  >
                    <Plus className="w-4 h-4" /> Criar processo
                  </button>
                </div>
              </div>
            )}

            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.25, maxZoom: 1.1 }}
              minZoom={0.2}
              maxZoom={1.6}
              proOptions={{ hideAttribution: true }}
              defaultEdgeOptions={{
                animated: false,
                type: "smoothstep",
                style: { stroke: "#3a4163", strokeWidth: 2 },
              }}
            >
              <Background
                variant={BackgroundVariant.Dots}
                gap={20}
                size={1.5}
                color="#2a3048"
              />
              <Controls showInteractive={false} />
              <MiniMap
                pannable
                zoomable
                nodeColor={(n) => (n.data as any)?.color ?? "#5F6BE5"}
                nodeStrokeColor="#222738"
                maskColor="rgba(11,13,23,0.6)"
              />
            </ReactFlow>
          </div>

          {selected && (
            <ProcessSidePanel
              process={selected}
              onClose={() => setSelected(null)}
              onEdit={() => {
                setEditing(selected);
                setSelected(null);
              }}
              onAddChild={() =>
                setEditing({
                  areaId,
                  parentId: selected.id,
                  type: "manual",
                  status: "active",
                  priority: "medium",
                })
              }
              onDelete={() => {
                setDeleting(selected);
                setSelected(null);
              }}
            />
          )}
        </div>
      </div>

      <ProcessForm
        open={!!editing}
        initial={editing}
        onClose={() => setEditing(null)}
        onSubmit={onSaveProcess}
        loading={saveProcess.isPending}
        processes={flatProcesses}
        tools={tools}
        responsibles={responsibles}
        areaColor={currentArea?.color ?? "#5F6BE5"}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Remover processo"
        message={`Remover "${deleting?.name}"? Todos os subprocessos também serão removidos.`}
        confirmLabel="Remover"
        onConfirm={onDelete}
        onClose={() => setDeleting(null)}
        loading={removeProcess.isPending}
      />
    </div>
  );
}
