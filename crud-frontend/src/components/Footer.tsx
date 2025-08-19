import React from "react";
import { Group, Text, ActionIcon } from "@mantine/core";
import {
  IconBrandGithub,
  IconBrandTwitter,
  IconBrandLinkedin,
  IconBrandYoutube,
} from "@tabler/icons-react";
import { useTheme } from "../contexts/ThemeContext";

export const Footer: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Group
      justify="space-between"
      h="100%"
      px="md"
      style={{
        backgroundColor: `var(--bg-footer)`,
        color: `var(--text-secondary)`,
        borderTop: `1px solid var(--border-light)`,
        boxShadow: `0 -1px 3px var(--shadow)`,
        transition:
          "background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
        minHeight: "60px",
      }}
    >
      <Text
        size="sm"
        style={{
          color: `var(--text-secondary)`,
          transition: "color 0.3s ease",
          textShadow: `0 1px 1px var(--shadow)`,
        }}
      >
        © 2024 CRUD Dashboard. Built with React & Mantine.
      </Text>
      <Group gap="xs">
        <ActionIcon
          variant="light"
          size="sm"
          radius="xl"
          style={{
            backgroundColor: `var(--bg-secondary)`,
            color: `var(--text-secondary)`,
            border: `1px solid var(--border-color)`,
            boxShadow: `0 1px 3px var(--shadow)`,
            transition: "all 0.3s ease",
            "&:hover": {
              backgroundColor: `var(--bg-tertiary)`,
              color: `var(--accent-color)`,
              transform: "scale(1.1)",
              boxShadow: `0 2px 6px var(--shadow)`,
            },
          }}
        >
          <IconBrandGithub size={16} />
        </ActionIcon>
        <ActionIcon
          variant="light"
          size="sm"
          radius="xl"
          style={{
            backgroundColor: `var(--bg-secondary)`,
            color: `var(--text-secondary)`,
            border: `1px solid var(--border-color)`,
            boxShadow: `0 1px 3px var(--shadow)`,
            transition: "all 0.3s ease",
            "&:hover": {
              backgroundColor: `var(--bg-tertiary)`,
              color: `var(--accent-color)`,
              transform: "scale(1.1)",
              boxShadow: `0 2px 6px var(--shadow)`,
            },
          }}
        >
          <IconBrandTwitter size={16} />
        </ActionIcon>
        <ActionIcon
          variant="light"
          size="sm"
          radius="xl"
          style={{
            backgroundColor: `var(--bg-secondary)`,
            color: `var(--text-secondary)`,
            border: `1px solid var(--border-color)`,
            boxShadow: `0 1px 3px var(--shadow)`,
            transition: "all 0.3s ease",
            "&:hover": {
              backgroundColor: `var(--bg-tertiary)`,
              color: `var(--accent-color)`,
              transform: "scale(1.1)",
              boxShadow: `0 2px 6px var(--shadow)`,
            },
          }}
        >
          <IconBrandLinkedin size={16} />
        </ActionIcon>
        <ActionIcon
          variant="light"
          size="sm"
          radius="xl"
          style={{
            backgroundColor: `var(--bg-secondary)`,
            color: `var(--text-secondary)`,
            border: `1px solid var(--border-color)`,
            boxShadow: `0 1px 3px var(--shadow)`,
            transition: "all 0.3s ease",
            "&:hover": {
              backgroundColor: `var(--bg-tertiary)`,
              color: `var(--accent-color)`,
              transform: "scale(1.1)",
              boxShadow: `0 2px 6px var(--shadow)`,
            },
          }}
        >
          <IconBrandYoutube size={16} />
        </ActionIcon>
      </Group>
    </Group>
  );
};
