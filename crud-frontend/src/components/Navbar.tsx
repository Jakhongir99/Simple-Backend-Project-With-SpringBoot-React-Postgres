import React from "react";
import { AppShell, Button, Group, Text, Stack, Divider } from "@mantine/core";
import {
  IconUsers,
  IconBriefcase,
  IconBuilding,
  IconFileText,
  IconPalette,
  IconLanguage,
  IconUpload,
} from "@tabler/icons-react";
import { useTranslations } from "../hooks/useTranslations";

interface NavbarProps {
  onNavigate?: (page: string) => void;
  currentPage: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage }) => {
  const { t } = useTranslations();

  const getButtonStyles = (isActive: boolean) => ({
    backgroundColor: isActive ? `var(--accent-color)` : `var(--bg-secondary)`,
    color: isActive ? "white" : `var(--text-primary)`,
    border: `1px solid ${
      isActive ? `var(--accent-color)` : `var(--border-color)`
    }`,
    boxShadow: isActive ? `0 2px 6px var(--shadow)` : `0 1px 3px var(--shadow)`,
    transition: "all 0.3s ease",
    outline: "none",
    "&:hover": {
      backgroundColor: isActive ? `var(--accent-hover)` : `var(--bg-tertiary)`,
      transform: isActive ? "none" : "translateX(4px)",
      borderColor: `var(--accent-color)`,
      boxShadow: isActive
        ? `0 4px 12px var(--shadow-lg)`
        : `0 2px 6px var(--shadow)`,
    },
  });

  return (
    <AppShell.Navbar bg="var(--bg-navbar)">
      <AppShell.Section
        p="md"
        style={{
          backgroundColor: `var(--bg-navbar)`,
          borderBottom: `1px solid var(--border-color)`,
          boxShadow: `0 1px 3px var(--shadow)`,
          transition:
            "background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
        }}
      >
        <Group>
          <IconUsers
            size={24}
            style={{
              color: `var(--accent-color)`,
              filter: `drop-shadow(0 1px 2px var(--shadow))`,
            }}
          />
          <Text
            fw={600}
            size="lg"
            style={{
              color: `var(--text-primary)`,
              textShadow: `0 1px 2px var(--shadow)`,
            }}
          >
            {t("nav.navigation")}
          </Text>
        </Group>
      </AppShell.Section>

      <AppShell.Section p="md">
        <Stack gap="md">
          <Button
            variant={currentPage === "dashboard" ? "filled" : "light"}
            leftSection={<IconUsers size={16} />}
            justify="flex-start"
            fullWidth
            size="md"
            radius="xl"
            onClick={() => onNavigate?.("dashboard")}
            style={getButtonStyles(currentPage === "dashboard")}
          >
            {t("nav.dashboard")}
          </Button>

          <Button
            variant={currentPage === "users" ? "filled" : "light"}
            leftSection={<IconUsers size={16} />}
            justify="flex-start"
            fullWidth
            size="md"
            radius="xl"
            onClick={() => onNavigate?.("users")}
            style={getButtonStyles(currentPage === "users")}
          >
            {t("nav.users")}
          </Button>

          <Button
            variant={currentPage === "departments" ? "filled" : "light"}
            leftSection={<IconBuilding size={16} />}
            justify="flex-start"
            fullWidth
            size="md"
            radius="xl"
            onClick={() => onNavigate?.("departments")}
            style={getButtonStyles(currentPage === "departments")}
          >
            {t("nav.departments")}
          </Button>

          <Button
            variant={currentPage === "jobs" ? "filled" : "light"}
            leftSection={<IconBriefcase size={16} />}
            justify="flex-start"
            fullWidth
            size="md"
            radius="xl"
            onClick={() => onNavigate?.("jobs")}
            style={getButtonStyles(currentPage === "jobs")}
          >
            {t("nav.jobs")}
          </Button>

          <Button
            variant={currentPage === "employees" ? "filled" : "light"}
            leftSection={<IconUsers size={16} />}
            justify="flex-start"
            fullWidth
            size="md"
            radius="xl"
            onClick={() => onNavigate?.("employees")}
            style={getButtonStyles(currentPage === "employees")}
          >
            {t("nav.employees")}
          </Button>

          <Button
            variant={currentPage === "files" ? "filled" : "light"}
            leftSection={<IconUpload size={16} />}
            justify="flex-start"
            fullWidth
            size="md"
            radius="xl"
            onClick={() => onNavigate?.("files")}
            style={getButtonStyles(currentPage === "files")}
          >
            {t("nav.fileManagement")}
          </Button>

          <Button
            variant={currentPage === "translations" ? "filled" : "light"}
            leftSection={<IconLanguage size={16} />}
            justify="flex-start"
            fullWidth
            size="md"
            radius="xl"
            onClick={() => onNavigate?.("translations")}
            style={getButtonStyles(currentPage === "translations")}
          >
            {t("nav.translations")}
          </Button>

          <Button
            variant={currentPage === "theme-demo" ? "filled" : "light"}
            leftSection={<IconPalette size={16} />}
            justify="flex-start"
            fullWidth
            size="md"
            radius="xl"
            onClick={() => onNavigate?.("theme-demo")}
            style={getButtonStyles(currentPage === "theme-demo")}
          >
            🎨 Theme Demo
          </Button>
        </Stack>
      </AppShell.Section>
    </AppShell.Navbar>
  );
};
