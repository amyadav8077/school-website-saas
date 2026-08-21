package com.schoolwebsite.backend.analytics.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

/**
 * A single public-website page load for a tenant. Recorded unauthenticated from
 * the public site; aggregated for the admin dashboard visits graph.
 */
@Entity
@Table(name = "site_visits")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SiteVisit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(length = 512)
    private String path;

    @Column(name = "visited_at", nullable = false, updatable = false)
    private LocalDateTime visitedAt;

    @PrePersist
    protected void onCreate() {
        if (visitedAt == null) {
            visitedAt = LocalDateTime.now();
        }
    }
}
