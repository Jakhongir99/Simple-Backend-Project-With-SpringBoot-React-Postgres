package com.example.translation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.Size;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTranslationRequest {
    
    @Size(max = 255, message = "Translation key cannot exceed 255 characters")
    private String translationKey;
    
    @Size(min = 2, max = 5, message = "Language code must be between 2 and 5 characters")
    private String languageCode;
    
    private String translationValue;
    
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;
    
    private Boolean isActive;
}
