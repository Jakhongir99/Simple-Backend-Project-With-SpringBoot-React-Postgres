package com.example.weather.controller;

import com.example.weather.dto.WeatherDto;
import com.example.weather.service.WeatherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Frontend calls: GET /api/weather/current?city=Tashkent
 *
 * Flow:
 * Frontend → this Controller → WeatherService → Open-Meteo (external) → DTO → Frontend
 *
 * No Repository: weather is not our database data.
 */
@RestController
@RequestMapping("/api/weather")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class WeatherController {

    private final WeatherService weatherService;

    @GetMapping("/current")
    public ResponseEntity<WeatherDto> getCurrentWeather(
            @RequestParam(defaultValue = "Tashkent") String city) {
        log.info("GET /api/weather/current?city={}", city);
        WeatherDto weather = weatherService.getCurrentWeather(city);
        return ResponseEntity.ok(weather);
    }
}
