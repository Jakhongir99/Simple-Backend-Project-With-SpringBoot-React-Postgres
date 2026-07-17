import { useEffect, useMemo, useRef, useState } from "react";
import {
  Badge,
  Button,
  Group,
  Loader,
  Modal,
  Paper,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import {
  IconDeviceFloppy,
  IconDownload,
  IconPlus,
  IconSitemap,
  IconSparkles,
  IconTrash,
  IconUpload,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import {
  useCreateProcess,
  useDeleteProcess,
  useGenerateFromPrompt,
  useProcesses,
  useUpdateProcess,
  type WorkflowProcessDto,
} from "../hooks/useProcesses";
import { BpmnEditor, type BpmnEditorHandle } from "./BpmnEditor";
import { clearFieldError, getFieldErrors } from "../utils/apiErrors";

const PROMPT_EXAMPLES = [
  "Employee ariza beradi → HR ko'rib chiqadi → Director tasdiqlaydi. Rad etsa tugaydi",
  "1. Ta'til so'rovi\n2. Rahbar ko'rib chiqadi\n3. HR qayd qiladi",
  "Xarid so'rovi → Moliya tekshiradi → Director tasdiqlaydi → Omborga yetkaziladi",
];

export default function ProcessManagement() {
  const { data: processes, isLoading } = useProcesses();
  const createMutation = useCreateProcess();
  const updateMutation = useUpdateProcess();
  const deleteMutation = useDeleteProcess();
  const promptMutation = useGenerateFromPrompt();

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ processKey: "", name: "" });
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [promptForm, setPromptForm] = useState({
    prompt: PROMPT_EXAMPLES[0],
    name: "",
  });
  const [promptErrors, setPromptErrors] = useState<Record<string, string>>({});

  const editorRef = useRef<BpmnEditorHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editorKey, setEditorKey] = useState(0);
  const [editorXml, setEditorXml] = useState<string | null>(null);

  const selected = useMemo<WorkflowProcessDto | undefined>(
    () => processes?.find((p) => p.id === selectedId),
    [processes, selectedId]
  );

  useEffect(() => {
    if (!selectedId && processes && processes.length > 0) {
      setSelectedId(processes[0].id);
    }
  }, [processes, selectedId]);

  useEffect(() => {
    if (selected) {
      setName(selected.name);
      setEditorXml(null); // use saved XML until a file is uploaded
    }
  }, [selected]);

  const handleSave = async () => {
    if (!selected || !editorRef.current) return;
    const bpmnXml = await editorRef.current.getXml();
    updateMutation.mutate({ id: selected.id, payload: { name, bpmnXml } });
  };

  const handleUploadClick = () => {
    if (!selected) {
      notifications.show({
        title: "Eslatma",
        message: "Avval chapdan jarayon tanlang, keyin BPMN XML yuklang",
        color: "yellow",
      });
      return;
    }
    fileInputRef.current?.click();
  };

  const handleUploadFile = async (file: File | null) => {
    if (!file || !selected) return;

    const lower = file.name.toLowerCase();
    if (!lower.endsWith(".bpmn") && !lower.endsWith(".xml")) {
      notifications.show({
        title: "Xatolik",
        message: "Faqat .bpmn yoki .xml fayl yuklash mumkin",
        color: "red",
      });
      return;
    }

    try {
      const text = await file.text();
      if (
        !text.includes("bpmn:definitions") &&
        !text.includes("<definitions")
      ) {
        notifications.show({
          title: "Xatolik",
          message: "Fayl BPMN XML ga o'xshamaydi",
          color: "red",
        });
        return;
      }

      setEditorXml(text);
      setEditorKey((k) => k + 1);

      updateMutation.mutate(
        { id: selected.id, payload: { bpmnXml: text } },
        {
          onSuccess: () => {
            notifications.show({
              title: "Yuklandi",
              message: `${file.name} jarayonga qo'llandi`,
              color: "green",
            });
          },
        }
      );
    } catch (e) {
      console.error(e);
      notifications.show({
        title: "Xatolik",
        message: "Faylni o'qib bo'lmadi",
        color: "red",
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDownloadXml = async () => {
    if (!selected) return;
    try {
      const bpmnXml = editorRef.current
        ? await editorRef.current.getXml()
        : editorXml ?? selected.bpmnXml;
      if (!bpmnXml?.trim()) {
        notifications.show({
          title: "Xatolik",
          message: "Yuklab olish uchun BPMN XML topilmadi",
          color: "red",
        });
        return;
      }
      const safeName = (selected.processKey || selected.name || "process")
        .replace(/[^\w\-]+/g, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase();
      const blob = new Blob([bpmnXml], {
        type: "application/xml;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${safeName || "process"}.bpmn`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      notifications.show({
        title: "Yuklab olindi",
        message: `${safeName}.bpmn fayli saqlandi`,
        color: "green",
      });
    } catch (e) {
      console.error(e);
      notifications.show({
        title: "Xatolik",
        message: "BPMN XML yuklab olinmadi",
        color: "red",
      });
    }
  };

  const handleCreate = () => {
    if (!createForm.processKey || !createForm.name) return;
    setCreateErrors({});
    createMutation.mutate(
      { processKey: createForm.processKey, name: createForm.name },
      {
        onSuccess: (created) => {
          setCreateOpen(false);
          setCreateForm({ processKey: "", name: "" });
          setCreateErrors({});
          setSelectedId(created.id);
        },
        onError: (error) => setCreateErrors(getFieldErrors(error)),
      }
    );
  };

  const handlePromptCreate = () => {
    if (!promptForm.prompt.trim()) return;
    setPromptErrors({});
    promptMutation.mutate(
      {
        prompt: promptForm.prompt.trim(),
        name: promptForm.name.trim() || undefined,
      },
      {
        onSuccess: (created) => {
          setPromptOpen(false);
          setPromptForm({ prompt: PROMPT_EXAMPLES[0], name: "" });
          setPromptErrors({});
          setSelectedId(created.id);
        },
        onError: (error) => setPromptErrors(getFieldErrors(error)),
      }
    );
  };

  const handleDelete = () => {
    if (!selected) return;
    if (!window.confirm(`"${selected.name}" jarayonini o'chirasizmi?`)) return;
    deleteMutation.mutate(selected.id, {
      onSuccess: () => setSelectedId(null),
    });
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-end">
        <div>
          <Group gap="xs">
            <IconSitemap size={26} color="var(--accent-color)" />
            <Title order={2}>Jarayonlar</Title>
          </Group>
          <Text c="dimmed" size="sm">
            Jarayonni tanlang, BPMN sxemasini tahrirlang va saqlang. Yoki
            prompt yozib avtomatik diagramma yarating.
          </Text>
        </div>
        <Group>
          <Button
            variant="light"
            leftSection={<IconSparkles size={16} />}
            onClick={() => setPromptOpen(true)}
          >
            Prompt bilan yaratish
          </Button>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setCreateOpen(true)}
          >
            Yangi jarayon
          </Button>
        </Group>
      </Group>

      <Group align="flex-start" gap="md" wrap="nowrap" style={{ width: "100%" }}>
        <Paper withBorder p="sm" radius="md" style={{ width: 260, flexShrink: 0 }}>
          <Title order={5} mb="xs">
            Ro&apos;yxat
          </Title>
          {isLoading ? (
            <Group justify="center" p="md">
              <Loader size="sm" />
            </Group>
          ) : (
            <Stack gap={4}>
              {processes?.map((p) => (
                <Button
                  key={p.id}
                  variant={p.id === selectedId ? "filled" : "subtle"}
                  justify="flex-start"
                  fullWidth
                  size="sm"
                  onClick={() => setSelectedId(p.id)}
                >
                  {p.name}
                </Button>
              ))}
              {processes?.length === 0 && (
                <Text c="dimmed" size="sm">
                  Jarayon yo&apos;q.
                </Text>
              )}
            </Stack>
          )}
        </Paper>

        <Paper withBorder p="md" radius="md" style={{ flex: 1, minWidth: 0 }}>
          {!selected ? (
            <Text c="dimmed">Jarayon tanlang.</Text>
          ) : (
            <Stack gap="sm">
              <Group justify="space-between" wrap="nowrap">
                <TextInput
                  label="Nomi"
                  value={name}
                  onChange={(e) => setName(e.currentTarget.value)}
                  style={{ flex: 1 }}
                />
                <Badge variant="light" mt={22}>
                  key: {selected.processKey}
                </Badge>
              </Group>

              <BpmnEditor
                key={`${selected.id}-${editorKey}`}
                ref={editorRef}
                xml={editorXml ?? selected.bpmnXml}
              />

              <input
                ref={fileInputRef}
                type="file"
                accept=".bpmn,.xml,application/xml,text/xml"
                style={{ display: "none" }}
                onChange={(e) =>
                  handleUploadFile(e.target.files?.[0] ?? null)
                }
              />

              <Group justify="flex-end">
                <Button
                  variant="light"
                  leftSection={<IconUpload size={16} />}
                  onClick={handleUploadClick}
                  loading={updateMutation.isPending}
                >
                  Upload
                </Button>
                <Button
                  variant="light"
                  leftSection={<IconDownload size={16} />}
                  onClick={handleDownloadXml}
                >
                  Download
                </Button>
                <Button
                  color="red"
                  variant="light"
                  leftSection={<IconTrash size={16} />}
                  onClick={handleDelete}
                  loading={deleteMutation.isPending}
                >
                  O&apos;chirish
                </Button>
                <Button
                  leftSection={<IconDeviceFloppy size={16} />}
                  onClick={handleSave}
                  loading={updateMutation.isPending}
                >
                  Saqlash
                </Button>
              </Group>
            </Stack>
          )}
        </Paper>
      </Group>

      <Modal
        opened={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setCreateErrors({});
        }}
        title="Yangi jarayon"
        centered
      >
        <Stack>
          <TextInput
            label="Key (lotincha, bo'sh joysiz)"
            placeholder="masalan: onboarding"
            value={createForm.processKey}
            error={createErrors.processKey}
            onChange={(e) => {
              setCreateForm({
                ...createForm,
                processKey: e.currentTarget.value.trim(),
              });
              setCreateErrors((prev) => clearFieldError(prev, "processKey"));
            }}
            required
          />
          <TextInput
            label="Nomi"
            placeholder="masalan: Yangi xodim onboarding"
            value={createForm.name}
            error={createErrors.name}
            onChange={(e) => {
              setCreateForm({ ...createForm, name: e.currentTarget.value });
              setCreateErrors((prev) => clearFieldError(prev, "name"));
            }}
            required
          />
          <Group justify="flex-end">
            <Button
              variant="default"
              onClick={() => {
                setCreateOpen(false);
                setCreateErrors({});
              }}
            >
              Bekor qilish
            </Button>
            <Button onClick={handleCreate} loading={createMutation.isPending}>
              Yaratish
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={promptOpen}
        onClose={() => {
          setPromptOpen(false);
          setPromptErrors({});
        }}
        title="Prompt bilan BPMN yaratish"
        size="lg"
        centered
      >
        <Stack>
          <Text size="sm" c="dimmed">
            Jarayonni oddiy matnda yozing. Bosqichlarni{" "}
            <b>→</b> yoki <b>-&gt;</b> bilan ajrating, yoki raqamlangan
            ro&apos;yxat qiling. &quot;Rad&quot; / &quot;tasdiq&quot; so&apos;zlari
            bo&apos;lsa, qaror gateway qo&apos;shiladi.
          </Text>

          <Textarea
            label="Prompt"
            minRows={5}
            maxRows={16}
            autosize
            description={`${promptForm.prompt.length} / 20000 belgi`}
            value={promptForm.prompt}
            error={promptErrors.prompt}
            onChange={(e) => {
              setPromptForm({ ...promptForm, prompt: e.currentTarget.value });
              setPromptErrors((prev) => clearFieldError(prev, "prompt"));
            }}
            required
          />

          <TextInput
            label="Nomi (ixtiyoriy)"
            placeholder="Bo'sh qoldirsangiz prompt'dan olinadi"
            value={promptForm.name}
            error={promptErrors.name}
            onChange={(e) => {
              setPromptForm({ ...promptForm, name: e.currentTarget.value });
              setPromptErrors((prev) => clearFieldError(prev, "name"));
            }}
          />

          <div>
            <Text size="sm" fw={500} mb={6}>
              Misollar
            </Text>
            <Stack gap={6}>
              {PROMPT_EXAMPLES.map((ex) => (
                <Button
                  key={ex}
                  variant="default"
                  size="compact-sm"
                  justify="flex-start"
                  styles={{
                    root: {
                      height: "auto",
                      padding: "8px 12px",
                      whiteSpace: "normal",
                      textAlign: "left",
                    },
                    label: { whiteSpace: "pre-wrap" },
                  }}
                  onClick={() => setPromptForm({ ...promptForm, prompt: ex })}
                >
                  {ex}
                </Button>
              ))}
            </Stack>
          </div>

          <Group justify="flex-end">
            <Button variant="default" onClick={() => setPromptOpen(false)}>
              Bekor qilish
            </Button>
            <Button
              leftSection={<IconSparkles size={16} />}
              onClick={handlePromptCreate}
              loading={promptMutation.isPending}
              disabled={promptForm.prompt.trim().length < 5}
            >
              BPMN yaratish
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
