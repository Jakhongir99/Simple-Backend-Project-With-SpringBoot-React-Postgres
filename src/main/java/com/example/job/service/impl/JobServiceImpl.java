package com.example.job.service.impl;

import com.example.job.dto.JobDto;
import com.example.job.dto.CreateJobRequest;
import com.example.job.dto.UpdateJobRequest;
import com.example.job.service.JobService;
import com.example.job.entity.Job;
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
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<JobDto> getAllJobs(Pageable pageable) {
        log.info("Fetching all jobs with pagination: {}", pageable);
        Page<Job> jobs = jobRepository.findAll(pageable);
        return jobs.map(this::mapToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobDto> getAllActiveJobs() {
        log.info("Fetching all active jobs");
        List<Job> jobs = jobRepository.findByIsActiveTrue();
        return jobs.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<JobDto> getJobById(Long id) {
        log.info("Fetching job by ID: {}", id);
        return jobRepository.findById(id)
                .map(this::mapToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<JobDto> getJobByTitle(String title) {
        log.info("Fetching job by title: {}", title);
        return jobRepository.findByTitle(title)
                .map(this::mapToDto);
    }

    @Override
    public JobDto createJob(CreateJobRequest request) {
        log.info("Creating new job: {}", request.getTitle());
        
        if (jobRepository.existsByTitle(request.getTitle())) {
            throw new IllegalArgumentException("Job with title '" + request.getTitle() + "' already exists");
        }

        // Validate salary range
        if (request.getMinSalary() != null && request.getMaxSalary() != null) {
            if (request.getMinSalary().compareTo(request.getMaxSalary()) > 0) {
                throw new IllegalArgumentException("Minimum salary cannot be greater than maximum salary");
            }
        }

        Job job = Job.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .minSalary(request.getMinSalary())
                .maxSalary(request.getMaxSalary())
                .requirements(request.getRequirements())
                .benefits(request.getBenefits())
                .isActive(true)
                .build();

        Job savedJob = jobRepository.save(job);
        log.info("Job created successfully with ID: {}", savedJob.getId());
        
        return mapToDto(savedJob);
    }

    @Override
    public JobDto updateJob(Long id, UpdateJobRequest request) {
        log.info("Updating job with ID: {}", id);
        
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Job not found with ID: " + id));

        // Check if title is being changed and if it conflicts with existing titles
        if (request.getTitle() != null && !request.getTitle().equals(job.getTitle())) {
            if (jobRepository.existsByTitle(request.getTitle())) {
                throw new IllegalArgumentException("Job with title '" + request.getTitle() + "' already exists");
            }
            job.setTitle(request.getTitle());
        }

        if (request.getDescription() != null) {
            job.setDescription(request.getDescription());
        }
        if (request.getMinSalary() != null) {
            job.setMinSalary(request.getMinSalary());
        }
        if (request.getMaxSalary() != null) {
            job.setMaxSalary(request.getMaxSalary());
        }
        if (request.getRequirements() != null) {
            job.setRequirements(request.getRequirements());
        }
        if (request.getBenefits() != null) {
            job.setBenefits(request.getBenefits());
        }
        if (request.getIsActive() != null) {
            job.setIsActive(request.getIsActive());
        }

        // Validate salary range if both are being updated
        if (job.getMinSalary() != null && job.getMaxSalary() != null) {
            if (job.getMinSalary().compareTo(job.getMaxSalary()) > 0) {
                throw new IllegalArgumentException("Minimum salary cannot be greater than maximum salary");
            }
        }

        job.setUpdatedAt(LocalDateTime.now());
        Job updatedJob = jobRepository.save(job);
        
        log.info("Job updated successfully with ID: {}", id);
        return mapToDto(updatedJob);
    }

    @Override
    public void deleteJob(Long id) {
        log.info("Deleting job with ID: {}", id);
        
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Job not found with ID: " + id));

        // Soft delete
        job.setIsActive(false);
        job.setUpdatedAt(LocalDateTime.now());
        jobRepository.save(job);
        
        log.info("Job deleted successfully with ID: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobDto> searchJobs(String keyword) {
        log.info("Searching jobs with keyword: {}", keyword);
        List<Job> jobs = jobRepository.searchByKeyword(keyword);
        return jobs.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobDto> getJobsBySalaryRange(Double minSalary, Double maxSalary) {
        log.info("Fetching jobs by salary range: {} - {}", minSalary, maxSalary);
        List<Job> jobs = jobRepository.findByMinSalaryGreaterThanEqual(minSalary);
        return jobs.stream()
                .filter(job -> job.getMaxSalary() == null || job.getMaxSalary() <= maxSalary)
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Long getEmployeeCount(Long jobId) {
        log.info("Getting employee count for job ID: {}", jobId);
        return jobRepository.countEmployeesByJob(jobId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByTitle(String title) {
        return jobRepository.existsByTitle(title);
    }

    private JobDto mapToDto(Job job) {
        JobDto dto = JobDto.builder()
                .id(job.getId())
                .title(job.getTitle())
                .description(job.getDescription())
                .minSalary(job.getMinSalary())
                .maxSalary(job.getMaxSalary())
                .requirements(job.getRequirements())
                .benefits(job.getBenefits())
                .isActive(job.getIsActive())
                .createdAt(job.getCreatedAt())
                .updatedAt(job.getUpdatedAt())
                .build();

        // Set additional fields
        dto.setEmployeeCount(jobRepository.countEmployeesByJob(job.getId()));
        
        return dto;
    }
}
