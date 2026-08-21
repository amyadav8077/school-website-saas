package com.schoolwebsite.backend.analytics.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.schoolwebsite.backend.analytics.dto.VisitStatsResponse;
import com.schoolwebsite.backend.analytics.service.SiteVisitService;
import com.schoolwebsite.backend.auth.security.CurrentUser;
import com.schoolwebsite.backend.common.dto.ApiResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SiteVisitController {
    private final SiteVisitService service;

    /** Public: the tenant's website posts here once per load to record a visit. */
    @PostMapping("/sites/{tenantId}/visit")
    public ResponseEntity<ApiResponse<Void>> record(@PathVariable Long tenantId,
            @RequestBody(required = false) Map<String, String> body) {
        String path = body == null ? null : body.get("path");
        service.record(tenantId, path);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    /** Admin: aggregated visit metrics for the dashboard graph. */
    @GetMapping("/admin/sites/{tenantId}/visits/stats")
    public ResponseEntity<ApiResponse<VisitStatsResponse>> stats(@PathVariable Long tenantId,
            @RequestParam(defaultValue = "14") int days) {
        CurrentUser.assertTenantAccess(tenantId);
        return ResponseEntity.ok(ApiResponse.ok(service.getStats(tenantId, days)));
    }
}
