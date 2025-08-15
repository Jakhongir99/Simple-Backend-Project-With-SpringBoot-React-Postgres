package com.example.employee.service;

import com.example.employee.dto.EmployeeDto;
import com.example.employee.dto.CreateEmployeeRequest;
import com.example.employee.dto.UpdateEmployeeRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.lang.Double;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface EmployeeService {

    /**
     * Get all employees with pagination
     */
    Page<EmployeeDto> getAllEmployees(Pageable pageable);

    /**
     * Get all active employees
     */
    Page<EmployeeDto> getAllActiveEmployees(Pageable pageable);

    /**
     * Get employee by ID
     */
    Optional<EmployeeDto> getEmployeeById(Long id);

    /**
     * Get employee by email
     */
    Optional<EmployeeDto> getEmployeeByEmail(String email);

    /**
     * Create a new employee
     */
    EmployeeDto createEmployee(CreateEmployeeRequest request);

    /**
     * Update an existing employee
     */
    EmployeeDto updateEmployee(Long id, UpdateEmployeeRequest request);

    /**
     * Delete an employee (soft delete)
     */
    void deleteEmployee(Long id);

    /**
     * Search employees by keyword
     */
    Page<EmployeeDto> searchEmployees(String keyword, Pageable pageable);

    /**
     * Get employees by department
     */
    List<EmployeeDto> getEmployeesByDepartment(Long departmentId);

    /**
     * Get employees by job
     */
    List<EmployeeDto> getEmployeesByJob(Long jobId);

    /**
     * Get employees by manager
     */
    List<EmployeeDto> getEmployeesByManager(Long managerId);

    /**
     * Get employees by hire date range
     */
    List<EmployeeDto> getEmployeesByHireDateRange(LocalDate startDate, LocalDate endDate);

    /**
     * Get employees by salary range
     */
    List<EmployeeDto> getEmployeesBySalaryRange(Double minSalary, Double maxSalary);

    /**
     * Get average salary by department
     */
    Double getAverageSalaryByDepartment(Long departmentId);

    /**
     * Get employee count by department
     */
    Long getEmployeeCountByDepartment(Long departmentId);

    /**
     * Check if employee exists by email
     */
    boolean existsByEmail(String email);
}
