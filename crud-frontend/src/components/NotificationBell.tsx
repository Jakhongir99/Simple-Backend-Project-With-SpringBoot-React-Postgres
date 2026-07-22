import { useState } from "react";
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Indicator,
  Menu,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";
import { IconBell } from "@tabler/icons-react";
import {
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from "../hooks/useNotifications";

export const NotificationBell = () => {
  const [opened, setOpened] = useState(false);
  const { data: unread = 0 } = useUnreadNotificationCount();
  const { data: page, isLoading } = useNotifications(0, 10, opened);
  const markRead = useMarkNotificationRead();

  const notifications = page?.content ?? [];

  return (
    <Menu
      opened={opened}
      onChange={setOpened}
      position="bottom-end"
      width={360}
      shadow="md"
    >
      <Menu.Target>
        <Indicator
          inline
          label={unread > 0 ? (unread > 9 ? "9+" : unread) : undefined}
          size={16}
          disabled={unread === 0}
          color="red"
        >
          <ActionIcon
            variant="outline"
            size="lg"
            radius="xl"
            aria-label="Notifications"
            style={{
              borderColor: "var(--border-color)",
              color: "var(--text-primary)",
              backgroundColor: "var(--bg-secondary)",
            }}
          >
            <IconBell size={18} />
          </ActionIcon>
        </Indicator>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>
          <Group justify="space-between">
            <Text fw={600}>Bildirishnomalar</Text>
            {unread > 0 && (
              <Badge size="sm" color="red" variant="light">
                {unread} yangi
              </Badge>
            )}
          </Group>
        </Menu.Label>

        <ScrollArea.Autosize mah={320}>
          {isLoading && (
            <Text size="sm" c="dimmed" p="sm">
              Yuklanmoqda...
            </Text>
          )}

          {!isLoading && notifications.length === 0 && (
            <Text size="sm" c="dimmed" p="sm">
              Bildirishnoma yo'q
            </Text>
          )}

          {notifications.map((n) => (
            <Menu.Item
              key={n.id}
              style={{
                backgroundColor: n.read ? undefined : "var(--accent-light)",
                whiteSpace: "normal",
                height: "auto",
                padding: "10px 12px",
              }}
              onClick={() => {
                if (!n.read) {
                  markRead.mutate(n.id);
                }
              }}
            >
              <Stack gap={2}>
                <Group justify="space-between" gap="xs">
                  <Text size="sm" fw={600}>
                    {n.title}
                  </Text>
                  {!n.read && (
                    <Badge size="xs" color="blue">
                      yangi
                    </Badge>
                  )}
                </Group>
                <Text size="xs" c="dimmed">
                  {n.message}
                </Text>
                <Text size="xs" c="dimmed">
                  {new Date(n.createdAt).toLocaleString()}
                </Text>
              </Stack>
            </Menu.Item>
          ))}
        </ScrollArea.Autosize>

        {notifications.length > 0 && (
          <>
            <Menu.Divider />
            <Menu.Item>
              <Button
                variant="subtle"
                size="xs"
                fullWidth
                onClick={() => setOpened(false)}
              >
                Yopish
              </Button>
            </Menu.Item>
          </>
        )}
      </Menu.Dropdown>
    </Menu>
  );
};
