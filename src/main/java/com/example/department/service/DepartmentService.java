package com.example.department.service;

import com.example.department.dto.DepartmentDto;
import com.example.department.dto.CreateDepartmentRequest;
import com.example.department.dto.UpdateDepartmentRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface DepartmentService {

    /**
     * Get all departments with pagination
     */
    Page<DepartmentDto> getAllDepartments(Pageable pageable);

    /**
     * Get all active departments
     */
    List<DepartmentDto> getAllActiveDepartments();

    /**
     * Get department by ID
     */
    Optional<DepartmentDto> getDepartmentById(Long id);

    /**
     * Get department by name
     */
    Optional<DepartmentDto> getDepartmentByName(String name);

    /**
     * Create a new department
     */
    DepartmentDto createDepartment(CreateDepartmentRequest request);

    /**
     * Update an existing department
     */
    DepartmentDto updateDepartment(Long id, UpdateDepartmentRequest request);

    /**
     * Delete a department (soft delete)
     */
    void deleteDepartment(Long id);

    /**
     * Search departments by keyword
     */
    List<DepartmentDto> searchDepartments(String keyword);

    /**
     * Get departments by location
     */
    List<DepartmentDto> getDepartmentsByLocation(String location);

    /**
     * Get employee count for a department
     */
    Long getEmployeeCount(Long departmentId);

    /**
     * Check if department exists by name
     */
    boolean existsByName(String name);
}
