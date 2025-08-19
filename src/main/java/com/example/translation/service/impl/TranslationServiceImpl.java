package com.example.translation.service.impl;

import com.example.translation.dto.BulkTranslationResult;
import com.example.translation.dto.CreateTranslationRequest;
import com.example.translation.dto.UpdateTranslationRequest;
import com.example.translation.dto.TranslationDto;
import com.example.translation.entity.Translation;
import com.example.translation.mapper.TranslationMapper;
import com.example.translation.repository.TranslationRepository;
import com.example.translation.service.TranslationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityNotFoundException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TranslationServiceImpl implements TranslationService {

    private final TranslationRepository translationRepository;
    private final TranslationMapper translationMapper;

    @Override
    public TranslationDto createTranslation(CreateTranslationRequest request) {
        log.info("Creating new translation: {} for language: {}", request.getTranslationKey(), request.getLanguageCode());

        if (translationRepository.existsByTranslationKeyAndLanguageCode(request.getTranslationKey(), request.getLanguageCode())) {
            throw new IllegalArgumentException("Translation with key '" + request.getTranslationKey() + "' already exists for language '" + request.getLanguageCode() + "'");
        }

        Translation translation = translationMapper.toEntity(request);

        Translation savedTranslation = translationRepository.save(translation);
        log.info("Translation created successfully with ID: {}", savedTranslation.getId());

        return translationMapper.toDto(savedTranslation);
    }

    @Override
    public TranslationDto updateTranslation(Long id, UpdateTranslationRequest request) {
        log.info("Updating translation with ID: {}", id);

        Translation translation = translationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Translation not found with ID: " + id));

        // Validation simplified - translation key field is disabled in frontend
        if (request.getTranslationKey() != null && request.getLanguageCode() != null) {
            if (!request.getTranslationKey().equals(translation.getTranslationKey()) || 
                !request.getLanguageCode().equals(translation.getLanguageCode())) {
                
                if (translationRepository.existsByTranslationKeyAndLanguageCode(request.getTranslationKey(), request.getLanguageCode())) {
                    throw new IllegalArgumentException("Translation with key '" + request.getTranslationKey() + "' already exists for language '" + request.getLanguageCode() + "'");
                }
            }
        } else if (request.getTranslationKey() != null && !request.getTranslationKey().equals(translation.getTranslationKey())) {
            if (translationRepository.existsByTranslationKeyAndLanguageCode(request.getTranslationKey(), translation.getLanguageCode())) {
                throw new IllegalArgumentException("Translation with key '" + request.getTranslationKey() + "' already exists for language '" + translation.getLanguageCode() + "'");
            }
        } else if (request.getLanguageCode() != null && !request.getLanguageCode().equals(translation.getLanguageCode())) {
            if (translationRepository.existsByTranslationKeyAndLanguageCode(translation.getTranslationKey(), request.getLanguageCode())) {
                throw new IllegalArgumentException("Translation with key '" + translation.getTranslationKey() + "' already exists for language '" + request.getLanguageCode() + "'");
            }
        }

        // Update translation using mapper
        translationMapper.updateEntity(translation, request);

        translation.setUpdatedAt(LocalDateTime.now());
        Translation updatedTranslation = translationRepository.save(translation);

        log.info("Translation updated successfully with ID: {}", id);
        return translationMapper.toDto(updatedTranslation);
    }

    @Override
    public void deleteTranslation(Long id) {
        log.info("Deleting translation with ID: {}", id);

        Translation translation = translationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Translation not found with ID: " + id));

        // Soft delete
        translation.setIsActive(false);
        translation.setUpdatedAt(LocalDateTime.now());
        translationRepository.save(translation);

        log.info("Translation deleted successfully with ID: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<TranslationDto> getTranslationById(Long id) {
        return translationRepository.findById(id).map(translationMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<TranslationDto> getTranslationByKeyAndLanguage(String translationKey, String languageCode) {
        return translationRepository.findByTranslationKeyAndLanguageCode(translationKey, languageCode).map(translationMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TranslationDto> getTranslationsByLanguage(String languageCode) {
        return translationRepository.findByLanguageCodeAndIsActiveTrue(languageCode)
                .stream()
                .map(translationMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TranslationDto> getAllActiveTranslations() {
        return translationRepository.findByIsActiveTrue()
                .stream()
                .map(translationMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Map<String, TranslationDto>> getGroupedTranslationsByKey() {
        List<Translation> translations = translationRepository.findByIsActiveTrue();
        
        // Group translations by key, then by language code
        return translations.stream()
                .collect(Collectors.groupingBy(
                    Translation::getTranslationKey,
                    Collectors.toMap(
                        Translation::getLanguageCode,
                        translationMapper::toDto
                    )
                ));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TranslationDto> searchTranslations(String keyword) {
        return translationRepository.findBySearchTerm(keyword)
                .stream()
                .map(translationMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TranslationDto> searchTranslationsByLanguage(String languageCode, String keyword) {
        return translationRepository.findByLanguageAndSearchTerm(languageCode, keyword)
                .stream()
                .map(translationMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, String> getTranslationsMapForLanguage(String languageCode) {
        List<Translation> translations = translationRepository.findByLanguageCodeAndIsActiveTrue(languageCode);
        Map<String, String> translationsMap = new HashMap<>();
        
        for (Translation translation : translations) {
            translationsMap.put(translation.getTranslationKey(), translation.getTranslationValue());
        }
        
        return translationsMap;
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getAllActiveTranslationKeys() {
        return translationRepository.findAllActiveTranslationKeys();
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getAvailableLanguages() {
        return translationRepository.findDistinctLanguageCodes();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByKeyAndLanguage(String translationKey, String languageCode) {
        return translationRepository.existsByTranslationKeyAndLanguageCode(translationKey, languageCode);
    }

    @Override
    public BulkTranslationResult bulkCreateTranslations(List<CreateTranslationRequest> requests) {
        log.info("Bulk creating {} translations", requests.size());
        
        int createdCount = 0;
        int skippedCount = 0;
        int errorCount = 0;
        
        for (CreateTranslationRequest request : requests) {
            try {
                // Check if translation already exists
                if (translationRepository.existsByTranslationKeyAndLanguageCode(request.getTranslationKey(), request.getLanguageCode())) {
                    log.info("Translation already exists for key: {} and language: {}, skipping", 
                        request.getTranslationKey(), request.getLanguageCode());
                    skippedCount++;
                    continue; // Skip existing translations instead of throwing error
                }
                
                createTranslation(request);
                createdCount++;
            } catch (Exception e) {
                log.error("Error creating translation for key: {} and language: {}", 
                    request.getTranslationKey(), request.getLanguageCode(), e);
                errorCount++;
                // Don't throw the exception, just log it and continue with other translations
                continue;
            }
        }
        
        BulkTranslationResult result = BulkTranslationResult.builder()
            .totalRequested(requests.size())
            .created(createdCount)
            .skipped(skippedCount)
            .errors(errorCount)
            .build();
            
        log.info("Bulk translation creation completed: {}", result);
        return result;
    }

    @Override
    public void bulkUpdateTranslations(Map<Long, UpdateTranslationRequest> updates) {
        log.info("Bulk updating {} translations", updates.size());
        
        for (Map.Entry<Long, UpdateTranslationRequest> entry : updates.entrySet()) {
            try {
                updateTranslation(entry.getKey(), entry.getValue());
            } catch (Exception e) {
                log.error("Error updating translation with ID: {}", entry.getKey(), e);
                throw e;
            }
        }
        
        log.info("Bulk translation update completed");
    }


}
