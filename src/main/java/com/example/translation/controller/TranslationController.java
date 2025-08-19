package com.example.translation.controller;

import com.example.translation.dto.BulkTranslationResult;
import com.example.translation.dto.CreateTranslationRequest;
import com.example.translation.dto.UpdateTranslationRequest;
import com.example.translation.dto.TranslationDto;
import com.example.translation.service.TranslationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/translations")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class TranslationController {

    private final TranslationService translationService;

    @GetMapping
    public ResponseEntity<List<TranslationDto>> getAllTranslations() {
        try {
            List<TranslationDto> translations = translationService.getAllActiveTranslations();
            return ResponseEntity.ok(translations);
        } catch (Exception e) {
            log.error("Error getting all translations: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/grouped")
    public ResponseEntity<Map<String, Map<String, TranslationDto>>> getGroupedTranslations() {
        try {
            Map<String, Map<String, TranslationDto>> groupedTranslations = translationService.getGroupedTranslationsByKey();
            return ResponseEntity.ok(groupedTranslations);
        } catch (Exception e) {
            log.error("Error getting grouped translations: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/language/{languageCode}")
    public ResponseEntity<List<TranslationDto>> getTranslationsByLanguage(@PathVariable String languageCode) {
        try {
            List<TranslationDto> translations = translationService.getTranslationsByLanguage(languageCode);
            return ResponseEntity.ok(translations);
        } catch (Exception e) {
            log.error("Error getting translations for language {}: {}", languageCode, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/language/{languageCode}/map")
    public ResponseEntity<Map<String, String>> getTranslationsMapForLanguage(@PathVariable String languageCode) {
        try {
            Map<String, String> translationsMap = translationService.getTranslationsMapForLanguage(languageCode);
            return ResponseEntity.ok(translationsMap);
        } catch (Exception e) {
            log.error("Error getting translations map for language {}: {}", languageCode, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<TranslationDto> getTranslationById(@PathVariable Long id) {
        try {
            Optional<TranslationDto> translation = translationService.getTranslationById(id);
            return translation.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error getting translation by ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/key/{translationKey}/language/{languageCode}")
    public ResponseEntity<TranslationDto> getTranslationByKeyAndLanguage(
            @PathVariable String translationKey,
            @PathVariable String languageCode) {
        try {
            Optional<TranslationDto> translation = translationService.getTranslationByKeyAndLanguage(translationKey, languageCode);
            return translation.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error getting translation for key {} and language {}: {}", translationKey, languageCode, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    public ResponseEntity<TranslationDto> createTranslation(@Valid @RequestBody CreateTranslationRequest request) {
        try {
            TranslationDto createdTranslation = translationService.createTranslation(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdTranslation);
        } catch (Exception e) {
            log.error("Error creating translation: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<TranslationDto> updateTranslation(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTranslationRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            log.info("🔧 Updating translation with ID: {}, request: {}", id, request);
            log.info("🔧 Authorization header: {}", authHeader != null ? "present" : "absent");
            
            // Debug authentication details
            org.springframework.security.core.Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            log.info("🔧 Current authentication: {}", auth);
            if (auth != null) {
                log.info("🔧 User: {}, Authorities: {}", auth.getName(), auth.getAuthorities());
                log.info("🔧 Has ROLE_USER: {}", auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_USER")));
                log.info("🔧 Has ROLE_ADMIN: {}", auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")));
            } else {
                log.warn("🔧 No authentication found in SecurityContext!");
            }
            
            TranslationDto updatedTranslation = translationService.updateTranslation(id, request);
            return ResponseEntity.ok(updatedTranslation);
        } catch (Exception e) {
            log.error("Error updating translation with ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTranslation(@PathVariable Long id) {
        try {
            translationService.deleteTranslation(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Error deleting translation with ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<TranslationDto>> searchTranslations(@RequestParam String keyword) {
        try {
            List<TranslationDto> translations = translationService.searchTranslations(keyword);
            return ResponseEntity.ok(translations);
        } catch (Exception e) {
            log.error("Error searching translations: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/search/language/{languageCode}")
    public ResponseEntity<List<TranslationDto>> searchTranslationsByLanguage(
            @PathVariable String languageCode,
            @RequestParam String keyword) {
        try {
            List<TranslationDto> translations = translationService.searchTranslationsByLanguage(languageCode, keyword);
            return ResponseEntity.ok(translations);
        } catch (Exception e) {
            log.error("Error searching translations for language {}: {}", languageCode, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/keys")
    public ResponseEntity<List<String>> getAllTranslationKeys() {
        try {
            List<String> keys = translationService.getAllActiveTranslationKeys();
            return ResponseEntity.ok(keys);
        } catch (Exception e) {
            log.error("Error getting translation keys: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/languages")
    public ResponseEntity<List<String>> getAvailableLanguages() {
        try {
            List<String> languages = translationService.getAvailableLanguages();
            return ResponseEntity.ok(languages);
        } catch (Exception e) {
            log.error("Error getting available languages: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Translation API is working!");
    }

    @GetMapping("/debug/auth")
    public ResponseEntity<Map<String, Object>> debugAuthentication() {
        try {
            org.springframework.security.core.Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Map<String, Object> debugInfo = new HashMap<>();
            debugInfo.put("authenticated", auth != null && auth.isAuthenticated());
            debugInfo.put("principal", auth != null ? auth.getPrincipal() : null);
            debugInfo.put("authorities", auth != null ? auth.getAuthorities().stream().map(a -> a.getAuthority()).collect(Collectors.toList()) : null);
            debugInfo.put("details", auth != null ? auth.getDetails() : null);
            debugInfo.put("requestURI", "debug endpoint called");
            
            log.info("🔍 Debug auth info: {}", debugInfo);
            return ResponseEntity.ok(debugInfo);
        } catch (Exception e) {
            log.error("Error getting auth debug info: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/debug/user")
    public ResponseEntity<Map<String, Object>> debugCurrentUser() {
        try {
            org.springframework.security.core.Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Map<String, Object> debugInfo = new HashMap<>();
            
            if (auth != null && auth.isAuthenticated()) {
                debugInfo.put("username", auth.getName());
                debugInfo.put("authorities", auth.getAuthorities().stream().map(a -> a.getAuthority()).collect(Collectors.toList()));
                debugInfo.put("hasRoleUser", auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_USER")));
                debugInfo.put("hasRoleAdmin", auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")));
                debugInfo.put("canUpdate", auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_USER") || a.getAuthority().equals("ROLE_ADMIN")));
            } else {
                debugInfo.put("authenticated", false);
            }
            
            log.info("🔍 Debug user info: {}", debugInfo);
            return ResponseEntity.ok(debugInfo);
        } catch (Exception e) {
            log.error("Error getting user debug info: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/exists/key/{translationKey}/language/{languageCode}")
    public ResponseEntity<Boolean> checkTranslationExists(
            @PathVariable String translationKey,
            @PathVariable String languageCode) {
        try {
            boolean exists = translationService.existsByKeyAndLanguage(translationKey, languageCode);
            return ResponseEntity.ok(exists);
        } catch (Exception e) {
            log.error("Error checking translation existence: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/bulk")
    public ResponseEntity<BulkTranslationResult> bulkCreateTranslations(@Valid @RequestBody List<CreateTranslationRequest> requests) {
        try {
            BulkTranslationResult result = translationService.bulkCreateTranslations(requests);
            
            // Return 201 Created if new translations were created, 200 OK if all were skipped
            if (result.hasNewTranslations()) {
                return ResponseEntity.status(HttpStatus.CREATED).body(result);
            } else {
                return ResponseEntity.ok(result);
            }
        } catch (Exception e) {
            log.error("Error bulk creating translations: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/bulk")
    public ResponseEntity<Void> bulkUpdateTranslations(@RequestBody Map<Long, UpdateTranslationRequest> updates) {
        try {
            translationService.bulkUpdateTranslations(updates);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error bulk updating translations: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
