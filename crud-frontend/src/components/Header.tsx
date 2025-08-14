import React from "react";
import {
  Group,
  Title,
  Menu,
  Avatar,
  ActionIcon,
  Burger,
  Container,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconDashboard,
  IconBell,
  IconUser,
  IconSettings,
  IconLogout,
} from "@tabler/icons-react";

interface HeaderProps {
  opened: boolean;
  setOpened: (opened: boolean) => void;
  userProfile: {
    name: string;
    email: string;
  };
  onProfileClick: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  opened,
  setOpened,
  userProfile,
  onProfileClick,
  onLogout,
}) => {
  return (
    <Container size="xl" h="100%">
      <Group justify="space-between" h="100%" px="md">
        {/* Logo and Title Section */}
        <Group gap="md">
          <Group gap="xs">
            <IconDashboard size={36} color="white" />
            <Title order={2} c="white" fw={700}>
              CRUD Dashboard
            </Title>
          </Group>
        </Group>

        {/* Right Section - Notifications and User */}
        <Group gap="lg">
          {/* Notification Bell */}
          <ActionIcon
            variant="light"
            size="lg"
            radius="xl"
            color="white"
            style={{ border: "1px solid rgba(255, 255, 255, 0.3)" }}
          >
            <IconBell size={20} />
          </ActionIcon>

          {/* User Profile Menu */}
          <Menu shadow="xl" width={280} position="bottom-end" radius="md">
            <Menu.Target>
              <Group gap="xs" style={{ cursor: "pointer" }}>
                <Avatar
                  src={null}
                  color="white"
                  radius="xl"
                  size="md"
                  style={{
                    border: "2px solid rgba(255, 255, 255, 0.4)",
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                  }}
                >
                  {userProfile.name.charAt(0).toUpperCase()}
                </Avatar>
                <Stack gap={4} align="flex-start">
                  <Text size="sm" c="white" fw={600}>
                    {userProfile.name || "User"}
                  </Text>
                  <Text size="xs" c="white" opacity={0.8}>
                    {userProfile.email || "user@example.com"}
                  </Text>
                </Stack>
              </Group>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>
                <Group gap="xs">
                  <IconUser size={16} />
                  <Text size="sm" fw={600}>
                    User Profile
                  </Text>
                </Group>
              </Menu.Label>
              <Menu.Item
                leftSection={<IconUser size={16} />}
                onClick={onProfileClick}
              >
                Profile Settings
              </Menu.Item>
              <Menu.Item leftSection={<IconSettings size={16} />}>
                Account Settings
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                leftSection={<IconLogout size={16} />}
                color="red"
                onClick={onLogout}
              >
                Sign Out
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>

          {/* Mobile Menu Button */}
          <Burger
            opened={opened}
            onChange={() => setOpened(!opened)}
            hiddenFrom="sm"
            size="sm"
            color="white"
          />
        </Group>
      </Group>
    </Container>
  );
};
