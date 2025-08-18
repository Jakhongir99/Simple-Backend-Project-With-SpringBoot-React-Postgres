import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authAPI } from "../utils/api";
import { notifications } from "@mantine/notifications";
import { useState, useEffect } from "react";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

// Authentication context hook
export const useAuth = () => {
  const [token, setToken] = useState<string | null>(
    typeof window !== "undefined" ? localStorage.getItem("token") : null
  );

  const { data: currentUser } = useCurrentUser(token);

  useEffect(() => {
    // Listen for storage changes (e.g., when token is set/removed in another tab)
    const handleStorageChange = () => {
      const newToken = localStorage.getItem("token");
      setToken(newToken);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return {
    token,
    user: currentUser,
    isAuthenticated: !!token,
    login,
    logout,
  };
};

// Authentication hooks
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      authAPI.login(credentials.email, credentials.password),
    onSuccess: (data) => {
      // Store token
      localStorage.setItem("token", data.token);

      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });

      notifications.show({
        title: "Success",
        message: "Login successful!",
        color: "green",
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "Login failed",
        color: "red",
      });
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterData) =>
      authAPI.register(data.name, data.email, data.password, data.phone),
    onSuccess: (data) => {
      // Store token
      localStorage.setItem("token", data.token);

      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });

      notifications.show({
        title: "Success",
        message: "Registration successful!",
        color: "green",
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "Registration failed",
        color: "red",
      });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authAPI.logout,
    onSuccess: () => {
      // Remove token
      localStorage.removeItem("token");

      // Clear all queries
      queryClient.clear();

      notifications.show({
        title: "Success",
        message: "Logged out successfully",
        color: "blue",
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: "Error",
        message: error.response?.data?.message || "Logout failed",
        color: "red",
      });
    },
  });
};

export const useCurrentUser = (token: string | null) => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: authAPI.getCurrentUser,
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 401/403 errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
  });
};
