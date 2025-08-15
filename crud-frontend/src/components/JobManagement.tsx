import React from "react";
import { Paper, Title, Text } from "@mantine/core";
import { IconBriefcase } from "@tabler/icons-react";

const JobManagement: React.FC = () => {
  return (
    <Paper shadow="xs" p="md">
      <Title order={3}>
        <IconBriefcase size={24} style={{ marginRight: 8 }} />
        Job Management
      </Title>
      <Text size="sm" color="dimmed" mt="md">
        Job management functionality will be implemented here.
      </Text>
    </Paper>
  );
};

export default JobManagement;
