import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  Text,
  Modal,
  TextInput,
  Textarea,
  Switch,
  Table,
  ActionIcon,
  Group,
  Stack,
  Title,
  Paper,
  Badge,
  Select,
  MultiSelect,
  Notification,
  Container,
  Grid,
  Flex,
  Divider,
} from "@mantine/core";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconSearch,
  IconUserCheck,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { useTranslations } from "../hooks/useTranslations";

interface Role {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userIds: number[];
  userCount: number;
}

interface CreateRoleRequest {
  name: string;
  description: string;
  isActive: boolean;
}

interface UpdateRoleRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
}

interface AssignRoleRequest {
  userId: number;
  roleIds: number[];
}

interface User {
  id: number;
  name: string;
  email: string;
}

const RoleManagement: React.FC = () => {
  const { token } = useAuth();
  const { t } = useTranslations();
  const queryClient = useQueryClient();

  const refreshCurrentUser = () => {
    // Role changes affect @PreAuthorize AND the hiring action buttons —
    // force /auth/me to reload so UI sees the new roles immediately.
    queryClient.invalidateQueries({ queryKey: ["currentUser"] });
  };
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  // Form states
  const [createForm, setCreateForm] = useState<CreateRoleRequest>({
    name: "",
    description: "",
    isActive: true,
  });

  const [editForm, setEditForm] = useState<UpdateRoleRequest>({});
  const [assignForm, setAssignForm] = useState<AssignRoleRequest>({
    userId: 0,
    roleIds: [],
  });

  // Manage user roles (give / take)
  const [openManageModal, setOpenManageModal] = useState(false);
  const [manageUserId, setManageUserId] = useState<number>(0);
  const [manageUserRoles, setManageUserRoles] = useState<Role[]>([]);
  const [addRoleIds, setAddRoleIds] = useState<number[]>([]);

  const API_BASE_URL = "http://localhost:8080/api";

  useEffect(() => {
    fetchRoles();
    fetchUsers();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/roles`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      } else {
        throw new Error("Failed to fetch roles");
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      showNotification("Error fetching roles", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.content || data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleCreateRole = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/roles`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createForm),
      });

      if (response.ok) {
        showNotification("Role created successfully", "success");
        setOpenCreateModal(false);
        setCreateForm({ name: "", description: "", isActive: true });
        fetchRoles();
      } else {
        throw new Error("Failed to create role");
      }
    } catch (error) {
      console.error("Error creating role:", error);
      showNotification("Error creating role", "error");
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedRole) return;

    try {
      const response = await fetch(`${API_BASE_URL}/roles/${selectedRole.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        showNotification("Role updated successfully", "success");
        setOpenEditModal(false);
        setSelectedRole(null);
        setEditForm({});
        fetchRoles();
      } else {
        throw new Error("Failed to update role");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      showNotification("Error updating role", "error");
    }
  };

  const handleDeleteRole = async (roleId: number) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/roles/${roleId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        showNotification("Role deleted successfully", "success");
        fetchRoles();
      } else {
        throw new Error("Failed to delete role");
      }
    } catch (error) {
      console.error("Error deleting role:", error);
      showNotification("Error deleting role", "error");
    }
  };

  const handleAssignRoles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/roles/assign`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(assignForm),
      });

      if (response.ok) {
        showNotification("Roles assigned successfully", "success");
        setOpenAssignModal(false);
        setAssignForm({ userId: 0, roleIds: [] });
        fetchRoles();
        refreshCurrentUser();
      } else {
        throw new Error("Failed to assign roles");
      }
    } catch (error) {
      console.error("Error assigning roles:", error);
      showNotification("Error assigning roles", "error");
    }
  };

  const handleEditClick = (role: Role) => {
    setSelectedRole(role);
    setEditForm({
      name: role.name,
      description: role.description,
      isActive: role.isActive,
    });
    setOpenEditModal(true);
  };

  const handleAssignClick = () => {
    setOpenAssignModal(true);
  };

  const fetchUserRoles = async (userId: number) => {
    if (!userId) {
      setManageUserRoles([]);
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/roles/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setManageUserRoles(data);
      }
    } catch (error) {
      console.error("Error fetching user roles:", error);
    }
  };

  const handleSelectManageUser = (userId: number) => {
    setManageUserId(userId);
    setAddRoleIds([]);
    fetchUserRoles(userId);
  };

  const handleGiveRoles = async () => {
    if (!manageUserId || addRoleIds.length === 0) return;
    try {
      const response = await fetch(`${API_BASE_URL}/roles/assign`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: manageUserId, roleIds: addRoleIds }),
      });
      if (response.ok) {
        showNotification("Rol berildi", "success");
        setAddRoleIds([]);
        fetchUserRoles(manageUserId);
        fetchRoles();
        queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      } else {
        throw new Error("Failed to give roles");
      }
    } catch (error) {
      console.error("Error giving roles:", error);
      showNotification("Rol berishda xatolik", "error");
    }
  };

  const handleTakeRole = async (roleId: number) => {
    if (!manageUserId) return;
    try {
      const response = await fetch(`${API_BASE_URL}/roles/user/${manageUserId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([roleId]),
      });
      if (response.ok) {
        showNotification("Rol olib tashlandi", "success");
        fetchUserRoles(manageUserId);
        fetchRoles();
        queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      } else {
        throw new Error("Failed to take role");
      }
    } catch (error) {
      console.error("Error taking role:", error);
      showNotification("Rol olishda xatolik", "error");
    }
  };

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "success" }),
      5000
    );
  };

  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tableRows = filteredRoles.map((role) => (
    <Table.Tr key={role.id}>
      <Table.Td>
        <Text fw={500}>{role.name}</Text>
      </Table.Td>
      <Table.Td>{role.description}</Table.Td>
      <Table.Td>
        <Badge color={role.isActive ? "green" : "gray"}>
          {role.isActive ? "Active" : "Inactive"}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Badge variant="outline">{role.userCount} users</Badge>
      </Table.Td>
      <Table.Td>{new Date(role.createdAt).toLocaleDateString()}</Table.Td>
      <Table.Td>
        <Group gap="xs">
          <ActionIcon
            variant="subtle"
            color="blue"
            onClick={() => handleEditClick(role)}
            title="Edit Role"
          >
            <IconEdit size={16} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="red"
            onClick={() => handleDeleteRole(role.id)}
            title="Delete Role"
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Container size="xl" py="md">
      <Title order={2} mb="lg">
        Role Management
      </Title>

      {/* Search and Actions Bar */}
      <Paper p="md" mb="lg" withBorder>
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftSection={<IconSearch size={16} />}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Flex gap="sm" justify="flex-end">
              <Button
                variant="filled"
                color="grape"
                leftSection={<IconUserCheck size={16} />}
                onClick={() => {
                  setManageUserId(0);
                  setManageUserRoles([]);
                  setAddRoleIds([]);
                  setOpenManageModal(true);
                }}
              >
                Rol berish / olish
              </Button>
              <Button
                variant="outline"
                leftSection={<IconUserCheck size={16} />}
                onClick={handleAssignClick}
              >
                Assign Roles
              </Button>
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => setOpenCreateModal(true)}
              >
                Create Role
              </Button>
            </Flex>
          </Grid.Col>
        </Grid>
      </Paper>

      {/* Roles Table */}
      <Card withBorder>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Description</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Users</Table.Th>
              <Table.Th>Created</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{tableRows}</Table.Tbody>
        </Table>
      </Card>

      {/* Create Role Modal */}
      <Modal
        opened={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        title="Create New Role"
        size="md"
        centered
      >
        <Stack>
          <TextInput
            label="Role Name"
            placeholder="Enter role name"
            value={createForm.name}
            onChange={(e) =>
              setCreateForm({ ...createForm, name: e.target.value })
            }
            required
          />
          <Textarea
            label="Description"
            placeholder="Enter role description"
            value={createForm.description}
            onChange={(e) =>
              setCreateForm({ ...createForm, description: e.target.value })
            }
            rows={3}
          />
          <Switch
            label="Active"
            checked={createForm.isActive}
            onChange={(e) =>
              setCreateForm({ ...createForm, isActive: e.target.checked })
            }
          />
          <Group justify="flex-end">
            <Button variant="outline" onClick={() => setOpenCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRole}>Create</Button>
          </Group>
        </Stack>
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        opened={openEditModal}
        onClose={() => setOpenEditModal(false)}
        title="Edit Role"
        size="md"
        centered
      >
        <Stack>
          <TextInput
            label="Role Name"
            placeholder="Enter role name"
            value={editForm.name || ""}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          />
          <Textarea
            label="Description"
            placeholder="Enter role description"
            value={editForm.description || ""}
            onChange={(e) =>
              setEditForm({ ...editForm, description: e.target.value })
            }
            rows={3}
          />
          <Switch
            label="Active"
            checked={editForm.isActive ?? true}
            onChange={(e) =>
              setEditForm({ ...editForm, isActive: e.target.checked })
            }
          />
          <Group justify="flex-end">
            <Button variant="outline" onClick={() => setOpenEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRole}>Update</Button>
          </Group>
        </Stack>
      </Modal>

      {/* Assign Roles Modal */}
      <Modal
        opened={openAssignModal}
        onClose={() => setOpenAssignModal(false)}
        title="Assign Roles to User"
        size="md"
        centered
      >
        <Stack>
          <Select
            label="Select User"
            placeholder="Choose a user"
            data={users.map((user) => ({
              value: user.id.toString(),
              label: `${user.name} (${user.email})`,
            }))}
            value={assignForm.userId.toString()}
            onChange={(value) =>
              setAssignForm({ ...assignForm, userId: parseInt(value || "0") })
            }
            comboboxProps={{ withinPortal: true, zIndex: 11000 }}
          />
          <MultiSelect
            label="Select Roles"
            placeholder="Choose roles to assign"
            data={roles
              .filter((role) => role.isActive)
              .map((role) => ({ value: role.id.toString(), label: role.name }))}
            value={assignForm.roleIds.map((id) => id.toString())}
            onChange={(values) =>
              setAssignForm({
                ...assignForm,
                roleIds: values.map((v) => parseInt(v)),
              })
            }
            comboboxProps={{ withinPortal: true, zIndex: 11000 }}
          />
          <Group justify="flex-end">
            <Button variant="outline" onClick={() => setOpenAssignModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAssignRoles}
              disabled={!assignForm.userId || assignForm.roleIds.length === 0}
            >
              Assign
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Manage User Roles Modal (give / take) */}
      <Modal
        opened={openManageModal}
        onClose={() => setOpenManageModal(false)}
        title="Foydalanuvchi rollarini boshqarish"
        size="lg"
        centered
      >
        <Stack>
          <Select
            label="Foydalanuvchi"
            placeholder="Foydalanuvchini tanlang"
            searchable
            data={users.map((user) => ({
              value: user.id.toString(),
              label: `${user.name} (${user.email})`,
            }))}
            value={manageUserId ? manageUserId.toString() : null}
            onChange={(value) => handleSelectManageUser(parseInt(value || "0"))}
            comboboxProps={{ withinPortal: true, zIndex: 11000 }}
          />

          {manageUserId > 0 && (
            <>
              <div>
                <Text size="sm" fw={500} mb={4}>
                  Hozirgi rollar
                </Text>
                {manageUserRoles.length === 0 ? (
                  <Text size="sm" c="dimmed">
                    Rol berilmagan.
                  </Text>
                ) : (
                  <Group gap="xs">
                    {manageUserRoles.map((role) => (
                      <Badge
                        key={role.id}
                        size="lg"
                        variant="filled"
                        color="grape"
                        rightSection={
                          <ActionIcon
                            size="xs"
                            color="white"
                            variant="transparent"
                            onClick={() => handleTakeRole(role.id)}
                            title="Rolni olib tashlash"
                          >
                            <IconX size={12} />
                          </ActionIcon>
                        }
                      >
                        {role.name}
                      </Badge>
                    ))}
                  </Group>
                )}
              </div>

              <Divider />

              <MultiSelect
                label="Rol berish"
                placeholder="Qo'shiladigan rollarni tanlang"
                data={roles
                  .filter(
                    (role) =>
                      role.isActive &&
                      !manageUserRoles.some((ur) => ur.id === role.id)
                  )
                  .map((role) => ({
                    value: role.id.toString(),
                    label: role.name,
                  }))}
                value={addRoleIds.map((id) => id.toString())}
                onChange={(values) =>
                  setAddRoleIds(values.map((v) => parseInt(v)))
                }
                comboboxProps={{ withinPortal: true, zIndex: 11000 }}
              />
              <Group justify="flex-end">
                <Button
                  onClick={handleGiveRoles}
                  disabled={addRoleIds.length === 0}
                >
                  Rol berish
                </Button>
              </Group>

              <Text size="xs" c="dimmed">
                Eslatma: rol o'zgarishi keyingi so'rovda darhol kuchga kiradi
                (qayta login shart emas).
              </Text>
            </>
          )}
        </Stack>
      </Modal>

      {/* Notification */}
      {notification.show && (
        <Notification
          icon={
            notification.type === "success" ? (
              <IconCheck size={18} />
            ) : (
              <IconX size={18} />
            )
          }
          color={notification.type === "success" ? "green" : "red"}
          title={notification.type === "success" ? "Success" : "Error"}
          onClose={() => setNotification({ ...notification, show: false })}
          style={{ position: "fixed", top: 20, right: 20, zIndex: 1000 }}
        >
          {notification.message}
        </Notification>
      )}
    </Container>
  );
};

export default RoleManagement;
