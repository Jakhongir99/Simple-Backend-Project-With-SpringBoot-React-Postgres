import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Divider,
  Group,
  Loader,
  Modal,
  Pagination,
  Paper,
  Stack,
  Table,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import {
  IconBriefcase,
  IconCheck,
  IconEye,
  IconPlus,
  IconX,
} from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import {
  useHiringDecision,
  useHiringRequests,
  useSubmitHiring,
  type HiringAction,
  type HiringRequestDto,
} from "../hooks/useHiring";
import type { HiringStatus } from "./hiringBpmn";
import { BpmnDiagram } from "./BpmnDiagram";
import { clearFieldError, getFieldErrors } from "../utils/apiErrors";

const STATUS_META: Record<HiringStatus, { label: string; color: string }> = {
  SUBMITTED: { label: "HR ko'rib chiqmoqda", color: "yellow" },
  HR_APPROVED: { label: "Director ko'rib chiqmoqda", color: "blue" },
  HIRED: { label: "Ishga olindi", color: "green" },
  REJECTED_BY_HR: { label: "HR rad etdi", color: "red" },
  REJECTED_BY_DIRECTOR: { label: "Director rad etdi", color: "red" },
};

function extractRoleNames(user: unknown): string[] {
  if (!user || typeof user !== "object") return [];
  const u = user as Record<string, unknown>;
  const names = new Set<string>();

  if (u.role != null) {
    names.add(String(u.role).toUpperCase());
  }

  const roles = u.roles;
  if (Array.isArray(roles)) {
    for (const r of roles) {
      if (typeof r === "string") {
        names.add(r.toUpperCase());
      } else if (r && typeof r === "object" && "name" in r) {
        names.add(String((r as { name: unknown }).name).toUpperCase());
      }
    }
  }

  return Array.from(names).filter(Boolean);
}

