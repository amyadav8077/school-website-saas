package com.schoolwebsite.backend.grades;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_grades")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentGrade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "student_name", nullable = false)
    private String studentName;

    @Column(name = "admission_no")
    private String admissionNo;

    @Column(name = "class_level")
    private String classLevel;

    private String section;

    @Column(name = "father_name")
    private String fatherName;

    @Column(name = "aadhar_no")
    private String aadharNo;

    @Column(name = "subject_name", nullable = false)
    private String subjectName; // e.g. Mathematics, English Literature, Chemistry

    @Column(nullable = false)
    private String term; // e.g. Term 1 Midterm, Annual Term End

    @Column(nullable = false)
    private String grade; // e.g. A+, B, 92%

    @Column(length = 512)
    private String remarks; // e.g. "Excellent problem-solving skills"

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
