package com.example.hiring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.Size;

/**
 * Payload for an approve/reject decision by HR or Director.
 * The comment is optional (e.g. reason for rejection).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HiringDecisionRequest {

    @Size(max = 500, message = "Comment cannot exceed 500 characters")
    private String comment;
}
