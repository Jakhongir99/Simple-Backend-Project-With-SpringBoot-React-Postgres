package com.example.translation.controller;

import com.example.translation.dto.CreateTranslationRequest;
import com.example.translation.dto.UpdateTranslationRequest;
import com.example.translation.dto.TranslationDto;
import com.example.translation.service.TranslationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/translations")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class TranslationController {

    private final TranslationService translationService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TranslationDto>> getAllTranslations() {
        try {
            List<TranslationDto> translations = translationService.getAllActiveTranslations();
            return ResponseEntity.ok(translations);
        } catch (Exception e) {
            log.error("Error getting all translations: {}", e.getMessage());
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
    @PreAuthorize("hasRole('ADMIN')")
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
    @PreAuthorize("hasRole('ADMIN')")
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
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TranslationDto> updateTranslation(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTranslationRequest request) {
        try {
            TranslationDto updatedTranslation = translationService.updateTranslation(id, request);
            return ResponseEntity.ok(updatedTranslation);
        } catch (Exception e) {
            log.error("Error updating translation with ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
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
    @PreAuthorize("hasRole('ADMIN')")
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
    @PreAuthorize("hasRole('ADMIN')")
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
    @PreAuthorize("hasRole('ADMIN')")
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
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> bulkCreateTranslations(@Valid @RequestBody List<CreateTranslationRequest> requests) {
        try {
            translationService.bulkCreateTranslations(requests);
            return ResponseEntity.status(HttpStatus.CREATED).build();
        } catch (Exception e) {
            log.error("Error bulk creating translations: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/bulk")
    @PreAuthorize("hasRole('ADMIN')")
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
