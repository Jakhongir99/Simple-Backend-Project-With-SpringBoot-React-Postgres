package com.example.translation.service;

import com.example.translation.dto.CreateTranslationRequest;
import com.example.translation.dto.UpdateTranslationRequest;
import com.example.translation.dto.TranslationDto;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface TranslationService {

    TranslationDto createTranslation(CreateTranslationRequest request);
    
    TranslationDto updateTranslation(Long id, UpdateTranslationRequest request);
    
    void deleteTranslation(Long id);
    
    Optional<TranslationDto> getTranslationById(Long id);
    
    Optional<TranslationDto> getTranslationByKeyAndLanguage(String translationKey, String languageCode);
    
    List<TranslationDto> getTranslationsByLanguage(String languageCode);
    
    List<TranslationDto> getAllActiveTranslations();
    
    List<TranslationDto> searchTranslations(String keyword);
    
    List<TranslationDto> searchTranslationsByLanguage(String languageCode, String keyword);
    
    Map<String, String> getTranslationsMapForLanguage(String languageCode);
    
    List<String> getAllActiveTranslationKeys();
    
    List<String> getAvailableLanguages();
    
    boolean existsByKeyAndLanguage(String translationKey, String languageCode);
    
    void bulkCreateTranslations(List<CreateTranslationRequest> requests);
    
    void bulkUpdateTranslations(Map<Long, UpdateTranslationRequest> updates);
}
