package com.example.workflow.service;

import com.example.workflow.dto.CreateWorkflowProcessRequest;
import com.example.workflow.dto.GenerateFromPromptRequest;
import com.example.workflow.dto.UpdateWorkflowProcessRequest;
import com.example.workflow.dto.WorkflowProcessDto;

import java.util.List;

public interface WorkflowProcessService {

    List<WorkflowProcessDto> getAll();

    WorkflowProcessDto getById(Long id);

    WorkflowProcessDto getByKey(String key);

    WorkflowProcessDto create(CreateWorkflowProcessRequest request);

    /** Parse a natural-language prompt into BPMN and save a new process. */
    WorkflowProcessDto createFromPrompt(GenerateFromPromptRequest request);

    WorkflowProcessDto update(Long id, UpdateWorkflowProcessRequest request);

    void delete(Long id);
}
