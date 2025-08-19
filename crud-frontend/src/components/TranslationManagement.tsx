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
    groupedTranslations,
    groupedTranslationsLoading,
    groupedTranslationsError,
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

  // Form states for multi-language translation
  const [formData, setFormData] = useState({
    translationKey: "",
    ru: "",
    en: "",
    uz: "",
    description: "",
    isActive: true,
  });

  // Load grouped translations when component mounts
  useEffect(() => {
    console.log(
      "🔤 TranslationManagement: groupedTranslations changed:",
      groupedTranslations
    );
    if (groupedTranslations) {
      // Convert grouped translations to flat list for search
      const flatTranslations = Object.entries(groupedTranslations).flatMap(
        ([key, langMap]) =>
          Object.values(langMap as Record<string, Translation>)
      );
      setSearchResults(flatTranslations);
      console.log(
        "🔤 TranslationManagement: Search results updated with",
        flatTranslations.length,
        "translations from",
        Object.keys(groupedTranslations).length,
        "keys"
      );
    }
  }, [groupedTranslations]);

  // Handle search
  const handleSearch = async () => {
    if (searchKeyword.trim()) {
      const results = await searchTranslations(searchKeyword);
      setSearchResults(results);
    } else {
      // Convert grouped translations to flat list for search
      if (groupedTranslations) {
        const flatTranslations = Object.entries(groupedTranslations).flatMap(
          ([key, langMap]) =>
            Object.values(langMap as Record<string, Translation>)
        );
        setSearchResults(flatTranslations);
      } else {
        setSearchResults([]);
      }
    }
  };

  // Handle create translation for all languages
  const handleCreate = () => {
    const translations = [];

    // Create translation for Russian if provided
    if (formData.ru.trim()) {
      translations.push({
        translationKey: formData.translationKey,
        languageCode: "ru",
        translationValue: formData.ru.trim(),
        description: formData.description,
        isActive: formData.isActive,
      });
    }

    // Create translation for English if provided
    if (formData.en.trim()) {
      translations.push({
        translationKey: formData.translationKey,
        languageCode: "en",
        translationValue: formData.en.trim(),
        description: formData.description,
        isActive: formData.isActive,
      });
    }

    // Create translation for Uzbek if provided
    if (formData.uz.trim()) {
      translations.push({
        translationKey: formData.translationKey,
        languageCode: "uz",
        translationValue: formData.uz.trim(),
        description: formData.description,
        isActive: formData.isActive,
      });
    }

    // Create all translations
    Promise.all(
      translations.map((translation) => createTranslation(translation))
    )
      .then(() => {
        setCreateModalOpened(false);
        setFormData({
          translationKey: "",
          ru: "",
          en: "",
          uz: "",
          description: "",
          isActive: true,
        });
      })
      .catch((error) => {
        console.error("Error creating translations:", error);
      });
  };

  // Handle edit translation for all languages
  const handleEdit = () => {
    if (selectedTranslation) {
      // Get all existing translations for this key
      const existingTranslations =
        (groupedTranslations?.[selectedTranslation.translationKey] as Record<
          string,
          Translation
        >) || {};

      const updatePromises = [];

      // Update Russian translation if it exists or if new value is provided
      if (existingTranslations["ru"] && formData.ru.trim()) {
        updatePromises.push(
          updateTranslation({
            id: existingTranslations["ru"].id,
            data: {
              translationKey: formData.translationKey,
              languageCode: "ru",
              translationValue: formData.ru.trim(),
              description: formData.description,
              isActive: formData.isActive,
            },
          })
        );
      } else if (formData.ru.trim() && !existingTranslations["ru"]) {
        // Create new Russian translation if it doesn't exist
        updatePromises.push(
          createTranslation({
            translationKey: formData.translationKey,
            languageCode: "ru",
            translationValue: formData.ru.trim(),
            description: formData.description,
            isActive: formData.isActive,
          })
        );
      }

      // Update English translation if it exists or if new value is provided
      if (existingTranslations["en"] && formData.en.trim()) {
        updatePromises.push(
          updateTranslation({
            id: existingTranslations["en"].id,
            data: {
              translationKey: formData.translationKey,
              languageCode: "en",
              translationValue: formData.en.trim(),
              description: formData.description,
              isActive: formData.isActive,
            },
          })
        );
      } else if (formData.en.trim() && !existingTranslations["en"]) {
        // Create new English translation if it doesn't exist
        updatePromises.push(
          createTranslation({
            translationKey: formData.translationKey,
            languageCode: "en",
            translationValue: formData.en.trim(),
            description: formData.description,
            isActive: formData.isActive,
          })
        );
      }

      // Update Uzbek translation if it exists or if new value is provided
      if (existingTranslations["uz"] && formData.uz.trim()) {
        updatePromises.push(
          updateTranslation({
            id: existingTranslations["uz"].id,
            data: {
              translationKey: formData.translationKey,
              languageCode: "uz",
              translationValue: formData.uz.trim(),
              description: formData.description,
              isActive: formData.isActive,
            },
          })
        );
      } else if (formData.uz.trim() && !existingTranslations["uz"]) {
        // Create new Uzbek translation if it doesn't exist
        updatePromises.push(
          createTranslation({
            translationKey: formData.translationKey,
            languageCode: "uz",
            translationValue: formData.uz.trim(),
            description: formData.description,
            isActive: formData.isActive,
          })
        );
      }

      // Execute all updates
      Promise.all(updatePromises)
        .then(() => {
          setEditModalOpened(false);
          setSelectedTranslation(null);
          setFormData({
            translationKey: "",
            ru: "",
            en: "",
            uz: "",
            description: "",
            isActive: true,
          });
        })
        .catch((error) => {
          console.error("Error updating translations:", error);
        });
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

    // Get all translations for this key to populate all language fields
    if (
      groupedTranslations &&
      groupedTranslations[translation.translationKey]
    ) {
      const langMap = groupedTranslations[translation.translationKey] as Record<
        string,
        Translation
      >;
      setFormData({
        translationKey: translation.translationKey,
        ru: langMap["ru"]?.translationValue || "",
        en: langMap["en"]?.translationValue || "",
        uz: langMap["uz"]?.translationValue || "",
        description: translation.description || "",
        isActive: translation.isActive,
      });
    } else {
      // Fallback if grouped data not available
      setFormData({
        translationKey: translation.translationKey,
        ru:
          translation.languageCode === "ru" ? translation.translationValue : "",
        en:
          translation.languageCode === "en" ? translation.translationValue : "",
        uz:
          translation.languageCode === "uz" ? translation.translationValue : "",
        description: translation.description || "",
        isActive: translation.isActive,
      });
    }
    setEditModalOpened(true);
  };

  // Open delete modal
  const openDeleteModal = (translation: Translation) => {
    setSelectedTranslation(translation);
    setDeleteModalOpened(true);
  };

  // Language change handler
  const handleLanguageChange = async (language: string) => {
    console.log(`🔄 TranslationManagement: Changing language to ${language}`);
    await changeLanguage(language);
    console.log(`🔄 TranslationManagement: Language changed to ${language}`);
  };

  return (
    <Box>
      <>
        <Group justify="space-between" mb="md">
          <Title order={2}>
            <IconLanguage size={24} style={{ marginRight: 8 }} />
            Translation Management
          </Title>
          <Group>
            {/* <Select
              value={currentLanguage}
              onChange={(value) => value && handleLanguageChange(value)}
              data={supportedLanguages.map((lang) => ({
                value: lang,
                label: lang.toUpperCase(),
              }))}
              size="sm"
            /> */}
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setCreateModalOpened(true)}
              color="blue"
              radius="xl"
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
            radius="xl"
          />
          <Button onClick={handleSearch} variant="outline" radius="xl">
            Search
          </Button>
        </Group>

        {/* Debug Info */}
        {/* <Box mb="md" p="xs" bg="gray.1" style={{ borderRadius: 4 }}>
          <Text size="xs" c="dimmed">
            Debug: groupedTranslationsLoading=
            {groupedTranslationsLoading.toString()}, groupedTranslations keys=
            {Object.keys(groupedTranslations || {}).length}, searchResults
            count={searchResults?.length || 0}
            {groupedTranslationsError &&
              `, Error: ${groupedTranslationsError.message}`}
          </Text>
        </Box> */}

        {/* Grouped Translations Table */}
        {groupedTranslations && Object.keys(groupedTranslations).length > 0 && (
          <>
            <Text size="lg" fw={600} mb="md">
              Grouped Translations by Key
            </Text>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Key</Table.Th>
                  <Table.Th>Russian (ru)</Table.Th>
                  <Table.Th>English (en)</Table.Th>
                  <Table.Th>Uzbek (uz)</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {Object.entries(groupedTranslations).map(([key, langMap]) => (
                  <Table.Tr key={key}>
                    <Table.Td>
                      <Text size="sm" fw={500}>
                        {key}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" style={{ maxWidth: 200 }} truncate>
                        {(langMap as Record<string, Translation>)["ru"]
                          ?.translationValue || "-"}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" style={{ maxWidth: 200 }} truncate>
                        {(langMap as Record<string, Translation>)["en"]
                          ?.translationValue || "-"}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" style={{ maxWidth: 200 }} truncate>
                        {(langMap as Record<string, Translation>)["uz"]
                          ?.translationValue || "-"}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          color="blue"
                          onClick={() =>
                            openEditModal(
                              Object.values(
                                langMap as Record<string, Translation>
                              )[0]
                            )
                          }
                          title="Edit Translation"
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          color="red"
                          onClick={() =>
                            openDeleteModal(
                              Object.values(
                                langMap as Record<string, Translation>
                              )[0]
                            )
                          }
                          title="Delete Translation"
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </>
        )}

        {/* Error state */}
        {groupedTranslationsError && (
          <Box p="md" bg="red.1" style={{ borderRadius: 4 }} mb="md">
            <Text c="red" size="sm">
              Error loading translations: {groupedTranslationsError.message}
            </Text>
          </Box>
        )}

        {/* Loading state */}
        {groupedTranslationsLoading && (
          <Text ta="center" c="dimmed" py="xl">
            Loading translations...
          </Text>
        )}

        {/* Empty state */}
        {!groupedTranslationsLoading &&
          !groupedTranslationsError &&
          (!searchResults || searchResults.length === 0) && (
            <Text ta="center" c="dimmed" py="xl">
              No translations found.
            </Text>
          )}
      </>

      {/* Create Modal */}
      <Modal
        opened={createModalOpened}
        onClose={() => setCreateModalOpened(false)}
        title="Add New Translation"
        size="lg"
        centered
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
          <TextInput
            label="Russian (ru)"
            placeholder="Enter Russian translation"
            value={formData.ru}
            onChange={(e) => setFormData({ ...formData, ru: e.target.value })}
          />
          <TextInput
            label="English (en)"
            placeholder="Enter English translation"
            value={formData.en}
            onChange={(e) => setFormData({ ...formData, en: e.target.value })}
          />
          <TextInput
            label="Uzbek (uz)"
            placeholder="Enter Uzbek translation"
            value={formData.uz}
            onChange={(e) => setFormData({ ...formData, uz: e.target.value })}
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
              disabled={
                !formData.translationKey ||
                (!formData.ru && !formData.en && !formData.uz)
              }
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
        title={`Edit Translation: ${selectedTranslation?.translationKey}`}
        size="lg"
        centered
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
            disabled
            description="Translation key cannot be changed after creation"
          />
          <TextInput
            label="Russian (ru)"
            placeholder="Enter Russian translation"
            value={formData.ru}
            onChange={(e) => setFormData({ ...formData, ru: e.target.value })}
          />
          <TextInput
            label="English (en)"
            placeholder="Enter English translation"
            value={formData.en}
            onChange={(e) => setFormData({ ...formData, en: e.target.value })}
          />
          <TextInput
            label="Uzbek (uz)"
            placeholder="Enter Uzbek translation"
            value={formData.uz}
            onChange={(e) => setFormData({ ...formData, uz: e.target.value })}
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
              disabled={
                !formData.translationKey ||
                (!formData.ru && !formData.en && !formData.uz)
              }
            >
              Update All Languages
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
        centered
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
