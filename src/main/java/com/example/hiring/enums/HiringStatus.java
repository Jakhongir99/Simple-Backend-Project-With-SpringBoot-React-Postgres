package com.example.hiring.enums;

/**
 * The states a hiring request moves through.
 *
 * Flow: SUBMITTED -> (HR) -> HR_APPROVED -> (Director) -> HIRED
 *                        \-> REJECTED_BY_HR
 *                                             \-> REJECTED_BY_DIRECTOR
 */
public enum HiringStatus {
    SUBMITTED,            // Employee submitted, waiting for HR review
    HR_APPROVED,          // HR approved, waiting for Director review
    REJECTED_BY_HR,       // Terminal: HR rejected
    HIRED,                // Terminal: Director approved -> candidate hired
    REJECTED_BY_DIRECTOR  // Terminal: Director rejected
}
