package com.schoolwebsite.backend.academics;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "transfer_certificates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransferCertificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "student_name", nullable = false)
    private String studentName;

    @Column(name = "admission_no", nullable = false)
    private String admissionNo; // e.g. ADM-901

    @Column(name = "class_level", nullable = false)
    private String classLevel; // e.g. Grade 10

    @Column(nullable = false)
    private String section; // e.g. A, B

    @Column(name = "father_name", nullable = false)
    private String fatherName;

    @Column(name = "aadhar_no", nullable = false)
    private String aadharNo; // e.g. 1234-5678-9012

    @Column(name = "tc_number", nullable = false)
    private String tcNumber; // e.g. TC-2026-001

    @Column(name = "issue_date", nullable = false)
    private LocalDateTime issueDate;

    @Column(name = "pdf_url")
    private String pdfUrl; // mock document path

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
