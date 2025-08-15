package com.example.job.controller;

import com.example.job.dto.JobDto;
import com.example.job.dto.CreateJobRequest;
import com.example.job.dto.UpdateJobRequest;
import com.example.job.service.JobService;
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
import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class JobController {

    private final JobService jobService;

    /**
     * Get all jobs with pagination
     */
    @GetMapping
    public ResponseEntity<Page<JobDto>> getAllJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        log.info("GET /api/jobs - page: {}, size: {}, sortBy: {}, sortDir: {}", page, size, sortBy, sortDir);
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<JobDto> jobs = jobService.getAllJobs(pageable);
        return ResponseEntity.ok(jobs);
    }

    /**
     * Get all active jobs
     */
    @GetMapping("/active")
    public ResponseEntity<List<JobDto>> getAllActiveJobs() {
        log.info("GET /api/jobs/active");
        List<JobDto> jobs = jobService.getAllActiveJobs();
        return ResponseEntity.ok(jobs);
    }

    /**
     * Get job by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<JobDto> getJobById(@PathVariable Long id) {
        log.info("GET /api/jobs/{}", id);
        
        return jobService.getJobById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get job by title
     */
    @GetMapping("/title/{title}")
    public ResponseEntity<JobDto> getJobByTitle(@PathVariable String title) {
        log.info("GET /api/jobs/title/{}", title);
        
        return jobService.getJobByTitle(title)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create a new job
     */
    @PostMapping
    public ResponseEntity<JobDto> createJob(@Valid @RequestBody CreateJobRequest request) {
        log.info("POST /api/jobs - {}", request.getTitle());
        
        try {
            JobDto createdJob = jobService.createJob(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdJob);
        } catch (IllegalArgumentException e) {
            log.error("Error creating job: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Update an existing job
     */
    @PutMapping("/{id}")
    public ResponseEntity<JobDto> updateJob(
            @PathVariable Long id, 
            @Valid @RequestBody UpdateJobRequest request) {
        log.info("PUT /api/jobs/{}", id);
        
        try {
            JobDto updatedJob = jobService.updateJob(id, request);
            return ResponseEntity.ok(updatedJob);
        } catch (IllegalArgumentException e) {
            log.error("Error updating job: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error updating job: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete a job
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id) {
        log.info("DELETE /api/jobs/{}", id);
        
        try {
            jobService.deleteJob(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Error deleting job: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Search jobs by keyword
     */
    @GetMapping("/search")
    public ResponseEntity<List<JobDto>> searchJobs(@RequestParam String keyword) {
        log.info("GET /api/jobs/search?keyword={}", keyword);
        List<JobDto> jobs = jobService.searchJobs(keyword);
        return ResponseEntity.ok(jobs);
    }

    /**
     * Get jobs by salary range
     */
    @GetMapping("/salary-range")
    public ResponseEntity<List<JobDto>> getJobsBySalaryRange(
            @RequestParam Double minSalary,
            @RequestParam Double maxSalary) {
        log.info("GET /api/jobs/salary-range?minSalary={}&maxSalary={}", minSalary, maxSalary);
        List<JobDto> jobs = jobService.getJobsBySalaryRange(minSalary, maxSalary);
        return ResponseEntity.ok(jobs);
    }

    /**
     * Get employee count for a job
     */
    @GetMapping("/{id}/employee-count")
    public ResponseEntity<Long> getEmployeeCount(@PathVariable Long id) {
        log.info("GET /api/jobs/{}/employee-count", id);
        Long count = jobService.getEmployeeCount(id);
        return ResponseEntity.ok(count);
    }

    /**
     * Check if job exists by title
     */
    @GetMapping("/exists/{title}")
    public ResponseEntity<Boolean> existsByTitle(@PathVariable String title) {
        log.info("GET /api/jobs/exists/{}", title);
        boolean exists = jobService.existsByTitle(title);
        return ResponseEntity.ok(exists);
    }
}
