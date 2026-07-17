package com.example.workflow.controller;

import com.example.workflow.dto.CreateWorkflowProcessRequest;
import com.example.workflow.dto.GenerateFromPromptRequest;
import com.example.workflow.dto.UpdateWorkflowProcessRequest;
import com.example.workflow.dto.WorkflowProcessDto;
import com.example.workflow.service.WorkflowProcessService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.persistence.EntityNotFoundException;
import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/workflow-processes")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class WorkflowProcessController {

    private final WorkflowProcessService service;

    @GetMapping
    public ResponseEntity<List<WorkflowProcessDto>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkflowProcessDto> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(service.getById(id));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/key/{key}")
    public ResponseEntity<WorkflowProcessDto> getByKey(@PathVariable String key) {
        try {
            return ResponseEntity.ok(service.getByKey(key));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<WorkflowProcessDto> create(@Valid @RequestBody CreateWorkflowProcessRequest request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
        } catch (IllegalArgumentException e) {
            log.warn("Create process failed: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Create a process from a natural-language prompt.
     * Example: "Employee ariza beradi -> HR ko'rib chiqadi -> Director tasdiqlaydi. Rad etsa tugaydi"
     */
    @PostMapping("/from-prompt")
    public ResponseEntity<WorkflowProcessDto> createFromPrompt(
            @Valid @RequestBody GenerateFromPromptRequest request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(service.createFromPrompt(request));
        } catch (IllegalArgumentException e) {
            log.warn("Prompt generate failed: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkflowProcessDto> update(
            @PathVariable Long id, @Valid @RequestBody UpdateWorkflowProcessRequest request) {
        try {
            return ResponseEntity.ok(service.update(id, request));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            service.delete(id);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
