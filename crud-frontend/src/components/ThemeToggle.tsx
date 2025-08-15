import React from "react";
import { ActionIcon, Tooltip } from "@mantine/core";
import { IconSun, IconMoon } from "@tabler/icons-react";
import { useTheme } from "../contexts/ThemeContext";

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Tooltip
      label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      <ActionIcon
        onClick={toggleTheme}
        variant="subtle"
        size="lg"
        aria-label="Toggle theme"
        style={{
          transition: "all 0.2s ease",
        }}
      >
        {theme === "light" ? (
          <IconMoon size={20} stroke={1.5} />
        ) : (
          <IconSun size={20} stroke={1.5} />
        )}
      </ActionIcon>
    </Tooltip>
  );
};
