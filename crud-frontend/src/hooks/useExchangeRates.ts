import { useQuery } from "@tanstack/react-query";
import api from "../utils/api";

export interface ExchangeRateDto {
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  fetchedAt: string;
  rates?: Record<string, number>;
}

export const useExchangeRate = (from = "USD", to = "UZS", enabled = true) =>
  useQuery({
    queryKey: ["exchange-rate", from, to],
    queryFn: async (): Promise<ExchangeRateDto> => {
      const res = await api.get("/exchange-rates/latest", { params: { from, to } });
      return res.data;
    },
    enabled: enabled && !!localStorage.getItem("token"),
    staleTime: 10 * 60 * 1000,
  });
