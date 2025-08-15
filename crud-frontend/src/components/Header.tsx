import React from "react";
import {
  Group,
  Button,
  Text,
  ActionIcon,
  useMantineColorScheme,
  Select,
} from "@mantine/core";
import { IconSun, IconMoon, IconLanguage } from "@tabler/icons-react";
import { useTheme } from "../contexts/ThemeContext";
import { useTranslations } from "../hooks/useTranslations";

interface HeaderProps {
  userProfile: any;
  onProfileClick: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userProfile,
  onProfileClick,
  onLogout,
}) => {
  const { toggleColorScheme } = useMantineColorScheme();
  const { theme } = useTheme();
  const { currentLanguage, changeLanguage, supportedLanguages } =
    useTranslations();

  const handleLanguageChange = (language: string | null) => {
    if (language) {
      changeLanguage(language);
    }
  };

  return (
    <Group
      justify="space-between"
      p="md"
      style={{ borderBottom: "1px solid var(--mantine-color-gray-3)" }}
    >
      <Text size="xl" fw={700}>
        CRUD Application
      </Text>

      <Group>
        {/* Language Selector */}
        <Select
          value={currentLanguage}
          onChange={handleLanguageChange}
          data={supportedLanguages.map((lang) => ({
            value: lang,
            label: lang.toUpperCase(),
          }))}
          leftSection={<IconLanguage size={16} />}
          size="sm"
          w={80}
        />

        {/* Theme Toggle */}
        <ActionIcon
          onClick={() => toggleColorScheme()}
          variant="outline"
          size="lg"
          aria-label="Toggle color scheme"
        >
          {theme === "dark" ? <IconSun size={18} /> : <IconMoon size={18} />}
        </ActionIcon>

        {/* User Profile */}
        <Button variant="subtle" onClick={onProfileClick} size="sm">
          {userProfile?.name || "Profile"}
        </Button>

        {/* Logout */}
        <Button variant="outline" color="red" onClick={onLogout} size="sm">
          Logout
        </Button>
      </Group>
    </Group>
  );
};
