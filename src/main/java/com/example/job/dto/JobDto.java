package com.example.job.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Positive;
import javax.validation.constraints.Size;
import java.lang.Double;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobDto {

    private Long id;

    @NotBlank(message = "Job title is required")
    @Size(min = 2, max = 100, message = "Job title must be between 2 and 100 characters")
    private String title;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;

    @Positive(message = "Minimum salary must be positive")
    private Double minSalary;

    @Positive(message = "Maximum salary must be positive")
    private Double maxSalary;

    @Size(max = 500, message = "Requirements cannot exceed 500 characters")
    private String requirements;

    @Size(max = 500, message = "Benefits cannot exceed 500 characters")
    private String benefits;

    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Additional fields for response
    private Long employeeCount;
}
