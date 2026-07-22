package com.example.exchange.service.impl;

import com.example.exchange.dto.ExchangeRateDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ExchangeRateServiceImplTest {

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private ExchangeRateServiceImpl exchangeRateService;

    @Test
    void getLatestRate_sameCurrency_returnsOne() {
        ExchangeRateDto result = exchangeRateService.getLatestRate("USD", "USD");

        assertEquals(1.0, result.getRate());
        assertEquals("USD", result.getBaseCurrency());
        assertEquals("USD", result.getTargetCurrency());
    }

    @Test
    void getLatestRate_success_returnsRate() {
        ReflectionTestUtils.setField(exchangeRateService, "apiUrl", "https://open.er-api.com/v6/latest");

        Map<String, Object> rates = new HashMap<>();
        rates.put("UZS", 11930.5);
        rates.put("EUR", 0.87);

        Map<String, Object> response = new HashMap<>();
        response.put("result", "success");
        response.put("base_code", "USD");
        response.put("rates", rates);

        when(restTemplate.getForObject(contains("/USD"), eq(Map.class))).thenReturn(response);

        ExchangeRateDto result = exchangeRateService.getLatestRate("usd", "uzs");

        assertEquals("USD", result.getBaseCurrency());
        assertEquals("UZS", result.getTargetCurrency());
        assertEquals(11930.5, result.getRate());
    }

    @Test
    void getLatestRate_unsupportedCurrency_throws() {
        ReflectionTestUtils.setField(exchangeRateService, "apiUrl", "https://open.er-api.com/v6/latest");

        Map<String, Object> response = new HashMap<>();
        response.put("result", "success");
        response.put("rates", new HashMap<String, Object>());

        when(restTemplate.getForObject(anyString(), eq(Map.class))).thenReturn(response);

        assertThrows(IllegalArgumentException.class,
                () -> exchangeRateService.getLatestRate("USD", "XXX"));
    }
}
