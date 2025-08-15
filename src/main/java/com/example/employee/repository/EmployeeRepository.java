package com.example.employee.repository;

import com.example.employee.entity.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    
    Optional<Employee> findByEmail(String email);
    
    List<Employee> findByDepartmentId(Long departmentId);
    
    List<Employee> findByJobId(Long jobId);
    
    List<Employee> findByManagerId(Long managerId);
    
    List<Employee> findByHireDateBetween(LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT e FROM Employee e WHERE e.salary BETWEEN :minSalary AND :maxSalary")
    List<Employee> findBySalaryRange(@Param("minSalary") Double minSalary, @Param("maxSalary") Double maxSalary);
    
    @Query("SELECT AVG(e.salary) FROM Employee e")
    Double getAverageSalary();
    
    @Query("SELECT COUNT(e) FROM Employee e")
    long getEmployeeCount();
    
    @Query("SELECT e FROM Employee e WHERE " +
           "(:search IS NULL OR e.firstName LIKE %:search% OR e.lastName LIKE %:search% OR e.email LIKE %:search%)")
    Page<Employee> findBySearchCriteria(@Param("search") String search, Pageable pageable);
    
    @Query("SELECT e FROM Employee e WHERE e.department.id = :departmentId")
    Page<Employee> findByDepartmentId(@Param("departmentId") Long departmentId, Pageable pageable);
    
    @Query("SELECT e FROM Employee e WHERE e.job.id = :jobId")
    Page<Employee> findByJobId(@Param("jobId") Long jobId, Pageable pageable);
    
    boolean existsByEmail(String email);
    
    @Query("SELECT e FROM Employee e WHERE e.isActive = true")
    Page<Employee> findByIsActiveTrue(Pageable pageable);
    
    @Query("SELECT e FROM Employee e WHERE e.firstName LIKE %:keyword% OR e.lastName LIKE %:keyword% OR e.email LIKE %:keyword%")
    Page<Employee> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
    
    @Query("SELECT e FROM Employee e WHERE e.salary BETWEEN :minSalary AND :maxSalary")
    List<Employee> findBySalaryBetween(@Param("minSalary") Double minSalary, @Param("maxSalary") Double maxSalary);
    
    @Query("SELECT AVG(e.salary) FROM Employee e WHERE e.department.id = :departmentId")
    Double getAverageSalaryByDepartment(@Param("departmentId") Long departmentId);
    
    @Query("SELECT COUNT(e) FROM Employee e WHERE e.department.id = :departmentId AND e.isActive = true")
    long countActiveEmployeesByDepartment(@Param("departmentId") Long departmentId);
}
