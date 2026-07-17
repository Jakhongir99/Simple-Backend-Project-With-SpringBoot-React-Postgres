package com.example.hiring.repository;

import com.example.hiring.entity.HiringRequest;
import com.example.hiring.enums.HiringStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HiringRequestRepository extends JpaRepository<HiringRequest, Long> {

    List<HiringRequest> findAllByOrderByCreatedAtDesc();

    List<HiringRequest> findByStatusOrderByCreatedAtDesc(HiringStatus status);

    long countByStatus(HiringStatus status);
}
