import React, { useState, useEffect } from "react";
import { Box } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import { Layout } from "./components/Layout";
import { AuthView } from "./components/AuthView";
import { UserManagement } from "./components/UserManagement";
import { Dashboard } from "./components/Dashboard";
import DepartmentManagement from "./components/DepartmentManagement";
import JobManagement from "./components/JobManagement";
import EmployeeManagement from "./components/EmployeeManagement";

import TranslationManagement from "./components/TranslationManagement";
import FileManagement from "./components/FileManagement";
import { ThemeDemo } from "./components/ThemeDemo";
import OAuthCallback from "./components/OAuthCallback";
import {
  useAuth,
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useLogout,
} from "./hooks";
import { useQueryClient } from "@tanstack/react-query";
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
  const navigate = useNavigate();
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

  // Authentication hook
  const {
    token,
    user: currentUserData,
    isAuthenticated,
    login,
    logout: authLogout,
  } = useAuth();

  // React Query hooks
  const { data: usersData, isLoading: usersLoading } = useUsers(
    currentPage - 1,
    pageSize,
    isAuthenticated // Enable as soon as we have a token
  );
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const logoutMutation = useLogout();
  const queryClient = useQueryClient();
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

  // Listen for authentication events
  useEffect(() => {
    const handleAuthUnauthorized = (_event: CustomEvent) => {
      // Clear token and redirect to auth
      authLogout();
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
    if (!isAuthenticated) return;

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
  }, [isAuthenticated]);

  const handleAuthSuccess = (newToken: string) => {
    // Call the login function from useAuth hook
    login(newToken);
  };

  const logout = () => {
    console.log("🔐 App: Logout initiated");

    // Clear all queries and cache immediately
    queryClient.clear();
    queryClient.resetQueries();
    queryClient.removeQueries();

    // Clear local state
    setCurrentUser({ name: "", email: "", password: "", phone: "" });
    setIsEditing(false);

    // Clear authentication state
    authLogout();

    console.log("🔐 App: Logout completed, redirecting to /auth");

    // Force redirect to auth page and prevent back navigation
    window.location.replace("/auth");
  };

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    // Navigate to the actual route
    navigate(`/${view}`);
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

  return (
    <Routes>
      {/* OAuth2 Callback Route - Always accessible */}
      <Route path="/oauth-callback" element={<OAuthCallback />} />

      {/* Auth Route - When not authenticated */}
      {!isAuthenticated ? (
        <Route
          path="/auth"
          element={
            <AuthView onSuccess={handleAuthSuccess} onError={(_msg) => {}} />
          }
        />
      ) : (
        /* Protected Routes - When authenticated */
        <>
          <Route
            path="/dashboard"
            element={
              <Layout
                opened={opened}
                setOpened={setOpened}
                userProfile={userProfile}
                onProfileClick={() => setProfileModalOpened(true)}
                onLogout={logout}
                onNavigate={handleNavigate}
                currentPage="dashboard"
                profileModalOpened={profileModalOpened}
                setProfileModalOpened={setProfileModalOpened}
                setUserProfile={setUserProfile}
              >
                <Dashboard />
              </Layout>
            }
          />

          <Route
            path="/users"
            element={
              <Layout
                opened={opened}
                setOpened={setOpened}
                userProfile={userProfile}
                onProfileClick={() => setProfileModalOpened(true)}
                onLogout={logout}
                onNavigate={handleNavigate}
                currentPage="users"
                profileModalOpened={profileModalOpened}
                setProfileModalOpened={setProfileModalOpened}
                setUserProfile={setUserProfile}
              >
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
              </Layout>
            }
          />

          <Route
            path="/departments"
            element={
              <Layout
                opened={opened}
                setOpened={setOpened}
                userProfile={userProfile}
                onProfileClick={() => setProfileModalOpened(true)}
                onLogout={logout}
                onNavigate={handleNavigate}
                currentPage="departments"
                profileModalOpened={profileModalOpened}
                setProfileModalOpened={setProfileModalOpened}
                setUserProfile={setUserProfile}
              >
                <DepartmentManagement />
              </Layout>
            }
          />

          <Route
            path="/jobs"
            element={
              <Layout
                opened={opened}
                setOpened={setOpened}
                userProfile={userProfile}
                onProfileClick={() => setProfileModalOpened(true)}
                onLogout={logout}
                onNavigate={handleNavigate}
                currentPage="jobs"
                profileModalOpened={profileModalOpened}
                setProfileModalOpened={setProfileModalOpened}
                setUserProfile={setUserProfile}
              >
                <JobManagement />
              </Layout>
            }
          />

          <Route
            path="/employees"
            element={
              <Layout
                opened={opened}
                setOpened={setOpened}
                userProfile={userProfile}
                onProfileClick={() => setProfileModalOpened(true)}
                onLogout={logout}
                onNavigate={handleNavigate}
                currentPage="employees"
                profileModalOpened={profileModalOpened}
                setProfileModalOpened={setProfileModalOpened}
                setUserProfile={setUserProfile}
              >
                <EmployeeManagement />
              </Layout>
            }
          />

          <Route
            path="/translations"
            element={
              <Layout
                opened={opened}
                setOpened={setOpened}
                userProfile={userProfile}
                onProfileClick={() => setProfileModalOpened(true)}
                onLogout={logout}
                onNavigate={handleNavigate}
                currentPage="translations"
                profileModalOpened={profileModalOpened}
                setProfileModalOpened={setProfileModalOpened}
                setUserProfile={setUserProfile}
              >
                <TranslationManagement />
              </Layout>
            }
          />

          <Route
            path="/files"
            element={
              <Layout
                opened={opened}
                setOpened={setOpened}
                userProfile={userProfile}
                onProfileClick={() => setProfileModalOpened(true)}
                onLogout={logout}
                onNavigate={handleNavigate}
                currentPage="files"
                profileModalOpened={profileModalOpened}
                setProfileModalOpened={setProfileModalOpened}
                setUserProfile={setUserProfile}
              >
                <FileManagement />
              </Layout>
            }
          />

          <Route
            path="/theme-demo"
            element={
              <Layout
                opened={opened}
                setOpened={setOpened}
                userProfile={userProfile}
                onProfileClick={() => setProfileModalOpened(true)}
                onLogout={logout}
                onNavigate={handleNavigate}
                currentPage="theme-demo"
                profileModalOpened={profileModalOpened}
                setProfileModalOpened={setProfileModalOpened}
                setUserProfile={setUserProfile}
              >
                <ThemeDemo />
              </Layout>
            }
          />

          {/* Default redirect for authenticated users */}
          <Route
            path="*"
            element={
              isAuthenticated && token && token.length > 0 ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />
        </>
      )}

      {/* Default redirect for unauthenticated users */}
      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
}

export default App;
