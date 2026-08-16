package com.schoolwebsite.backend.bootstrap.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.schoolwebsite.backend.bootstrap.dto.SiteBootstrapResponse;
import com.schoolwebsite.backend.bootstrap.service.SiteBootstrapService;
import com.schoolwebsite.backend.common.dto.ApiResponse;

import lombok.RequiredArgsConstructor;

/**
 * Single public entry point a tenant's website calls on load. One request
 * returns everything needed to render the first screen.
 */
@RestController
@RequestMapping("/api/sites")
@RequiredArgsConstructor
public class SiteBootstrapController
{
    private final SiteBootstrapService siteBootstrapService;

    @GetMapping("/bootstrap")
    public ResponseEntity<ApiResponse<SiteBootstrapResponse>> bootstrap(@RequestParam String host)
    {
        return ResponseEntity.ok(ApiResponse.ok(siteBootstrapService.bootstrap(host)));
    }
}
