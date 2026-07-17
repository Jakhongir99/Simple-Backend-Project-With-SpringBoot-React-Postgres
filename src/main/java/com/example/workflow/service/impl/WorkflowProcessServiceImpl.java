package com.example.workflow.service.impl;

import com.example.workflow.dto.CreateWorkflowProcessRequest;
import com.example.workflow.dto.GenerateFromPromptRequest;
import com.example.workflow.dto.UpdateWorkflowProcessRequest;
import com.example.workflow.dto.WorkflowProcessDto;
import com.example.workflow.entity.WorkflowProcess;
import com.example.workflow.mapper.WorkflowProcessMapper;
import com.example.workflow.repository.WorkflowProcessRepository;
import com.example.workflow.service.BpmnPromptGenerator;
import com.example.workflow.service.WorkflowProcessService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityNotFoundException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class WorkflowProcessServiceImpl implements WorkflowProcessService {

    private final WorkflowProcessRepository repository;
    private final WorkflowProcessMapper mapper;

    /** A minimal, valid BPMN diagram used as a starting point for new processes. */
    private static final String BLANK_BPMN =
            "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
            + "<bpmn:definitions xmlns:bpmn=\"http://www.omg.org/spec/BPMN/20100524/MODEL\" "
            + "xmlns:bpmndi=\"http://www.omg.org/spec/BPMN/20100524/DI\" "
            + "xmlns:dc=\"http://www.omg.org/spec/DD/20100524/DC\" "
            + "id=\"Definitions_1\" targetNamespace=\"http://bpmn.io/schema/bpmn\">\n"
            + "  <bpmn:process id=\"Process_1\" isExecutable=\"false\">\n"
            + "    <bpmn:startEvent id=\"StartEvent_1\" name=\"Boshlanish\" />\n"
            + "  </bpmn:process>\n"
            + "  <bpmndi:BPMNDiagram id=\"BPMNDiagram_1\">\n"
            + "    <bpmndi:BPMNPlane id=\"BPMNPlane_1\" bpmnElement=\"Process_1\">\n"
            + "      <bpmndi:BPMNShape id=\"StartEvent_1_di\" bpmnElement=\"StartEvent_1\">\n"
            + "        <dc:Bounds x=\"180\" y=\"180\" width=\"36\" height=\"36\" />\n"
            + "      </bpmndi:BPMNShape>\n"
            + "    </bpmndi:BPMNPlane>\n"
            + "  </bpmndi:BPMNDiagram>\n"
            + "</bpmn:definitions>";

    @Override
    @Transactional(readOnly = true)
    public List<WorkflowProcessDto> getAll() {
        return repository.findAllByOrderByNameAsc()
                .stream().map(mapper::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public WorkflowProcessDto getById(Long id) {
        return mapper.toDto(findOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public WorkflowProcessDto getByKey(String key) {
        return mapper.toDto(repository.findByProcessKey(key)
                .orElseThrow(() -> new EntityNotFoundException("Process not found: " + key)));
    }

    @Override
    public WorkflowProcessDto create(CreateWorkflowProcessRequest request) {
        if (repository.existsByProcessKey(request.getProcessKey())) {
            throw new IllegalArgumentException("Process key already exists: " + request.getProcessKey());
        }
        WorkflowProcess entity = WorkflowProcess.builder()
                .processKey(request.getProcessKey())
                .name(request.getName())
                .description(request.getDescription())
                .bpmnXml(request.getBpmnXml() != null && !request.getBpmnXml().trim().isEmpty()
                        ? request.getBpmnXml() : BLANK_BPMN)
                .isActive(true)
                .build();
        WorkflowProcess saved = repository.save(entity);
        log.info("Created workflow process: {}", saved.getProcessKey());
        return mapper.toDto(saved);
    }

    @Override
    public WorkflowProcessDto createFromPrompt(GenerateFromPromptRequest request) {
        BpmnPromptGenerator.GeneratedBpmn generated = BpmnPromptGenerator.generate(request.getPrompt());

        String name = (request.getName() != null && !request.getName().trim().isEmpty())
                ? request.getName().trim()
                : generated.getSuggestedName();

        String key = (request.getProcessKey() != null && !request.getProcessKey().trim().isEmpty())
                ? request.getProcessKey().trim()
                : BpmnPromptGenerator.slugify(name);

        // Ensure unique key
        String uniqueKey = key;
        int i = 2;
        while (repository.existsByProcessKey(uniqueKey)) {
            uniqueKey = key + "-" + i;
            i++;
        }

        String description = "Prompt: " + request.getPrompt();
        if (description.length() > 500) {
            description = description.substring(0, 497) + "...";
        }

        CreateWorkflowProcessRequest create = CreateWorkflowProcessRequest.builder()
                .processKey(uniqueKey)
                .name(name)
                .description(description)
                .bpmnXml(generated.getXml())
                .build();

        log.info("Generated BPMN from prompt ({} steps, reject={})",
                generated.getSteps().size(), generated.isWithReject());
        return create(create);
    }

    @Override
    public WorkflowProcessDto update(Long id, UpdateWorkflowProcessRequest request) {
        WorkflowProcess entity = findOrThrow(id);
        if (request.getName() != null) {
            entity.setName(request.getName());
        }
        if (request.getDescription() != null) {
            entity.setDescription(request.getDescription());
        }
        if (request.getBpmnXml() != null && !request.getBpmnXml().trim().isEmpty()) {
            entity.setBpmnXml(request.getBpmnXml());
        }
        if (request.getIsActive() != null) {
            entity.setIsActive(request.getIsActive());
        }
        WorkflowProcess saved = repository.save(entity);
        log.info("Updated workflow process: {}", saved.getProcessKey());
        return mapper.toDto(saved);
    }

    @Override
    public void delete(Long id) {
        WorkflowProcess entity = findOrThrow(id);
        repository.delete(entity);
        log.info("Deleted workflow process: {}", entity.getProcessKey());
    }

    private WorkflowProcess findOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Process not found with ID: " + id));
    }
}
