package com.example.employee.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.Email;
import javax.validation.constraints.Positive;
import java.lang.Double;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateEmployeeRequest {

    private String firstName;
    private String lastName;
    
    @Email(message = "Email should be valid")
    private String email;
    
    private String phone;
    private LocalDate hireDate;
    
    @Positive(message = "Salary must be positive")
    private Double salary;
    
    private Long departmentId;
    private Long jobId;
    private Long managerId;
    private Boolean isActive;
}
