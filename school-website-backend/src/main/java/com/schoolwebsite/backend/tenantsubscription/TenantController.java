package com.schoolwebsite.backend.tenantsubscription;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/tenants")
@RequiredArgsConstructor
public class TenantController {

    private final TenantService tenantService;

    @PostMapping
    public ResponseEntity<TenantResponse> onboardTenant(@Valid @RequestBody TenantOnboardRequest request) {
        TenantResponse response = tenantService.onboardTenant(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<java.util.List<TenantResponse>> getAllTenants() {
        java.util.List<TenantResponse> response = tenantService.getAllTenants();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{subdomain}")
    public ResponseEntity<TenantResponse> getTenant(@PathVariable String subdomain) {
        TenantResponse response = tenantService.getTenantBySubdomain(subdomain);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{tenantId}/custom-domain")
    public ResponseEntity<TenantResponse> updateCustomDomain(
            @PathVariable Long tenantId,
            @RequestParam(required = false) String customDomain) {
        TenantResponse response = tenantService.updateCustomDomain(tenantId, customDomain);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{sourceTenantId}/clone")
    public ResponseEntity<TenantResponse> cloneTenant(
            @PathVariable Long sourceTenantId,
            @RequestParam String name,
            @RequestParam String subdomain) {
        TenantResponse response = tenantService.cloneTenant(sourceTenantId, name, subdomain);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}
