package com.schoolwebsite.backend.siteconfiguration.controller;

import com.schoolwebsite.backend.siteconfiguration.service.*;
import com.schoolwebsite.backend.siteconfiguration.dto.*;

import com.schoolwebsite.backend.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sites")
@RequiredArgsConstructor
public class SiteConfigController {

    private final SiteConfigService siteConfigService;

    @GetMapping("/{subdomain}/config")
    public ResponseEntity<ApiResponse<SiteConfigResponse>> getSiteConfig(@PathVariable String subdomain) {
        return ResponseEntity.ok(ApiResponse.ok(siteConfigService.getSiteConfigBySubdomain(subdomain)));
    }

    @PutMapping("/{tenantId}/config")
    public ResponseEntity<ApiResponse<SiteConfigResponse>> updateSiteConfig(
            @PathVariable Long tenantId,
            @Valid @RequestBody SiteConfigUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Site configuration updated",
                siteConfigService.updateSiteConfig(tenantId, request)));
    }
}
