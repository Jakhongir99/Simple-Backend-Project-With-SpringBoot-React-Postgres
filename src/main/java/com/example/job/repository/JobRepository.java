package com.example.job.repository;

import com.example.job.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    
    Optional<Job> findByTitle(String title);
    
    List<Job> findByIsActiveTrue();
    
    @Query("SELECT j FROM Job j WHERE j.minSalary >= :minSalary AND j.maxSalary <= :maxSalary")
    List<Job> findBySalaryRange(@Param("minSalary") Double minSalary, @Param("maxSalary") Double maxSalary);
    
    @Query("SELECT COUNT(e) FROM Employee e WHERE e.job.id = :jobId")
    long countEmployeesByJob(@Param("jobId") Long jobId);
    
    @Query("SELECT j FROM Job j WHERE j.title LIKE %:search% OR j.description LIKE %:search%")
    List<Job> findBySearchTerm(@Param("search") String search);
    
    boolean existsByTitle(String title);
    
    @Query("SELECT j FROM Job j WHERE j.title LIKE %:keyword% OR j.description LIKE %:keyword%")
    List<Job> searchByKeyword(@Param("keyword") String keyword);
    
    @Query("SELECT j FROM Job j WHERE j.minSalary >= :minSalary")
    List<Job> findByMinSalaryGreaterThanEqual(@Param("minSalary") Double minSalary);
}
