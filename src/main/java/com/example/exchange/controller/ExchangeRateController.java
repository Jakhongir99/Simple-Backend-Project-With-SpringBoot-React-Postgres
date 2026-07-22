package com.example.exchange.controller;

import com.example.exchange.dto.ExchangeRateDto;
import com.example.exchange.service.ExchangeRateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/exchange-rates")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class ExchangeRateController {

    private final ExchangeRateService exchangeRateService;

    @GetMapping("/latest")
    public ResponseEntity<ExchangeRateDto> getLatest(
            @RequestParam(defaultValue = "USD") String from,
            @RequestParam(defaultValue = "UZS") String to) {
        log.info("GET /api/exchange-rates/latest?from={}&to={}", from, to);
        return ResponseEntity.ok(exchangeRateService.getLatestRate(from, to));
    }
}
