package com.schoolwebsite.backend.tenantsubscription.controller;

import com.schoolwebsite.backend.tenantsubscription.service.*;
import com.schoolwebsite.backend.tenantsubscription.dto.*;

import com.schoolwebsite.backend.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/tenants")
@RequiredArgsConstructor
public class TenantController {

    private final TenantService tenantService;

    @PostMapping
    public ResponseEntity<ApiResponse<TenantResponse>> onboardTenant(
            @Valid @RequestBody TenantOnboardRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Tenant onboarded successfully", tenantService.onboardTenant(request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TenantResponse>>> getAllTenants() {
        return ResponseEntity.ok(ApiResponse.ok(tenantService.getAllTenants()));
    }

    @GetMapping("/{subdomain}")
    public ResponseEntity<ApiResponse<TenantResponse>> getTenant(@PathVariable String subdomain) {
        return ResponseEntity.ok(ApiResponse.ok(tenantService.getTenantBySubdomain(subdomain)));
    }

    @PutMapping("/{tenantId}/custom-domain")
    public ResponseEntity<ApiResponse<TenantResponse>> updateCustomDomain(
            @PathVariable Long tenantId,
            @RequestParam(required = false) String customDomain) {
        return ResponseEntity.ok(ApiResponse.ok("Custom domain updated",
                tenantService.updateCustomDomain(tenantId, customDomain)));
    }

    @PostMapping("/{sourceTenantId}/clone")
    public ResponseEntity<ApiResponse<TenantResponse>> cloneTenant(
            @PathVariable Long sourceTenantId,
            @RequestParam String name,
            @RequestParam String subdomain) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Tenant cloned successfully",
                        tenantService.cloneTenant(sourceTenantId, name, subdomain)));
    }
}
