import { useQuery } from "@tanstack/react-query";
import api from "../utils/api";

export interface WeatherDto {
  city: string;
  country?: string;
  latitude: number;
  longitude: number;
  temperatureC: number;
  humidityPercent?: number;
  windSpeedKmh?: number;
  weatherCode?: number;
  description: string;
  observedAt?: string;
}

export const useCurrentWeather = (city: string, enabled = true) =>
  useQuery({
    queryKey: ["weather", "current", city],
    queryFn: async (): Promise<WeatherDto> => {
      const res = await api.get("/weather/current", { params: { city } });
      return res.data;
    },
    enabled: enabled && !!city.trim() && !!localStorage.getItem("token"),
    staleTime: 5 * 60 * 1000,
  });
