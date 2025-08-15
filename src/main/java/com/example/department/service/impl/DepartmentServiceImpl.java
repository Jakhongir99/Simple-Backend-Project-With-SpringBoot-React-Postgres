package com.example.department.service.impl;

import com.example.department.dto.DepartmentDto;
import com.example.department.dto.CreateDepartmentRequest;
import com.example.department.dto.UpdateDepartmentRequest;
import com.example.department.service.DepartmentService;
import com.example.department.entity.Department;
import com.example.department.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityNotFoundException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<DepartmentDto> getAllDepartments(Pageable pageable) {
        log.info("Fetching all departments with pagination: {}", pageable);
        Page<Department> departments = departmentRepository.findAll(pageable);
        return departments.map(this::mapToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DepartmentDto> getAllActiveDepartments() {
        log.info("Fetching all active departments");
        List<Department> departments = departmentRepository.findByIsActiveTrue();
        return departments.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<DepartmentDto> getDepartmentById(Long id) {
        log.info("Fetching department by ID: {}", id);
        return departmentRepository.findById(id)
                .map(this::mapToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<DepartmentDto> getDepartmentByName(String name) {
        log.info("Fetching department by name: {}", name);
        return departmentRepository.findByName(name)
                .map(this::mapToDto);
    }

    @Override
    public DepartmentDto createDepartment(CreateDepartmentRequest request) {
        log.info("Creating new department: {}", request.getName());
        
        if (departmentRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Department with name '" + request.getName() + "' already exists");
        }

        Department department = Department.builder()
                .name(request.getName())
                .description(request.getDescription())
                .location(request.getLocation())
                .managerId(request.getManagerId())
                .budget(request.getBudget())
                .isActive(true)
                .build();

        Department savedDepartment = departmentRepository.save(department);
        log.info("Department created successfully with ID: {}", savedDepartment.getId());
        
        return mapToDto(savedDepartment);
    }

    @Override
    public DepartmentDto updateDepartment(Long id, UpdateDepartmentRequest request) {
        log.info("Updating department with ID: {}", id);
        
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Department not found with ID: " + id));

        // Check if name is being changed and if it conflicts with existing names
        if (request.getName() != null && !request.getName().equals(department.getName())) {
            if (departmentRepository.existsByName(request.getName())) {
                throw new IllegalArgumentException("Department with name '" + request.getName() + "' already exists");
            }
            department.setName(request.getName());
        }

        if (request.getDescription() != null) {
            department.setDescription(request.getDescription());
        }
        if (request.getLocation() != null) {
            department.setLocation(request.getLocation());
        }
        if (request.getManagerId() != null) {
            department.setManagerId(request.getManagerId());
        }
        if (request.getBudget() != null) {
            department.setBudget(request.getBudget());
        }
        if (request.getIsActive() != null) {
            department.setIsActive(request.getIsActive());
        }

        department.setUpdatedAt(LocalDateTime.now());
        Department updatedDepartment = departmentRepository.save(department);
        
        log.info("Department updated successfully with ID: {}", id);
        return mapToDto(updatedDepartment);
    }

    @Override
    public void deleteDepartment(Long id) {
        log.info("Deleting department with ID: {}", id);
        
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Department not found with ID: " + id));

        // Soft delete
        department.setIsActive(false);
        department.setUpdatedAt(LocalDateTime.now());
        departmentRepository.save(department);
        
        log.info("Department deleted successfully with ID: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DepartmentDto> searchDepartments(String keyword) {
        log.info("Searching departments with keyword: {}", keyword);
        List<Department> departments = departmentRepository.searchByKeyword(keyword);
        return departments.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DepartmentDto> getDepartmentsByLocation(String location) {
        log.info("Fetching departments by location: {}", location);
        List<Department> departments = departmentRepository.findByLocation(location);
        return departments.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Long getEmployeeCount(Long departmentId) {
        log.info("Getting employee count for department ID: {}", departmentId);
        return departmentRepository.countEmployeesByDepartment(departmentId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByName(String name) {
        return departmentRepository.existsByName(name);
    }

    private DepartmentDto mapToDto(Department department) {
        DepartmentDto dto = DepartmentDto.builder()
                .id(department.getId())
                .name(department.getName())
                .description(department.getDescription())
                .location(department.getLocation())
                .managerId(department.getManagerId())
                .budget(department.getBudget())
                .isActive(department.getIsActive())
                .createdAt(department.getCreatedAt())
                .updatedAt(department.getUpdatedAt())
                .build();

        // Set additional fields
        dto.setEmployeeCount(departmentRepository.countEmployeesByDepartment(department.getId()));
        
        return dto;
    }
}
