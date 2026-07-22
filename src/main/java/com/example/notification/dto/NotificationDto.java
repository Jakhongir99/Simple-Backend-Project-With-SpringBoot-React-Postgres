package com.example.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {
    private Long id;
    private String recipientEmail;
    private String title;
    private String message;
    private Boolean read;
    private String type;
    private Long referenceId;
    private LocalDateTime createdAt;
}
