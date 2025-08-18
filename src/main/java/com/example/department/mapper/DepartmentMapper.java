package com.example.department.mapper;

import com.example.department.dto.CreateDepartmentRequest;
import com.example.department.dto.DepartmentDto;
import com.example.department.dto.UpdateDepartmentRequest;
import com.example.department.entity.Department;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface DepartmentMapper {
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "employees", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Department toEntity(CreateDepartmentRequest request);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "employees", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(@MappingTarget Department department, UpdateDepartmentRequest request);
    
    DepartmentDto toDto(Department department);
}
