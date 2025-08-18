package com.example.employee.mapper;

import com.example.employee.dto.CreateEmployeeRequest;
import com.example.employee.dto.EmployeeDto;
import com.example.employee.dto.UpdateEmployeeRequest;
import com.example.employee.entity.Employee;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface EmployeeMapper {
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "department", ignore = true)
    @Mapping(target = "job", ignore = true)
    @Mapping(target = "managerId", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Employee toEntity(CreateEmployeeRequest request);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "department", ignore = true)
    @Mapping(target = "job", ignore = true)
    @Mapping(target = "managerId", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(@MappingTarget Employee employee, UpdateEmployeeRequest request);
    
    @Mapping(target = "departmentId", source = "department.id")
    @Mapping(target = "jobId", source = "job.id")
    @Mapping(target = "departmentName", source = "department.name")
    @Mapping(target = "jobTitle", source = "job.title")
    EmployeeDto toDto(Employee employee);
}
