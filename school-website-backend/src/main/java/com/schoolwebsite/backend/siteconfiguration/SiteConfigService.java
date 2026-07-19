package com.schoolwebsite.backend.siteconfiguration;

import com.schoolwebsite.backend.tenantsubscription.Tenant;
import com.schoolwebsite.backend.tenantsubscription.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SiteConfigService {

    private final SiteConfigRepository siteConfigRepository;
    private final TenantRepository tenantRepository;

    public SiteConfigResponse getSiteConfigBySubdomain(String subdomain) {
        Tenant tenant = tenantRepository.findBySubdomain(subdomain)
                .orElseThrow(() -> new IllegalArgumentException("Subdomain not found: " + subdomain));

        SiteConfig siteConfig = siteConfigRepository.findByTenantId(tenant.getId())
                .orElseThrow(() -> new IllegalArgumentException("Site configuration not found for tenant: " + tenant.getName()));

        return mapToResponse(siteConfig);
    }

    @Transactional
    public SiteConfigResponse updateSiteConfig(Long tenantId, SiteConfigUpdateRequest request) {
        SiteConfig siteConfig = siteConfigRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Site configuration not found for tenant id: " + tenantId));

        siteConfig.setPrimaryColor(request.getPrimaryColor());
        siteConfig.setSecondaryColor(request.getSecondaryColor());
        siteConfig.setAccentColor(request.getAccentColor());
        siteConfig.setFontFamily(request.getFontFamily());
        siteConfig.setThemeName(request.getThemeName() != null ? request.getThemeName() : "DEFAULT");
        siteConfig.setLogoUrl(request.getLogoUrl());
        siteConfig.setFaviconUrl(request.getFaviconUrl());
        siteConfig.setContactEmail(request.getContactEmail());
        siteConfig.setContactPhone(request.getContactPhone());
        siteConfig.setSocialLinks(request.getSocialLinks());

        SiteConfig updated = siteConfigRepository.save(siteConfig);
        return mapToResponse(updated);
    }

    private SiteConfigResponse mapToResponse(SiteConfig siteConfig) {
        return SiteConfigResponse.builder()
                .id(siteConfig.getId())
                .tenantId(siteConfig.getTenantId())
                .logoUrl(siteConfig.getLogoUrl())
                .faviconUrl(siteConfig.getFaviconUrl())
                .primaryColor(siteConfig.getPrimaryColor())
                .secondaryColor(siteConfig.getSecondaryColor())
                .accentColor(siteConfig.getAccentColor())
                .fontFamily(siteConfig.getFontFamily())
                .themeName(siteConfig.getThemeName() != null ? siteConfig.getThemeName() : "DEFAULT")
                .contactEmail(siteConfig.getContactEmail())
                .contactPhone(siteConfig.getContactPhone())
                .socialLinks(siteConfig.getSocialLinks())
                .build();
    }
}
