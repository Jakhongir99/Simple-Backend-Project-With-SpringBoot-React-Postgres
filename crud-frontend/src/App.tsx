import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Grid,
  Card,
  TextInput,
  PasswordInput,
  Button,
  Table,
  Alert,
  Loader,
  Badge,
  Group,
  Title,
  Text,
  Stack,
  Paper,
  Divider,
  Tabs,
} from "@mantine/core";
import {
  IconUserPlus,
  IconUsers,
  IconRefresh,
  IconPlus,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";
import QRCode from "react-qr-code";
import "./App.css";

interface User {
  id?: number;
  name: string;
  email: string;
  password: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

const API_ROOT = "http://localhost:8080/api";
const USERS_URL = `${API_ROOT}/users`;
const AUTH_URL = `${API_ROOT}/auth`;

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
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "danger";
  } | null>(null);
  const [token, setToken] = useState<string | null>(
    typeof window !== "undefined" ? localStorage.getItem("token") : null
  );
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);
  const [twoFA, setTwoFA] = useState<{
    enabled: boolean;
    otpauth?: string;
    secret?: string;
  } | null>(null);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      loadUsers();
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("token", token);
    } else {
      delete axios.defaults.headers.common["Authorization"];
      localStorage.removeItem("token");
    }
  }, [token]);

  const extractErrorMessage = (error: any, defaultPrefix?: string) => {
    const data = error?.response?.data;
    if (!data)
      return defaultPrefix
        ? `${defaultPrefix}: Request failed`
        : "Request failed";
    if (typeof data === "string")
      return defaultPrefix ? `${defaultPrefix}: ${data}` : data;
    const parts: string[] = [];
    if (data.message) parts.push(data.message);
    if (Array.isArray(data.fieldErrors) && data.fieldErrors.length > 0) {
      parts.push(
        data.fieldErrors.map((f: any) => `${f.field}: ${f.message}`).join(" | ")
      );
    } else if (data.error) {
      parts.push(data.error);
    }
    const msg = parts.filter(Boolean).join(" | ") || "Request failed";
    return defaultPrefix ? `${defaultPrefix}: ${msg}` : msg;
  };

  const showMessage = (text: string, type: "success" | "danger") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(USERS_URL);
      setUsers(response.data);
    } catch (error: any) {
      showMessage(extractErrorMessage(error, "Error loading users"), "danger");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing && currentUser.id) {
        await axios.put(`${USERS_URL}/${currentUser.id}`, currentUser);
        showMessage("User updated successfully", "success");
      } else {
        await axios.post(USERS_URL, currentUser);
        showMessage("User created successfully", "success");
      }

      clearForm();
      loadUsers();
    } catch (error: any) {
      showMessage(extractErrorMessage(error, "Error saving user"), "danger");
    }
  };

  const editUser = async (id: number) => {
    try {
      const response = await axios.get(`${USERS_URL}/${id}`);
      setCurrentUser(response.data);
      setIsEditing(true);
      showMessage("User loaded for editing", "success");
    } catch (error: any) {
      showMessage(extractErrorMessage(error, "Error loading user"), "danger");
    }
  };

  const deleteUser = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      await axios.delete(`${USERS_URL}/${id}`);
      showMessage("User deleted successfully", "success");
      loadUsers();
    } catch (error: any) {
      showMessage(extractErrorMessage(error, "Error deleting user"), "danger");
    }
  };

  const clearForm = () => {
    setCurrentUser({
      name: "",
      email: "",
      password: "",
      phone: "",
    });
    setIsEditing(false);
  };

  const addSampleData = async () => {
    const sampleUsers = [
      {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        phone: "123-456-7890",
      },
      {
        name: "Jane Smith",
        email: "jane@example.com",
        password: "password456",
        phone: "098-765-4321",
      },
      {
        name: "Bob Johnson",
        email: "bob@example.com",
        password: "password789",
        phone: "555-123-4567",
      },
    ];

    let successCount = 0;
    let errorCount = 0;

    for (const userData of sampleUsers) {
      try {
        await axios.post(USERS_URL, userData);
        successCount++;
      } catch (error: any) {
        errorCount++;
        console.error("Error adding sample user:", error);
        showMessage(
          extractErrorMessage(error, "Error adding sample user"),
          "danger"
        );
      }
    }

    if (successCount > 0) {
      showMessage(`${successCount} sample users added successfully`, "success");
    }
    if (errorCount > 0) {
      showMessage(`${errorCount} sample users failed to add`, "danger");
    }
    loadUsers();
  };

  const handleAuthSuccess = (jwt: string) => {
    setToken(jwt);
    showMessage("Authenticated successfully", "success");
    try {
      const payload = JSON.parse(atob(jwt.split(".")[1] || "") || "{}");
      if (payload?.sub) setCurrentEmail(payload.sub as string);
    } catch {}
  };

  const logout = () => {
    setToken(null);
    setUsers([]);
    setIsEditing(false);
    clearForm();
    showMessage("Logged out", "success");
  };

  const AuthView: React.FC<{
    onSuccess: (token: string) => void;
    onError: (msg: string) => void;
  }> = ({ onSuccess, onError }) => {
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [loginCode, setLoginCode] = useState("");
    const [regName, setRegName] = useState("");
    const [regEmail, setRegEmail] = useState("");
    const [regPassword, setRegPassword] = useState("");
    const [regPhone, setRegPhone] = useState("");

    const doLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const body: any = { email: loginEmail, password: loginPassword };
        if (loginCode.trim()) body.code = loginCode.trim();
        const res = await axios.post(`${AUTH_URL}/login`, body);
        onSuccess(res.data.token);
      } catch (error: any) {
        onError(extractErrorMessage(error, "Login failed"));
      }
    };

    const doRegister = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const res = await axios.post(`${AUTH_URL}/register`, {
          name: regName,
          email: regEmail,
          password: regPassword,
          phone: regPhone,
        });
        onSuccess(res.data.token);
      } catch (error: any) {
        onError(extractErrorMessage(error, "Registration failed"));
      }
    };

    return (
      <Card radius="md" shadow="sm" withBorder>
        <Card.Section inheritPadding py="sm">
          <Title order={4}>Authentication</Title>
        </Card.Section>
        <Divider my="xs" />
        <Card.Section inheritPadding py="md">
          <Tabs defaultValue="login">
            <Tabs.List>
              <Tabs.Tab value="login">Login</Tabs.Tab>
              <Tabs.Tab value="register">Register</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="login" pt="md">
              <form onSubmit={doLogin}>
                <Stack gap="md">
                  <TextInput
                    label="Email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                  <PasswordInput
                    label="Password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                  <TextInput
                    label="2FA code (if enabled)"
                    placeholder="123456"
                    value={loginCode}
                    onChange={(e) => setLoginCode(e.target.value)}
                  />
                  <Button type="submit">Login</Button>
                </Stack>
              </form>
            </Tabs.Panel>
            <Tabs.Panel value="register" pt="md">
              <form onSubmit={doRegister}>
                <Stack gap="md">
                  <TextInput
                    label="Name"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                  />
                  <TextInput
                    label="Email"
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                  />
                  <PasswordInput
                    label="Password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                  />
                  <TextInput
                    label="Phone"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                  />
                  <Button type="submit">Create account</Button>
                </Stack>
              </form>
            </Tabs.Panel>
          </Tabs>
        </Card.Section>
      </Card>
    );
  };

  if (!token) {
    return (
      <div className="app">
        <div className="main-container">
          <Paper withBorder radius="lg" p="xl" className="header">
            <Stack gap={4} align="center">
              <Title order={2}>Welcome</Title>
              <Text c="dimmed">Please login or create an account</Text>
            </Stack>
          </Paper>
          <div className="content">
            {message && (
              <Alert
                color={message.type === "success" ? "green" : "red"}
                withCloseButton
                onClose={() => setMessage(null)}
              >
                {message.text}
              </Alert>
            )}
            <AuthView
              onSuccess={handleAuthSuccess}
              onError={(msg) => showMessage(msg, "danger")}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="main-container">
        <Paper withBorder radius="lg" p="xl" className="header">
          <Stack gap={4} align="center">
            <Title order={2}>PostgreSQL CRUD Application (React)</Title>
            <Text c="dimmed">
              Modern React Interface for Database Operations
            </Text>
          </Stack>
          <Group justify="flex-end" mt="md">
            <Button variant="light" color="red" onClick={logout}>
              Logout
            </Button>
          </Group>
        </Paper>

        <div className="content">
          {message && (
            <Alert
              color={message.type === "success" ? "green" : "red"}
              withCloseButton
              onClose={() => setMessage(null)}
            >
              {message.text}
            </Alert>
          )}

          <Grid gutter="lg" mt="md">
            <Grid.Col span={{ base: 12, lg: 4 }}>
              <Card radius="md" shadow="sm" withBorder>
                <Card.Section inheritPadding py="sm">
                  <Group justify="space-between">
                    <Group gap="xs">
                      <IconUserPlus size={18} />
                      <Text fw={600}>{isEditing ? "Edit" : "Add"} User</Text>
                    </Group>
                  </Group>
                </Card.Section>
                <Divider my="xs" />
                <Card.Section inheritPadding py="md">
                  <form onSubmit={handleSubmit}>
                    <Stack gap="md">
                      <TextInput
                        label="Name"
                        value={currentUser.name}
                        onChange={(e) =>
                          setCurrentUser({
                            ...currentUser,
                            name: e.target.value,
                          })
                        }
                        required
                      />
                      <TextInput
                        label="Email"
                        type="email"
                        value={currentUser.email}
                        onChange={(e) =>
                          setCurrentUser({
                            ...currentUser,
                            email: e.target.value,
                          })
                        }
                        required
                      />
                      <PasswordInput
                        label="Password"
                        value={currentUser.password}
                        onChange={(e) =>
                          setCurrentUser({
                            ...currentUser,
                            password: e.target.value,
                          })
                        }
                        required
                      />
                      <TextInput
                        label="Phone"
                        value={currentUser.phone || ""}
                        onChange={(e) =>
                          setCurrentUser({
                            ...currentUser,
                            phone: e.target.value,
                          })
                        }
                      />
                      <Group justify="stretch">
                        <Button
                          type="submit"
                          color="green"
                          fullWidth
                          leftSection={<IconUserPlus size={16} />}
                        >
                          {isEditing ? "Update" : "Save"} User
                        </Button>
                        <Button
                          type="button"
                          variant="light"
                          onClick={clearForm}
                          fullWidth
                        >
                          Clear
                        </Button>
                      </Group>
                    </Stack>
                  </form>
                </Card.Section>
              </Card>
              <Card radius="md" shadow="sm" withBorder mt="md">
                <Card.Section inheritPadding py="sm">
                  <Group justify="space-between">
                    <Text fw={600}>Two-Factor Authentication</Text>
                  </Group>
                </Card.Section>
                <Divider my="xs" />
                <Card.Section inheritPadding py="md">
                  <Stack gap="sm">
                    {!twoFA?.enabled ? (
                      <>
                        <Text c="dimmed" size="sm">
                          Enable 2FA to secure your account. Use Google
                          Authenticator or Authy.
                        </Text>
                        <Button
                          onClick={async () => {
                            try {
                              if (!currentEmail) return;
                              const res = await axios.post(
                                `${AUTH_URL}/2fa/enable`,
                                { email: currentEmail }
                              );
                              setTwoFA({
                                enabled: true,
                                otpauth: res.data.otpauth,
                                secret: res.data.secret,
                              });
                              showMessage(
                                "2FA enabled. Scan the QR code.",
                                "success"
                              );
                            } catch (e: any) {
                              showMessage(
                                extractErrorMessage(e, "Failed to enable 2FA"),
                                "danger"
                              );
                            }
                          }}
                        >
                          Enable 2FA
                        </Button>
                        {twoFA?.otpauth && (
                          <Stack align="center" gap={6}>
                            <QRCode value={twoFA.otpauth} size={160} />
                            <Text size="xs" c="dimmed">
                              Secret: {twoFA.secret}
                            </Text>
                          </Stack>
                        )}
                      </>
                    ) : (
                      <Button
                        color="red"
                        variant="light"
                        onClick={async () => {
                          try {
                            if (!currentEmail) return;
                            await axios.post(`${AUTH_URL}/2fa/disable`, {
                              email: currentEmail,
                            });
                            setTwoFA({ enabled: false });
                            showMessage("2FA disabled", "success");
                          } catch (e: any) {
                            showMessage(
                              extractErrorMessage(e, "Failed to disable 2FA"),
                              "danger"
                            );
                          }
                        }}
                      >
                        Disable 2FA
                      </Button>
                    )}
                  </Stack>
                </Card.Section>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, lg: 8 }}>
              <Card radius="md" shadow="sm" withBorder>
                <Card.Section inheritPadding py="sm">
                  <Group justify="space-between">
                    <Group gap="xs">
                      <IconUsers size={18} />
                      <Text fw={600}>Users Database</Text>
                    </Group>
                    <Group gap="xs">
                      <Button
                        variant="light"
                        onClick={loadUsers}
                        leftSection={<IconRefresh size={16} />}
                      >
                        Refresh
                      </Button>
                      <Button
                        color="yellow"
                        variant="light"
                        onClick={addSampleData}
                        leftSection={<IconPlus size={16} />}
                      >
                        Add Sample Data
                      </Button>
                    </Group>
                  </Group>
                </Card.Section>
                <Divider my="xs" />
                <Card.Section inheritPadding py="md">
                  {loading ? (
                    <Stack align="center" gap={6} py="lg">
                      <Loader color="indigo" />
                      <Text c="dimmed">Loading users...</Text>
                    </Stack>
                  ) : (
                    <Table striped withRowBorders={false} highlightOnHover>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>ID</Table.Th>
                          <Table.Th>Name</Table.Th>
                          <Table.Th>Email</Table.Th>
                          <Table.Th>Phone</Table.Th>
                          <Table.Th>Created</Table.Th>
                          <Table.Th>Actions</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {users.length === 0 ? (
                          <Table.Tr>
                            <Table.Td colSpan={6}>
                              <Text c="dimmed" ta="center">
                                No users found
                              </Text>
                            </Table.Td>
                          </Table.Tr>
                        ) : (
                          users.map((user) => (
                            <Table.Tr key={user.id}>
                              <Table.Td>
                                <Badge color="indigo">{user.id}</Badge>
                              </Table.Td>
                              <Table.Td>
                                <Text fw={600}>{user.name}</Text>
                              </Table.Td>
                              <Table.Td>{user.email}</Table.Td>
                              <Table.Td>
                                {user.phone || <Text c="dimmed">-</Text>}
                              </Table.Td>
                              <Table.Td>
                                <Text size="sm" c="dimmed">
                                  {user.createdAt
                                    ? new Date(user.createdAt).toLocaleString()
                                    : "-"}
                                </Text>
                              </Table.Td>
                              <Table.Td>
                                <Group gap="xs">
                                  <Button
                                    size="xs"
                                    color="yellow"
                                    variant="light"
                                    onClick={() => editUser(user.id!)}
                                    leftSection={<IconEdit size={14} />}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    size="xs"
                                    color="red"
                                    variant="light"
                                    onClick={() => deleteUser(user.id!)}
                                    leftSection={<IconTrash size={14} />}
                                  >
                                    Delete
                                  </Button>
                                </Group>
                              </Table.Td>
                            </Table.Tr>
                          ))
                        )}
                      </Table.Tbody>
                    </Table>
                  )}
                </Card.Section>
              </Card>
            </Grid.Col>
          </Grid>
        </div>
      </div>
    </div>
  );
}

export default App;
