package com.schoolwebsite.backend.tenantsubscription;

import com.schoolwebsite.backend.siteconfiguration.SiteConfig;
import com.schoolwebsite.backend.siteconfiguration.SiteConfigRepository;
import com.schoolwebsite.backend.pagebuilder.Page;
import com.schoolwebsite.backend.pagebuilder.PageRepository;
import com.schoolwebsite.backend.pagebuilder.PageSection;
import com.schoolwebsite.backend.pagebuilder.PageSectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TenantService {

    private final TenantRepository tenantRepository;
    private final SiteConfigRepository siteConfigRepository;
    private final PageRepository pageRepository;
    private final PageSectionRepository pageSectionRepository;

    @Transactional
    public TenantResponse onboardTenant(TenantOnboardRequest request) {
        if (tenantRepository.existsBySubdomain(request.getSubdomain())) {
            throw new IllegalArgumentException("Subdomain is already taken");
        }
        if (tenantRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("School name is already registered");
        }

        Tenant tenant = Tenant.builder()
                .name(request.getName())
                .subdomain(request.getSubdomain())
                .status("ACTIVE")
                .build();

        Tenant savedTenant = tenantRepository.save(tenant);

        // Initialize default SiteConfig
        SiteConfig siteConfig = SiteConfig.builder()
                .tenantId(savedTenant.getId())
                .primaryColor(request.getPrimaryColor())
                .secondaryColor(request.getSecondaryColor())
                .accentColor(request.getAccentColor())
                .fontFamily(request.getFontFamily())
                .build();

        siteConfigRepository.save(siteConfig);

        return mapToResponse(savedTenant);
    }

    public TenantResponse getTenantBySubdomain(String subdomain) {
        Tenant tenant = tenantRepository.findBySubdomain(subdomain)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found with subdomain: " + subdomain));
        return mapToResponse(tenant);
    }

    public java.util.List<TenantResponse> getAllTenants() {
        return tenantRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    @Transactional
    public TenantResponse updateCustomDomain(Long tenantId, String customDomain) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found with id: " + tenantId));
        tenant.setCustomDomain(customDomain != null && !customDomain.trim().isEmpty() ? customDomain.trim() : null);
        Tenant updated = tenantRepository.save(tenant);
        return mapToResponse(updated);
    }

    @Transactional
    public TenantResponse cloneTenant(Long sourceTenantId, String newName, String newSubdomain) {
        if (tenantRepository.existsBySubdomain(newSubdomain)) {
            throw new IllegalArgumentException("Subdomain is already taken");
        }
        if (tenantRepository.existsByName(newName)) {
            throw new IllegalArgumentException("School name is already registered");
        }

        Tenant sourceTenant = tenantRepository.findById(sourceTenantId)
                .orElseThrow(() -> new IllegalArgumentException("Source Tenant not found with id: " + sourceTenantId));

        Tenant newTenant = Tenant.builder()
                .name(newName)
                .subdomain(newSubdomain)
                .status("ACTIVE")
                .build();
        Tenant savedTenant = tenantRepository.save(newTenant);
        Long newTenantId = savedTenant.getId();

        SiteConfig sourceConfig = siteConfigRepository.findByTenantId(sourceTenantId)
                .orElse(null);
        if (sourceConfig != null) {
            SiteConfig clonedConfig = SiteConfig.builder()
                    .tenantId(newTenantId)
                    .primaryColor(sourceConfig.getPrimaryColor())
                    .secondaryColor(sourceConfig.getSecondaryColor())
                    .accentColor(sourceConfig.getAccentColor())
                    .fontFamily(sourceConfig.getFontFamily())
                    .themeName(sourceConfig.getThemeName())
                    .logoUrl(sourceConfig.getLogoUrl())
                    .faviconUrl(sourceConfig.getFaviconUrl())
                    .contactEmail(sourceConfig.getContactEmail())
                    .contactPhone(sourceConfig.getContactPhone())
                    .socialLinks(sourceConfig.getSocialLinks())
                    .build();
            siteConfigRepository.save(clonedConfig);
        } else {
            SiteConfig fallbackConfig = SiteConfig.builder()
                    .tenantId(newTenantId)
                    .primaryColor("#1e3a8a")
                    .secondaryColor("#3b82f6")
                    .accentColor("#f59e0b")
                    .fontFamily("Segoe UI")
                    .build();
            siteConfigRepository.save(fallbackConfig);
        }

        List<Page> sourcePages = pageRepository.findByTenantId(sourceTenantId);
        for (Page srcPage : sourcePages) {
            Page clonedPage = Page.builder()
                    .tenantId(newTenantId)
                    .title(srcPage.getTitle())
                    .slug(srcPage.getSlug())
                    .status(srcPage.getStatus())
                    .build();
            Page savedClonedPage = pageRepository.save(clonedPage);

            List<PageSection> srcSections = pageSectionRepository.findByPageIdOrderByPositionOrderAsc(srcPage.getId());
            for (PageSection srcSec : srcSections) {
                PageSection clonedSec = PageSection.builder()
                        .pageId(savedClonedPage.getId())
                        .type(srcSec.getType())
                        .positionOrder(srcSec.getPositionOrder())
                        .config(srcSec.getConfig())
                        .build();
                pageSectionRepository.save(clonedSec);
            }
        }

        return mapToResponse(savedTenant);
    }

    private TenantResponse mapToResponse(Tenant tenant) {
        return TenantResponse.builder()
                .id(tenant.getId())
                .name(tenant.getName())
                .subdomain(tenant.getSubdomain())
                .customDomain(tenant.getCustomDomain())
                .status(tenant.getStatus())
                .createdAt(tenant.getCreatedAt())
                .build();
    }
}
