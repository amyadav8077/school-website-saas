package com.schoolwebsite.backend.academics.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.schoolwebsite.backend.academics.entity.*;
import com.schoolwebsite.backend.academics.service.*;
import com.schoolwebsite.backend.common.dto.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class EnrichmentActivityController
{
    private final EnrichmentActivityService service;

    @GetMapping("/sites/{tenantId}/enrichment")
    public ResponseEntity<ApiResponse<List<EnrichmentActivity>>> getEnrichment(@PathVariable Long tenantId)
    {
        return ResponseEntity.ok(ApiResponse.ok(service.getActivitiesByTenant(tenantId)));
    }

    @PostMapping("/admin/sites/{tenantId}/enrichment")
    public ResponseEntity<ApiResponse<EnrichmentActivity>> createEnrichmentActivity(@PathVariable Long tenantId,
            @Valid @RequestBody EnrichmentActivity item)
    {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Enrichment activity created successfully",
                service.createActivity(tenantId, item)));
    }

    @DeleteMapping("/admin/enrichment/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEnrichmentActivity(@PathVariable Long id)
    {
        service.deleteActivity(id);
        return ResponseEntity.ok(ApiResponse.ok("Enrichment activity deleted successfully", null));
    }
}
