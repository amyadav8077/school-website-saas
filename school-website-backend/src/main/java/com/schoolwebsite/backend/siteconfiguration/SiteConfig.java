package com.schoolwebsite.backend.siteconfiguration;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "site_configs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SiteConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false, unique = true)
    private Long tenantId;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "favicon_url")
    private String faviconUrl;

    @Column(name = "primary_color", nullable = false)
    private String primaryColor; // e.g. #1e3a8a

    @Column(name = "secondary_color", nullable = false)
    private String secondaryColor; // e.g. #3b82f6

    @Column(name = "accent_color", nullable = false)
    private String accentColor; // e.g. #f59e0b

    @Column(name = "font_family", nullable = false)
    private String fontFamily; // e.g. Inter, Roboto

    @Column(name = "theme_name")
    private String themeName; // DEFAULT, GURUKUL_MAROON, ROYAL_NAVY, FOREST_GREEN, SLATE_GREY

    @Column(name = "contact_email")
    private String contactEmail;

    @Column(name = "contact_phone")
    private String contactPhone;

    @Column(name = "social_links")
    private String socialLinks; // Stringified JSON or comma-separated links

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (themeName == null) {
            themeName = "DEFAULT";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
