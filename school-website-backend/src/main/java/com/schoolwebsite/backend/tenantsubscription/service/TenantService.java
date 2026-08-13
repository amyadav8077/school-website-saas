package com.schoolwebsite.backend.tenantsubscription.service;

import java.util.List;

import com.schoolwebsite.backend.tenantsubscription.dto.TenantOnboardRequest;
import com.schoolwebsite.backend.tenantsubscription.dto.TenantResponse;

public interface TenantService {

    TenantResponse onboardTenant(TenantOnboardRequest request);

    TenantResponse getTenantBySubdomain(String subdomain);

    List<TenantResponse> getAllTenants();

    TenantResponse updateCustomDomain(Long tenantId, String customDomain);

    TenantResponse cloneTenant(Long sourceTenantId, String newName, String newSubdomain);
}
