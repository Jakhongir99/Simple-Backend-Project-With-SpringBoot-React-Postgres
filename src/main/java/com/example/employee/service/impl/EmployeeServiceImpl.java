package com.example.employee.service.impl;

import com.example.employee.dto.EmployeeDto;
import com.example.employee.dto.CreateEmployeeRequest;
import com.example.employee.dto.UpdateEmployeeRequest;
import com.example.employee.service.EmployeeService;
import com.example.employee.entity.Employee;
import com.example.employee.mapper.EmployeeMapper;
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
    private final EmployeeMapper employeeMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<EmployeeDto> getAllEmployees(Pageable pageable) {
        log.info("Fetching all employees with pagination: {}", pageable);
        Page<Employee> employees = employeeRepository.findAll(pageable);
        return employees.map(employeeMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EmployeeDto> getAllActiveEmployees(Pageable pageable) {
        log.info("Fetching all active employees with pagination: {}", pageable);
        Page<Employee> employees = employeeRepository.findByIsActiveTrue(pageable);
        return employees.map(employeeMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<EmployeeDto> getEmployeeById(Long id) {
        log.info("Fetching employee by ID: {}", id);
        return employeeRepository.findById(id)
                .map(employeeMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<EmployeeDto> getEmployeeByEmail(String email) {
        log.info("Fetching employee by email: {}", email);
        return employeeRepository.findByEmail(email)
                .map(employeeMapper::toDto);
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

        Employee employee = employeeMapper.toEntity(request);
        employee.setDepartment(department);
        employee.setJob(job);
        employee.setManagerId(request.getManagerId());
        employee.setIsActive(true);

        Employee savedEmployee = employeeRepository.save(employee);
        log.info("Employee created successfully with ID: {}", savedEmployee.getId());
        
        return employeeMapper.toDto(savedEmployee);
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
        }

        // Update employee using mapper
        employeeMapper.updateEntity(employee, request);

        // Handle department and job updates separately
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

        employee.setUpdatedAt(LocalDateTime.now());
        Employee updatedEmployee = employeeRepository.save(employee);
        
        log.info("Employee updated successfully with ID: {}", id);
        return employeeMapper.toDto(updatedEmployee);
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
        return employees.map(employeeMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeDto> getEmployeesByDepartment(Long departmentId) {
        log.info("Fetching employees by department ID: {}", departmentId);
        List<Employee> employees = employeeRepository.findByDepartmentId(departmentId);
        return employees.stream()
                .map(employeeMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeDto> getEmployeesByJob(Long jobId) {
        log.info("Fetching employees by job ID: {}", jobId);
        List<Employee> employees = employeeRepository.findByJobId(jobId);
        return employees.stream()
                .map(employeeMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeDto> getEmployeesByManager(Long managerId) {
        log.info("Fetching employees by manager ID: {}", managerId);
        List<Employee> employees = employeeRepository.findByManagerId(managerId);
        return employees.stream()
                .map(employeeMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeDto> getEmployeesByHireDateRange(LocalDate startDate, LocalDate endDate) {
        log.info("Fetching employees by hire date range: {} - {}", startDate, endDate);
        List<Employee> employees = employeeRepository.findByHireDateBetween(startDate, endDate);
        return employees.stream()
                .map(employeeMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeDto> getEmployeesBySalaryRange(Double minSalary, Double maxSalary) {
        log.info("Fetching employees by salary range: {} - {}", minSalary, maxSalary);
        List<Employee> employees = employeeRepository.findBySalaryBetween(minSalary, maxSalary);
        return employees.stream()
                .map(employeeMapper::toDto)
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


}
