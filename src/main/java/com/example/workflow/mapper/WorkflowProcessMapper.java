package com.example.workflow.mapper;

import com.example.workflow.dto.WorkflowProcessDto;
import com.example.workflow.entity.WorkflowProcess;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface WorkflowProcessMapper {

    WorkflowProcessDto toDto(WorkflowProcess entity);
}
