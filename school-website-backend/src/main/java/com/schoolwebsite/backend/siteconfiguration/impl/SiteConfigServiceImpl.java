package com.schoolwebsite.backend.siteconfiguration.impl;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.schoolwebsite.backend.common.constant.AppConstants;
import com.schoolwebsite.backend.common.exception.AppException;
import com.schoolwebsite.backend.common.exception.ErrorCode;
import com.schoolwebsite.backend.siteconfiguration.dto.SiteConfigResponse;
import com.schoolwebsite.backend.siteconfiguration.dto.SiteConfigUpdateRequest;
import com.schoolwebsite.backend.siteconfiguration.entity.SiteConfig;
import com.schoolwebsite.backend.siteconfiguration.repository.SiteConfigRepository;
import com.schoolwebsite.backend.siteconfiguration.service.SiteConfigService;
import com.schoolwebsite.backend.tenantsubscription.entity.Tenant;
import com.schoolwebsite.backend.tenantsubscription.event.TenantCacheEvictEvent;
import com.schoolwebsite.backend.tenantsubscription.repository.TenantRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class SiteConfigServiceImpl implements SiteConfigService {
    private final SiteConfigRepository siteConfigRepository;

    private final TenantRepository tenantRepository;

    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional(readOnly = true)
    public SiteConfigResponse getSiteConfigBySubdomain(String subdomain) {
        log.debug("Fetching site config for subdomain={}", subdomain);
        Tenant tenant = tenantRepository.findBySubdomain(subdomain)
                .orElseThrow(() -> AppException.of(ErrorCode.SUBDOMAIN_NOT_FOUND, subdomain));

        SiteConfig siteConfig = siteConfigRepository.findByTenantId(tenant.getId())
                .orElseThrow(() -> AppException.of(ErrorCode.SITE_CONFIG_NOT_FOUND_BY_TENANT, tenant.getName()));

        return mapToResponse(siteConfig);
    }

    @Override
    @Transactional
    public SiteConfigResponse updateSiteConfig(Long tenantId, SiteConfigUpdateRequest request) {
        log.info("Updating site config for tenantId={}", tenantId);
        SiteConfig siteConfig = siteConfigRepository.findByTenantId(tenantId)
                .orElseThrow(() -> AppException.of(ErrorCode.SITE_CONFIG_NOT_FOUND_BY_TENANT_ID, tenantId));

        siteConfig.setPrimaryColor(request.getPrimaryColor());
        siteConfig.setSecondaryColor(request.getSecondaryColor());
        siteConfig.setAccentColor(request.getAccentColor());
        siteConfig.setFontFamily(request.getFontFamily());
        siteConfig.setThemeName(request.getThemeName() != null ? request.getThemeName() : AppConstants.DEFAULT_THEME);
        siteConfig.setLogoUrl(request.getLogoUrl());
        siteConfig.setFaviconUrl(request.getFaviconUrl());
        siteConfig.setContactEmail(request.getContactEmail());
        siteConfig.setContactPhone(request.getContactPhone());
        siteConfig.setSocialLinks(request.getSocialLinks());

        SiteConfig updated = siteConfigRepository.save(siteConfig);
        eventPublisher.publishEvent(new TenantCacheEvictEvent(tenantId));
        return mapToResponse(updated);
    }

    private SiteConfigResponse mapToResponse(SiteConfig siteConfig) {
        return SiteConfigResponse.builder().id(siteConfig.getId()).tenantId(siteConfig.getTenantId())
                .logoUrl(siteConfig.getLogoUrl()).faviconUrl(siteConfig.getFaviconUrl())
                .primaryColor(siteConfig.getPrimaryColor()).secondaryColor(siteConfig.getSecondaryColor())
                .accentColor(siteConfig.getAccentColor()).fontFamily(siteConfig.getFontFamily())
                .themeName(siteConfig.getThemeName() != null ? siteConfig.getThemeName() : AppConstants.DEFAULT_THEME)
                .contactEmail(siteConfig.getContactEmail()).contactPhone(siteConfig.getContactPhone())
                .socialLinks(siteConfig.getSocialLinks()).build();
    }
}
