import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  Group,
  Loader,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconCloud, IconRefresh, IconSearch } from "@tabler/icons-react";
import { useCurrentWeather } from "../hooks/useWeather";

const CITY_PRESETS = ["Tashkent", "Samarkand", "Bukhara", "London", "Dubai"];

export default function WeatherView() {
  const [cityInput, setCityInput] = useState("Tashkent");
  const [city, setCity] = useState("Tashkent");

  const { data, isLoading, isFetching, error, refetch } = useCurrentWeather(city);

  const search = () => {
    if (!cityInput.trim()) return;
    setCity(cityInput.trim());
  };

  return (
    <Stack gap="lg">
      <div>
        <Group gap="xs">
          <IconCloud size={26} color="var(--accent-color)" />
          <Title order={2}>Ob-havo</Title>
        </Group>
        <Text c="dimmed" size="sm" mt={4}>
          Frontend → <code>/api/weather/current</code> → Backend Service →
          Open-Meteo (tashqi API). Repository yo&apos;q — ma&apos;lumot DB&apos;da
          saqlanmaydi.
        </Text>
      </div>

      <Card withBorder radius="md" padding="md">
        <Group align="flex-end" wrap="wrap">
          <TextInput
            label="Shahar"
            placeholder="masalan: Tashkent"
            value={cityInput}
            onChange={(e) => setCityInput(e.currentTarget.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            style={{ flex: 1, minWidth: 200 }}
          />
          <Button leftSection={<IconSearch size={16} />} onClick={search}>
            Qidirish
          </Button>
          <Button
            variant="light"
            leftSection={<IconRefresh size={16} />}
            onClick={() => refetch()}
            loading={isFetching}
          >
            Yangilash
          </Button>
        </Group>

        <Group gap="xs" mt="sm">
          {CITY_PRESETS.map((c) => (
            <Button
              key={c}
              size="compact-sm"
              variant={city === c ? "filled" : "default"}
              onClick={() => {
                setCityInput(c);
                setCity(c);
              }}
            >
              {c}
            </Button>
          ))}
        </Group>
      </Card>

      {isLoading ? (
        <Group justify="center" p="xl">
          <Loader />
        </Group>
      ) : error ? (
        <Card withBorder padding="md" radius="md">
          <Text c="red" fw={500}>
            Xatolik:{" "}
            {(error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ||
              (error as Error).message ||
              "Ob-havo olinmadi"}
          </Text>
        </Card>
      ) : data ? (
        <Card withBorder padding="lg" radius="md">
          <Group justify="space-between" mb="md">
            <div>
              <Title order={3}>
                {data.city}
                {data.country ? `, ${data.country}` : ""}
              </Title>
              <Text size="sm" c="dimmed">
                {data.latitude?.toFixed(2)}, {data.longitude?.toFixed(2)}
              </Text>
            </div>
            <Badge size="lg" variant="light">
              {data.description}
            </Badge>
          </Group>

          <Group gap="xl" align="flex-start">
            <div>
              <Text size="sm" c="dimmed">
                Harorat
              </Text>
              <Text fw={700} style={{ fontSize: 42, lineHeight: 1.1 }}>
                {data.temperatureC?.toFixed(1)}°C
              </Text>
            </div>
            <Stack gap={4}>
              <Text size="sm">
                Namlik: <b>{data.humidityPercent ?? "—"}%</b>
              </Text>
              <Text size="sm">
                Shamol: <b>{data.windSpeedKmh?.toFixed(1) ?? "—"} km/h</b>
              </Text>
              <Text size="sm" c="dimmed">
                Vaqt: {data.observedAt || "—"}
              </Text>
            </Stack>
          </Group>
        </Card>
      ) : null}
    </Stack>
  );
}
