package com.example.hiring.service.impl;

import com.example.hiring.dto.CreateHiringRequest;
import com.example.hiring.dto.HiringDecisionRequest;
import com.example.hiring.dto.HiringRequestDto;
import com.example.hiring.entity.HiringRequest;
import com.example.hiring.enums.HiringStatus;
import com.example.hiring.mapper.HiringMapper;
import com.example.hiring.repository.HiringRequestRepository;
import com.example.hiring.service.HiringService;
import com.example.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityNotFoundException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class HiringServiceImpl implements HiringService {

    private final HiringRequestRepository hiringRequestRepository;
    private final HiringMapper hiringMapper;
    private final NotificationService notificationService;

    @Override
    public HiringRequestDto submit(CreateHiringRequest request, String submittedBy) {
        log.info("New hiring request submitted for candidate: {} by: {}", request.getCandidateEmail(), submittedBy);

        HiringRequest entity = hiringMapper.toEntity(request);
        entity.setStatus(HiringStatus.SUBMITTED);
        entity.setSubmittedBy(submittedBy);

        HiringRequest saved = hiringRequestRepository.save(entity);
        return hiringMapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HiringRequestDto> getAll() {
        return hiringRequestRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(hiringMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<HiringRequestDto> getAllPaged(HiringStatus status, Pageable pageable) {
        Page<HiringRequest> page = status != null
                ? hiringRequestRepository.findByStatusOrderByCreatedAtDesc(status, pageable)
                : hiringRequestRepository.findAllByOrderByCreatedAtDesc(pageable);
        return page.map(hiringMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HiringRequestDto> getByStatus(HiringStatus status) {
        return hiringRequestRepository.findByStatusOrderByCreatedAtDesc(status)
                .stream()
                .map(hiringMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public HiringRequestDto getById(Long id) {
        return hiringMapper.toDto(findOrThrow(id));
    }

    @Override
    public HiringRequestDto hrApprove(Long id, HiringDecisionRequest decision, String decidedBy) {
        HiringRequest entity = findOrThrow(id);
        requireStatus(entity, HiringStatus.SUBMITTED, "HR review");

        entity.setStatus(HiringStatus.HR_APPROVED);
        entity.setHrComment(commentOf(decision));
        entity.setHrDecidedBy(decidedBy);
        entity.setHrDecidedAt(LocalDateTime.now());

        log.info("Hiring request {} approved by HR: {}", id, decidedBy);
        HiringRequest saved = hiringRequestRepository.save(entity);
        notificationService.notifyHiringDecision(saved,
                "HR tasdiqladi",
                "Ariza #" + saved.getId() + " (" + saved.getCandidateName() + ") HR tomonidan tasdiqlandi.");
        return hiringMapper.toDto(saved);
    }

    @Override
    public HiringRequestDto hrReject(Long id, HiringDecisionRequest decision, String decidedBy) {
        HiringRequest entity = findOrThrow(id);
        requireStatus(entity, HiringStatus.SUBMITTED, "HR review");

        entity.setStatus(HiringStatus.REJECTED_BY_HR);
        entity.setHrComment(commentOf(decision));
        entity.setHrDecidedBy(decidedBy);
        entity.setHrDecidedAt(LocalDateTime.now());

        log.info("Hiring request {} rejected by HR: {}", id, decidedBy);
        HiringRequest saved = hiringRequestRepository.save(entity);
        notificationService.notifyHiringDecision(saved,
                "HR rad etdi",
                "Ariza #" + saved.getId() + " HR tomonidan rad etildi."
                        + (saved.getHrComment() != null ? " Izoh: " + saved.getHrComment() : ""));
        return hiringMapper.toDto(saved);
    }

    @Override
    public HiringRequestDto directorApprove(Long id, HiringDecisionRequest decision, String decidedBy) {
        HiringRequest entity = findOrThrow(id);
        requireStatus(entity, HiringStatus.HR_APPROVED, "Director review");

        entity.setStatus(HiringStatus.HIRED);
        entity.setDirectorComment(commentOf(decision));
        entity.setDirectorDecidedBy(decidedBy);
        entity.setDirectorDecidedAt(LocalDateTime.now());

        log.info("Hiring request {} approved by Director: {} -> HIRED", id, decidedBy);
        HiringRequest saved = hiringRequestRepository.save(entity);
        notificationService.notifyHiringDecision(saved,
                "Ishga olindi!",
                "Tabriklaymiz! " + saved.getCandidateName() + " ishga olish jarayoni muvaffaqiyatli yakunlandi.");
        return hiringMapper.toDto(saved);
    }

    @Override
    public HiringRequestDto directorReject(Long id, HiringDecisionRequest decision, String decidedBy) {
        HiringRequest entity = findOrThrow(id);
        requireStatus(entity, HiringStatus.HR_APPROVED, "Director review");

        entity.setStatus(HiringStatus.REJECTED_BY_DIRECTOR);
        entity.setDirectorComment(commentOf(decision));
        entity.setDirectorDecidedBy(decidedBy);
        entity.setDirectorDecidedAt(LocalDateTime.now());

        log.info("Hiring request {} rejected by Director: {}", id, decidedBy);
        HiringRequest saved = hiringRequestRepository.save(entity);
        notificationService.notifyHiringDecision(saved,
                "Director rad etdi",
                "Ariza #" + saved.getId() + " Director tomonidan rad etildi."
                        + (saved.getDirectorComment() != null ? " Izoh: " + saved.getDirectorComment() : ""));
        return hiringMapper.toDto(saved);
    }

    // --- helpers ---

    private HiringRequest findOrThrow(Long id) {
        return hiringRequestRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Hiring request not found with ID: " + id));
    }

    private void requireStatus(HiringRequest entity, HiringStatus expected, String step) {
        if (entity.getStatus() != expected) {
            throw new IllegalStateException(
                    "Cannot perform " + step + " on request #" + entity.getId()
                            + " because its current status is " + entity.getStatus()
                            + " (expected " + expected + ")");
        }
    }

    private String commentOf(HiringDecisionRequest decision) {
        return decision != null ? decision.getComment() : null;
    }
}
