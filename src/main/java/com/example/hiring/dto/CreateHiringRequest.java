package com.example.hiring.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateHiringRequest {

    @NotBlank(message = "Nomzod ismi majburiy")
    @Size(min = 2, max = 100, message = "Nomzod ismi 2–100 belgi bo'lishi kerak")
    private String candidateName;

    @NotBlank(message = "Nomzod email majburiy")
    @Email(message = "Email noto'g'ri formatda")
    private String candidateEmail;

    @NotBlank(message = "Lavozim majburiy")
    @Size(max = 100, message = "Lavozim 100 belgidan oshmasligi kerak")
    private String position;

    @Size(max = 100, message = "Bo'lim 100 belgidan oshmasligi kerak")
    private String department;
}
