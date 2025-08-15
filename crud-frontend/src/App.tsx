import React, { useState, useEffect } from "react";
import { Box, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";

import { Layout } from "./components/Layout";
import { AuthView } from "./components/AuthView";
import { ProfileModal } from "./components/ProfileModal";
import { UserManagement } from "./components/UserManagement";
import { Dashboard } from "./components/Dashboard";
import DepartmentManagement from "./components/DepartmentManagement";
import JobManagement from "./components/JobManagement";
import EmployeeManagement from "./components/EmployeeManagement";

import TranslationManagement from "./components/TranslationManagement";
import {
  useCurrentUser,
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useLogout,
} from "./hooks";
import { checkAuthStatus } from "./utils/auth";
import { useTheme } from "./contexts/ThemeContext";

interface User {
  id?: number;
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

function App() {
  const [currentUser, setCurrentUser] = useState<User>({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [currentView, setCurrentView] = useState<string>("dashboard");
  const pageSize = 5;
  const [token, setToken] = useState<string | null>(
    typeof window !== "undefined" ? localStorage.getItem("token") : null
  );

  // New state for enhanced UI
  const [opened, setOpened] = useState(false);
  const [profileModalOpened, setProfileModalOpened] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    role: "User",
    notifications: true,
  });

  // Theme context
  const { theme } = useTheme();

  // React Query hooks
  const { data: currentUserData } = useCurrentUser(token);
  const { data: usersData, isLoading: usersLoading } = useUsers(
    currentPage - 1,
    pageSize,
    !!token // Enable as soon as we have a token
  );
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const logoutMutation = useLogout();

  useEffect(() => {
    if (
      token &&
      currentUserData &&
      typeof currentUserData === "object" &&
      currentUserData !== null
    ) {
      const userData = currentUserData as any;
      // Update user profile when current user data changes
      setUserProfile({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        bio: "",
        role: userData.role || "User",
        notifications: true,
      });
    }
  }, [token, currentUserData]);

  // Debug: Log users data
  useEffect(() => {
    console.log("Users data:", usersData);
    console.log("Users loading:", usersLoading);
    console.log("Token:", token);
    console.log("Current user data:", currentUserData);
  }, [usersData, usersLoading, token, currentUserData]);

  // Listen for authentication events
  useEffect(() => {
    const handleAuthUnauthorized = (_event: CustomEvent) => {
      // Clear token and redirect to auth
      setToken(null);
      localStorage.removeItem("token");
      setCurrentUser({ name: "", email: "", password: "", phone: "" });
      setUserProfile({
        name: "",
        email: "",
        phone: "",
        bio: "",
        role: "User",
        notifications: true,
      });

      // Show notification
      notifications.show({
        title: "Session Expired",
        message: "Please login again",
        color: "yellow",
      });
    };

    window.addEventListener(
      "auth:unauthorized",
      handleAuthUnauthorized as EventListener
    );

    return () => {
      window.removeEventListener(
        "auth:unauthorized",
        handleAuthUnauthorized as EventListener
      );
    };
  }, []);

  // Periodic token validation check
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      if (!checkAuthStatus()) {
        // Token is expired, trigger unauthorized event
        window.dispatchEvent(
          new CustomEvent("auth:unauthorized", {
            detail: { message: "Token expired. Please login again." },
          })
        );
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [token]);

  const handleAuthSuccess = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
  };

  const logout = () => {
    logoutMutation.mutate();
    setToken(null);
    localStorage.removeItem("token");
    setCurrentUser({ name: "", email: "", password: "", phone: "" });
    setIsEditing(false);
  };

  const handleNavigate = (view: string) => {
    setCurrentView(view);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser.name || !currentUser.email || !currentUser.password) {
      return;
    }

    if (isEditing && currentUser.id) {
      updateUserMutation.mutate({
        id: currentUser.id,
        userData: {
          name: currentUser.name,
          email: currentUser.email,
          phone: currentUser.phone,
        },
      });
    } else {
      createUserMutation.mutate({
        name: currentUser.name,
        email: currentUser.email,
        password: currentUser.password,
        phone: currentUser.phone || "",
      });
    }

    setCurrentUser({ name: "", email: "", password: "", phone: "" });
    setIsEditing(false);
  };

  const editUser = (_id: number) => {
    // This will be handled by the UserManagement component
    // We just need to set the editing state
    setIsEditing(true);
  };

  const deleteUser = (id: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      deleteUserMutation.mutate(id);
    }
  };

  if (!token) {
    return (
      <Box bg="blue" c="white" p="xl">
        <AuthView onSuccess={handleAuthSuccess} onError={(_msg) => {}} />
      </Box>
    );
  }

  // Show loading state while fetching user data
  if (!currentUserData) {
    return (
      <Box p="xl" ta="center">
        <Text size="lg" c="dimmed">
          Loading user data...
        </Text>
      </Box>
    );
  }

  return (
    <Layout
      opened={opened}
      setOpened={setOpened}
      userProfile={userProfile}
      onProfileClick={() => setProfileModalOpened(true)}
      onLogout={logout}
      onNavigate={handleNavigate}
      currentPage={currentView}
    >
      {token && ( // Only render components when there's a token
        <>
          {currentView === "dashboard" && <Dashboard />}
          {currentView === "users" && (
            <UserManagement
              users={usersData?.content || []}
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              loading={usersLoading}
              currentPage={currentPage}
              totalPages={usersData?.totalPages || 1}
              onSubmit={handleSubmit}
              onEdit={editUser}
              onDelete={deleteUser}
              onRefresh={() => {}}
              onPageChange={(page) => setCurrentPage(page)}
            />
          )}
          {currentView === "departments" && <DepartmentManagement />}
          {currentView === "jobs" && <JobManagement />}
          {currentView === "employees" && <EmployeeManagement />}

          {currentView === "translations" && <TranslationManagement />}
        </>
      )}

      {/* Profile Modal */}
      <ProfileModal
        opened={profileModalOpened}
        onClose={() => setProfileModalOpened(false)}
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        onSave={() => {
          setProfileModalOpened(false);
        }}
        onRefresh={() => {}}
      />
    </Layout>
  );
}

export default App;
