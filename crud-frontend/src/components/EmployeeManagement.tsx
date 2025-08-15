import React from "react";
import { Paper, Title, Text } from "@mantine/core";
import { IconUserCheck } from "@tabler/icons-react";

const EmployeeManagement: React.FC = () => {
  return (
    <Paper shadow="xs" p="md">
      <Title order={3}>
        <IconUserCheck size={24} style={{ marginRight: 8 }} />
        Employee Management
      </Title>
      <Text size="sm" color="dimmed" mt="md">
        Employee management functionality will be implemented here.
      </Text>
    </Paper>
  );
};

export default EmployeeManagement;
