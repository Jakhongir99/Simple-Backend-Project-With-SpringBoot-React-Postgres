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
