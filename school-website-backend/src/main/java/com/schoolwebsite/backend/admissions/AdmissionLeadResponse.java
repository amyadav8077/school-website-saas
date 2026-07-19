package com.schoolwebsite.backend.admissions;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdmissionLeadResponse {
    private Long id;
    private Long tenantId;
    private String studentName;
    private String gradeLevel;
    private String parentName;
    private String parentEmail;
    private String parentPhone;
    private String status;
    private String message;
    private LocalDateTime createdAt;
}
