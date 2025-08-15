package com.example.translation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTranslationRequest {
    
    @NotBlank(message = "Translation key is required")
    @Size(max = 255, message = "Translation key cannot exceed 255 characters")
    private String translationKey;
    
    @NotBlank(message = "Language code is required")
    @Size(min = 2, max = 5, message = "Language code must be between 2 and 5 characters")
    private String languageCode;
    
    @NotBlank(message = "Translation value is required")
    private String translationValue;
    
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;
    
    private Boolean isActive = true;
}
