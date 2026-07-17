package com.example.hiring.dto;

import com.example.hiring.enums.HiringStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HiringRequestDto {

    private Long id;
    private String candidateName;
    private String candidateEmail;
    private String position;
    private String department;
    private HiringStatus status;
    private String submittedBy;

    private String hrComment;
    private String hrDecidedBy;
    private LocalDateTime hrDecidedAt;

    private String directorComment;
    private String directorDecidedBy;
    private LocalDateTime directorDecidedAt;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
