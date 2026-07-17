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
public class GenerateFromPromptRequest {

    @NotBlank(message = "Prompt is required")
    @Size(min = 5, max = 20000, message = "Prompt must be between 5 and 20000 characters")
    private String prompt;

    /** Optional. Auto-generated from name if empty. */
    @Size(max = 80)
    private String processKey;

    /** Optional. Derived from prompt if empty. */
    @Size(max = 120)
    private String name;
}
