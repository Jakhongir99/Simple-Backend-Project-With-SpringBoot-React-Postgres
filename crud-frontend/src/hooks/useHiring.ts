import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import api from "../utils/api";
import { showApiError } from "../utils/apiErrors";
import type { HiringStatus } from "../components/hiringBpmn";

export interface HiringRequestDto {
  id: number;
  candidateName: string;
  candidateEmail: string;
  position: string;
  department?: string;
  status: HiringStatus;
  submittedBy?: string;
  hrComment?: string;
  hrDecidedBy?: string;
  hrDecidedAt?: string;
  directorComment?: string;
  directorDecidedBy?: string;
  directorDecidedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHiringPayload {
  candidateName: string;
  candidateEmail: string;
  position: string;
  department?: string;
}

export type HiringAction =
  | "hr/approve"
  | "hr/reject"
  | "director/approve"
  | "director/reject";

const QUERY_KEY = ["hiring-requests"];

export const useHiringRequests = (enabled = true) =>
  useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<HiringRequestDto[]> => {
      const res = await api.get("/hiring");
      return res.data;
    },
    enabled: enabled && !!localStorage.getItem("token"),
    staleTime: 60 * 1000,
  });

export const useSubmitHiring = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateHiringPayload): Promise<HiringRequestDto> => {
      const res = await api.post("/hiring", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      notifications.show({
        title: "Muvaffaqiyatli",
        message: "Ariza yuborildi",
        color: "green",
      });
    },
    onError: (error: unknown) => {
      showApiError(error, "Xatolik", "Ariza yuborilmadi");
    },
  });
};

export const useHiringDecision = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      action,
      comment,
    }: {
      id: number;
      action: HiringAction;
      comment?: string;
    }): Promise<HiringRequestDto> => {
      const res = await api.post(`/hiring/${id}/${action}`, { comment });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      notifications.show({
        title: "Muvaffaqiyatli",
        message: "Qaror saqlandi",
        color: "green",
      });
    },
    onError: (error: unknown) => {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status === 403) {
        notifications.show({
          title: "Xatolik",
          message: "Sizda bu amal uchun ruxsat yo'q",
          color: "red",
        });
        return;
      }
      showApiError(error, "Xatolik", "Amal bajarilmadi");
    },
  });
};
