import axios from "axios";
import { clearAuthData } from "./auth";

const API_BASE_URL = "http://localhost:8080/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  // Define public endpoints that don't need authentication
  const isPublicEndpoint =
    config.url?.includes("/translations") ||
    config.url?.includes("/files/public") ||
    config.url?.includes("/files/all") ||
    config.url?.includes("/files/search") ||
    config.url?.includes("/files/type") ||
    config.url?.includes("/files/recent");

  // If no token and trying to access protected endpoints, block the request
  if (
    !token &&
    (config.url?.includes("/auth/me") || config.url?.includes("/users"))
  ) {
    console.log(
      `🚫 Blocked API Call: ${config.method?.toUpperCase()} ${
        config.url
      } - No token`
    );
    return Promise.reject(new Error("No authentication token available"));
  }

  // Only add Authorization header for protected endpoints
  if (token && !isPublicEndpoint) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log(`🚀 API Call: ${config.method?.toUpperCase()} ${config.url}`, {
      hasToken: true,
      tokenLength: token.length,
      isProtected: true,
    });
  } else {
    console.log(`🚀 API Call: ${config.method?.toUpperCase()} ${config.url}`, {
      hasToken: !!token,
      isPublic: isPublicEndpoint,
    });
  }
  return config;
});

// Add response interceptor to handle 401 errors and redirect to auth
api.interceptors.response.use(
  (response) => {
    console.log(
      `✅ API Response: ${response.config.method?.toUpperCase()} ${
        response.config.url
      }`,
      {
        status: response.status,
        data: response.data,
      }
    );
    return response;
  },
  (error) => {
    console.log(
      `❌ API Error: ${error.config?.method?.toUpperCase()} ${
        error.config?.url
      }`,
      {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      }
    );

    if (error.response?.status === 401) {
      // Clear all auth data
      clearAuthData();

      // Dispatch custom event for authentication failure
      window.dispatchEvent(
        new CustomEvent("auth:unauthorized", {
          detail: { message: "Session expired. Please login again." },
        })
      );

      // Only redirect if we're not already on the auth page
      if (window.location.pathname !== "/") {
        // Use a small delay to ensure the event is processed
        setTimeout(() => {
          window.location.href = "/";
        }, 100);
      }
    }
    return Promise.reject(error);
  }
);

// API functions
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  register: async (
    name: string,
    email: string,
    password: string,
    phone: string
  ) => {
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
      phone,
    });
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },
};

export const usersAPI = {
  getUsers: async (page: number, size: number) => {
    const response = await api.get(`/users?page=${page}&size=${size}`);
    return response.data;
  },

  getUser: async (id: number) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  createUser: async (userData: any) => {
    const response = await api.post("/users", userData);
    return response.data;
  },

  updateUser: async (id: number, userData: any) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id: number) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

export default api;
