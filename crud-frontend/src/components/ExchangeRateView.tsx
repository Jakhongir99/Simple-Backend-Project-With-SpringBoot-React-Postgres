import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  Group,
  Loader,
  Select,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconArrowsExchange } from "@tabler/icons-react";
import { useExchangeRate } from "../hooks/useExchangeRates";

const CURRENCIES = [
  { value: "USD", label: "USD — AQSh dollari" },
  { value: "EUR", label: "EUR — Yevro" },
  { value: "RUB", label: "RUB — Rubl" },
  { value: "UZS", label: "UZS — O'zbek so'mi" },
  { value: "GBP", label: "GBP — Funt sterling" },
];

export default function ExchangeRateView() {
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("UZS");

  const { data, isLoading, isError, refetch, isFetching } = useExchangeRate(from, to);

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Group gap="sm">
          <IconArrowsExchange size={28} />
          <Title order={2}>Valyuta kursi</Title>
        </Group>
        <Badge color="blue" variant="light">
          Frankfurter API
        </Badge>
      </Group>

      <Card withBorder padding="lg" radius="md">
        <Stack gap="md">
          <Group grow>
            <Select
              label="Dan (from)"
              data={CURRENCIES}
              value={from}
              onChange={(v) => v && setFrom(v)}
            />
            <Select
              label="Ga (to)"
              data={CURRENCIES}
              value={to}
              onChange={(v) => v && setTo(v)}
            />
          </Group>

          <Button onClick={() => refetch()} loading={isFetching}>
            Kursni yangilash
          </Button>
        </Stack>
      </Card>

      {isLoading && (
        <Group justify="center" p="xl">
          <Loader />
        </Group>
      )}

      {isError && (
        <Text c="red">Kurs olinmadi. Keyinroq qayta urinib ko'ring.</Text>
      )}

      {data && (
        <Card withBorder padding="xl" radius="md" bg="var(--bg-secondary)">
          <Stack gap="xs" align="center">
            <Text size="sm" c="dimmed">
              1 {data.baseCurrency} =
            </Text>
            <Title order={1} c="var(--accent-color)">
              {data.rate?.toLocaleString(undefined, { maximumFractionDigits: 4 })}{" "}
              {data.targetCurrency}
            </Title>
            <Text size="xs" c="dimmed">
              Yangilangan: {new Date(data.fetchedAt).toLocaleString()}
            </Text>
          </Stack>
        </Card>
      )}
    </Stack>
  );
}
