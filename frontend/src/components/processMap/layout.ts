import type { Edge, Node } from "@xyflow/react";
import type { ProcessTreeNode } from "../../types";

const NODE_WIDTH = 280;
const NODE_HEIGHT = 132;
const H_GAP = 80;
const V_GAP = 32;

interface LayoutHandlers {
  onAddChild?: (parent: ProcessTreeNode) => void;
  onOpen?: (node: ProcessTreeNode) => void;
}

// Tree layout horizontal — usa pós-ordem para calcular a altura de cada subárvore.
export function layoutTree(roots: ProcessTreeNode[], handlers: LayoutHandlers = {}) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  function measure(node: ProcessTreeNode): number {
    if (!node.children?.length) return NODE_HEIGHT;
    return node.children.reduce(
      (sum, child, i) =>
        sum + measure(child) + (i > 0 ? V_GAP : 0),
      0
    );
  }

  function place(node: ProcessTreeNode, depth: number, yStart: number): number {
    const height = measure(node);
    const x = depth * (NODE_WIDTH + H_GAP);
    const y = yStart + height / 2 - NODE_HEIGHT / 2;

    nodes.push({
      id: node.id,
      type: "process",
      position: { x, y },
      data: {
        process: node,
        color: areaColor(node),
        onAddChild: () => handlers.onAddChild?.(node),
        onOpen: () => handlers.onOpen?.(node),
      },
      sourcePosition: "right" as any,
      targetPosition: "left" as any,
    });

    let childY = yStart;
    for (const child of node.children ?? []) {
      const childH = measure(child);
      place(child, depth + 1, childY);
      edges.push({
        id: `${node.id}-${child.id}`,
        source: node.id,
        target: child.id,
        type: "smoothstep",
        animated: false,
        style: { stroke: `${areaColor(node)}aa`, strokeWidth: 2 },
      });
      childY += childH + V_GAP;
    }

    return height;
  }

  let cursorY = 0;
  for (const root of roots) {
    const h = place(root, 0, cursorY);
    cursorY += h + V_GAP * 2;
  }

  return { nodes, edges };
}

function areaColor(node: ProcessTreeNode): string {
  return node.area?.color ?? "#5F6BE5";
}
