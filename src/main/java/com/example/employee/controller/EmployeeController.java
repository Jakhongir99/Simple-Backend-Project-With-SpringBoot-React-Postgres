package com.example.employee.controller;

import com.example.employee.dto.EmployeeDto;
import com.example.employee.dto.CreateEmployeeRequest;
import com.example.employee.dto.UpdateEmployeeRequest;
import com.example.employee.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.lang.Double;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class EmployeeController {

    private final EmployeeService employeeService;

    /**
     * Get all employees with pagination
     */
    @GetMapping
    public ResponseEntity<Page<EmployeeDto>> getAllEmployees(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        log.info("GET /api/employees - page: {}, size: {}, sortBy: {}, sortDir: {}", page, size, sortBy, sortDir);
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<EmployeeDto> employees = employeeService.getAllEmployees(pageable);
        return ResponseEntity.ok(employees);
    }

    /**
     * Get all active employees with pagination
     */
    @GetMapping("/active")
    public ResponseEntity<Page<EmployeeDto>> getAllActiveEmployees(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        log.info("GET /api/employees/active - page: {}, size: {}", page, size);
        Pageable pageable = PageRequest.of(page, size);
        
        Page<EmployeeDto> employees = employeeService.getAllActiveEmployees(pageable);
        return ResponseEntity.ok(employees);
    }

    /**
     * Get employee by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<EmployeeDto> getEmployeeById(@PathVariable Long id) {
        log.info("GET /api/employees/{}", id);
        
        return employeeService.getEmployeeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get employee by email
     */
    @GetMapping("/email/{email}")
    public ResponseEntity<EmployeeDto> getEmployeeByEmail(@PathVariable String email) {
        log.info("GET /api/employees/email/{}", email);
        
        return employeeService.getEmployeeByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create a new employee
     */
    @PostMapping
    public ResponseEntity<EmployeeDto> createEmployee(@Valid @RequestBody CreateEmployeeRequest request) {
        log.info("POST /api/employees - {}", request.getEmail());
        
        try {
            EmployeeDto createdEmployee = employeeService.createEmployee(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdEmployee);
        } catch (IllegalArgumentException e) {
            log.error("Error creating employee: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error creating employee: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Update an existing employee
     */
    @PutMapping("/{id}")
    public ResponseEntity<EmployeeDto> updateEmployee(
            @PathVariable Long id, 
            @Valid @RequestBody UpdateEmployeeRequest request) {
        log.info("PUT /api/employees/{}", id);
        
        try {
            EmployeeDto updatedEmployee = employeeService.updateEmployee(id, request);
            return ResponseEntity.ok(updatedEmployee);
        } catch (IllegalArgumentException e) {
            log.error("Error updating employee: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error updating employee: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete an employee
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        log.info("DELETE /api/employees/{}", id);
        
        try {
            employeeService.deleteEmployee(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Error deleting employee: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Search employees by keyword
     */
    @GetMapping("/search")
    public ResponseEntity<Page<EmployeeDto>> searchEmployees(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        log.info("GET /api/employees/search?keyword={}&page={}&size={}", keyword, page, size);
        Pageable pageable = PageRequest.of(page, size);
        Page<EmployeeDto> employees = employeeService.searchEmployees(keyword, pageable);
        return ResponseEntity.ok(employees);
    }

    /**
     * Get employees by department
     */
    @GetMapping("/department/{departmentId}")
    public ResponseEntity<List<EmployeeDto>> getEmployeesByDepartment(@PathVariable Long departmentId) {
        log.info("GET /api/employees/department/{}", departmentId);
        List<EmployeeDto> employees = employeeService.getEmployeesByDepartment(departmentId);
        return ResponseEntity.ok(employees);
    }

    /**
     * Get employees by job
     */
    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<EmployeeDto>> getEmployeesByJob(@PathVariable Long jobId) {
        log.info("GET /api/employees/job/{}", jobId);
        List<EmployeeDto> employees = employeeService.getEmployeesByJob(jobId);
        return ResponseEntity.ok(employees);
    }

    /**
     * Get employees by manager
     */
    @GetMapping("/manager/{managerId}")
    public ResponseEntity<List<EmployeeDto>> getEmployeesByManager(@PathVariable Long managerId) {
        log.info("GET /api/employees/manager/{}", managerId);
        List<EmployeeDto> employees = employeeService.getEmployeesByManager(managerId);
        return ResponseEntity.ok(employees);
    }

    /**
     * Get employees by hire date range
     */
    @GetMapping("/hire-date-range")
    public ResponseEntity<List<EmployeeDto>> getEmployeesByHireDateRange(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        
        log.info("GET /api/employees/hire-date-range?startDate={}&endDate={}", startDate, endDate);
        List<EmployeeDto> employees = employeeService.getEmployeesByHireDateRange(startDate, endDate);
        return ResponseEntity.ok(employees);
    }

    /**
     * Get employees by salary range
     */
    @GetMapping("/salary-range")
    public ResponseEntity<List<EmployeeDto>> getEmployeesBySalaryRange(
            @RequestParam Double minSalary,
            @RequestParam Double maxSalary) {
        
        log.info("GET /api/employees/salary-range?minSalary={}&maxSalary={}", minSalary, maxSalary);
        List<EmployeeDto> employees = employeeService.getEmployeesBySalaryRange(minSalary, maxSalary);
        return ResponseEntity.ok(employees);
    }

    /**
     * Get average salary by department
     */
    @GetMapping("/department/{departmentId}/average-salary")
    public ResponseEntity<Double> getAverageSalaryByDepartment(@PathVariable Long departmentId) {
        log.info("GET /api/employees/department/{}/average-salary", departmentId);
        Double averageSalary = employeeService.getAverageSalaryByDepartment(departmentId);
        return ResponseEntity.ok(averageSalary);
    }

    /**
     * Get employee count by department
     */
    @GetMapping("/department/{departmentId}/count")
    public ResponseEntity<Long> getEmployeeCountByDepartment(@PathVariable Long departmentId) {
        log.info("GET /api/employees/department/{}/count", departmentId);
        Long count = employeeService.getEmployeeCountByDepartment(departmentId);
        return ResponseEntity.ok(count);
    }

    /**
     * Check if employee exists by email
     */
    @GetMapping("/exists/{email}")
    public ResponseEntity<Boolean> existsByEmail(@PathVariable String email) {
        log.info("GET /api/employees/exists/{}", email);
        boolean exists = employeeService.existsByEmail(email);
        return ResponseEntity.ok(exists);
    }
}
