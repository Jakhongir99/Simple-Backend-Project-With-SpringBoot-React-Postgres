import React from "react";
import { Card, Text, Group, Stack, Badge, Button, Flex } from "@mantine/core";
import {
  IconUsers,
  IconBuilding,
  IconBriefcase,
  IconUser,
  IconLanguage,
} from "@tabler/icons-react";
import { useTranslations } from "../hooks/useTranslations";
import { useTheme } from "../contexts/ThemeContext";

export const Dashboard: React.FC = () => {
  const { t } = useTranslations();
  const { theme } = useTheme();

  const stats = [
    {
      title: t("nav.users"),
      value: "25",
      icon: IconUsers,
      color: "blue",
      description: "Active users in the system",
    },
    {
      title: t("nav.employees"),
      value: "150",
      icon: IconUser,
      color: "green",
      description: "Total employees",
    },
    {
      title: t("nav.departments"),
      value: "12",
      icon: IconBuilding,
      color: "violet",
      description: "Company departments",
    },
    {
      title: t("nav.jobs"),
      value: "45",
      icon: IconBriefcase,
      color: "orange",
      description: "Available positions",
    },

    {
      title: t("nav.translations"),
      value: "18",
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
                <Badge color={stat.color} variant="light">
                  {stat.value}
                </Badge>
              </Group>
              <Group justify="space-between" align="flex-end" gap="xs">
                <Stack gap={0}>
                  <Text size="xl" fw={700} color={stat.color}>
                    {stat.value}
                  </Text>
                  <Text size="xs" c="dimmed" maw={150}>
                    {stat.description}
                  </Text>
                </Stack>
                <IconComponent size={32} color={`var(--${stat.color}-6)`} />
              </Group>
            </Card>
          );
        })}
      </Flex>
    </Stack>
  );
};
