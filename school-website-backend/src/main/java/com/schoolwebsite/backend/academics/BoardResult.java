package com.schoolwebsite.backend.academics;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "board_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "class_level", nullable = false)
    private String classLevel; // "CLASS 10", "CLASS 12"

    @Column(name = "assessment_year", nullable = false)
    private Integer assessmentYear; // e.g. 2023, 2024, 2025

    @Column(name = "registered_students", nullable = false)
    private Integer registeredStudents;

    @Column(name = "passed_students", nullable = false)
    private Integer passedStudents;

    @Column(name = "pass_percentage", nullable = false)
    private Double passPercentage;

    @Column(length = 512)
    private String remarks;

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
