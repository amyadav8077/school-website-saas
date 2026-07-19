package com.schoolwebsite.backend.siteconfiguration;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SiteConfigResponse {
    private Long id;
    private Long tenantId;
    private String logoUrl;
    private String faviconUrl;
    private String primaryColor;
    private String secondaryColor;
    private String accentColor;
    private String fontFamily;
    private String themeName;
    private String contactEmail;
    private String contactPhone;
    private String socialLinks;
}
