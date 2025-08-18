package com.example.job.mapper;

import com.example.job.dto.CreateJobRequest;
import com.example.job.dto.JobDto;
import com.example.job.dto.UpdateJobRequest;
import com.example.job.entity.Job;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface JobMapper {
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "employees", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Job toEntity(CreateJobRequest request);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "employees", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(@MappingTarget Job job, UpdateJobRequest request);
    
    JobDto toDto(Job job);
}
