import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../utils/api";

export interface NotificationDto {
  id: number;
  recipientEmail: string;
  title: string;
  message: string;
  read: boolean;
  type?: string;
  referenceId?: number;
  createdAt: string;
}

interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

export const useNotifications = (page = 0, size = 10, enabled = true) =>
  useQuery({
    queryKey: ["notifications", page, size],
    queryFn: async (): Promise<PageResponse<NotificationDto>> => {
      const res = await api.get("/notifications", { params: { page, size } });
      return res.data;
    },
    enabled: enabled && !!localStorage.getItem("token"),
    staleTime: 30 * 1000,
  });

export const useUnreadNotificationCount = (enabled = true) =>
  useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async (): Promise<number> => {
      const res = await api.get("/notifications/unread-count");
      return res.data.count ?? 0;
    },
    enabled: enabled && !!localStorage.getItem("token"),
    refetchInterval: 60 * 1000,
  });

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.patch(`/notifications/${id}/read`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
