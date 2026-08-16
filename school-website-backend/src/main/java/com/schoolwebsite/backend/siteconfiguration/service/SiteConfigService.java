package com.schoolwebsite.backend.siteconfiguration.service;

import com.schoolwebsite.backend.siteconfiguration.dto.SiteConfigResponse;
import com.schoolwebsite.backend.siteconfiguration.dto.SiteConfigUpdateRequest;

public interface SiteConfigService {
    SiteConfigResponse getSiteConfigBySubdomain(String subdomain);

    SiteConfigResponse updateSiteConfig(Long tenantId, SiteConfigUpdateRequest request);
}
