package com.example.notification.service.impl;

import com.example.hiring.entity.HiringRequest;
import com.example.notification.dto.NotificationDto;
import com.example.notification.entity.Notification;
import com.example.notification.mapper.NotificationMapper;
import com.example.notification.repository.NotificationRepository;
import com.example.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityNotFoundException;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;

    @Override
    public void notifyHiringDecision(HiringRequest request, String title, String message) {
        if (request == null || request.getSubmittedBy() == null || request.getSubmittedBy().trim().isEmpty()) {
            return;
        }

        Notification notification = Notification.builder()
                .recipientEmail(request.getSubmittedBy().trim())
                .title(title)
                .message(message)
                .type("HIRING")
                .referenceId(request.getId())
                .read(false)
                .build();

        notificationRepository.save(notification);
        log.info("Notification sent to {} for hiring request #{}", notification.getRecipientEmail(), request.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationDto> getMyNotifications(String recipientEmail, Pageable pageable) {
        return notificationRepository
                .findByRecipientEmailOrderByCreatedAtDesc(recipientEmail, pageable)
                .map(notificationMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(String recipientEmail) {
        return notificationRepository.countByRecipientEmailAndReadFalse(recipientEmail);
    }

    @Override
    public NotificationDto markAsRead(Long id, String recipientEmail) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Notification not found: " + id));

        if (!recipientEmail.equalsIgnoreCase(notification.getRecipientEmail())) {
            throw new EntityNotFoundException("Notification not found: " + id);
        }

        notification.setRead(true);
        return notificationMapper.toDto(notificationRepository.save(notification));
    }
}
