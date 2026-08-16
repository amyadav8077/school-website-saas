package com.schoolwebsite.backend.tenantsubscription.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.schoolwebsite.backend.auth.security.CurrentUser;
import com.schoolwebsite.backend.common.dto.ApiResponse;
import com.schoolwebsite.backend.tenantsubscription.dto.*;
import com.schoolwebsite.backend.tenantsubscription.service.*;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/tenants")
@RequiredArgsConstructor
public class TenantController {
    private final TenantService tenantService;

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<TenantResponse>> onboardTenant(@Valid @RequestBody TenantOnboardRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Tenant onboarded successfully", tenantService.onboardTenant(request)));
    }

    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<TenantResponse>>> getAllTenants() {
        return ResponseEntity.ok(ApiResponse.ok(tenantService.getAllTenants()));
    }

    @GetMapping("/{subdomain}")
    public ResponseEntity<ApiResponse<TenantResponse>> getTenant(@PathVariable String subdomain) {
        // Authenticated lookup scoped to the owning tenant (or super-admin), so an
        // admin cannot read another tenant's record by subdomain.
        TenantResponse tenant = tenantService.getTenantBySubdomain(subdomain);
        CurrentUser.assertTenantAccess(tenant.getId());
        return ResponseEntity.ok(ApiResponse.ok(tenant));
    }

    @GetMapping("/resolve")
    public ResponseEntity<ApiResponse<TenantResponse>> resolveByHost(@RequestParam String host) {
        return ResponseEntity.ok(ApiResponse.ok(tenantService.resolveByHost(host)));
    }

    @PutMapping("/{tenantId}/custom-domain")
    @PreAuthorize("hasRole('SUPER_ADMIN') or @tenantSecurity.canManage(#tenantId)")
    public ResponseEntity<ApiResponse<TenantResponse>> updateCustomDomain(@PathVariable Long tenantId,
            @RequestParam(required = false) String customDomain) {
        return ResponseEntity
                .ok(ApiResponse.ok("Custom domain updated", tenantService.updateCustomDomain(tenantId, customDomain)));
    }

    @PostMapping("/{sourceTenantId}/clone")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<TenantResponse>> cloneTenant(@PathVariable Long sourceTenantId,
            @RequestParam String name, @RequestParam String subdomain) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Tenant cloned successfully",
                tenantService.cloneTenant(sourceTenantId, name, subdomain)));
    }
}
