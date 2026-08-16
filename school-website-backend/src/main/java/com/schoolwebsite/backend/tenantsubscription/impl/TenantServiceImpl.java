package com.schoolwebsite.backend.tenantsubscription.impl;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.schoolwebsite.backend.common.constant.AppConstants;
import com.schoolwebsite.backend.common.exception.AppException;
import com.schoolwebsite.backend.common.exception.ErrorCode;
import com.schoolwebsite.backend.common.util.StringUtils;
import com.schoolwebsite.backend.pagebuilder.entity.Page;
import com.schoolwebsite.backend.pagebuilder.entity.PageSection;
import com.schoolwebsite.backend.pagebuilder.repository.PageRepository;
import com.schoolwebsite.backend.pagebuilder.repository.PageSectionRepository;
import com.schoolwebsite.backend.siteconfiguration.entity.SiteConfig;
import com.schoolwebsite.backend.siteconfiguration.repository.SiteConfigRepository;
import com.schoolwebsite.backend.tenantsubscription.dto.TenantOnboardRequest;
import com.schoolwebsite.backend.tenantsubscription.dto.TenantResponse;
import com.schoolwebsite.backend.tenantsubscription.entity.Tenant;
import com.schoolwebsite.backend.tenantsubscription.event.TenantCacheEvictEvent;
import com.schoolwebsite.backend.tenantsubscription.repository.TenantRepository;
import com.schoolwebsite.backend.tenantsubscription.service.TenantService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class TenantServiceImpl implements TenantService {
    private final TenantRepository tenantRepository;

    private final SiteConfigRepository siteConfigRepository;

    private final PageRepository pageRepository;

    private final PageSectionRepository pageSectionRepository;

    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public TenantResponse onboardTenant(TenantOnboardRequest request) {
        log.info("Onboarding tenant name={}, subdomain={}", request.getName(), request.getSubdomain());
        validateUniqueness(request.getSubdomain(), request.getName());

        Tenant tenant = Tenant.builder().name(request.getName()).subdomain(request.getSubdomain())
                .status(AppConstants.STATUS_ACTIVE).build();

        Tenant savedTenant = tenantRepository.save(tenant);

        // Apply defaults defensively so an omitted/null color never violates the
        // NOT NULL constraints on site_configs (the columns are required).
        SiteConfig siteConfig = SiteConfig.builder().tenantId(savedTenant.getId())
                .primaryColor(orDefault(request.getPrimaryColor(), AppConstants.DEFAULT_PRIMARY_COLOR))
                .secondaryColor(orDefault(request.getSecondaryColor(), AppConstants.DEFAULT_SECONDARY_COLOR))
                .accentColor(orDefault(request.getAccentColor(), AppConstants.DEFAULT_ACCENT_COLOR))
                .fontFamily(orDefault(request.getFontFamily(), AppConstants.DEFAULT_FONT_FAMILY)).build();

        siteConfigRepository.save(siteConfig);

        return mapToResponse(savedTenant);
    }

    private String orDefault(String value, String fallback) {
        return (value == null || value.isBlank()) ? fallback : value;
    }

    @Override
    @Transactional(readOnly = true)
    public TenantResponse getTenantBySubdomain(String subdomain) {
        log.debug("Fetching tenant by subdomain={}", subdomain);
        Tenant tenant = tenantRepository.findBySubdomain(subdomain)
                .orElseThrow(() -> AppException.of(ErrorCode.TENANT_NOT_FOUND_BY_SUBDOMAIN, subdomain));
        return mapToResponse(tenant);
    }

    @Override
    @Transactional(readOnly = true)
    public TenantResponse resolveByHost(String host) {
        String normalized = normalizeHost(host);
        log.debug("Resolving tenant by host={} (normalized={})", host, normalized);

        if (normalized == null || normalized.isEmpty()) {
            throw AppException.of(ErrorCode.TENANT_NOT_FOUND_BY_HOST, String.valueOf(host));
        }

        // 1) Exact custom-domain match (e.g. www.pioneerschool.com).
        Optional<Tenant> byCustom = tenantRepository.findByCustomDomain(normalized);
        if (byCustom.isPresent()) {
            return mapToResponse(byCustom.get());
        }

        // 2) Treat "www." as optional in BOTH directions so a domain stored as
        // "www.pioneerschool.com" still matches a request for "pioneerschool.com"
        // and vice versa.
        String alternate = normalized.startsWith("www.") ? normalized.substring(4) : "www." + normalized;
        Optional<Tenant> byAltCustom = tenantRepository.findByCustomDomain(alternate);
        if (byAltCustom.isPresent()) {
            return mapToResponse(byAltCustom.get());
        }

        // 3) Fall back to the first DNS label as the subdomain (e.g. pioneer.myapp.com).
        String firstLabel = normalized.startsWith("www.") ? normalized.substring(4) : normalized;
        int dot = firstLabel.indexOf('.');
        if (dot > 0) {
            String subdomain = firstLabel.substring(0, dot);
            Optional<Tenant> bySubdomain = tenantRepository.findBySubdomain(subdomain);
            if (bySubdomain.isPresent()) {
                return mapToResponse(bySubdomain.get());
            }
        }

        throw AppException.of(ErrorCode.TENANT_NOT_FOUND_BY_HOST, normalized);
    }

    private String normalizeHost(String host) {
        if (host == null) {
            return null;
        }
        String h = host.trim().toLowerCase();
        // Strip protocol if a full URL was passed.
        int scheme = h.indexOf("://");
        if (scheme >= 0) {
            h = h.substring(scheme + 3);
        }
        // Drop any path.
        int slash = h.indexOf('/');
        if (slash >= 0) {
            h = h.substring(0, slash);
        }
        // Drop the port.
        int colon = h.indexOf(':');
        if (colon >= 0) {
            h = h.substring(0, colon);
        }
        return h;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TenantResponse> getAllTenants() {
        log.debug("Fetching all tenants");
        return tenantRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TenantResponse updateCustomDomain(Long tenantId, String customDomain) {
        log.info("Updating custom domain for tenantId={}", tenantId);
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> AppException.of(ErrorCode.TENANT_NOT_FOUND_BY_ID, tenantId));
        tenant.setCustomDomain(StringUtils.trimToNull(customDomain));
        Tenant updated = tenantRepository.save(tenant);
        eventPublisher.publishEvent(new TenantCacheEvictEvent(updated.getId()));
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public TenantResponse cloneTenant(Long sourceTenantId, String newName, String newSubdomain) {
        log.info("Cloning tenant sourceTenantId={} into name={}, subdomain={}", sourceTenantId, newName, newSubdomain);
        validateUniqueness(newSubdomain, newName);

        tenantRepository.findById(sourceTenantId)
                .orElseThrow(() -> AppException.of(ErrorCode.SOURCE_TENANT_NOT_FOUND, sourceTenantId));

        Tenant newTenant = Tenant.builder().name(newName).subdomain(newSubdomain).status(AppConstants.STATUS_ACTIVE)
                .build();
        Tenant savedTenant = tenantRepository.save(newTenant);
        Long newTenantId = savedTenant.getId();

        cloneSiteConfig(sourceTenantId, newTenantId);
        clonePagesWithSections(sourceTenantId, newTenantId);

        return mapToResponse(savedTenant);
    }

    private void cloneSiteConfig(Long sourceTenantId, Long newTenantId) {
        SiteConfig sourceConfig = siteConfigRepository.findByTenantId(sourceTenantId).orElse(null);
        SiteConfig clonedConfig = sourceConfig != null
                ? SiteConfig.builder().tenantId(newTenantId).primaryColor(sourceConfig.getPrimaryColor())
                        .secondaryColor(sourceConfig.getSecondaryColor()).accentColor(sourceConfig.getAccentColor())
                        .fontFamily(sourceConfig.getFontFamily()).themeName(sourceConfig.getThemeName())
                        .logoUrl(sourceConfig.getLogoUrl()).faviconUrl(sourceConfig.getFaviconUrl())
                        .contactEmail(sourceConfig.getContactEmail()).contactPhone(sourceConfig.getContactPhone())
                        .socialLinks(sourceConfig.getSocialLinks()).build()
                : SiteConfig.builder().tenantId(newTenantId).primaryColor(AppConstants.DEFAULT_PRIMARY_COLOR)
                        .secondaryColor(AppConstants.DEFAULT_SECONDARY_COLOR)
                        .accentColor(AppConstants.DEFAULT_ACCENT_COLOR).fontFamily(AppConstants.DEFAULT_FONT_FAMILY)
                        .build();
        siteConfigRepository.save(clonedConfig);
    }

    private void clonePagesWithSections(Long sourceTenantId, Long newTenantId) {
        List<Page> sourcePages = pageRepository.findByTenantId(sourceTenantId);
        for (Page srcPage : sourcePages) {
            Page clonedPage = Page.builder().tenantId(newTenantId).title(srcPage.getTitle()).slug(srcPage.getSlug())
                    .status(srcPage.getStatus()).build();
            Page savedClonedPage = pageRepository.save(clonedPage);

            List<PageSection> srcSections = pageSectionRepository.findByPageIdOrderByPositionOrderAsc(srcPage.getId());
            for (PageSection srcSec : srcSections) {
                PageSection clonedSec = PageSection.builder().pageId(savedClonedPage.getId()).type(srcSec.getType())
                        .positionOrder(srcSec.getPositionOrder()).config(srcSec.getConfig()).build();
                pageSectionRepository.save(clonedSec);
            }
        }
    }

    private void validateUniqueness(String subdomain, String name) {
        if (tenantRepository.existsBySubdomain(subdomain)) {
            throw AppException.of(ErrorCode.SUBDOMAIN_ALREADY_TAKEN);
        }
        if (tenantRepository.existsByName(name)) {
            throw AppException.of(ErrorCode.SCHOOL_NAME_ALREADY_REGISTERED);
        }
    }

    private TenantResponse mapToResponse(Tenant tenant) {
        return TenantResponse.builder().id(tenant.getId()).name(tenant.getName()).subdomain(tenant.getSubdomain())
                .customDomain(tenant.getCustomDomain()).status(tenant.getStatus()).createdAt(tenant.getCreatedAt())
                .build();
    }
}
