import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Box, Paper, Title, Text, Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";

import { Layout } from "./components/Layout";
import { AuthView } from "./components/AuthView";
import { ProfileModal } from "./components/ProfileModal";
import { UserManagement } from "./components/UserManagement";

interface User {
  id?: number;
  name: string;
  email: string;
  password: string;
  phone?: string;
  createdAt?: string;
}

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User>({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
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
    theme: "light",
  });

  useEffect(() => {
    if (token) {
      loadUsers(1);
    }
  }, [token]);

  const showMessage = (
    message: string,
    type: "success" | "error" | "warning" | "info" = "info"
  ) => {
    notifications.show({
      title: type.charAt(0).toUpperCase() + type.slice(1),
      message,
      color:
        type === "success"
          ? "green"
          : type === "error"
          ? "red"
          : type === "warning"
          ? "yellow"
          : "blue",
    });
  };

  const handleAuthSuccess = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
    showMessage("Authentication successful!", "success");
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("token");
    setUsers([]);
    setCurrentUser({ name: "", email: "", password: "", phone: "" });
    setIsEditing(false);
    showMessage("Logged out successfully", "success");
  };

  const loadUsers = async (page: number) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8080/api/users?page=${page - 1}&size=${pageSize}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUsers(response.data.content || []);
      setTotalPages(response.data.totalPages || 1);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error loading users:", error);
      showMessage("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser.name || !currentUser.email || !currentUser.password) {
      showMessage("Please fill in all required fields", "error");
      return;
    }

    try {
      if (isEditing && currentUser.id) {
        await axios.put(
          `http://localhost:8080/api/users/${currentUser.id}`,
          currentUser,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        showMessage("User updated successfully!", "success");
      } else {
        await axios.post("http://localhost:8080/api/users", currentUser, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showMessage("User created successfully!", "success");
      }

      setCurrentUser({ name: "", email: "", password: "", phone: "" });
      setIsEditing(false);
      loadUsers(currentPage);
    } catch (error: any) {
      console.error("Error saving user:", error);
      showMessage(
        error.response?.data?.message || "Failed to save user",
        "error"
      );
    }
  };

  const editUser = async (id: number) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/users/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCurrentUser(response.data);
      setIsEditing(true);
    } catch (error) {
      console.error("Error loading user:", error);
      showMessage("Failed to load user details", "error");
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await axios.delete(`http://localhost:8080/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showMessage("User deleted successfully!", "success");
      loadUsers(currentPage);
    } catch (error: any) {
      console.error("Error deleting user:", error);
      showMessage(
        error.response?.data?.message || "Failed to delete user",
        "error"
      );
    }
  };

  if (!token) {
    return (
      <Box bg="blue" c="white" p="xl">
        <AuthView
          onSuccess={handleAuthSuccess}
          onError={(msg) => showMessage(msg, "error")}
        />
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
    >
      <UserManagement
        users={users}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        onSubmit={handleSubmit}
        onEdit={editUser}
        onDelete={deleteUser}
        onRefresh={() => loadUsers(currentPage)}
        onPageChange={loadUsers}
      />

      {/* Profile Modal */}
      <ProfileModal
        opened={profileModalOpened}
        onClose={() => setProfileModalOpened(false)}
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        onSave={() => {
          showMessage("Profile updated successfully!", "success");
          setProfileModalOpened(false);
        }}
      />
    </Layout>
  );
}

export default App;
