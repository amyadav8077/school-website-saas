package com.schoolwebsite.backend.admissions.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.schoolwebsite.backend.admissions.dto.*;
import com.schoolwebsite.backend.admissions.service.*;
import com.schoolwebsite.backend.common.dto.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AdmissionLeadController {

    private final AdmissionLeadService service;

    @PostMapping("/sites/{tenantId}/admissions")
    public ResponseEntity<ApiResponse<AdmissionLeadResponse>> submitInquiry(@PathVariable Long tenantId,
            @Valid @RequestBody AdmissionLeadRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.ok("Admission inquiry submitted successfully", service.submitLead(tenantId, request)));
    }

    @GetMapping("/admin/sites/{tenantId}/admissions")
    public ResponseEntity<ApiResponse<List<AdmissionLeadResponse>>> getInquiries(@PathVariable Long tenantId) {
        return ResponseEntity.ok(ApiResponse.ok(service.getLeadsByTenant(tenantId)));
    }

    @PutMapping("/admin/admissions/{leadId}/status")
    public ResponseEntity<ApiResponse<AdmissionLeadResponse>> updateStatus(@PathVariable Long leadId,
            @RequestParam String status) {
        return ResponseEntity.ok(ApiResponse.ok("Status updated", service.updateStatus(leadId, status)));
    }
}
