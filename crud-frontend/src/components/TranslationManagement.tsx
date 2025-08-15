import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Group,
  Text,
  Modal,
  TextInput,
  Textarea,
  Select,
  ActionIcon,
  Box,
  Card,
  Title,
  Badge,
  Stack,
  Pagination,
  TextInput as SearchInput,
} from "@mantine/core";
import {
  IconEdit,
  IconTrash,
  IconPlus,
  IconSearch,
  IconLanguage,
} from "@tabler/icons-react";
import { useTranslations } from "../hooks/useTranslations";
import type {
  Translation,
  CreateTranslationRequest,
  UpdateTranslationRequest,
} from "../hooks/useTranslations";
import { notifications } from "@mantine/notifications";

const TranslationManagement: React.FC = () => {
  const {
    t,
    currentLanguage,
    changeLanguage,
    supportedLanguages,
    allTranslations,
    allTranslationsLoading,
    createTranslation,
    updateTranslation,
    deleteTranslation,
    searchTranslations,
    isCreating,
    isUpdating,
    isDeleting,
  } = useTranslations();

  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [selectedTranslation, setSelectedTranslation] =
    useState<Translation | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState<Translation[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Form states
  const [formData, setFormData] = useState<CreateTranslationRequest>({
    translationKey: "",
    languageCode: "en",
    translationValue: "",
    description: "",
    isActive: true,
  });

  // Load all translations when component mounts
  useEffect(() => {
    if (allTranslations) {
      setSearchResults(allTranslations);
    }
  }, [allTranslations]);

  // Handle search
  const handleSearch = async () => {
    if (searchKeyword.trim()) {
      const results = await searchTranslations(searchKeyword);
      setSearchResults(results);
    } else {
      setSearchResults(allTranslations || []);
    }
    setCurrentPage(1);
  };

  // Handle create translation
  const handleCreate = () => {
    createTranslation(formData, {
      onSuccess: () => {
        setCreateModalOpened(false);
        setFormData({
          translationKey: "",
          languageCode: "en",
          translationValue: "",
          description: "",
          isActive: true,
        });
      },
    });
  };

  // Handle edit translation
  const handleEdit = () => {
    if (selectedTranslation) {
      updateTranslation(
        {
          id: selectedTranslation.id,
          data: formData,
        },
        {
          onSuccess: () => {
            setEditModalOpened(false);
            setSelectedTranslation(null);
            setFormData({
              translationKey: "",
              languageCode: "en",
              translationValue: "",
              description: "",
              isActive: true,
            });
          },
        }
      );
    }
  };

  // Handle delete translation
  const handleDelete = () => {
    if (selectedTranslation) {
      deleteTranslation(selectedTranslation.id, {
        onSuccess: () => {
          setDeleteModalOpened(false);
          setSelectedTranslation(null);
        },
      });
    }
  };

  // Open edit modal
  const openEditModal = (translation: Translation) => {
    setSelectedTranslation(translation);
    setFormData({
      translationKey: translation.translationKey,
      languageCode: translation.languageCode,
      translationValue: translation.translationValue,
      description: translation.description || "",
      isActive: translation.isActive,
    });
    setEditModalOpened(true);
  };

  // Open delete modal
  const openDeleteModal = (translation: Translation) => {
    setSelectedTranslation(translation);
    setDeleteModalOpened(true);
  };

  // Pagination
  const totalPages = Math.ceil((searchResults?.length || 0) / itemsPerPage);
  const paginatedResults = searchResults?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Language change handler
  const handleLanguageChange = (language: string) => {
    changeLanguage(language);
  };

  return (
    <Box>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={2}>
            <IconLanguage size={24} style={{ marginRight: 8 }} />
            Translation Management
          </Title>
          <Group>
            <Select
              label="Current Language"
              value={currentLanguage}
              onChange={(value) => value && handleLanguageChange(value)}
              data={supportedLanguages.map((lang) => ({
                value: lang,
                label: lang.toUpperCase(),
              }))}
              size="sm"
            />
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setCreateModalOpened(true)}
              color="blue"
            >
              Add Translation
            </Button>
          </Group>
        </Group>

        {/* Search */}
        <Group mb="md">
          <SearchInput
            placeholder="Search translations..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            leftSection={<IconSearch size={16} />}
            style={{ flex: 1 }}
          />
          <Button onClick={handleSearch} variant="outline">
            Search
          </Button>
        </Group>

        {/* Translations Table */}
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Key</Table.Th>
              <Table.Th>Language</Table.Th>
              <Table.Th>Value</Table.Th>
              <Table.Th>Description</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {paginatedResults?.map((translation) => (
              <Table.Tr key={translation.id}>
                <Table.Td>
                  <Text size="sm" fw={500}>
                    {translation.translationKey}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge color="blue" variant="light">
                    {translation.languageCode.toUpperCase()}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" style={{ maxWidth: 200 }} truncate>
                    {translation.translationValue}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed" style={{ maxWidth: 150 }} truncate>
                    {translation.description || "-"}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={translation.isActive ? "green" : "red"}
                    variant="light"
                  >
                    {translation.isActive ? "Active" : "Inactive"}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      color="blue"
                      onClick={() => openEditModal(translation)}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      color="red"
                      onClick={() => openDeleteModal(translation)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <Group justify="center" mt="md">
            <Pagination
              total={totalPages}
              value={currentPage}
              onChange={setCurrentPage}
              size="sm"
            />
          </Group>
        )}

        {/* Loading state */}
        {allTranslationsLoading && (
          <Text ta="center" c="dimmed" py="xl">
            Loading translations...
          </Text>
        )}

        {/* Empty state */}
        {!allTranslationsLoading &&
          (!searchResults || searchResults.length === 0) && (
            <Text ta="center" c="dimmed" py="xl">
              No translations found.
            </Text>
          )}
      </Card>

      {/* Create Modal */}
      <Modal
        opened={createModalOpened}
        onClose={() => setCreateModalOpened(false)}
        title="Add New Translation"
        size="lg"
      >
        <Stack gap="md">
          <TextInput
            label="Translation Key"
            placeholder="e.g., nav.dashboard"
            value={formData.translationKey}
            onChange={(e) =>
              setFormData({ ...formData, translationKey: e.target.value })
            }
            required
          />
          <Select
            label="Language"
            placeholder="Select language"
            data={supportedLanguages.map((lang) => ({
              value: lang,
              label: lang.toUpperCase(),
            }))}
            value={formData.languageCode}
            onChange={(value) =>
              setFormData({ ...formData, languageCode: value || "en" })
            }
            required
          />
          <TextInput
            label="Translation Value"
            placeholder="Enter translation"
            value={formData.translationValue}
            onChange={(e) =>
              setFormData({ ...formData, translationValue: e.target.value })
            }
            required
          />
          <Textarea
            label="Description"
            placeholder="Optional description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={3}
          />
          <Group justify="flex-end">
            <Button
              variant="outline"
              onClick={() => setCreateModalOpened(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              loading={isCreating}
              disabled={!formData.translationKey || !formData.translationValue}
            >
              Create
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Edit Modal */}
      <Modal
        opened={editModalOpened}
        onClose={() => setEditModalOpened(false)}
        title="Edit Translation"
        size="lg"
      >
        <Stack gap="md">
          <TextInput
            label="Translation Key"
            placeholder="e.g., nav.dashboard"
            value={formData.translationKey}
            onChange={(e) =>
              setFormData({ ...formData, translationKey: e.target.value })
            }
            required
          />
          <Select
            label="Language"
            placeholder="Select language"
            data={supportedLanguages.map((lang) => ({
              value: lang,
              label: lang.toUpperCase(),
            }))}
            value={formData.languageCode}
            onChange={(value) =>
              setFormData({ ...formData, languageCode: value || "en" })
            }
            required
          />
          <TextInput
            label="Translation Value"
            placeholder="Enter translation"
            value={formData.translationValue}
            onChange={(e) =>
              setFormData({ ...formData, translationValue: e.target.value })
            }
            required
          />
          <Textarea
            label="Description"
            placeholder="Optional description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={3}
          />
          <Group justify="flex-end">
            <Button variant="outline" onClick={() => setEditModalOpened(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              loading={isUpdating}
              disabled={!formData.translationKey || !formData.translationValue}
            >
              Update
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        title="Delete Translation"
        size="sm"
      >
        <Stack gap="md">
          <Text>
            Are you sure you want to delete the translation "
            {selectedTranslation?.translationKey}" for language "
            {selectedTranslation?.languageCode}"?
          </Text>
          <Text size="sm" c="dimmed">
            This action cannot be undone.
          </Text>
          <Group justify="flex-end">
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpened(false)}
            >
              Cancel
            </Button>
            <Button color="red" onClick={handleDelete} loading={isDeleting}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
};

export default TranslationManagement;
