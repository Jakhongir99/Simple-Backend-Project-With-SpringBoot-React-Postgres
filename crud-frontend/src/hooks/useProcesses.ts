import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import api from "../utils/api";
import { showApiError } from "../utils/apiErrors";

export interface WorkflowProcessDto {
  id: number;
  processKey: string;
  name: string;
  description?: string;
  bpmnXml: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProcessPayload {
  processKey: string;
  name: string;
  description?: string;
  bpmnXml?: string;
}

export interface UpdateProcessPayload {
  name?: string;
  description?: string;
  bpmnXml?: string;
  isActive?: boolean;
}

const KEY = ["workflow-processes"];

export const useProcesses = (enabled = true) =>
  useQuery({
    queryKey: KEY,
    queryFn: async (): Promise<WorkflowProcessDto[]> => {
      const res = await api.get("/workflow-processes");
      return res.data;
    },
    enabled: enabled && !!localStorage.getItem("token"),
    staleTime: 60 * 1000,
  });

export const useCreateProcess = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateProcessPayload): Promise<WorkflowProcessDto> => {
      const res = await api.post("/workflow-processes", payload);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      notifications.show({ title: "Muvaffaqiyatli", message: "Jarayon yaratildi", color: "green" });
    },
    onError: (e: unknown) =>
      showApiError(e, "Xatolik", "Jarayon yaratilmadi (key band bo'lishi mumkin)"),
  });
};

export const useUpdateProcess = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateProcessPayload;
    }): Promise<WorkflowProcessDto> => {
      const res = await api.put(`/workflow-processes/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      notifications.show({ title: "Saqlandi", message: "Jarayon yangilandi", color: "green" });
    },
    onError: (e: unknown) => showApiError(e, "Xatolik", "Saqlanmadi"),
  });
};

export const useDeleteProcess = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/workflow-processes/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      notifications.show({ title: "O'chirildi", message: "Jarayon o'chirildi", color: "green" });
    },
    onError: (e: unknown) => showApiError(e, "Xatolik", "O'chirilmadi"),
  });
};

export interface GenerateFromPromptPayload {
  prompt: string;
  processKey?: string;
  name?: string;
}

export const useGenerateFromPrompt = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      payload: GenerateFromPromptPayload
    ): Promise<WorkflowProcessDto> => {
      const res = await api.post("/workflow-processes/from-prompt", payload);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      notifications.show({
        title: "Yaratildi",
        message: "Prompt'dan BPMN jarayon yaratildi",
        color: "green",
      });
    },
    onError: (e: unknown) =>
      showApiError(e, "Xatolik", "Prompt'dan yaratilmadi"),
  });
};
