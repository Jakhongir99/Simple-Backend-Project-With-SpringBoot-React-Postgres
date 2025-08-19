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

  const { data: currentUser } = useCurrentUser(
    token && token.length > 0 ? token : null
  );
  const queryClient = useQueryClient();

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
    console.log("🔐 useAuth: Login function called", {
      hasToken: !!newToken,
      tokenLength: newToken?.length,
    });

    localStorage.setItem("token", newToken);
    setToken(newToken);

    console.log("🔐 useAuth: Token state updated", {
      localStorageToken: localStorage.getItem("token"),
      stateToken: newToken,
    });

    // Trigger a storage event to sync across tabs
    window.dispatchEvent(
      new StorageEvent("storage", { key: "token", newValue: newToken })
    );
  };

  const logout = () => {
    console.log("🔐 useAuth: Logout initiated");

    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    setToken(null);

    // Clear all queries when logging out
    queryClient.clear();
    queryClient.resetQueries();
    queryClient.removeQueries();

    console.log("🔐 useAuth: Logout completed, reloading page");

    // Force a page reload to clear all state
    window.location.reload();
  };

  return {
    token,
    user: currentUser,
    isAuthenticated: !!token && token.length > 0,
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

      // Clear all queries and reset cache
      queryClient.clear();
      queryClient.resetQueries();
      queryClient.removeQueries();

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
  console.log("🔐 useCurrentUser: Hook called", {
    hasToken: !!token,
    tokenLength: token?.length,
    enabled: !!token,
  });

  return useQuery({
    queryKey: ["currentUser"],
    queryFn: authAPI.getCurrentUser,
    enabled: !!token && token.length > 0, // Only enable if token exists and is not empty
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
