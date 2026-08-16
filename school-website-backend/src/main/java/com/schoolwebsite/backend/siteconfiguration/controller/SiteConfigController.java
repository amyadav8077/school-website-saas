package com.schoolwebsite.backend.siteconfiguration.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.schoolwebsite.backend.common.dto.ApiResponse;
import com.schoolwebsite.backend.siteconfiguration.dto.*;
import com.schoolwebsite.backend.siteconfiguration.service.*;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/sites")
@RequiredArgsConstructor
public class SiteConfigController
{
    private final SiteConfigService siteConfigService;

    @GetMapping("/{subdomain}/config")
    public ResponseEntity<ApiResponse<SiteConfigResponse>> getSiteConfig(@PathVariable String subdomain)
    {
        return ResponseEntity.ok(ApiResponse.ok(siteConfigService.getSiteConfigBySubdomain(subdomain)));
    }

    @PutMapping("/{tenantId}/config")
    public ResponseEntity<ApiResponse<SiteConfigResponse>> updateSiteConfig(@PathVariable Long tenantId,
            @Valid @RequestBody SiteConfigUpdateRequest request)
    {
        return ResponseEntity.ok(
                ApiResponse.ok("Site configuration updated", siteConfigService.updateSiteConfig(tenantId, request)));
    }
}
