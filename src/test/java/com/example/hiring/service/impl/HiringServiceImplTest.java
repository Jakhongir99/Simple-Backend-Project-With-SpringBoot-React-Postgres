package com.example.hiring.service.impl;

import com.example.hiring.dto.CreateHiringRequest;
import com.example.hiring.dto.HiringDecisionRequest;
import com.example.hiring.dto.HiringRequestDto;
import com.example.hiring.entity.HiringRequest;
import com.example.hiring.enums.HiringStatus;
import com.example.hiring.mapper.HiringMapper;
import com.example.hiring.repository.HiringRequestRepository;
import com.example.notification.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.persistence.EntityNotFoundException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HiringServiceImplTest {

    @Mock
    private HiringRequestRepository hiringRequestRepository;

    @Mock
    private HiringMapper hiringMapper;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private HiringServiceImpl hiringService;

    private HiringRequest entity;
    private HiringRequestDto dto;

    @BeforeEach
    void setUp() {
        entity = HiringRequest.builder()
                .id(1L)
                .candidateName("Ali Valiyev")
                .candidateEmail("ali@example.com")
                .position("Developer")
                .status(HiringStatus.SUBMITTED)
                .submittedBy("employee@example.com")
                .build();

        dto = HiringRequestDto.builder()
                .id(1L)
                .candidateName("Ali Valiyev")
                .status(HiringStatus.SUBMITTED)
                .build();
    }

    @Test
    void submit_setsSubmittedStatus() {
        CreateHiringRequest request = CreateHiringRequest.builder()
                .candidateName("Ali Valiyev")
                .candidateEmail("ali@example.com")
                .position("Developer")
                .build();

        when(hiringMapper.toEntity(request)).thenReturn(new HiringRequest());
        when(hiringRequestRepository.save(any(HiringRequest.class))).thenAnswer(inv -> {
            HiringRequest saved = inv.getArgument(0);
            saved.setId(1L);
            saved.setStatus(HiringStatus.SUBMITTED);
            return saved;
        });
        when(hiringMapper.toDto(any(HiringRequest.class))).thenReturn(dto);

        HiringRequestDto result = hiringService.submit(request, "employee@example.com");

        assertNotNull(result);
        verify(hiringRequestRepository).save(argThat(e ->
                e.getStatus() == HiringStatus.SUBMITTED
                        && "employee@example.com".equals(e.getSubmittedBy())));
    }

    @Test
    void hrApprove_movesSubmittedToHrApproved() {
        when(hiringRequestRepository.findById(1L)).thenReturn(Optional.of(entity));
        when(hiringRequestRepository.save(any(HiringRequest.class))).thenAnswer(inv -> inv.getArgument(0));
        when(hiringMapper.toDto(any(HiringRequest.class))).thenReturn(
                HiringRequestDto.builder().id(1L).status(HiringStatus.HR_APPROVED).build());

        HiringRequestDto result = hiringService.hrApprove(
                1L,
                HiringDecisionRequest.builder().comment("Yaxshi nomzod").build(),
                "hr@example.com");

        assertEquals(HiringStatus.HR_APPROVED, entity.getStatus());
        assertEquals("hr@example.com", entity.getHrDecidedBy());
        assertEquals("Yaxshi nomzod", entity.getHrComment());
        verify(notificationService).notifyHiringDecision(eq(entity), anyString(), anyString());
    }

    @Test
    void hrApprove_wrongStatus_throwsIllegalState() {
        entity.setStatus(HiringStatus.HIRED);
        when(hiringRequestRepository.findById(1L)).thenReturn(Optional.of(entity));

        assertThrows(IllegalStateException.class, () ->
                hiringService.hrApprove(1L, null, "hr@example.com"));
    }

    @Test
    void directorApprove_movesHrApprovedToHired() {
        entity.setStatus(HiringStatus.HR_APPROVED);
        when(hiringRequestRepository.findById(1L)).thenReturn(Optional.of(entity));
        when(hiringRequestRepository.save(any(HiringRequest.class))).thenAnswer(inv -> inv.getArgument(0));
        when(hiringMapper.toDto(any(HiringRequest.class))).thenReturn(
                HiringRequestDto.builder().id(1L).status(HiringStatus.HIRED).build());

        HiringRequestDto result = hiringService.directorApprove(
                1L,
                HiringDecisionRequest.builder().comment("Qabul qilindi").build(),
                "director@example.com");

        assertEquals(HiringStatus.HIRED, entity.getStatus());
        verify(notificationService).notifyHiringDecision(eq(entity), anyString(), anyString());
    }

    @Test
    void getById_notFound_throwsEntityNotFound() {
        when(hiringRequestRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> hiringService.getById(99L));
    }
}
