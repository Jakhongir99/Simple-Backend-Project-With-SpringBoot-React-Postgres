package com.example.hiring.mapper;

import com.example.hiring.dto.CreateHiringRequest;
import com.example.hiring.dto.HiringRequestDto;
import com.example.hiring.entity.HiringRequest;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface HiringMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "submittedBy", ignore = true)
    @Mapping(target = "hrComment", ignore = true)
    @Mapping(target = "hrDecidedBy", ignore = true)
    @Mapping(target = "hrDecidedAt", ignore = true)
    @Mapping(target = "directorComment", ignore = true)
    @Mapping(target = "directorDecidedBy", ignore = true)
    @Mapping(target = "directorDecidedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    HiringRequest toEntity(CreateHiringRequest request);

    HiringRequestDto toDto(HiringRequest entity);
}
