import React from "react";
import { Group, Text, ActionIcon } from "@mantine/core";
import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandTwitter,
} from "@tabler/icons-react";

export const Footer: React.FC = () => {
  return (
    <Group justify="space-between" h="100%" px="md">
      <Text size="sm" c="dimmed">
        © 2024 CRUD Dashboard. Built with React & Mantine.
      </Text>
      <Group gap="xs">
        <ActionIcon variant="light" size="sm" radius="xl">
          <IconBrandGithub size={16} />
        </ActionIcon>
        <ActionIcon variant="light" size="sm" radius="xl">
          <IconBrandLinkedin size={16} />
        </ActionIcon>
        <ActionIcon variant="light" size="sm" radius="xl">
          <IconBrandTwitter size={16} />
        </ActionIcon>
      </Group>
    </Group>
  );
};
