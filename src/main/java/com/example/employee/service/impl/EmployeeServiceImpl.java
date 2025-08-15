package com.example.employee.service.impl;

import com.example.employee.dto.EmployeeDto;
import com.example.employee.dto.CreateEmployeeRequest;
import com.example.employee.dto.UpdateEmployeeRequest;
import com.example.employee.service.EmployeeService;
import com.example.employee.entity.Employee;
import com.example.department.entity.Department;
import com.example.job.entity.Job;
import com.example.employee.repository.EmployeeRepository;
import com.example.department.repository.DepartmentRepository;
import com.example.job.repository.JobRepository;
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
import java.time.LocalDate;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final JobRepository jobRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<EmployeeDto> getAllEmployees(Pageable pageable) {
        log.info("Fetching all employees with pagination: {}", pageable);
        Page<Employee> employees = employeeRepository.findAll(pageable);
        return employees.map(this::mapToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EmployeeDto> getAllActiveEmployees(Pageable pageable) {
        log.info("Fetching all active employees with pagination: {}", pageable);
        Page<Employee> employees = employeeRepository.findByIsActiveTrue(pageable);
        return employees.map(this::mapToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<EmployeeDto> getEmployeeById(Long id) {
        log.info("Fetching employee by ID: {}", id);
        return employeeRepository.findById(id)
                .map(this::mapToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<EmployeeDto> getEmployeeByEmail(String email) {
        log.info("Fetching employee by email: {}", email);
        return employeeRepository.findByEmail(email)
                .map(this::mapToDto);
    }

    @Override
    public EmployeeDto createEmployee(CreateEmployeeRequest request) {
        log.info("Creating new employee: {}", request.getEmail());
        
        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Employee with email '" + request.getEmail() + "' already exists");
        }

        // Get department and job entities
        Department department = null;
        Job job = null;
        
        if (request.getDepartmentId() != null) {
            department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new EntityNotFoundException("Department not found with ID: " + request.getDepartmentId()));
        }
        
        if (request.getJobId() != null) {
            job = jobRepository.findById(request.getJobId())
                    .orElseThrow(() -> new EntityNotFoundException("Job not found with ID: " + request.getJobId()));
        }

        Employee employee = Employee.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .hireDate(request.getHireDate())
                .salary(request.getSalary())
                .department(department)
                .job(job)
                .managerId(request.getManagerId())
                .isActive(true)
                .build();

        Employee savedEmployee = employeeRepository.save(employee);
        log.info("Employee created successfully with ID: {}", savedEmployee.getId());
        
        return mapToDto(savedEmployee);
    }

    @Override
    public EmployeeDto updateEmployee(Long id, UpdateEmployeeRequest request) {
        log.info("Updating employee with ID: {}", id);
        
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found with ID: " + id));

        // Check if email is being changed and if it conflicts with existing emails
        if (request.getEmail() != null && !request.getEmail().equals(employee.getEmail())) {
            if (employeeRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException("Employee with email '" + request.getEmail() + "' already exists");
            }
            employee.setEmail(request.getEmail());
        }

        if (request.getFirstName() != null) {
            employee.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            employee.setLastName(request.getLastName());
        }
        if (request.getPhone() != null) {
            employee.setPhone(request.getPhone());
        }
        if (request.getHireDate() != null) {
            employee.setHireDate(request.getHireDate());
        }
        if (request.getSalary() != null) {
            employee.setSalary(request.getSalary());
        }
        if (request.getDepartmentId() != null) {
            Department department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new EntityNotFoundException("Department not found with ID: " + request.getDepartmentId()));
            employee.setDepartment(department);
        }
        if (request.getJobId() != null) {
            Job job = jobRepository.findById(request.getJobId())
                    .orElseThrow(() -> new EntityNotFoundException("Job not found with ID: " + request.getJobId()));
            employee.setJob(job);
        }
        if (request.getManagerId() != null) {
            employee.setManagerId(request.getManagerId());
        }
        if (request.getIsActive() != null) {
            employee.setIsActive(request.getIsActive());
        }

        employee.setUpdatedAt(LocalDateTime.now());
        Employee updatedEmployee = employeeRepository.save(employee);
        
        log.info("Employee updated successfully with ID: {}", id);
        return mapToDto(updatedEmployee);
    }

    @Override
    public void deleteEmployee(Long id) {
        log.info("Deleting employee with ID: {}", id);
        
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found with ID: " + id));

        // Soft delete
        employee.setIsActive(false);
        employee.setUpdatedAt(LocalDateTime.now());
        employeeRepository.save(employee);
        
        log.info("Employee deleted successfully with ID: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EmployeeDto> searchEmployees(String keyword, Pageable pageable) {
        log.info("Searching employees with keyword: {}", keyword);
        Page<Employee> employees = employeeRepository.searchByKeyword(keyword, pageable);
        return employees.map(this::mapToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeDto> getEmployeesByDepartment(Long departmentId) {
        log.info("Fetching employees by department ID: {}", departmentId);
        List<Employee> employees = employeeRepository.findByDepartmentId(departmentId);
        return employees.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeDto> getEmployeesByJob(Long jobId) {
        log.info("Fetching employees by job ID: {}", jobId);
        List<Employee> employees = employeeRepository.findByJobId(jobId);
        return employees.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeDto> getEmployeesByManager(Long managerId) {
        log.info("Fetching employees by manager ID: {}", managerId);
        List<Employee> employees = employeeRepository.findByManagerId(managerId);
        return employees.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeDto> getEmployeesByHireDateRange(LocalDate startDate, LocalDate endDate) {
        log.info("Fetching employees by hire date range: {} - {}", startDate, endDate);
        List<Employee> employees = employeeRepository.findByHireDateBetween(startDate, endDate);
        return employees.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeDto> getEmployeesBySalaryRange(Double minSalary, Double maxSalary) {
        log.info("Fetching employees by salary range: {} - {}", minSalary, maxSalary);
        List<Employee> employees = employeeRepository.findBySalaryBetween(minSalary, maxSalary);
        return employees.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Double getAverageSalaryByDepartment(Long departmentId) {
        log.info("Getting average salary for department ID: {}", departmentId);
        return employeeRepository.getAverageSalaryByDepartment(departmentId);
    }

    @Override
    @Transactional(readOnly = true)
    public Long getEmployeeCountByDepartment(Long departmentId) {
        log.info("Getting employee count for department ID: {}", departmentId);
        return employeeRepository.countActiveEmployeesByDepartment(departmentId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return employeeRepository.existsByEmail(email);
    }

    private EmployeeDto mapToDto(Employee employee) {
        EmployeeDto dto = EmployeeDto.builder()
                .id(employee.getId())
                .firstName(employee.getFirstName())
                .lastName(employee.getLastName())
                .email(employee.getEmail())
                .phone(employee.getPhone())
                .hireDate(employee.getHireDate())
                .salary(employee.getSalary())
                .departmentId(employee.getDepartment() != null ? employee.getDepartment().getId() : null)
                .jobId(employee.getJob() != null ? employee.getJob().getId() : null)
                .managerId(employee.getManagerId())
                .isActive(employee.getIsActive())
                .createdAt(employee.getCreatedAt())
                .updatedAt(employee.getUpdatedAt())
                .fullName(employee.getFullName())
                .departmentName(employee.getDepartment() != null ? employee.getDepartment().getName() : null)
                .jobTitle(employee.getJob() != null ? employee.getJob().getTitle() : null)
                .build();
        
        return dto;
    }
}
