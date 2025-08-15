package com.example.translation.repository;

import com.example.translation.entity.Translation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TranslationRepository extends JpaRepository<Translation, Long> {

    List<Translation> findByLanguageCode(String languageCode);
    
    List<Translation> findByLanguageCodeAndIsActiveTrue(String languageCode);
    
    Optional<Translation> findByTranslationKeyAndLanguageCode(String translationKey, String languageCode);
    
    List<Translation> findByTranslationKey(String translationKey);
    
    List<Translation> findByIsActiveTrue();
    
    @Query("SELECT t FROM Translation t WHERE t.languageCode = :languageCode AND t.isActive = true")
    List<Translation> findActiveTranslationsByLanguage(@Param("languageCode") String languageCode);
    
    @Query("SELECT DISTINCT t.translationKey FROM Translation t WHERE t.isActive = true")
    List<String> findAllActiveTranslationKeys();
    
    @Query("SELECT DISTINCT t.languageCode FROM Translation t WHERE t.isActive = true")
    List<String> findDistinctLanguageCodes();
    
    @Query("SELECT t FROM Translation t WHERE t.translationKey LIKE %:search% OR t.translationValue LIKE %:search% OR t.description LIKE %:search%")
    List<Translation> findBySearchTerm(@Param("search") String search);
    
    @Query("SELECT t FROM Translation t WHERE t.languageCode = :languageCode AND (t.translationKey LIKE %:search% OR t.translationValue LIKE %:search% OR t.description LIKE %:search%)")
    List<Translation> findByLanguageAndSearchTerm(@Param("languageCode") String languageCode, @Param("search") String search);
    
    boolean existsByTranslationKeyAndLanguageCode(String translationKey, String languageCode);
    
    @Query("SELECT t FROM Translation t WHERE t.translationKey = :translationKey AND t.languageCode = :languageCode AND t.id != :excludeId")
    Optional<Translation> findByTranslationKeyAndLanguageCodeExcludingId(
            @Param("translationKey") String translationKey, 
            @Param("languageCode") String languageCode, 
            @Param("excludeId") Long excludeId);
}
