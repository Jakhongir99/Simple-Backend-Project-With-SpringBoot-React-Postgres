package com.example.department.repository;

import com.example.department.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    
    Optional<Department> findByName(String name);
    
    List<Department> findByIsActiveTrue();
    
    List<Department> findByLocation(String location);
    
    @Query("SELECT d FROM Department d WHERE d.budget >= :minBudget")
    List<Department> findByBudgetGreaterThanEqual(@Param("minBudget") Double minBudget);
    
    @Query("SELECT COUNT(e) FROM Employee e WHERE e.department.id = :departmentId")
    long countEmployeesByDepartment(@Param("departmentId") Long departmentId);
    
    @Query("SELECT d FROM Department d WHERE d.name LIKE %:search% OR d.description LIKE %:search%")
    List<Department> findBySearchTerm(@Param("search") String search);
    
    boolean existsByName(String name);
    
    @Query("SELECT d FROM Department d WHERE d.name LIKE %:keyword% OR d.description LIKE %:keyword%")
    List<Department> searchByKeyword(@Param("keyword") String keyword);
}
