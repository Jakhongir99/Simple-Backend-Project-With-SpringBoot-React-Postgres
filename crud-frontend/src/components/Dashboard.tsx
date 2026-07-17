import React from "react";
import { Card, Text, Group, Stack, Badge, Flex } from "@mantine/core";
import {
  IconUsers,
  IconLanguage,
  IconUserCheck,
  IconSitemap,
} from "@tabler/icons-react";
import { useTranslations } from "../hooks/useTranslations";
import { useTheme } from "../contexts/ThemeContext";

export const Dashboard: React.FC = () => {
  const { t } = useTranslations();
  const { theme } = useTheme();

  const stats = [
    {
      title: t("nav.users"),
      value: "—",
      icon: IconUsers,
      color: "blue",
      description: "Active users in the system",
    },
    {
      title: t("nav.hiring", "Ishga olish"),
      value: "—",
      icon: IconUserCheck,
      color: "green",
      description: "Hiring workflow requests",
    },
    {
      title: t("nav.processes", "Jarayonlar"),
      value: "—",
      icon: IconSitemap,
      color: "violet",
      description: "BPMN process templates",
    },
    {
      title: t("nav.translations"),
      value: "—",
      icon: IconLanguage,
      color: "indigo",
      description: "Translation keys",
    },
  ];

  return (
    <Stack gap="xl">
      <Text size="xl" fw={700} ta="center">
        {t("nav.dashboard")}
      </Text>

      <Text size="sm" c="dimmed" ta="center">
        Current theme: {theme} | Language: {t("language.english")}
      </Text>

      <Flex gap="md" wrap="wrap" justify="space-between">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card
              key={index}
              shadow="sm"
              padding="lg"
              radius="lg"
              withBorder
              bg="var(--bg-navbar)"
            >
              <Group justify="space-between" mb="xs">
                <Text fw={500} size="lg">
                  {stat.title}
                </Text>
                <IconComponent size={24} color={`var(--mantine-color-${stat.color}-6)`} />
              </Group>
              <Text size="xl" fw={700}>
                {stat.value}
              </Text>
              <Text size="sm" c="dimmed" mt="xs">
                {stat.description}
              </Text>
              <Badge color={stat.color} variant="light" mt="sm">
                Active
              </Badge>
            </Card>
          );
        })}
      </Flex>
    </Stack>
  );
};
