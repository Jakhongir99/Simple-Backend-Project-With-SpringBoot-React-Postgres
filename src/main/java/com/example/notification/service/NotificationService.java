package com.example.notification.service;

import com.example.hiring.entity.HiringRequest;
import com.example.notification.dto.NotificationDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificationService {

    void notifyHiringDecision(HiringRequest request, String title, String message);

    Page<NotificationDto> getMyNotifications(String recipientEmail, Pageable pageable);

    long getUnreadCount(String recipientEmail);

    NotificationDto markAsRead(Long id, String recipientEmail);
}
