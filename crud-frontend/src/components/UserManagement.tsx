import React from "react";
import {
  Grid,
  Card,
  TextInput,
  PasswordInput,
  Button,
  Table,
  Loader,
  Badge,
  Group,
  Title,
  Text,
  Stack,
  Divider,
  Pagination,
} from "@mantine/core";
import {
  IconUserPlus,
  IconRefresh,
  IconPlus,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";

interface User {
  id?: number;
  name: string;
  email: string;
  password: string;
  phone?: string;
  createdAt?: string;
}

interface UserManagementProps {
  users: User[];
  currentUser: User;
  setCurrentUser: (user: User) => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  loading: boolean;
  currentPage: number;
  totalPages: number;
  onSubmit: (e: React.FormEvent) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onRefresh: () => void;
  onPageChange: (page: number) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  users,
  currentUser,
  setCurrentUser,
  isEditing,
  setIsEditing,
  loading,
  currentPage,
  totalPages,
  onSubmit,
  onEdit,
  onDelete,
  onRefresh,
  onPageChange,
}) => {
  return (
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
            <form onSubmit={onSubmit}>
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
                <Group gap="xs">
                  <Button
                    type="submit"
                    leftSection={<IconPlus size={16} />}
                    fullWidth
                  >
                    {isEditing ? "Update" : "Add"} User
                  </Button>
                  {isEditing && (
                    <Button
                      variant="light"
                      onClick={() => setIsEditing(false)}
                      fullWidth
                    >
                      Cancel
                    </Button>
                  )}
                </Group>
              </Stack>
            </form>
          </Card.Section>
        </Card>
      </Grid.Col>

      <Grid.Col span={{ base: 12, lg: 8 }}>
        <Card radius="md" shadow="sm" withBorder>
          <Card.Section inheritPadding py="sm">
            <Group justify="space-between">
              <Title order={4}>Users List</Title>
              <Button
                variant="light"
                leftSection={<IconRefresh size={16} />}
                onClick={onRefresh}
              >
                Refresh
              </Button>
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
              <>
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
                                onClick={() => onEdit(user.id!)}
                                leftSection={<IconEdit size={14} />}
                              >
                                Edit
                              </Button>
                              <Button
                                size="xs"
                                color="red"
                                variant="light"
                                onClick={() => onDelete(user.id!)}
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
                {totalPages > 1 && (
                  <Group justify="center" mt="md">
                    <Pagination
                      total={totalPages}
                      value={currentPage}
                      onChange={onPageChange}
                    />
                  </Group>
                )}
              </>
            )}
          </Card.Section>
        </Card>
      </Grid.Col>
    </Grid>
  );
};
