package com.schoolwebsite.backend.admissions;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AdmissionLeadRequest {
    @NotBlank(message = "Student name is required")
    private String studentName;

    @NotBlank(message = "Grade level is required")
    private String gradeLevel;

    @NotBlank(message = "Parent name is required")
    private String parentName;

    @NotBlank(message = "Parent email is required")
    @Email(message = "Valid email is required")
    private String parentEmail;

    @NotBlank(message = "Parent phone is required")
    private String parentPhone;

    private String message;
}
