package com.example.controller;

import com.example.service.CacheManagementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/cache")
@Tag(name = "Cache Management", description = "Cache management operations")
public class CacheController {

    private final CacheManagementService cacheManagementService;

    public CacheController(CacheManagementService cacheManagementService) {
        this.cacheManagementService = cacheManagementService;
    }

    @GetMapping("/names")
    @Operation(summary = "Get all cache names", description = "Retrieve all available cache names")
    public ResponseEntity<Collection<String>> getCacheNames() {
        return ResponseEntity.ok(cacheManagementService.getCacheNames());
    }

    @DeleteMapping("/all")
    @Operation(summary = "Clear all caches", description = "Clear all application caches")
    public ResponseEntity<Map<String, String>> clearAllCaches() {
        cacheManagementService.clearAllCaches();
        Map<String, String> response = new HashMap<>();
        response.put("message", "All caches cleared successfully");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{cacheName}")
    @Operation(summary = "Clear specific cache", description = "Clear a specific cache by name")
    public ResponseEntity<Map<String, String>> clearCache(@PathVariable String cacheName) {
        cacheManagementService.clearCache(cacheName);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Cache '" + cacheName + "' cleared successfully");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/users")
    @Operation(summary = "Clear user caches", description = "Clear all user-related caches")
    public ResponseEntity<Map<String, String>> clearUserCaches() {
        cacheManagementService.clearUserCaches();
        Map<String, String> response = new HashMap<>();
        response.put("message", "User caches cleared successfully");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/roles")
    @Operation(summary = "Clear role caches", description = "Clear all role-related caches")
    public ResponseEntity<Map<String, String>> clearRoleCaches() {
        cacheManagementService.clearRoleCaches();
        Map<String, String> response = new HashMap<>();
        response.put("message", "Role caches cleared successfully");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/translations")
    @Operation(summary = "Clear translation caches", description = "Clear all translation-related caches")
    public ResponseEntity<Map<String, String>> clearTranslationCaches() {
        cacheManagementService.clearTranslationCaches();
        Map<String, String> response = new HashMap<>();
        response.put("message", "Translation caches cleared successfully");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/files")
    @Operation(summary = "Clear file caches", description = "Clear all file-related caches")
    public ResponseEntity<Map<String, String>> clearFileCaches() {
        cacheManagementService.clearFileCaches();
        Map<String, String> response = new HashMap<>();
        response.put("message", "File caches cleared successfully");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/weather")
    @Operation(summary = "Clear weather caches", description = "Clear weather API caches")
    public ResponseEntity<Map<String, String>> clearWeatherCaches() {
        cacheManagementService.clearWeatherCaches();
        Map<String, String> response = new HashMap<>();
        response.put("message", "Weather caches cleared successfully");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/exchange-rates")
    @Operation(summary = "Clear exchange rate caches", description = "Clear exchange rate API caches")
    public ResponseEntity<Map<String, String>> clearExchangeRateCaches() {
        cacheManagementService.clearExchangeRateCaches();
        Map<String, String> response = new HashMap<>();
        response.put("message", "Exchange rate caches cleared successfully");
        return ResponseEntity.ok(response);
    }
}
