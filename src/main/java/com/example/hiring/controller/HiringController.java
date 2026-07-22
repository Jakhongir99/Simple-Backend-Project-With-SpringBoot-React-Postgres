package com.example.hiring.controller;

import com.example.hiring.dto.CreateHiringRequest;
import com.example.hiring.dto.HiringDecisionRequest;
import com.example.hiring.dto.HiringRequestDto;
import com.example.hiring.enums.HiringStatus;
import com.example.hiring.service.HiringService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import javax.persistence.EntityNotFoundException;
import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/hiring")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class HiringController {

    private final HiringService hiringService;

    /** Any authenticated user (employee) can submit a hiring request. */
    @PostMapping
    public ResponseEntity<HiringRequestDto> submit(@Valid @RequestBody CreateHiringRequest request) {
        log.info("POST /api/hiring - candidate: {}", request.getCandidateEmail());
        HiringRequestDto dto = hiringService.submit(request, currentUser());
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    /** List requests with optional status filter and pagination. */
    @GetMapping
    public ResponseEntity<?> list(
            @RequestParam(required = false) HiringStatus status,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        log.info("GET /api/hiring - status: {}, page: {}, size: {}", status, page, size);

        if (page != null || size != null) {
            int pageNumber = page != null ? page : 0;
            int pageSize = size != null ? size : 10;
            Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(Sort.Direction.DESC, "createdAt"));
            Page<HiringRequestDto> result = hiringService.getAllPaged(status, pageable);
            return ResponseEntity.ok(result);
        }

        List<HiringRequestDto> result =
                status != null ? hiringService.getByStatus(status) : hiringService.getAll();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<HiringRequestDto> getById(@PathVariable Long id) {
        log.info("GET /api/hiring/{}", id);
        try {
            return ResponseEntity.ok(hiringService.getById(id));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/hr/approve")
    @PreAuthorize("hasAnyRole('HR','ADMIN')")
    public ResponseEntity<HiringRequestDto> hrApprove(
            @PathVariable Long id,
            @Valid @RequestBody(required = false) HiringDecisionRequest decision) {
        log.info("POST /api/hiring/{}/hr/approve", id);
        return decide(() -> hiringService.hrApprove(id, decision, currentUser()));
    }

    @PostMapping("/{id}/hr/reject")
    @PreAuthorize("hasAnyRole('HR','ADMIN')")
    public ResponseEntity<HiringRequestDto> hrReject(
            @PathVariable Long id,
            @Valid @RequestBody(required = false) HiringDecisionRequest decision) {
        log.info("POST /api/hiring/{}/hr/reject", id);
        return decide(() -> hiringService.hrReject(id, decision, currentUser()));
    }

    @PostMapping("/{id}/director/approve")
    @PreAuthorize("hasAnyRole('DIRECTOR','ADMIN')")
    public ResponseEntity<HiringRequestDto> directorApprove(
            @PathVariable Long id,
            @Valid @RequestBody(required = false) HiringDecisionRequest decision) {
        log.info("POST /api/hiring/{}/director/approve", id);
        return decide(() -> hiringService.directorApprove(id, decision, currentUser()));
    }

    @PostMapping("/{id}/director/reject")
    @PreAuthorize("hasAnyRole('DIRECTOR','ADMIN')")
    public ResponseEntity<HiringRequestDto> directorReject(
            @PathVariable Long id,
            @Valid @RequestBody(required = false) HiringDecisionRequest decision) {
        log.info("POST /api/hiring/{}/director/reject", id);
        return decide(() -> hiringService.directorReject(id, decision, currentUser()));
    }

    // --- helpers ---

    private ResponseEntity<HiringRequestDto> decide(java.util.function.Supplier<HiringRequestDto> action) {
        try {
            return ResponseEntity.ok(action.get());
        } catch (EntityNotFoundException e) {
            log.warn("Hiring decision failed (not found): {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException | IllegalArgumentException e) {
            log.warn("Hiring decision failed (bad state): {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    private String currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null ? auth.getName() : "unknown";
    }
}
