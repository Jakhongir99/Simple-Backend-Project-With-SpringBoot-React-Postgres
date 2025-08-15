import React from "react";
import {
  Group,
  Text,
  Stack,
  Button,
  AppShell,
  ScrollArea,
} from "@mantine/core";
import {
  IconUsers,
  IconHome,
  IconSettings,
  IconLanguage,
  IconBuilding,
  IconBriefcase,
  IconUserCheck,
} from "@tabler/icons-react";

interface NavbarProps {
  onNavigate?: (page: string) => void;
  currentPage?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigate,
  currentPage = "dashboard",
}) => {
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
            variant={currentPage === "dashboard" ? "filled" : "light"}
            leftSection={<IconHome size={16} />}
            justify="flex-start"
            fullWidth
            size="md"
            color="blue"
            onClick={() => onNavigate?.("dashboard")}
          >
            Dashboard
          </Button>
          <Button
            variant={currentPage === "users" ? "filled" : "light"}
            leftSection={<IconUsers size={16} />}
            justify="flex-start"
            fullWidth
            size="md"
            color="blue"
            onClick={() => onNavigate?.("users")}
          >
            User Management
          </Button>
          <Button
            variant={currentPage === "departments" ? "filled" : "light"}
            leftSection={<IconBuilding size={16} />}
            justify="flex-start"
            fullWidth
            size="md"
            color="blue"
            onClick={() => onNavigate?.("departments")}
          >
            Departments
          </Button>
          <Button
            variant={currentPage === "jobs" ? "filled" : "light"}
            leftSection={<IconBriefcase size={16} />}
            justify="flex-start"
            fullWidth
            size="md"
            color="blue"
            onClick={() => onNavigate?.("jobs")}
          >
            Jobs
          </Button>
          <Button
            variant={currentPage === "employees" ? "filled" : "light"}
            leftSection={<IconUserCheck size={16} />}
            justify="flex-start"
            fullWidth
            size="md"
            color="blue"
            onClick={() => onNavigate?.("employees")}
          >
            Employees
          </Button>

          <Button
            variant={currentPage === "translations" ? "filled" : "light"}
            leftSection={<IconLanguage size={16} />}
            justify="flex-start"
            fullWidth
            size="md"
            color="blue"
            onClick={() => onNavigate?.("translations")}
          >
            Translations
          </Button>
        </Stack>
      </AppShell.Section>
    </>
  );
};
