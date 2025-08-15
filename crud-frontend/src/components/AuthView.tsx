import React, { useState } from "react";
import {
  Paper,
  SegmentedControl,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Container,
} from "@mantine/core";
import {
  IconUserPlus,
  IconLock,
  IconMail,
  IconUser,
  IconPhone,
} from "@tabler/icons-react";
import { useLogin, useRegister } from "../hooks";

interface AuthViewProps {
  onSuccess: (token: string) => void;
  onError: (message: string) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess, onError }) => {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");

  // React Query hooks
  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const doLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(
      { email: loginEmail, password: loginPassword },
      {
        onSuccess: (data) => {
          onSuccess(data.token);
        },
        onError: (error: any) => {
          onError(error.response?.data?.message || "Login failed");
        },
      }
    );
  };

  const doRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(
      {
        name: registerName,
        email: registerEmail,
        password: registerPassword,
        phone: registerPhone,
      },
      {
        onSuccess: (data) => {
          onSuccess(data.token);
        },
        onError: (error: any) => {
          onError(error.response?.data?.message || "Registration failed");
        },
      }
    );
  };

  return (
    <Container
      size="sm"
      style={{
        height: "100%",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <Stack gap="xl" align="center">
        {/* Welcome Card */}
        <Paper
          withBorder
          radius="xl"
          p="xl"
          shadow="lg"
          bg="#f1f3f5"
          style={{
            width: "100%",
            maxWidth: "500px",
            border: "2px solid #e1e8ed",
          }}
        >
          <Stack gap="md" align="center">
            <h1
              style={{
                fontSize: "2rem",
                fontWeight: 700,
                color: "#2c3e50",
                margin: 0,
                textAlign: "center",
              }}
            >
              Welcome Back! 👋
            </h1>
            <p
              style={{
                fontSize: "1.1rem",
                color: "#6c757d",
                margin: 0,
                textAlign: "center",
              }}
            >
              Please sign in to your account or create a new one
            </p>
          </Stack>
        </Paper>

        {/* Auth Form Card */}
        <Paper
          withBorder
          radius="xl"
          p="xl"
          shadow="xl"
          bg="#f1f3f5"
          style={{
            width: "100%",
            maxWidth: "500px",
            border: "1px solid #e1e8ed",
          }}
        >
          <Stack gap="md">
            {/* Segmented Control */}
            <SegmentedControl
              value={activeTab}
              onChange={setActiveTab}
              data={[
                { label: "Sign In", value: "login" },
                { label: "Sign Up", value: "register" },
              ]}
              size="lg"
              radius="md"
              styles={{
                root: {
                  backgroundColor: "transparent",
                  border: "none",
                  padding: "4px",
                },
                control: {
                  color: "#6c757d",
                  fontWeight: 600,
                  fontSize: "16px",
                  "&[dataActive]": {
                    backgroundColor: "rgba(0, 123, 255, 0.3)",
                    color: "black",
                    boxShadow: "0 2px 8px rgba(0, 123, 255, 0.3)",
                  },
                  "&:hover": {
                    backgroundColor: "#e9ecef",
                  },
                },
              }}
            />

            {/* Login Form */}
            {activeTab === "login" && (
              <form onSubmit={doLogin}>
                <Stack gap="md">
                  <TextInput
                    label="Email Address"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    leftSection={<IconMail size={20} color="#6c757d" />}
                    placeholder="Enter your email address"
                    size="lg"
                    radius="md"
                    styles={{
                      label: {
                        fontWeight: 600,
                        color: "#2c3e50",
                        fontSize: "16px",
                      },
                    }}
                  />
                  <PasswordInput
                    label="Password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    leftSection={<IconLock size={20} color="#6c757d" />}
                    placeholder="Enter your password"
                    size="lg"
                    radius="md"
                    styles={{
                      label: {
                        fontWeight: 600,
                        color: "#2c3e50",
                        fontSize: "16px",
                      },
                    }}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    leftSection={<IconLock size={20} />}
                    radius="md"
                    fw={700}
                    loading={loginMutation.isPending}
                    bg="#007bff"
                    c="white"
                    h={56}
                    styles={{
                      root: {
                        transition: "all 0.3s ease",
                        "&:hover": {
                          backgroundColor: "#0056b3",
                          transform: "translateY(-2px)",
                          boxShadow: "0 8px 25px rgba(0, 123, 255, 0.3)",
                        },
                      },
                    }}
                  >
                    Sign In
                  </Button>
                </Stack>
              </form>
            )}

            {/* Register Form */}
            {activeTab === "register" && (
              <form onSubmit={doRegister}>
                <Stack gap="md">
                  <TextInput
                    label="Full Name"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    required
                    leftSection={<IconUser size={20} color="#6c757d" />}
                    placeholder="Enter your full name"
                    size="lg"
                    radius="md"
                    styles={{
                      label: {
                        fontWeight: 600,
                        color: "#2c3e50",
                        fontSize: "16px",
                      },
                    }}
                  />
                  <TextInput
                    label="Email Address"
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                    leftSection={<IconMail size={20} color="#6c757d" />}
                    placeholder="Enter your email address"
                    size="lg"
                    radius="md"
                    styles={{
                      label: {
                        fontWeight: 600,
                        color: "#2c3e50",
                        fontSize: "16px",
                      },
                    }}
                  />
                  <PasswordInput
                    label="Password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                    leftSection={<IconLock size={20} color="#6c757d" />}
                    placeholder="Create a strong password"
                    size="lg"
                    radius="md"
                    styles={{
                      label: {
                        fontWeight: 600,
                        color: "#2c3e50",
                        fontSize: "16px",
                      },
                    }}
                  />
                  <TextInput
                    label="Phone Number"
                    value={registerPhone}
                    onChange={(e) => setRegisterPhone(e.target.value)}
                    leftSection={<IconPhone size={20} color="#6c757d" />}
                    placeholder="Enter your phone number"
                    size="lg"
                    radius="md"
                    styles={{
                      label: {
                        fontWeight: 600,
                        color: "#2c3e50",
                        fontSize: "16px",
                      },
                    }}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    leftSection={<IconUserPlus size={20} />}
                    radius="md"
                    fw={700}
                    loading={registerMutation.isPending}
                    bg="#28a745"
                    c="white"
                    h={56}
                    styles={{
                      root: {
                        transition: "all 0.3s ease",
                        "&:hover": {
                          backgroundColor: "#1e7e34",
                          transform: "translateY(-2px)",
                          boxShadow: "0 8px 25px rgba(40, 167, 69, 0.3)",
                        },
                      },
                    }}
                  >
                    Create Account
                  </Button>
                </Stack>
              </form>
            )}
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
};
