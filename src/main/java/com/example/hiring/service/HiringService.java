package com.example.hiring.service;

import com.example.hiring.dto.CreateHiringRequest;
import com.example.hiring.dto.HiringDecisionRequest;
import com.example.hiring.dto.HiringRequestDto;
import com.example.hiring.enums.HiringStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface HiringService {

    /** Employee submits a new hiring request (status = SUBMITTED). */
    HiringRequestDto submit(CreateHiringRequest request, String submittedBy);

    /** All requests, newest first. */
    List<HiringRequestDto> getAll();

    /** Paginated list, optionally filtered by status. */
    Page<HiringRequestDto> getAllPaged(HiringStatus status, Pageable pageable);

    /** Requests filtered by status. */
    List<HiringRequestDto> getByStatus(HiringStatus status);

    HiringRequestDto getById(Long id);

    /** HR approves: SUBMITTED -> HR_APPROVED. */
    HiringRequestDto hrApprove(Long id, HiringDecisionRequest decision, String decidedBy);

    /** HR rejects: SUBMITTED -> REJECTED_BY_HR. */
    HiringRequestDto hrReject(Long id, HiringDecisionRequest decision, String decidedBy);

    /** Director approves: HR_APPROVED -> HIRED. */
    HiringRequestDto directorApprove(Long id, HiringDecisionRequest decision, String decidedBy);

    /** Director rejects: HR_APPROVED -> REJECTED_BY_DIRECTOR. */
    HiringRequestDto directorReject(Long id, HiringDecisionRequest decision, String decidedBy);
}
