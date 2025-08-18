import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  Group,
  Text,
  TextInput,
  Textarea,
  Switch,
  FileInput,
  Pagination,
  ActionIcon,
  Modal,
  Stack,
  Badge,
  Grid,
  Select,
  Alert,
  LoadingOverlay,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconUpload,
  IconDownload,
  IconTrash,
  IconEdit,
  IconEye,
  IconEyeOff,
} from "@tabler/icons-react";
import { useAuth } from "../hooks/useAuth";

interface FileDto {
  id: number;
  originalFileName: string;
  storedFileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  mimeType: string;
  description: string;
  uploadedBy: string;
  isPublic: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  downloadUrl?: string;
  fileSizeFormatted?: string;
  uploadDateFormatted?: string;
}

interface FileUploadRequest {
  description: string;
  isPublic: boolean;
}

const FileManagement: React.FC = () => {
  const { token } = useAuth();
  const [files, setFiles] = useState<FileDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadModalOpened, setUploadModalOpened] = useState(false);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileDto | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [fileTypeFilter, setFileTypeFilter] = useState<string>("");
  const [uploadForm, setUploadForm] = useState<FileUploadRequest>({
    description: "",
    isPublic: false,
  });
  const [selectedFileForUpload, setSelectedFileForUpload] =
    useState<File | null>(null);

  const pageSize = 10;

  useEffect(() => {
    if (token) {
      loadFiles();
    }
  }, [token, currentPage, searchKeyword, fileTypeFilter]);

  const loadFiles = async () => {
    if (!token) return;

    setLoading(true);
    try {
      let url = `/api/files/my-files?page=${currentPage - 1}&size=${pageSize}`;

      if (searchKeyword) {
        url = `/api/files/search?keyword=${encodeURIComponent(
          searchKeyword
        )}&page=${currentPage - 1}&size=${pageSize}`;
      } else if (fileTypeFilter) {
        url = `/api/files/type/${fileTypeFilter}?page=${
          currentPage - 1
        }&size=${pageSize}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFiles(data.content || []);
        setTotalPages(data.totalPages || 1);
      } else {
        notifications.show({
          title: "Error",
          message: "Failed to load files",
          color: "red",
        });
      }
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to load files",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFileForUpload || !token) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFileForUpload);
      formData.append("description", uploadForm.description);
      formData.append("isPublic", uploadForm.isPublic.toString());

      const response = await fetch("/api/files/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        notifications.show({
          title: "Success",
          message: "File uploaded successfully",
          color: "green",
        });
        setUploadModalOpened(false);
        setUploadForm({ description: "", isPublic: false });
        setSelectedFileForUpload(null);
        loadFiles();
      } else {
        const errorData = await response.json();
        notifications.show({
          title: "Error",
          message: errorData.message || "Failed to upload file",
          color: "red",
        });
      }
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to upload file",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileDownload = async (fileId: number) => {
    if (!token) return;

    try {
      const response = await fetch(`/api/files/download/${fileId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download =
          files.find((f) => f.id === fileId)?.originalFileName || "download";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        notifications.show({
          title: "Error",
          message: "Failed to download file",
          color: "red",
        });
      }
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to download file",
        color: "red",
      });
    }
  };

  const handleFileDelete = async (fileId: number) => {
    if (!token) return;

    if (!confirm("Are you sure you want to delete this file?")) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        notifications.show({
          title: "Success",
          message: "File deleted successfully",
          color: "green",
        });
        loadFiles();
      } else {
        notifications.show({
          title: "Error",
          message: "Failed to delete file",
          color: "red",
        });
      }
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to delete file",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async (fileId: number) => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/files/${fileId}/toggle-visibility`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        notifications.show({
          title: "Success",
          message: "File visibility updated",
          color: "green",
        });
        loadFiles();
      } else {
        notifications.show({
          title: "Error",
          message: "Failed to update file visibility",
          color: "red",
        });
      }
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to update file visibility",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditFile = async () => {
    if (!selectedFile || !token) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/files/${selectedFile.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(uploadForm),
      });

      if (response.ok) {
        notifications.show({
          title: "Success",
          message: "File updated successfully",
          color: "green",
        });
        setEditModalOpened(false);
        setSelectedFile(null);
        setUploadForm({ description: "", isPublic: false });
        loadFiles();
      } else {
        const errorData = await response.json();
        notifications.show({
          title: "Error",
          message: errorData.message || "Failed to update file",
          color: "red",
        });
      }
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to update file",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (file: FileDto) => {
    setSelectedFile(file);
    setUploadForm({
      description: file.description,
      isPublic: file.isPublic,
    });
    setEditModalOpened(true);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const getFileIcon = (fileType: string): string => {
    const type = fileType.toLowerCase();
    if (["pdf"].includes(type)) return "📄";
    if (["doc", "docx"].includes(type)) return "📝";
    if (["jpg", "jpeg", "png", "gif"].includes(type)) return "🖼️";
    if (["xls", "xlsx"].includes(type)) return "📊";
    if (["zip", "rar"].includes(type)) return "📦";
    return "📁";
  };

  return (
    <Box p="md">
      <LoadingOverlay visible={loading} />

      <Group position="apart" mb="lg">
        <Text size="xl" weight={700}>
          File Management
        </Text>
        <Button
          leftIcon={<IconUpload size={16} />}
          onClick={() => setUploadModalOpened(true)}
          color="blue"
        >
          Upload File
        </Button>
      </Group>

      {/* Search and Filters */}
      <Card mb="lg" withBorder>
        <Grid>
          <Grid.Col span={6}>
            <TextInput
              placeholder="Search files..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              icon={<IconEye size={16} />}
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <Select
              placeholder="File Type"
              value={fileTypeFilter}
              onChange={(value) => setFileTypeFilter(value || "")}
              data={[
                { value: "", label: "All Types" },
                { value: "pdf", label: "PDF" },
                { value: "doc", label: "Word Documents" },
                { value: "xls", label: "Excel Files" },
                { value: "jpg", label: "Images" },
                { value: "zip", label: "Archives" },
              ]}
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <Button
              variant="outline"
              onClick={() => {
                setSearchKeyword("");
                setFileTypeFilter("");
                setCurrentPage(1);
              }}
              fullWidth
            >
              Clear Filters
            </Button>
          </Grid.Col>
        </Grid>
      </Card>

      {/* Files List */}
      {files.length === 0 ? (
        <Card withBorder>
          <Text align="center" color="dimmed" py="xl">
            No files found. Upload your first file to get started!
          </Text>
        </Card>
      ) : (
        <>
          <Grid>
            {files.map((file) => (
              <Grid.Col key={file.id} span={12} md={6} lg={4}>
                <Card withBorder>
                  <Group position="apart" mb="xs">
                    <Text size="lg">{getFileIcon(file.fileType)}</Text>
                    <Badge color={file.isPublic ? "green" : "blue"}>
                      {file.isPublic ? "Public" : "Private"}
                    </Badge>
                  </Group>

                  <Text weight={500} size="sm" mb="xs" lineClamp={2}>
                    {file.originalFileName}
                  </Text>

                  <Text size="xs" color="dimmed" mb="xs">
                    {file.description}
                  </Text>

                  <Text size="xs" color="dimmed" mb="md">
                    Size: {formatFileSize(file.fileSize)} • Uploaded:{" "}
                    {formatDate(file.createdAt)}
                  </Text>

                  <Group position="apart">
                    <Group>
                      <ActionIcon
                        color="blue"
                        onClick={() => handleFileDownload(file.id)}
                        title="Download"
                      >
                        <IconDownload size={16} />
                      </ActionIcon>

                      <ActionIcon
                        color="gray"
                        onClick={() => openEditModal(file)}
                        title="Edit"
                      >
                        <IconEdit size={16} />
                      </ActionIcon>

                      <ActionIcon
                        color={file.isPublic ? "orange" : "green"}
                        onClick={() => handleToggleVisibility(file.id)}
                        title={file.isPublic ? "Make Private" : "Make Public"}
                      >
                        {file.isPublic ? (
                          <IconEyeOff size={16} />
                        ) : (
                          <IconEye size={16} />
                        )}
                      </ActionIcon>
                    </Group>

                    <ActionIcon
                      color="red"
                      onClick={() => handleFileDelete(file.id)}
                      title="Delete"
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Card>
              </Grid.Col>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Group position="center" mt="lg">
              <Pagination
                total={totalPages}
                page={currentPage}
                onChange={setCurrentPage}
                size="sm"
              />
            </Group>
          )}
        </>
      )}

      {/* Upload Modal */}
      <Modal
        opened={uploadModalOpened}
        onClose={() => setUploadModalOpened(false)}
        title="Upload File"
        size="md"
      >
        <Stack>
          <FileInput
            label="Select File"
            placeholder="Choose a file to upload"
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.xls,.xlsx,.zip,.rar"
            value={selectedFileForUpload}
            onChange={setSelectedFileForUpload}
            required
          />

          <Textarea
            label="Description"
            placeholder="Enter file description"
            value={uploadForm.description}
            onChange={(e) =>
              setUploadForm({ ...uploadForm, description: e.target.value })
            }
            required
          />

          <Switch
            label="Make file public"
            checked={uploadForm.isPublic}
            onChange={(e) =>
              setUploadForm({
                ...uploadForm,
                isPublic: e.currentTarget.checked,
              })
            }
          />

          <Group position="right">
            <Button
              variant="outline"
              onClick={() => setUploadModalOpened(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleFileUpload}
              disabled={!selectedFileForUpload}
            >
              Upload
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Edit Modal */}
      <Modal
        opened={editModalOpened}
        onClose={() => setEditModalOpened(false)}
        title="Edit File"
        size="md"
      >
        <Stack>
          <Text size="sm" color="dimmed">
            File: {selectedFile?.originalFileName}
          </Text>

          <Textarea
            label="Description"
            placeholder="Enter file description"
            value={uploadForm.description}
            onChange={(e) =>
              setUploadForm({ ...uploadForm, description: e.target.value })
            }
            required
          />

          <Switch
            label="Make file public"
            checked={uploadForm.isPublic}
            onChange={(e) =>
              setUploadForm({
                ...uploadForm,
                isPublic: e.currentTarget.checked,
              })
            }
          />

          <Group position="right">
            <Button variant="outline" onClick={() => setEditModalOpened(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditFile}>Update</Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
};

export default FileManagement;
