package com.example.workflow.repository;

import com.example.workflow.entity.WorkflowProcess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkflowProcessRepository extends JpaRepository<WorkflowProcess, Long> {

    Optional<WorkflowProcess> findByProcessKey(String processKey);

    boolean existsByProcessKey(String processKey);

    List<WorkflowProcess> findAllByOrderByNameAsc();
}
