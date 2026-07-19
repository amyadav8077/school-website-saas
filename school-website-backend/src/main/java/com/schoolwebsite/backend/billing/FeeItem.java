package com.schoolwebsite.backend.billing;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "fee_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeeItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(nullable = false)
    private String name; // e.g. "Term 1 Tuition Fee", "Annual Sports Fee"

    @Column(nullable = false)
    private Double amount;

    @Column(length = 512)
    private String description;

    @Column(name = "grade_level")
    private String gradeLevel;

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
