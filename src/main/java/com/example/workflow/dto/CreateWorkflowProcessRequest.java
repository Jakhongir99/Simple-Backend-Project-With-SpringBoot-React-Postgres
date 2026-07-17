package com.example.workflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateWorkflowProcessRequest {

    @NotBlank(message = "Process key is required")
    @Size(max = 80)
    private String processKey;

    @NotBlank(message = "Name is required")
    @Size(max = 120)
    private String name;

    @Size(max = 500)
    private String description;

    /** Optional. When empty a blank starter diagram is used. */
    private String bpmnXml;
}
