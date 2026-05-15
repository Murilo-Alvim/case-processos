export type ProcessType = "system" | "manual" | "hybrid";
export type ProcessStatus = "active" | "draft" | "deprecated";
export type ProcessPriority = "low" | "medium" | "high" | "critical";

export interface Area {
  id: string;
  name: string;
  description?: string | null;
  color: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
  _count?: { processes: number };
  processes?: Process[];
}

export interface Tool {
  id: string;
  name: string;
  type: "software" | "platform" | "service";
  url?: string | null;
  description?: string | null;
  _count?: { processes: number };
}

export interface Responsible {
  id: string;
  name: string;
  email?: string | null;
  role?: string | null;
  team?: string | null;
  _count?: { processes: number };
}

export interface Doc {
  id: string;
  title: string;
  url?: string | null;
  type: "link" | "file" | "wiki" | "video";
  description?: string | null;
  processId: string;
}

export interface Process {
  id: string;
  name: string;
  description?: string | null;
  type: ProcessType;
  status: ProcessStatus;
  priority: ProcessPriority;
  order: number;
  areaId: string;
  parentId?: string | null;
  area?: Area;
  parent?: Process | null;
  children?: ProcessTreeNode[];
  tools?: { tool: Tool }[];
  responsibles?: { responsible: Responsible }[];
  documents?: Doc[];
  _count?: { children: number };
  createdAt: string;
  updatedAt: string;
}

export interface ProcessTreeNode extends Process {
  children: ProcessTreeNode[];
}

export interface Stats {
  totals: {
    areas: number;
    processes: number;
    tools: number;
    responsibles: number;
    documents: number;
  };
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byArea: { id: string; name: string; color: string; icon: string; total: number }[];
}
