package com.schoolwebsite.backend.siteconfiguration;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sites")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class SiteConfigController {

    private final SiteConfigService siteConfigService;

    @GetMapping("/{subdomain}/config")
    public ResponseEntity<SiteConfigResponse> getSiteConfig(@PathVariable String subdomain) {
        SiteConfigResponse response = siteConfigService.getSiteConfigBySubdomain(subdomain);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{tenantId}/config")
    public ResponseEntity<SiteConfigResponse> updateSiteConfig(
            @PathVariable Long tenantId,
            @Valid @RequestBody SiteConfigUpdateRequest request) {
        SiteConfigResponse response = siteConfigService.updateSiteConfig(tenantId, request);
        return ResponseEntity.ok(response);
    }
}
