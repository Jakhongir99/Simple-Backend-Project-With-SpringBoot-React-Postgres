import React from "react";
import {
  Modal,
  Stack,
  TextInput,
  Textarea,
  Select,
  Switch,
  Group,
  Button,
} from "@mantine/core";
import { IconUser, IconMail } from "@tabler/icons-react";

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  bio: string;
  role: string;
  notifications: boolean;
}

interface ProfileModalProps {
  opened: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
  onSave?: () => void;
  onRefresh?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  opened,
  onClose,
  userProfile,
  setUserProfile,
  onSave,
  onRefresh,
}) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Profile Settings"
      size="lg"
      radius="xl"
      centered
      styles={{
        title: { color: `var(--text-primary)` },
        header: {
          backgroundColor: `var(--bg-navbar)`,
          borderBottom: `1px solid var(--border-color)`,
        },
        body: { backgroundColor: `var(--bg-navbar)` },
      }}
    >
      <Stack gap="lg">
        <TextInput
          label="Full Name"
          value={userProfile.name}
          onChange={(e) =>
            setUserProfile({ ...userProfile, name: e.target.value })
          }
          leftSection={<IconUser size={16} />}
          placeholder="Enter your full name"
          radius="xl"
        />
        <TextInput
          label="Email"
          value={userProfile.email}
          onChange={(e) =>
            setUserProfile({ ...userProfile, email: e.target.value })
          }
          leftSection={<IconMail size={16} />}
          placeholder="Enter your email"
          radius="xl"
        />
        <TextInput
          label="Phone"
          value={userProfile.phone}
          onChange={(e) =>
            setUserProfile({ ...userProfile, phone: e.target.value })
          }
          leftSection={<IconUser size={16} />}
          placeholder="Enter your phone number"
          radius="xl"
        />
        <Textarea
          label="Bio"
          value={userProfile.bio}
          onChange={(e) =>
            setUserProfile({ ...userProfile, bio: e.target.value })
          }
          placeholder="Tell us about yourself..."
          rows={3}
          radius="xl"
        />
        <Select
          label="Role"
          value={userProfile.role}
          onChange={(value) =>
            setUserProfile({ ...userProfile, role: value || "User" })
          }
          data={["User", "Admin", "Moderator"]}
          radius="xl"
        />
        <Switch
          label="Enable Notifications"
          checked={userProfile.notifications}
          onChange={(e) =>
            setUserProfile({
              ...userProfile,
              notifications: e.currentTarget.checked,
            })
          }
        />

        <Group justify="flex-end" gap="md">
          <Button variant="light" onClick={onClose} radius="xl">
            Cancel
          </Button>
          <Button onClick={onSave} radius="xl">
            Save Changes
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
