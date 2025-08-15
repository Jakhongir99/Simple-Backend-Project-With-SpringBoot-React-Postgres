package com.example.job.service;

import com.example.job.dto.JobDto;
import com.example.job.dto.CreateJobRequest;
import com.example.job.dto.UpdateJobRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.lang.Double;
import java.util.List;
import java.util.Optional;

public interface JobService {

    /**
     * Get all jobs with pagination
     */
    Page<JobDto> getAllJobs(Pageable pageable);

    /**
     * Get all active jobs
     */
    List<JobDto> getAllActiveJobs();

    /**
     * Get job by ID
     */
    Optional<JobDto> getJobById(Long id);

    /**
     * Get job by title
     */
    Optional<JobDto> getJobByTitle(String title);

    /**
     * Create a new job
     */
    JobDto createJob(CreateJobRequest request);

    /**
     * Update an existing job
     */
    JobDto updateJob(Long id, UpdateJobRequest request);

    /**
     * Delete a job (soft delete)
     */
    void deleteJob(Long id);

    /**
     * Search jobs by keyword
     */
    List<JobDto> searchJobs(String keyword);

    /**
     * Get jobs by salary range
     */
    List<JobDto> getJobsBySalaryRange(Double minSalary, Double maxSalary);

    /**
     * Get employee count for a job
     */
    Long getEmployeeCount(Long jobId);

    /**
     * Check if job exists by title
     */
    boolean existsByTitle(String title);
}
