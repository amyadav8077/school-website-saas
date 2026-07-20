package com.schoolwebsite.backend.billing;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_invoices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentInvoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "student_name", nullable = false)
    private String studentName;

    @Column(name = "admission_no")
    private String admissionNo;

    @Column(name = "grade_level", nullable = false)
    private String gradeLevel; // e.g. 1st, 2nd, etc. (Maps to classLevel)

    private String section;

    @Column(name = "father_name")
    private String fatherName;

    @Column(name = "aadhar_no")
    private String aadharNo;

    @Column(name = "fee_item_name", nullable = false)
    private String feeItemName;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private String status; // PENDING, PAID

    @Column(name = "due_date", nullable = false)
    private LocalDateTime dueDate;

    @Column(name = "payment_date")
    private LocalDateTime paymentDate;

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
