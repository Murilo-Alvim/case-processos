import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import type {
  Area,
  Process,
  ProcessTreeNode,
  Responsible,
  Stats,
  Tool,
} from "../types";

/* ---------------- areas ---------------- */
export function useAreas() {
  return useQuery<Area[]>({
    queryKey: ["areas"],
    queryFn: async () => (await api.get("/areas")).data,
  });
}

export function useArea(id?: string) {
  return useQuery<Area>({
    queryKey: ["areas", id],
    queryFn: async () => (await api.get(`/areas/${id}`)).data,
    enabled: !!id,
  });
}

export function useSaveArea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Area> & { id?: string }) => {
      const { id, ...rest } = payload;
      const res = id ? await api.put(`/areas/${id}`, rest) : await api.post("/areas", rest);
      return res.data as Area;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["areas"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useDeleteArea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/areas/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["areas"] });
      qc.invalidateQueries({ queryKey: ["processes"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

/* ---------------- processes ---------------- */
export function useProcesses(areaId?: string) {
  return useQuery<Process[]>({
    queryKey: ["processes", { areaId, tree: false }],
    queryFn: async () =>
      (await api.get("/processes", { params: { areaId } })).data,
  });
}

export function useProcessTree(areaId?: string) {
  return useQuery<ProcessTreeNode[]>({
    queryKey: ["processes", { areaId, tree: true }],
    queryFn: async () =>
      (await api.get("/processes", { params: { areaId, tree: true } })).data,
  });
}

export function useProcess(id?: string) {
  return useQuery<Process>({
    queryKey: ["processes", id],
    queryFn: async () => (await api.get(`/processes/${id}`)).data,
    enabled: !!id,
  });
}

export function useSaveProcess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Process> & {
      id?: string;
      toolIds?: string[];
      responsibleIds?: string[];
    }) => {
      const { id, ...rest } = payload;
      const res = id
        ? await api.put(`/processes/${id}`, rest)
        : await api.post("/processes", rest);
      return res.data as Process;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["processes"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useDeleteProcess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/processes/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["processes"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useAddDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      processId,
      ...payload
    }: {
      processId: string;
      title: string;
      url?: string;
      type?: string;
      description?: string;
    }) => (await api.post(`/processes/${processId}/documents`, payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["processes"] }),
  });
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ processId, docId }: { processId: string; docId: string }) =>
      api.delete(`/processes/${processId}/documents/${docId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["processes"] }),
  });
}

/* ---------------- tools ---------------- */
export function useTools() {
  return useQuery<Tool[]>({
    queryKey: ["tools"],
    queryFn: async () => (await api.get("/tools")).data,
  });
}

export function useSaveTool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Tool> & { id?: string }) => {
      const { id, ...rest } = payload;
      const res = id ? await api.put(`/tools/${id}`, rest) : await api.post("/tools", rest);
      return res.data as Tool;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tools"] }),
  });
}

export function useDeleteTool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/tools/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tools"] }),
  });
}

/* ---------------- responsibles ---------------- */
export function useResponsibles() {
  return useQuery<Responsible[]>({
    queryKey: ["responsibles"],
    queryFn: async () => (await api.get("/responsibles")).data,
  });
}

export function useSaveResponsible() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Responsible> & { id?: string }) => {
      const { id, ...rest } = payload;
      const res = id
        ? await api.put(`/responsibles/${id}`, rest)
        : await api.post("/responsibles", rest);
      return res.data as Responsible;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["responsibles"] }),
  });
}

export function useDeleteResponsible() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/responsibles/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["responsibles"] }),
  });
}

/* ---------------- stats ---------------- */
export function useStats() {
  return useQuery<Stats>({
    queryKey: ["stats"],
    queryFn: async () => (await api.get("/stats")).data,
  });
}
