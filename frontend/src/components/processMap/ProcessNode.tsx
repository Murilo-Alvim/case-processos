import { Handle, Position, type NodeProps } from "@xyflow/react";
import { ChevronRight, FileText, Plus, Users, Wrench } from "lucide-react";
import { PRIORITY_META, STATUS_META, TYPE_META } from "../../lib/meta";
import { cn } from "../../lib/utils";
import type { ProcessTreeNode } from "../../types";

interface ProcessNodeData {
  process: ProcessTreeNode;
  color: string;
  onAddChild: () => void;
  onOpen: () => void;
}

export function ProcessNode({ data }: NodeProps) {
  const { process, color, onAddChild, onOpen } = data as unknown as ProcessNodeData;
  const Tp = TYPE_META[process.type];
  const St = STATUS_META[process.status];
  const Pr = PRIORITY_META[process.priority];
  const childCount = process.children?.length ?? 0;

  return (
    <div className="group relative">
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-line !border-line"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-line !border-line"
      />

      <div
        onClick={onOpen}
        className={cn(
          "w-[280px] cursor-pointer rounded-xl bg-card border transition-all",
          "hover:shadow-glow hover:-translate-y-0.5"
        )}
        style={{
          borderColor: `${color}40`,
          boxShadow: `0 0 0 1px ${color}1a, 0 8px 24px -12px rgba(0,0,0,0.45)`,
        }}
      >
        {/* color bar */}
        <div
          className="h-1 rounded-t-xl"
          style={{
            background: `linear-gradient(90deg, ${color}, ${color}66)`,
          }}
        />

        <div className="px-3.5 py-3">
          <div className="flex items-start gap-2">
            <div
              className={cn(
                "w-7 h-7 rounded-lg grid place-items-center shrink-0 border",
                Tp.bg,
                Tp.border,
                Tp.color
              )}
            >
              <Tp.icon className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-ink text-sm leading-tight line-clamp-2">
                {process.name}
              </h4>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span
                  className={cn("badge text-[10px] py-0", St.bg, St.border, St.color)}
                >
                  <span className={cn("w-1 h-1 rounded-full", St.dot)} />
                  {St.label}
                </span>
                <span
                  className={cn("badge text-[10px] py-0", Pr.bg, Pr.border, Pr.color)}
                >
                  {Pr.label}
                </span>
              </div>
            </div>
          </div>

          {/* footer counters */}
          <div className="mt-2.5 pt-2.5 border-t border-line/50 flex items-center gap-3 text-[11px] text-muted">
            {!!process.tools?.length && (
              <span className="flex items-center gap-1">
                <Wrench className="w-3 h-3" />
                {process.tools.length}
              </span>
            )}
            {!!process.responsibles?.length && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {process.responsibles.length}
              </span>
            )}
            {!!process.documents?.length && (
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {process.documents.length}
              </span>
            )}
            {childCount > 0 && (
              <span className="ml-auto flex items-center gap-0.5 text-brand-300 font-medium">
                {childCount} sub <ChevronRight className="w-3 h-3" />
              </span>
            )}
          </div>
        </div>
      </div>

      {/* add-child button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAddChild();
        }}
        title="Adicionar subprocesso"
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-brand-500 text-white shadow-glow opacity-0 group-hover:opacity-100 transition-all grid place-items-center hover:bg-brand-400 z-10"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
