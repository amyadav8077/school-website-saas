package com.schoolwebsite.backend.tenantsubscription;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class TenantControllerTest {

    @Autowired
    private TenantService tenantService;

    @Test
    public void testOnboardTenantAndList() {
        TenantOnboardRequest request = new TenantOnboardRequest(
                "Stanford Academy",
                "stanford-academy",
                "#1e3a8a",
                "#3b82f6",
                "#f59e0b",
                "Inter"
        );

        // 1. Onboard Tenant
        TenantResponse response = tenantService.onboardTenant(request);
        assertNotNull(response.getId());
        assertEquals("Stanford Academy", response.getName());
        assertEquals("stanford-academy", response.getSubdomain());

        // 2. Retrieve All and verify
        List<TenantResponse> list = tenantService.getAllTenants();
        assertFalse(list.isEmpty());
        assertTrue(list.stream().anyMatch(t -> t.getSubdomain().equals("stanford-academy")));
    }

    @Test
    public void testDuplicateSubdomainValidation() {
        TenantOnboardRequest request = new TenantOnboardRequest(
                "Harvard Academy",
                "harvard",
                "#1e3a8a",
                "#3b82f6",
                "#f59e0b",
                "Inter"
        );

        // First onboarding succeeds
        tenantService.onboardTenant(request);

        // Second onboarding with same subdomain should fail
        assertThrows(IllegalArgumentException.class, () -> {
            tenantService.onboardTenant(request);
        });
    }

    @Test
    public void testUpdateCustomDomain() {
        TenantOnboardRequest request = new TenantOnboardRequest(
                "Oxford Academy",
                "oxford-academy",
                "#1e3a8a",
                "#3b82f6",
                "#f59e0b",
                "Inter"
        );
        TenantResponse response = tenantService.onboardTenant(request);
        assertNull(response.getCustomDomain());

        // Update custom domain
        TenantResponse updated = tenantService.updateCustomDomain(response.getId(), "www.oxfordacademy.org");
        assertEquals("www.oxfordacademy.org", updated.getCustomDomain());

        // Update to null / empty to reset custom domain
        TenantResponse reset = tenantService.updateCustomDomain(response.getId(), "");
        assertNull(reset.getCustomDomain());
    }

    @Test
    public void testCloneTenant() {
        TenantOnboardRequest request = new TenantOnboardRequest(
                "Source School",
                "source-school",
                "#1e3a8a",
                "#3b82f6",
                "#f59e0b",
                "Inter"
        );
        TenantResponse source = tenantService.onboardTenant(request);

        TenantResponse cloned = tenantService.cloneTenant(source.getId(), "Cloned School", "cloned-school");
        assertNotNull(cloned.getId());
        assertEquals("Cloned School", cloned.getName());
        assertEquals("cloned-school", cloned.getSubdomain());
        assertNotEquals(source.getId(), cloned.getId());
    }
}
