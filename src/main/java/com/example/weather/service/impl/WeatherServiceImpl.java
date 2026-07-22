package com.example.weather.service.impl;

import com.example.weather.dto.WeatherDto;
import com.example.weather.service.WeatherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Map;

/**
 * Calls Open-Meteo (free, no API key):
 * 1) Geocoding API — city name → latitude/longitude
 * 2) Forecast API  — coordinates → current weather
 *
 * Repository is NOT needed: we do not store weather rows in our DB.
 * RestTemplate = "axios for Java backend".
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class WeatherServiceImpl implements WeatherService {

    private final RestTemplate restTemplate;

    @Value("${weather.geocoding-url:https://geocoding-api.open-meteo.com/v1/search}")
    private String geocodingUrl;

    @Value("${weather.forecast-url:https://api.open-meteo.com/v1/forecast}")
    private String forecastUrl;

    @Override
    @Cacheable(value = "weather", key = "#city.trim().toLowerCase()")
    @SuppressWarnings("unchecked")
    public WeatherDto getCurrentWeather(String city) {
        if (city == null || city.trim().isEmpty()) {
            throw new IllegalArgumentException("City name is required");
        }

        String cityName = city.trim();
        log.info("Fetching weather for city: {}", cityName);

        try {
            // Step 1: city → coordinates
            String geoUri = UriComponentsBuilder.fromHttpUrl(geocodingUrl)
                    .queryParam("name", cityName)
                    .queryParam("count", 1)
                    .queryParam("language", "en")
                    .queryParam("format", "json")
                    .toUriString();

            Map<String, Object> geoResponse = restTemplate.getForObject(geoUri, Map.class);
            if (geoResponse == null || geoResponse.get("results") == null) {
                throw new IllegalArgumentException("City not found: " + cityName);
            }

            List<Map<String, Object>> results = (List<Map<String, Object>>) geoResponse.get("results");
            if (results == null || results.isEmpty()) {
                throw new IllegalArgumentException("City not found: " + cityName);
            }

            Map<String, Object> place = results.get(0);
            double latitude = ((Number) place.get("latitude")).doubleValue();
            double longitude = ((Number) place.get("longitude")).doubleValue();
            String resolvedCity = place.get("name") != null ? String.valueOf(place.get("name")) : cityName;
            String country = place.get("country") != null ? String.valueOf(place.get("country")) : null;

            // Step 2: coordinates → current weather
            String weatherUri = UriComponentsBuilder.fromHttpUrl(forecastUrl)
                    .queryParam("latitude", latitude)
                    .queryParam("longitude", longitude)
                    .queryParam("current", "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m")
                    .queryParam("timezone", "auto")
                    .toUriString();

            Map<String, Object> weatherResponse = restTemplate.getForObject(weatherUri, Map.class);
            if (weatherResponse == null || weatherResponse.get("current") == null) {
                throw new IllegalStateException("Weather data unavailable for: " + resolvedCity);
            }

            Map<String, Object> current = (Map<String, Object>) weatherResponse.get("current");

            Integer weatherCode = current.get("weather_code") != null
                    ? ((Number) current.get("weather_code")).intValue()
                    : null;

            return WeatherDto.builder()
                    .city(resolvedCity)
                    .country(country)
                    .latitude(latitude)
                    .longitude(longitude)
                    .temperatureC(asDouble(current.get("temperature_2m")))
                    .humidityPercent(asInteger(current.get("relative_humidity_2m")))
                    .windSpeedKmh(asDouble(current.get("wind_speed_10m")))
                    .weatherCode(weatherCode)
                    .description(describeWeatherCode(weatherCode))
                    .observedAt(current.get("time") != null ? String.valueOf(current.get("time")) : null)
                    .build();

        } catch (IllegalArgumentException | IllegalStateException e) {
            throw e;
        } catch (RestClientException e) {
            log.error("External weather API failed for {}: {}", cityName, e.getMessage());
            throw new IllegalStateException("External weather service is unavailable. Try again later.");
        }
    }

    private Double asDouble(Object value) {
        return value instanceof Number ? ((Number) value).doubleValue() : null;
    }

    private Integer asInteger(Object value) {
        return value instanceof Number ? ((Number) value).intValue() : null;
    }

    /** Simple WMO weather code → human text (Open-Meteo codes). */
    private String describeWeatherCode(Integer code) {
        if (code == null) return "Noma'lum";
        if (code == 0) return "Ochiq osmon";
        if (code <= 3) return "Asosan ochiq / bulutli";
        if (code <= 48) return "Tuman";
        if (code <= 57) return "Mayda yomg'ir";
        if (code <= 67) return "Yomg'ir";
        if (code <= 77) return "Qor";
        if (code <= 82) return "Kuchli yomg'ir";
        if (code <= 86) return "Kuchli qor";
        if (code <= 99) return "Momaqaldiroq";
        return "Noma'lum";
    }
}
