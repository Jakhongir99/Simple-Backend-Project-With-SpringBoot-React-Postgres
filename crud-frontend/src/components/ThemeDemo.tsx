import React from "react";
import {
  Paper,
  Stack,
  Text,
  Button,
  Group,
  Card,
  Badge,
  Divider,
  Switch,
  Slider,
  TextInput,
  Select,
  Checkbox,
  Radio,
  Textarea,
  Alert,
  Progress,
  RingProgress,
  Timeline,
  Tabs,
  Modal,
} from "@mantine/core";
import {
  IconSun,
  IconMoon,
  IconPalette,
  IconEye,
  IconSettings,
  IconCheck,
  IconX,
  IconAlertCircle,
  IconInfoCircle,
} from "@tabler/icons-react";
import { useTheme } from "../contexts/ThemeContext";
import { THEME_COLORS, getThemeColor } from "../utils/theme";
import { useDisclosure } from "@mantine/hooks";

export const ThemeDemo: React.FC = () => {
  const { theme, toggleTheme, isDark, isLight } = useTheme();
  const [opened, { open, close }] = useDisclosure();

  const currentColors = THEME_COLORS[theme];

  return (
    <Stack gap="xl" p="xl">
      {/* Theme Header */}
      <Paper
        p="xl"
        radius="xl"
        style={{
          backgroundColor: `var(--bg-navbar)`,
          border: `1px solid var(--border-color)`,
          boxShadow: `var(--shadow)`,
        }}
      >
        <Group justify="space-between" align="center">
          <div>
            <Text size="xl" fw={700} style={{ color: `var(--text-primary)` }}>
              🎨 Advanced Theme System Demo
            </Text>
            <Text size="sm" style={{ color: `var(--text-secondary)` }}>
              Current theme: {theme} {isDark ? "🌙" : "☀️"}
            </Text>
          </div>
          <Group>
            <Button
              variant="outline"
              leftSection={
                isDark ? <IconSun size={16} /> : <IconMoon size={16} />
              }
              onClick={toggleTheme}
              radius="xl"
              style={{
                borderColor: `var(--border-color)`,
                color: `var(--text-primary)`,
                backgroundColor: `var(--bg-secondary)`,
              }}
            >
              Switch to {isDark ? "Light" : "Dark"}
            </Button>
            <Button
              variant="filled"
              leftSection={<IconPalette size={16} />}
              onClick={open}
              radius="xl"
              style={{
                backgroundColor: `var(--accent-color)`,
                color: "white",
              }}
            >
              Theme Settings
            </Button>
          </Group>
        </Group>
      </Paper>

      {/* Color Palette */}
      <Paper
        p="xl"
        radius="xl"
        style={{
          backgroundColor: `var(--bg-navbar)`,
          border: `1px solid var(--border-color)`,
          boxShadow: `var(--shadow)`,
        }}
      >
        <Text
          size="lg"
          fw={600}
          mb="md"
          style={{ color: `var(--text-primary)` }}
        >
          🎨 Color Palette
        </Text>
        <Group gap="md">
          <Card
            p="sm"
            radius="xl"
            style={{
              backgroundColor: currentColors.primary,
              border: `1px solid var(--border-color)`,
            }}
          >
            <Text size="xs" ta="center" c="white">
              Primary
            </Text>
            <Text size="xs" ta="center" c="white">
              {currentColors.primary}
            </Text>
          </Card>
          <Card
            p="sm"
            radius="xl"
            style={{
              backgroundColor: currentColors.secondary,
              border: `1px solid var(--border-color)`,
            }}
          >
            <Text
              size="xs"
              ta="center"
              style={{ color: getThemeColor(theme, "text.primary") }}
            >
              Secondary
            </Text>
            <Text
              size="xs"
              ta="center"
              style={{ color: getThemeColor(theme, "text.primary") }}
            >
              {currentColors.secondary}
            </Text>
          </Card>
          <Card
            p="sm"
            radius="xl"
            style={{
              backgroundColor: currentColors.tertiary,
              border: `1px solid var(--border-color)`,
            }}
          >
            <Text
              size="xs"
              ta="center"
              style={{ color: getThemeColor(theme, "text.primary") }}
            >
              Tertiary
            </Text>
            <Text
              size="xs"
              ta="center"
              style={{ color: getThemeColor(theme, "text.primary") }}
            >
              {currentColors.tertiary}
            </Text>
          </Card>
          <Card
            p="sm"
            radius="xl"
            style={{
              backgroundColor: currentColors.accent.primary,
              border: `1px solid var(--border-color)`,
            }}
          >
            <Text size="xs" ta="center" c="white">
              Accent
            </Text>
            <Text size="xs" ta="center" c="white">
              {currentColors.accent.primary}
            </Text>
          </Card>
        </Group>
      </Paper>

      {/* Form Elements */}
      <Paper
        p="xl"
        radius="xl"
        style={{
          backgroundColor: `var(--bg-navbar)`,
          border: `1px solid var(--border-color)`,
          boxShadow: `var(--shadow)`,
        }}
      >
        <Text
          size="lg"
          fw={600}
          mb="md"
          style={{ color: `var(--text-primary)` }}
        >
          📝 Form Elements
        </Text>
        <Stack gap="md">
          <Group grow>
            <TextInput
              label="Text Input"
              placeholder="Enter text here"
              radius="xl"
              styles={{
                label: { color: `var(--text-primary)` },
                input: {
                  backgroundColor: `var(--bg-secondary)`,
                  color: `var(--text-primary)`,
                  borderColor: `var(--border-color)`,
                },
              }}
            />
            <Select
              label="Select Dropdown"
              placeholder="Choose an option"
              data={["Option 1", "Option 2", "Option 3"]}
              radius="xl"
              styles={{
                label: { color: `var(--text-primary)` },
                input: {
                  backgroundColor: `var(--bg-secondary)`,
                  color: `var(--text-primary)`,
                  borderColor: `var(--border-color)`,
                },
              }}
            />
          </Group>
          <Group grow>
            <Checkbox
              label="Checkbox option"
              styles={{ label: { color: `var(--text-primary)` } }}
            />
            <Radio
              label="Radio option"
              styles={{ label: { color: `var(--text-primary)` } }}
            />
            <Switch
              label="Toggle switch"
              styles={{ label: { color: `var(--text-primary)` } }}
            />
          </Group>
          <Textarea
            label="Textarea"
            placeholder="Enter longer text here"
            rows={3}
            radius="xl"
            styles={{
              label: { color: `var(--text-primary)` },
              input: {
                backgroundColor: `var(--bg-secondary)`,
                color: `var(--text-primary)`,
                borderColor: `var(--border-color)`,
              },
            }}
          />
        </Stack>
      </Paper>

      {/* Interactive Elements */}
      <Paper
        p="xl"
        radius="xl"
        style={{
          backgroundColor: `var(--bg-navbar)`,
          border: `1px solid var(--border-color)`,
          boxShadow: `var(--shadow)`,
        }}
      >
        <Text
          size="lg"
          fw={600}
          mb="md"
          style={{ color: `var(--text-primary)` }}
        >
          🎯 Interactive Elements
        </Text>
        <Stack gap="md">
          <Group>
            <Button
              variant="filled"
              radius="xl"
              style={{ backgroundColor: `var(--accent-color)` }}
            >
              Primary Button
            </Button>
            <Button
              variant="outline"
              radius="xl"
              style={{
                borderColor: `var(--border-color)`,
                color: `var(--text-primary)`,
              }}
            >
              Secondary Button
            </Button>
            <Button
              variant="subtle"
              radius="xl"
              style={{ color: `var(--text-primary)` }}
            >
              Subtle Button
            </Button>
          </Group>
          <Group>
            <Badge
              size="lg"
              variant="filled"
              radius="xl"
              style={{ backgroundColor: `var(--accent-color)` }}
            >
              Badge
            </Badge>
            <Badge
              size="lg"
              variant="outline"
              radius="xl"
              style={{
                borderColor: `var(--border-color)`,
                color: `var(--text-primary)`,
              }}
            >
              Outline Badge
            </Badge>
          </Group>
          <Slider
            label="Slider"
            defaultValue={50}
            radius="xl"
            styles={{
              label: { color: `var(--text-primary)` },
              thumb: { borderColor: `var(--accent-color)` },
              track: { backgroundColor: `var(--border-color)` },
              bar: { backgroundColor: `var(--accent-color)` },
            }}
          />
        </Stack>
      </Paper>

      {/* Alerts and Notifications */}
      <Paper
        p="xl"
        radius="xl"
        style={{
          backgroundColor: `var(--bg-navbar)`,
          border: `1px solid var(--border-color)`,
          boxShadow: `var(--shadow)`,
        }}
      >
        <Text
          size="lg"
          fw={600}
          mb="md"
          style={{ color: `var(--text-primary)` }}
        >
          🔔 Alerts & Notifications
        </Text>
        <Stack gap="md">
          <Alert
            icon={<IconCheck size={16} />}
            title="Success!"
            color="green"
            variant="light"
            radius="xl"
          >
            This is a success message with the new theme system.
          </Alert>
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Warning!"
            color="yellow"
            variant="light"
            radius="xl"
          >
            This is a warning message with the new theme system.
          </Alert>
          <Alert
            icon={<IconInfoCircle size={16} />}
            title="Info"
            color="blue"
            variant="light"
            radius="xl"
          >
            This is an info message with the new theme system.
          </Alert>
        </Stack>
      </Paper>

      {/* Progress Indicators */}
      <Paper
        p="xl"
        radius="xl"
        style={{
          backgroundColor: `var(--bg-navbar)`,
          border: `1px solid var(--border-color)`,
          boxShadow: `var(--shadow)`,
        }}
      >
        <Text
          size="lg"
          fw={600}
          mb="md"
          style={{ color: `var(--text-secondary)` }}
        >
          📊 Progress Indicators
        </Text>
        <Group gap="xl">
          <div>
            <Text size="sm" mb="xs" style={{ color: `var(--text-secondary)` }}>
              Linear Progress
            </Text>
            <Progress value={65} size="lg" color="blue" radius="xl" />
          </div>
          <div>
            <Text size="sm" mb="xs" style={{ color: `var(--text-secondary)` }}>
              Ring Progress
            </Text>
            <RingProgress
              size={80}
              thickness={8}
              sections={[{ value: 65, color: "blue" }]}
              label={
                <Text
                  ta="center"
                  size="xs"
                  fw={700}
                  style={{ color: `var(--text-primary)` }}
                >
                  65%
                </Text>
              }
            />
          </div>
        </Group>
      </Paper>

      {/* Theme Settings Modal */}
      <Modal
        opened={opened}
        onClose={close}
        title="Theme Settings"
        size="lg"
        radius="xl"
        styles={{
          title: { color: `var(--text-primary)` },
          header: {
            backgroundColor: `var(--bg-card)`,
            borderBottom: `1px solid var(--border-color)`,
          },
          body: { backgroundColor: `var(--bg-card)` },
        }}
      >
        <Stack gap="md">
          <Text size="sm" style={{ color: `var(--text-secondary)` }}>
            Customize your theme experience with these advanced settings.
          </Text>

          <Group justify="space-between">
            <Text style={{ color: `var(--text-primary)` }}>Current Theme</Text>
            <Badge
              size="lg"
              variant="filled"
              radius="xl"
              style={{ backgroundColor: `var(--accent-color)` }}
            >
              {theme.toUpperCase()}
            </Badge>
          </Group>

          <Divider />

          <Group justify="space-between">
            <Text style={{ color: `var(--text-primary)` }}>Theme Mode</Text>
            <Group>
              <Button
                variant={isLight ? "filled" : "outline"}
                size="sm"
                radius="xl"
                leftSection={<IconSun size={16} />}
                onClick={() => theme !== "light" && toggleTheme()}
                style={{
                  backgroundColor: isLight
                    ? `var(--accent-color)`
                    : "transparent",
                  borderColor: `var(--border-color)`,
                  color: isLight ? "white" : `var(--text-primary)`,
                }}
              >
                Light
              </Button>
              <Button
                variant={isDark ? "filled" : "outline"}
                size="sm"
                radius="xl"
                leftSection={<IconMoon size={16} />}
                onClick={() => theme !== "dark" && toggleTheme()}
                style={{
                  backgroundColor: isDark
                    ? `var(--accent-color)`
                    : "transparent",
                  borderColor: `var(--border-color)`,
                  color: isDark ? "white" : `var(--text-primary)`,
                }}
              >
                Dark
              </Button>
            </Group>
          </Group>

          <Divider />

          <Text size="sm" style={{ color: `var(--text-secondary)` }}>
            Theme colors are automatically optimized for accessibility and
            visual appeal.
          </Text>
        </Stack>
      </Modal>
    </Stack>
  );
};
