package com.example.exchange.service;

import com.example.exchange.dto.ExchangeRateDto;

public interface ExchangeRateService {

    ExchangeRateDto getLatestRate(String from, String to);
}