export default function HiringWorkflowManagement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Always refresh roles when opening this page (role may have just been assigned).
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["currentUser"] });
  }, [queryClient]);

  const myRoles = useMemo(() => extractRoleNames(user), [user]);
  const isHr = myRoles.includes("HR") || myRoles.includes("ADMIN");
  const isDirector = myRoles.includes("DIRECTOR") || myRoles.includes("ADMIN");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const { data: requestsPage, isLoading } = useHiringRequests(
    currentPage - 1,
    pageSize
  );
  const requests = requestsPage?.content ?? [];
  const totalPages = requestsPage?.totalPages ?? 1;
  const submitMutation = useSubmitHiring();
  const decisionMutation = useHiringDecision();

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    candidateName: "",
    candidateEmail: "",
    position: "",
    department: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [pendingAction, setPendingAction] = useState<{
    action: HiringAction;
    label: string;
  } | null>(null);
  const [comment, setComment] = useState("");

  const selected = useMemo<HiringRequestDto | undefined>(
    () => requests?.find((r) => r.id === selectedId),
    [requests, selectedId]
  );

  const openView = (id: number) => {
    // Refresh roles right before deciding which buttons to show.
    queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    setSelectedId(id);
    setPendingAction(null);
    setComment("");
    setViewOpen(true);
  };

  const handleCreate = () => {
    if (!form.candidateName || !form.candidateEmail || !form.position) return;
    setFormErrors({});
    submitMutation.mutate(
      {
        candidateName: form.candidateName,
        candidateEmail: form.candidateEmail,
        position: form.position,
        department: form.department || undefined,
      },
      {
        onSuccess: () => {
          setCreateOpen(false);
          setFormErrors({});
          setForm({
            candidateName: "",
            candidateEmail: "",
            position: "",
            department: "",
          });
        },
        onError: (error) => {
          setFormErrors(getFieldErrors(error));
        },
      }
    );
  };

  const updateFormField = (
    field: keyof typeof form,
    value: string
  ) => {
    setForm({ ...form, [field]: value });
    setFormErrors((prev) => clearFieldError(prev, field));
  };

  const startDecision = (action: HiringAction, label: string) => {
    setComment("");
    setPendingAction({ action, label });
  };

  const isRejectAction =
    pendingAction?.action === "hr/reject" ||
    pendingAction?.action === "director/reject";

  const confirmDecision = () => {
    if (!selected || !pendingAction) return;
    if (isRejectAction && !comment.trim()) return;
    decisionMutation.mutate(
      {
        id: selected.id,
        action: pendingAction.action,
        comment: comment.trim() || undefined,
      },
      { onSuccess: () => setPendingAction(null) }
    );
  };

  const renderActions = () => {
    if (!selected) return null;

    if (pendingAction) {
      return (
        <Paper withBorder p="md" radius="md" bg="var(--mantine-color-gray-0)">
          <Stack gap="sm">
            <Text fw={600}>{pendingAction.label}</Text>
            <Textarea
              label="Izoh"
              description={
                isRejectAction
                  ? "Rad etish sababini yozing (majburiy)"
                  : "Qisqa izoh yozishingiz mumkin (ixtiyoriy)"
              }
              placeholder={
                isRejectAction
                  ? "Masalan: tajriba yetarli emas..."
                  : "Masalan: suhbat muvaffaqiyatli o'tdi..."
              }
              value={comment}
              onChange={(e) => setComment(e.currentTarget.value)}
              minRows={3}
              maxLength={500}
              required={isRejectAction}
              error={
                isRejectAction && !comment.trim()
                  ? "Rad etish uchun izoh majburiy"
                  : undefined
              }
            />
            <Group justify="flex-end">
              <Button variant="default" onClick={() => setPendingAction(null)}>
                Bekor
              </Button>
              <Button
                color={isRejectAction ? "red" : "green"}
                leftSection={
                  isRejectAction ? <IconX size={16} /> : <IconCheck size={16} />
                }
                onClick={confirmDecision}
                loading={decisionMutation.isPending}
                disabled={isRejectAction && !comment.trim()}
              >
                {isRejectAction ? "Rad etish" : "Tasdiqlash"}
              </Button>
            </Group>
          </Stack>
        </Paper>
      );
    }

    if (selected.status === "SUBMITTED" && isHr) {
      return (
        <Stack gap="xs">
          <Text size="sm" c="dimmed">
            HR qarori: tugmani bosing — izoh yozish maydoni ochiladi.
          </Text>
          <Group>
            <Button
              color="green"
              leftSection={<IconCheck size={16} />}
              onClick={() => startDecision("hr/approve", "HR: Tasdiqlash")}
            >
              Tasdiqlash
            </Button>
            <Button
              color="red"
              variant="light"
              leftSection={<IconX size={16} />}
              onClick={() => startDecision("hr/reject", "HR: Rad etish")}
            >
              Rad etish
            </Button>
          </Group>
        </Stack>
      );
    }
    if (selected.status === "HR_APPROVED" && isDirector) {
      return (
        <Stack gap="xs">
          <Text size="sm" c="dimmed">
            Director qarori: tugmani bosing — izoh yozish maydoni ochiladi.
          </Text>
          <Group>
            <Button
              color="green"
              leftSection={<IconCheck size={16} />}
              onClick={() =>
                startDecision("director/approve", "Director: Tasdiqlash")
              }
            >
              Tasdiqlash
            </Button>
            <Button
              color="red"
              variant="light"
              leftSection={<IconX size={16} />}
              onClick={() =>
                startDecision("director/reject", "Director: Rad etish")
              }
            >
              Rad etish
            </Button>
          </Group>
        </Stack>
      );
    }
    if (selected.status === "SUBMITTED" && !isHr) {
      return (
        <Text c="dimmed" size="sm">
          HR ko&apos;rib chiqishini kutmoqda. (Amal qilish uchun HR roli kerak.
          Hozirgi rollaringiz: {myRoles.join(", ") || "yo'q"})
        </Text>
      );
    }
    if (selected.status === "HR_APPROVED" && !isDirector) {
      return (
        <Text c="dimmed" size="sm">
          Director ko&apos;rib chiqishini kutmoqda. (Amal qilish uchun Director
          roli kerak. Hozirgi rollaringiz: {myRoles.join(", ") || "yo'q"})
        </Text>
      );
    }
    return (
      <Text c="dimmed" size="sm">
        Jarayon yakunlangan.
      </Text>
    );
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-end">
        <div>
          <Group gap="xs">
            <IconBriefcase size={26} color="var(--accent-color)" />
            <Title order={2}>Ishga olish jarayoni</Title>
          </Group>
          <Text c="dimmed" size="sm">
            Employee ariza beradi &rarr; HR ko&apos;rib chiqadi &rarr; Director
            yakuniy tasdiqlaydi. Sizning rollaringiz:{" "}
            <b>{myRoles.join(", ") || "USER"}</b>
            {isHr ? " — HR amallari ochiq" : ""}
            {isDirector ? " — Director amallari ochiq" : ""}
          </Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={() => setCreateOpen(true)}>
          Yangi ariza
        </Button>
      </Group>

      <Paper withBorder p="md" radius="md">
        <Title order={4} mb="sm">
          Arizalar
        </Title>
        <Text size="sm" c="dimmed" mb="sm">
          Nomzod ustiga bosing yoki &quot;Ko&apos;rish&quot; — u yerda BPMN va
          Tasdiqlash/Rad etish tugmalari chiqadi.
        </Text>
        {isLoading ? (
          <Group justify="center" p="lg">
            <Loader />
          </Group>
        ) : !requests || requests.length === 0 ? (
          <Text c="dimmed" size="sm">
            Hozircha ariza yo&apos;q. &quot;Yangi ariza&quot; tugmasini bosing.
          </Text>
        ) : (
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Nomzod</Table.Th>
                <Table.Th>Lavozim</Table.Th>
                <Table.Th>Bo&apos;lim</Table.Th>
                <Table.Th>Holat</Table.Th>
                <Table.Th></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {requests.map((r) => (
                <Table.Tr
                  key={r.id}
                  onClick={() => openView(r.id)}
                  style={{ cursor: "pointer" }}
                >
                  <Table.Td>{r.candidateName}</Table.Td>
                  <Table.Td>{r.position}</Table.Td>
                  <Table.Td>{r.department || "-"}</Table.Td>
                  <Table.Td>
                    <Badge color={STATUS_META[r.status].color} variant="light">
                      {STATUS_META[r.status].label}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Button
                      size="xs"
                      variant="subtle"
                      leftSection={<IconEye size={14} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        openView(r.id);
                      }}
                    >
                      Ko&apos;rish
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
        {totalPages > 1 && (
          <Group justify="center" mt="md">
            <Pagination
              total={totalPages}
              value={currentPage}
              onChange={setCurrentPage}
            />
          </Group>
        )}
      </Paper>

      <Modal
        opened={viewOpen}
        onClose={() => setViewOpen(false)}
        title={selected ? selected.candidateName : ""}
        size="xl"
        centered
      >
        {selected && (
          <Stack gap="sm">
            <Group justify="space-between">
              <Text fw={600} size="lg">
                {selected.position}
              </Text>
              <Badge
                size="lg"
                color={STATUS_META[selected.status].color}
                variant="light"
              >
                {STATUS_META[selected.status].label}
              </Badge>
            </Group>

            <Card withBorder radius="md" padding="sm">
              <SimpleInfo label="Email" value={selected.candidateEmail} />
              <SimpleInfo label="Bo'lim" value={selected.department || "-"} />
              <SimpleInfo
                label="Ariza bergan"
                value={selected.submittedBy || "-"}
              />
              {selected.hrDecidedBy && (
                <SimpleInfo
                  label="HR qarori"
                  value={`${selected.hrDecidedBy}${
                    selected.hrComment ? ` — ${selected.hrComment}` : ""
                  }`}
                />
              )}
              {selected.directorDecidedBy && (
                <SimpleInfo
                  label="Director qarori"
                  value={`${selected.directorDecidedBy}${
                    selected.directorComment
                      ? ` — ${selected.directorComment}`
                      : ""
                  }`}
                />
              )}
            </Card>

            <BpmnDiagram status={selected.status} />

            <Divider my="xs" label="Amallar" labelPosition="left" />
            {renderActions()}
          </Stack>
        )}
      </Modal>

      <Modal
        opened={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setFormErrors({});
        }}
        title="Yangi ishga olish arizasi"
        centered
      >
        <Stack>
          <TextInput
            label="Nomzod ismi"
            required
            value={form.candidateName}
            error={formErrors.candidateName}
            onChange={(e) =>
              updateFormField("candidateName", e.currentTarget.value)
            }
          />
          <TextInput
            label="Nomzod email"
            required
            value={form.candidateEmail}
            error={formErrors.candidateEmail}
            onChange={(e) =>
              updateFormField("candidateEmail", e.currentTarget.value)
            }
          />
          <TextInput
            label="Lavozim"
            required
            value={form.position}
            error={formErrors.position}
            onChange={(e) => updateFormField("position", e.currentTarget.value)}
          />
          <TextInput
            label="Bo'lim"
            value={form.department}
            error={formErrors.department}
            onChange={(e) =>
              updateFormField("department", e.currentTarget.value)
            }
          />
          <Group justify="flex-end">
            <Button
              variant="default"
              onClick={() => {
                setCreateOpen(false);
                setFormErrors({});
              }}
            >
              Bekor qilish
            </Button>
            <Button onClick={handleCreate} loading={submitMutation.isPending}>
              Yuborish
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

function SimpleInfo({ label, value }: { label: string; value: string }) {
  return (
    <Group justify="space-between" wrap="nowrap" mb={4}>
      <Text size="sm" c="dimmed">
        {label}
      </Text>
      <Text size="sm" fw={500} style={{ textAlign: "right" }}>
        {value}
      </Text>
    </Group>
  );
}
