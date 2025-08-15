package com.example.department.controller;

import com.example.department.dto.DepartmentDto;
import com.example.department.dto.CreateDepartmentRequest;
import com.example.department.dto.UpdateDepartmentRequest;
import com.example.department.service.DepartmentService;
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
import java.util.List;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class DepartmentController {

    private final DepartmentService departmentService;

    /**
     * Get all departments with pagination
     */
    @GetMapping
    public ResponseEntity<Page<DepartmentDto>> getAllDepartments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        log.info("GET /api/departments - page: {}, size: {}, sortBy: {}, sortDir: {}", page, size, sortBy, sortDir);
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<DepartmentDto> departments = departmentService.getAllDepartments(pageable);
        return ResponseEntity.ok(departments);
    }

    /**
     * Get all active departments
     */
    @GetMapping("/active")
    public ResponseEntity<List<DepartmentDto>> getAllActiveDepartments() {
        log.info("GET /api/departments/active");
        List<DepartmentDto> departments = departmentService.getAllActiveDepartments();
        return ResponseEntity.ok(departments);
    }

    /**
     * Get department by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<DepartmentDto> getDepartmentById(@PathVariable Long id) {
        log.info("GET /api/departments/{}", id);
        
        return departmentService.getDepartmentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get department by name
     */
    @GetMapping("/name/{name}")
    public ResponseEntity<DepartmentDto> getDepartmentByName(@PathVariable String name) {
        log.info("GET /api/departments/name/{}", name);
        
        return departmentService.getDepartmentByName(name)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create a new department
     */
    @PostMapping
    public ResponseEntity<DepartmentDto> createDepartment(@Valid @RequestBody CreateDepartmentRequest request) {
        log.info("POST /api/departments - {}", request.getName());
        
        try {
            DepartmentDto createdDepartment = departmentService.createDepartment(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdDepartment);
        } catch (IllegalArgumentException e) {
            log.error("Error creating department: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Update an existing department
     */
    @PutMapping("/{id}")
    public ResponseEntity<DepartmentDto> updateDepartment(
            @PathVariable Long id, 
            @Valid @RequestBody UpdateDepartmentRequest request) {
        log.info("PUT /api/departments/{}", id);
        
        try {
            DepartmentDto updatedDepartment = departmentService.updateDepartment(id, request);
            return ResponseEntity.ok(updatedDepartment);
        } catch (IllegalArgumentException e) {
            log.error("Error updating department: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error updating department: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete a department
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDepartment(@PathVariable Long id) {
        log.info("DELETE /api/departments/{}", id);
        
        try {
            departmentService.deleteDepartment(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Error deleting department: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Search departments by keyword
     */
    @GetMapping("/search")
    public ResponseEntity<List<DepartmentDto>> searchDepartments(@RequestParam String keyword) {
        log.info("GET /api/departments/search?keyword={}", keyword);
        List<DepartmentDto> departments = departmentService.searchDepartments(keyword);
        return ResponseEntity.ok(departments);
    }

    /**
     * Get departments by location
     */
    @GetMapping("/location/{location}")
    public ResponseEntity<List<DepartmentDto>> getDepartmentsByLocation(@PathVariable String location) {
        log.info("GET /api/departments/location/{}", location);
        List<DepartmentDto> departments = departmentService.getDepartmentsByLocation(location);
        return ResponseEntity.ok(departments);
    }

    /**
     * Get employee count for a department
     */
    @GetMapping("/{id}/employee-count")
    public ResponseEntity<Long> getEmployeeCount(@PathVariable Long id) {
        log.info("GET /api/departments/{}/employee-count", id);
        Long count = departmentService.getEmployeeCount(id);
        return ResponseEntity.ok(count);
    }

    /**
     * Check if department exists by name
     */
    @GetMapping("/exists/{name}")
    public ResponseEntity<Boolean> existsByName(@PathVariable String name) {
        log.info("GET /api/departments/exists/{}", name);
        boolean exists = departmentService.existsByName(name);
        return ResponseEntity.ok(exists);
    }
}
