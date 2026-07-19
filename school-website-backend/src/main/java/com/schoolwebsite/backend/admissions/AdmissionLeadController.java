package com.schoolwebsite.backend.admissions;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class AdmissionLeadController {

    private final AdmissionLeadService service;

    // Public Endpoint: Submission of Inquiry
    @PostMapping("/sites/{tenantId}/admissions")
    public ResponseEntity<AdmissionLeadResponse> submitInquiry(
            @PathVariable Long tenantId,
            @Valid @RequestBody AdmissionLeadRequest request) {
        AdmissionLeadResponse response = service.submitLead(tenantId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // Admin Endpoint: List inquiries
    @GetMapping("/admin/sites/{tenantId}/admissions")
    public ResponseEntity<List<AdmissionLeadResponse>> getInquiries(@PathVariable Long tenantId) {
        List<AdmissionLeadResponse> response = service.getLeadsByTenant(tenantId);
        return ResponseEntity.ok(response);
    }

    // Admin Endpoint: Transition inquiry status
    @PutMapping("/admin/admissions/{leadId}/status")
    public ResponseEntity<AdmissionLeadResponse> updateStatus(
            @PathVariable Long leadId,
            @RequestParam String status) {
        AdmissionLeadResponse response = service.updateStatus(leadId, status);
        return ResponseEntity.ok(response);
    }
}
