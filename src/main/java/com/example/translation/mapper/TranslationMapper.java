package com.example.translation.mapper;

import com.example.translation.dto.CreateTranslationRequest;
import com.example.translation.dto.TranslationDto;
import com.example.translation.dto.UpdateTranslationRequest;
import com.example.translation.entity.Translation;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface TranslationMapper {
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Translation toEntity(CreateTranslationRequest request);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(@MappingTarget Translation translation, UpdateTranslationRequest request);
    
    TranslationDto toDto(Translation translation);
}
