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
  const { theme, toggleTheme } = useTheme();
  const { currentLanguage, changeLanguage, supportedLanguages } =
    useTranslations();

  const handleLanguageChange = async (language: string | null) => {
    if (language) {
      console.log(`🔄 Header: Changing language to ${language}`);
      await changeLanguage(language);
      console.log(`🔄 Header: Language changed to ${language}`);
    }
  };

  const handleThemeToggle = () => {
    toggleTheme();
    toggleColorScheme();
  };

  return (
    <Group
      justify="space-between"
      p="md"
      style={{
        backgroundColor: `var(--bg-header)`,
        color: `var(--text-primary)`,
        borderBottom: `2px solid var(--border-color) !important`,
        boxShadow: `var(--shadow)`,
        transition:
          "background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
        minHeight: "65px",
      }}
    >
      <Text
        size="xl"
        fw={700}
        style={{
          color: `var(--text-primary)`,
          textShadow: `0 1px 2px var(--shadow)`,
        }}
      >
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
          miw={80}
          radius="xl"
          styles={{
            input: {
              backgroundColor: `var(--bg-secondary)`,
              color: `var(--text-primary)`,
              borderColor: `var(--border-color)`,
              boxShadow: `0 1px 3px var(--shadow)`,
              transition: "all 0.3s ease",
              "&:focus": {
                borderColor: `var(--accent-color)`,
                boxShadow: `0 0 0 3px var(--accent-light)`,
              },
            },
            dropdown: {
              backgroundColor: `var(--bg-navbar)`,
              borderColor: `var(--border-color)`,
              boxShadow: `var(--shadow-lg)`,
            },
            option: {
              color: `var(--text-primary)`,
              transition: "all 0.2s ease",
              "&[data-selected]": {
                backgroundColor: `var(--accent-color)`,
                color: "white",
              },
              "&:hover": {
                backgroundColor: `var(--bg-tertiary)`,
                transform: "translateX(2px)",
              },
            },
          }}
        />

        {/* Theme Toggle */}
        <ActionIcon
          onClick={handleThemeToggle}
          variant="outline"
          size="lg"
          radius="xl"
          aria-label="Toggle color scheme"
          style={{
            borderColor: `var(--border-color)`,
            color: `var(--text-primary)`,
            backgroundColor: `var(--bg-secondary)`,
            boxShadow: `0 1px 3px var(--shadow)`,
            transition: "all 0.3s ease",
            "&:hover": {
              backgroundColor: `var(--bg-tertiary)`,
              transform: "scale(1.05)",
              boxShadow: `0 2px 6px var(--shadow)`,
            },
          }}
        >
          {theme === "dark" ? <IconSun size={18} /> : <IconMoon size={18} />}
        </ActionIcon>

        {/* User Profile */}
        <Button
          variant="filled"
          onClick={onProfileClick}
          size="sm"
          radius="xl"
          style={{
            color: `var(--text-primary)`,
            borderColor: `var(--border-color)`,
            backgroundColor: `var(--bg-secondary)`,
            boxShadow: `0 1px 3px var(--shadow)`,
            transition: "all 0.3s ease",
            "&:hover": {
              backgroundColor: `var(--bg-tertiary)`,
              transform: "translateY(-1px)",
              boxShadow: `0 2px 4px var(--shadow)`,
            },
          }}
        >
          {userProfile?.name || "Profile"}
        </Button>

        {/* Logout */}
        <Button
          variant="outline"
          color="red"
          onClick={onLogout}
          size="sm"
          radius="xl"
          style={{
            borderColor: `var(--border-color)`,
            color: `var(--text-primary)`,
            backgroundColor: `var(--bg-secondary)`,
            boxShadow: `0 1px 3px var(--shadow)`,
            transition: "all 0.3s ease",
            "&:hover": {
              backgroundColor: `var(--bg-tertiary)`,
              transform: "translateY(-1px)",
              boxShadow: `0 2px 6px var(--shadow)`,
            },
          }}
        >
          Logout
        </Button>
      </Group>
    </Group>
  );
};
