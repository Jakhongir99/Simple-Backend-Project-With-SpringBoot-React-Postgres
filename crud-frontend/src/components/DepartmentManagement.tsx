import React from "react";
import { Paper, Title, Text } from "@mantine/core";
import { IconBuilding } from "@tabler/icons-react";

const DepartmentManagement: React.FC = () => {
  return (
    <Paper shadow="xs" p="md">
      <Title order={3}>
        <IconBuilding size={24} style={{ marginRight: 8 }} />
        Department Management
      </Title>
      <Text size="sm" color="dimmed" mt="md">
        Department management functionality will be implemented here.
      </Text>
    </Paper>
  );
};

export default DepartmentManagement;
