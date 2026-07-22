package com.example.exchange.service.impl;

import com.example.exchange.dto.ExchangeRateDto;
import com.example.exchange.service.ExchangeRateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Map;

/**
 * Uses Open Exchange Rate API (free, no API key).
 * Docs: https://www.exchangerate-api.com/docs/free
 * Example: https://open.er-api.com/v6/latest/USD
 *
 * Note: Frankfurter does NOT support UZS — that is why we switched.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ExchangeRateServiceImpl implements ExchangeRateService {

    private final RestTemplate restTemplate;

    @Value("${exchange-rate.api-url:https://open.er-api.com/v6/latest}")
    private String apiUrl;

    @Override
    @Cacheable(value = "exchangeRates", key = "#from + '-' + #to")
    @SuppressWarnings("unchecked")
    public ExchangeRateDto getLatestRate(String from, String to) {
        String base = normalizeCurrency(from, "USD");
        String target = normalizeCurrency(to, "UZS");

        if (base.equals(target)) {
            return ExchangeRateDto.builder()
                    .baseCurrency(base)
                    .targetCurrency(target)
                    .rate(1.0)
                    .rates(Collections.singletonMap(target, 1.0))
                    .fetchedAt(LocalDateTime.now())
                    .build();
        }

        log.info("Fetching exchange rate {} -> {}", base, target);

        try {
            // open.er-api.com/v6/latest/{BASE}
            String uri = apiUrl.endsWith("/")
                    ? apiUrl + base
                    : apiUrl + "/" + base;

            Map<String, Object> response = restTemplate.getForObject(uri, Map.class);
            if (response == null || response.get("rates") == null) {
                throw new IllegalStateException("Exchange rate data unavailable");
            }

            Object result = response.get("result");
            if (result != null && !"success".equalsIgnoreCase(String.valueOf(result))) {
                throw new IllegalStateException("Exchange rate provider returned: " + result);
            }

            Map<String, Object> ratesRaw = (Map<String, Object>) response.get("rates");
            Double rate = ratesRaw.get(target) instanceof Number
                    ? ((Number) ratesRaw.get(target)).doubleValue()
                    : null;

            if (rate == null) {
                throw new IllegalArgumentException("Currency not supported: " + target);
            }

            return ExchangeRateDto.builder()
                    .baseCurrency(base)
                    .targetCurrency(target)
                    .rate(rate)
                    .rates(Collections.singletonMap(target, rate))
                    .fetchedAt(LocalDateTime.now())
                    .build();

        } catch (IllegalArgumentException | IllegalStateException e) {
            throw e;
        } catch (HttpClientErrorException e) {
            log.error("Exchange rate API HTTP {}: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new IllegalStateException("Exchange rate service is unavailable. Try again later.");
        } catch (RestClientException e) {
            log.error("Exchange rate API failed: {}", e.getMessage());
            throw new IllegalStateException("Exchange rate service is unavailable. Try again later.");
        }
    }

    private String normalizeCurrency(String value, String defaultValue) {
        if (value == null || value.trim().isEmpty()) {
            return defaultValue;
        }
        return value.trim().toUpperCase();
    }
}
