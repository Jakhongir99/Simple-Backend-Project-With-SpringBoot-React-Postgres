import React, { useState } from "react";
import {
  Paper,
  SegmentedControl,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Container,
  Group,
  ActionIcon,
  Text,
} from "@mantine/core";
import {
  IconUserPlus,
  IconLock,
  IconMail,
  IconUser,
  IconPhone,
  IconBrandGoogle,
  IconBrandGithub,
  IconSun,
  IconMoon,
} from "@tabler/icons-react";
import { useLogin, useRegister } from "../hooks";
import { useTheme } from "../contexts/ThemeContext";

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

  const { theme, toggleTheme, isDark, isLight } = useTheme();

  // React Query hooks
  const loginMutation = useLogin();
  const registerMutation = useRegister();

  // OAuth2 handlers
  const handleGoogleLogin = async () => {
    try {
      const response = await fetch("/api/auth/oauth2/google/authorize");
      const data = await response.json();
      window.location.href = data.authorizationUrl;
    } catch (error) {
      console.error("Error getting Google authorization URL:", error);
      onError("Failed to initiate Google login");
    }
  };

  const handleGitHubLogin = async () => {
    try {
      const response = await fetch("/api/auth/oauth2/github/authorize");
      const data = await response.json();
      window.location.href = data.authorizationUrl;
    } catch (error) {
      console.error("Error getting GitHub authorization URL:", error);
      onError("Failed to initiate GitHub login");
    }
  };

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

  const getThemeStyles = () => ({
    container: {
      height: "100%",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      backgroundColor: `var(--bg-primary)`,
      transition: "background-color 0.3s ease",
      padding: "20px",
    },
    welcomeCard: {
      width: "100%",
      maxWidth: "500px",
      border: `2px solid var(--border-color)`,
      backgroundColor: `var(--bg-card)`,
      boxShadow: `var(--shadow-lg)`,
      transition: "all 0.3s ease",
      backdropFilter: "blur(10px)",
    },
    authFormCard: {
      width: "100%",
      maxWidth: "500px",
      border: `2px solid var(--border-color)`,
      backgroundColor: `var(--bg-card)`,
      boxShadow: `var(--shadow-xl)`,
      transition: "all 0.3s ease",
      backdropFilter: "blur(10px)",
    },
    title: {
      fontSize: "2rem",
      fontWeight: 700,
      color: `var(--text-primary)`,
      margin: 0,
      textAlign: "center" as const,
      transition: "color 0.3s ease",
      textShadow: `0 2px 4px var(--shadow)`,
    },
    subtitle: {
      fontSize: "1.1rem",
      color: `var(--text-secondary)`,
      margin: 0,
      textAlign: "center" as const,
      transition: "color 0.3s ease",
      textShadow: `0 1px 2px var(--shadow)`,
    },
    divider: {
      width: "100%",
      height: "2px",
      backgroundColor: `var(--border-color)`,
      margin: "16px 0",
      borderRadius: "1px",
      boxShadow: `0 1px 2px var(--shadow)`,
      transition: "background-color 0.3s ease",
    },
    oauthText: {
      color: `var(--text-secondary)`,
      margin: "0 0 16px 0",
      fontSize: "14px",
      transition: "color 0.3s ease",
      textShadow: `0 1px 1px var(--shadow)`,
    },
  });

  const styles = getThemeStyles();

  return (
    <Container size="sm" style={styles.container}>
      {/* Theme Switcher - Top Right */}
      <ActionIcon
        onClick={toggleTheme}
        variant="outline"
        size="lg"
        radius="xl"
        aria-label="Toggle theme"
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          borderColor: `var(--border-color)`,
          color: `var(--text-primary)`,
          backgroundColor: `var(--bg-secondary)`,
          boxShadow: `0 2px 6px var(--shadow)`,
          transition: "all 0.3s ease",
          zIndex: 1000,
          "&:hover": {
            backgroundColor: `var(--bg-tertiary)`,
            transform: "scale(1.1)",
            boxShadow: `0 4px 12px var(--shadow-lg)`,
          },
        }}
      >
        {isDark ? <IconSun size={20} /> : <IconMoon size={20} />}
      </ActionIcon>

      <Stack gap="xl" align="center">
        {/* Welcome Card */}
        <Paper
          withBorder
          radius="xl"
          p="xl"
          shadow="lg"
          style={{
            backgroundColor: `var(--bg-navbar)`,
            border: `2px solid var(--border-color)`,
            boxShadow: `var(--shadow-lg)`,
            transition: "all 0.3s ease",
            backdropFilter: "blur(10px)",
          }}
        >
          <Stack gap="md" align="center">
            <h1 style={styles.title}>Welcome Back! 👋</h1>
            <p style={styles.subtitle}>
              Please sign in to your account or create a new one
            </p>
            {/* Theme Indicator */}
            <Group gap="xs" style={{ marginTop: "8px" }}>
              <Text size="sm" style={{ color: `var(--text-secondary)` }}>
                Current Theme:
              </Text>
              <Text
                size="sm"
                fw={600}
                style={{
                  color: `var(--accent-color)`,
                  backgroundColor: `var(--bg-tertiary)`,
                  padding: "4px 12px",
                  borderRadius: "16px",
                  border: `1px solid var(--border-color)`,
                }}
              >
                {isDark ? "🌙 Dark Mode" : "☀️ Light Mode"}
              </Text>
            </Group>
          </Stack>
        </Paper>

        {/* Auth Form Card */}
        <Paper
          withBorder
          radius="xl"
          p="xl"
          shadow="xl"
          style={{
            backgroundColor: `var(--bg-navbar)`,
            border: `2px solid var(--border-color)`,
            boxShadow: `var(--shadow-xl)`,
            transition: "all 0.3s ease",
            backdropFilter: "blur(10px)",
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
              radius="xl"
              styles={{
                root: {
                  backgroundColor: "transparent",
                  border: "none",
                  padding: "4px",
                },
                control: {
                  color: `var(--text-secondary)`,
                  fontWeight: 600,
                  fontSize: "16px",
                  transition: "all 0.3s ease",
                  "&[dataActive]": {
                    backgroundColor: "rgba(100, 108, 255, 0.3)",
                    color: `var(--text-primary)`,
                    boxShadow: "0 2px 8px rgba(100, 108, 255, 0.3)",
                    transform: "scale(1.02)",
                  },
                  "&:hover": {
                    backgroundColor: `var(--bg-tertiary)`,
                    transform: "scale(1.01)",
                  },
                },
              }}
            />

            {/* OAuth2 Login Buttons */}
            <Stack gap="md" align="center">
              <div style={{ textAlign: "center", width: "100%" }}>
                <p style={styles.oauthText}>Or continue with</p>
                <Stack gap="sm" style={{ width: "100%" }}>
                  <Button
                    variant="outline"
                    fullWidth
                    size="md"
                    radius="xl"
                    leftSection={<IconBrandGoogle size={20} />}
                    onClick={handleGoogleLogin}
                    styles={{
                      root: {
                        borderColor: "#4285f4",
                        color: "#4285f4",
                        backgroundColor: `var(--bg-secondary)`,
                        boxShadow: `0 2px 4px var(--shadow)`,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          backgroundColor: "#4285f4",
                          color: "white",
                          transform: "translateY(-2px)",
                          boxShadow: `0 4px 12px var(--shadow-lg)`,
                        },
                      },
                    }}
                  >
                    Continue with Google
                  </Button>
                  <Button
                    variant="outline"
                    fullWidth
                    size="md"
                    radius="xl"
                    leftSection={<IconBrandGithub size={20} />}
                    onClick={handleGitHubLogin}
                    styles={{
                      root: {
                        borderColor: "#333",
                        color: "#333",
                        backgroundColor: `var(--bg-secondary)`,
                        boxShadow: `0 2px 4px var(--shadow)`,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          backgroundColor: "#333",
                          color: "white",
                          transform: "translateY(-2px)",
                          boxShadow: `0 4px 12px var(--shadow-lg)`,
                        },
                      },
                    }}
                  >
                    Continue with GitHub
                  </Button>
                </Stack>
              </div>
              <div style={styles.divider} />
            </Stack>

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
                    leftSection={<IconMail size={20} />}
                    placeholder="Enter your email address"
                    size="lg"
                    radius="xl"
                    styles={{
                      label: {
                        fontWeight: 600,
                        color: `var(--text-primary)`,
                        fontSize: "16px",
                        transition: "color 0.3s ease",
                        textShadow: `0 1px 1px var(--shadow)`,
                      },
                      input: {
                        backgroundColor: `var(--bg-secondary)`,
                        color: `var(--text-primary)`,
                        borderColor: `var(--border-color)`,
                        boxShadow: `0 1px 3px var(--shadow)`,
                        transition: "all 0.3s ease",
                        "&:focus": {
                          borderColor: `var(--accent-color)`,
                          boxShadow: `0 0 0 3px var(--accent-light), 0 2px 6px var(--shadow)`,
                          transform: "translateY(-1px)",
                        },
                      },
                    }}
                  />
                  <PasswordInput
                    label="Password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    leftSection={<IconLock size={20} />}
                    placeholder="Enter your password"
                    size="lg"
                    radius="xl"
                    styles={{
                      label: {
                        fontWeight: 600,
                        color: `var(--text-primary)`,
                        fontSize: "16px",
                        transition: "color 0.3s ease",
                        textShadow: `0 1px 1px var(--shadow)`,
                      },
                      input: {
                        backgroundColor: `var(--bg-secondary)`,
                        color: `var(--text-primary)`,
                        borderColor: `var(--border-color)`,
                        boxShadow: `0 1px 3px var(--shadow)`,
                        transition: "all 0.3s ease",
                        "&:focus": {
                          borderColor: `var(--accent-color)`,
                          boxShadow: `0 0 0 3px var(--accent-light), 0 2px 6px var(--shadow)`,
                          transform: "translateY(-1px)",
                        },
                      },
                    }}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    radius="xl"
                    leftSection={<IconLock size={20} />}
                    fw={700}
                    loading={loginMutation.isPending}
                    h={56}
                    styles={{
                      root: {
                        backgroundColor: `var(--accent-color)`,
                        color: "white",
                        boxShadow: `0 4px 12px var(--shadow-lg)`,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          backgroundColor: `var(--accent-hover)`,
                          transform: "translateY(-2px)",
                          boxShadow: "0 8px 25px rgba(100, 108, 255, 0.4)",
                        },
                        "&:active": {
                          transform: "translateY(0px)",
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
                    leftSection={<IconUser size={20} />}
                    placeholder="Enter your full name"
                    size="lg"
                    radius="xl"
                    styles={{
                      label: {
                        fontWeight: 600,
                        color: `var(--text-primary)`,
                        fontSize: "16px",
                        transition: "color 0.3s ease",
                        textShadow: `0 1px 1px var(--shadow)`,
                      },
                      input: {
                        backgroundColor: `var(--bg-secondary)`,
                        color: `var(--text-primary)`,
                        borderColor: `var(--border-color)`,
                        boxShadow: `0 1px 3px var(--shadow)`,
                        transition: "all 0.3s ease",
                        "&:focus": {
                          borderColor: `var(--accent-color)`,
                          boxShadow: `0 0 0 3px var(--accent-light), 0 2px 6px var(--shadow)`,
                          transform: "translateY(-1px)",
                        },
                      },
                    }}
                  />
                  <TextInput
                    label="Email Address"
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                    leftSection={<IconMail size={20} />}
                    placeholder="Enter your email address"
                    size="lg"
                    radius="xl"
                    styles={{
                      label: {
                        fontWeight: 600,
                        color: `var(--text-primary)`,
                        fontSize: "16px",
                        transition: "color 0.3s ease",
                        textShadow: `0 1px 1px var(--shadow)`,
                      },
                      input: {
                        backgroundColor: `var(--bg-secondary)`,
                        color: `var(--text-primary)`,
                        borderColor: `var(--border-color)`,
                        boxShadow: `0 1px 3px var(--shadow)`,
                        transition: "all 0.3s ease",
                        "&:focus": {
                          borderColor: `var(--accent-color)`,
                          boxShadow: `0 0 0 3px var(--accent-light), 0 2px 6px var(--shadow)`,
                          transform: "translateY(-1px)",
                        },
                      },
                    }}
                  />
                  <PasswordInput
                    label="Password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                    leftSection={<IconLock size={20} />}
                    placeholder="Create a strong password"
                    size="lg"
                    radius="xl"
                    styles={{
                      label: {
                        fontWeight: 600,
                        color: `var(--text-primary)`,
                        fontSize: "16px",
                        transition: "color 0.3s ease",
                        textShadow: `0 1px 1px var(--shadow)`,
                      },
                      input: {
                        backgroundColor: `var(--bg-secondary)`,
                        color: `var(--text-primary)`,
                        borderColor: `var(--border-color)`,
                        boxShadow: `0 1px 3px var(--shadow)`,
                        transition: "all 0.3s ease",
                        "&:focus": {
                          borderColor: `var(--accent-color)`,
                          boxShadow: `0 0 0 3px var(--accent-light), 0 2px 6px var(--shadow)`,
                          transform: "translateY(-1px)",
                        },
                      },
                    }}
                  />
                  <TextInput
                    label="Phone Number"
                    value={registerPhone}
                    onChange={(e) => setRegisterPhone(e.target.value)}
                    leftSection={<IconPhone size={20} />}
                    placeholder="Enter your phone number"
                    size="lg"
                    radius="xl"
                    styles={{
                      label: {
                        fontWeight: 600,
                        color: `var(--text-primary)`,
                        fontSize: "16px",
                        transition: "color 0.3s ease",
                        textShadow: `0 1px 1px var(--shadow)`,
                      },
                      input: {
                        backgroundColor: `var(--bg-secondary)`,
                        color: `var(--text-primary)`,
                        borderColor: `var(--border-color)`,
                        boxShadow: `0 1px 3px var(--shadow)`,
                        transition: "all 0.3s ease",
                        "&:focus": {
                          borderColor: `var(--accent-color)`,
                          boxShadow: `0 0 0 3px var(--accent-light), 0 2px 6px var(--shadow)`,
                          transform: "translateY(-1px)",
                        },
                      },
                    }}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    radius="xl"
                    leftSection={<IconUserPlus size={20} />}
                    fw={700}
                    loading={registerMutation.isPending}
                    h={56}
                    styles={{
                      root: {
                        backgroundColor: "#28a745",
                        color: "white",
                        boxShadow: `0 4px 12px var(--shadow-lg)`,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          backgroundColor: "#1e7e34",
                          transform: "translateY(-2px)",
                          boxShadow: "0 8px 25px rgba(40, 167, 69, 0.4)",
                        },
                        "&:active": {
                          transform: "translateY(0px)",
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
