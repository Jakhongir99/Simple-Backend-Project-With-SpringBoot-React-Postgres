package com.example.workflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.Size;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateWorkflowProcessRequest {

    @Size(max = 120)
    private String name;

    @Size(max = 500)
    private String description;

    /** The edited BPMN 2.0 XML. */
    private String bpmnXml;

    private Boolean isActive;
}
