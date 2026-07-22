import React from "react";
import { AppShell, Button, Group, Text, Stack } from "@mantine/core";
import {
  IconUsers,
  IconPalette,
  IconLanguage,
  IconUpload,
  IconShield,
  IconUserCheck,
  IconSitemap,
  IconCloud,
  IconArrowsExchange,
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
            variant={currentPage === "roles" ? "filled" : "light"}
            leftSection={<IconShield size={16} />}
            justify="flex-start"
            fullWidth
            size="md"
            radius="xl"
            onClick={() => onNavigate?.("roles")}
            style={getButtonStyles(currentPage === "roles")}
          >
            Roles
          </Button>

          <Button
            variant={currentPage === "hiring" ? "filled" : "light"}
            leftSection={<IconUserCheck size={16} />}
            justify="flex-start"
            fullWidth
            size="md"
            radius="xl"
            onClick={() => onNavigate?.("hiring")}
            style={getButtonStyles(currentPage === "hiring")}
          >
            {t("nav.hiring", "Ishga olish")}
          </Button>

          <Button
            variant={currentPage === "processes" ? "filled" : "light"}
            leftSection={<IconSitemap size={16} />}
            justify="flex-start"
            fullWidth
            size="md"
            radius="xl"
            onClick={() => onNavigate?.("processes")}
            style={getButtonStyles(currentPage === "processes")}
          >
            {t("nav.processes", "Jarayonlar")}
          </Button>

          <Button
            variant={currentPage === "weather" ? "filled" : "light"}
            leftSection={<IconCloud size={16} />}
            justify="flex-start"
            fullWidth
            size="md"
            radius="xl"
            onClick={() => onNavigate?.("weather")}
            style={getButtonStyles(currentPage === "weather")}
          >
            Ob-havo
          </Button>

          <Button
            variant={currentPage === "exchange" ? "filled" : "light"}
            leftSection={<IconArrowsExchange size={16} />}
            justify="flex-start"
            fullWidth
            size="md"
            radius="xl"
            onClick={() => onNavigate?.("exchange")}
            style={getButtonStyles(currentPage === "exchange")}
          >
            Valyuta kursi
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
