import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersAPI } from "../utils/api";
import { notifications } from "@mantine/notifications";

export interface UserData {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  phone?: string;
}

export interface UsersResponse {
  content: UserData[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// User management hooks
export const useUsers = (
  page: number = 0,
  size: number = 10,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["users", page, size],
    queryFn: () => usersAPI.getUsers(page, size),
    enabled: enabled, // Only run query when enabled
    staleTime: 2 * 60 * 1000, // 2 minutes
    // keepPreviousData: true, // Keep previous data while fetching new data
  });
};

export const useUser = (id: number) => {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => usersAPI.getUser(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: CreateUserData) => usersAPI.createUser(userData),
    onSuccess: () => {
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: ["users"] });

      notifications.show({
        title: "Success",
        message: "User created successfully!",
        color: "green",
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "Failed to create user",
        color: "red",
      });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userData }: { id: number; userData: UpdateUserData }) =>
      usersAPI.updateUser(id, userData),
    onSuccess: (_, variables) => {
      // Invalidate users list and specific user
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", variables.id] });

      // Update current user if it's the same user
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });

      notifications.show({
        title: "Success",
        message: "User updated successfully!",
        color: "green",
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "Failed to update user",
        color: "red",
      });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => usersAPI.deleteUser(id),
    onSuccess: (_, variables) => {
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: ["users"] });

      // Remove specific user from cache
      queryClient.removeQueries({ queryKey: ["user", variables] });

      notifications.show({
        title: "Success",
        message: "User deleted successfully!",
        color: "green",
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "Failed to delete user",
        color: "red",
      });
    },
  });
};
