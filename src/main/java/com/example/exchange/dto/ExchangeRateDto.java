package com.example.exchange.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExchangeRateDto {
    private String baseCurrency;
    private String targetCurrency;
    private Double rate;
    private LocalDateTime fetchedAt;
    private Map<String, Double> rates;
}
