package com.example.weather.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Clean weather payload for the frontend.
 * External Open-Meteo JSON is mapped into this DTO in the service layer.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeatherDto {

    private String city;
    private String country;
    private Double latitude;
    private Double longitude;
    private Double temperatureC;
    private Integer humidityPercent;
    private Double windSpeedKmh;
    private Integer weatherCode;
    private String description;
    private String observedAt;
}
