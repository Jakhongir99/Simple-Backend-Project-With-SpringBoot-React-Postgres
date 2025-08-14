import React from "react";
import {
  Group,
  Text,
  Stack,
  Button,
  AppShell,
  ScrollArea,
} from "@mantine/core";
import { IconUsers, IconHome, IconSettings } from "@tabler/icons-react";

interface NavbarProps {}

export const Navbar: React.FC<NavbarProps> = () => {
  return (
    <>
      <AppShell.Section bg="blue" c="white" p="md">
        <Group>
          <IconUsers size={24} />
          <Text fw={600} size="lg">
            Navigation
          </Text>
        </Group>
      </AppShell.Section>

      <AppShell.Section grow component={ScrollArea}>
        <Stack gap="xs" p="md">
          <Button
            variant="light"
            leftSection={<IconHome size={16} />}
            justify="flex-start"
            fullWidth
            size="md"
            color="blue"
          >
            Dashboard
          </Button>
          <Button
            variant="light"
            leftSection={<IconUsers size={16} />}
            justify="flex-start"
            fullWidth
            size="md"
            color="blue"
          >
            User Management
          </Button>
          <Button
            variant="light"
            leftSection={<IconSettings size={16} />}
            justify="flex-start"
            fullWidth
            size="md"
            color="blue"
          >
            Settings
          </Button>
        </Stack>
      </AppShell.Section>
    </>
  );
};
