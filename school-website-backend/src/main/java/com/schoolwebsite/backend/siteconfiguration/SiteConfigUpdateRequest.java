package com.schoolwebsite.backend.siteconfiguration;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SiteConfigUpdateRequest {

    @NotBlank(message = "Primary color is required")
    private String primaryColor;

    @NotBlank(message = "Secondary color is required")
    private String secondaryColor;

    @NotBlank(message = "Accent color is required")
    private String accentColor;

    @NotBlank(message = "Font family is required")
    private String fontFamily;

    private String themeName;
    private String logoUrl;
    private String faviconUrl;
    private String contactEmail;
    private String contactPhone;
    private String socialLinks;
}
