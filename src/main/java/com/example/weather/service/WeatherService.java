package com.example.weather.service;

import com.example.weather.dto.WeatherDto;

public interface WeatherService {

    /**
     * Fetch current weather for a city from an external weather API.
     * No database / repository is used — data comes from a third-party HTTP service.
     */
    WeatherDto getCurrentWeather(String city);
}
