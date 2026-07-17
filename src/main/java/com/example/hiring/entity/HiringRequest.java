package com.example.hiring.entity;

import com.example.hiring.enums.HiringStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.*;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.time.LocalDateTime;

@Entity
@Table(name = "hiring_requests")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class HiringRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Candidate name is required")
    @Size(min = 2, max = 100)
    @Column(name = "candidate_name", nullable = false, length = 100)
    private String candidateName;

    @NotBlank(message = "Candidate email is required")
    @Email(message = "Candidate email must be valid")
    @Column(name = "candidate_email", nullable = false, length = 100)
    private String candidateEmail;

    @NotBlank(message = "Position is required")
    @Size(max = 100)
    @Column(name = "position", nullable = false, length = 100)
    private String position;

    @Size(max = 100)
    @Column(name = "department", length = 100)
    private String department;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private HiringStatus status = HiringStatus.SUBMITTED;

    @Column(name = "submitted_by", length = 100)
    private String submittedBy;

    // HR decision
    @Column(name = "hr_comment", length = 500)
    private String hrComment;

    @Column(name = "hr_decided_by", length = 100)
    private String hrDecidedBy;

    @Column(name = "hr_decided_at")
    private LocalDateTime hrDecidedAt;

    // Director decision
    @Column(name = "director_comment", length = 500)
    private String directorComment;

    @Column(name = "director_decided_by", length = 100)
    private String directorDecidedBy;

    @Column(name = "director_decided_at")
    private LocalDateTime directorDecidedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
