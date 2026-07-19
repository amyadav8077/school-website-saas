package com.schoolwebsite.backend.support;

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
public class SupportInquiryController {

    private final SupportInquiryService service;

    // Public Endpoint: Submit Contact Form Inquiry
    @PostMapping("/sites/{tenantId}/support")
    public ResponseEntity<SupportInquiry> submitInquiry(
            @PathVariable Long tenantId,
            @Valid @RequestBody SupportInquiry inquiry) {
        SupportInquiry saved = service.submitInquiry(tenantId, inquiry);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    // Admin Endpoint: List inquiries
    @GetMapping("/admin/sites/{tenantId}/support")
    public ResponseEntity<List<SupportInquiry>> getInquiries(@PathVariable Long tenantId) {
        List<SupportInquiry> list = service.getInquiries(tenantId);
        return ResponseEntity.ok(list);
    }

    // Admin Endpoint: Resolve Inquiry
    @PutMapping("/admin/support/{id}/resolve")
    public ResponseEntity<SupportInquiry> resolveInquiry(
            @PathVariable Long id,
            @RequestParam String notes) {
        SupportInquiry resolved = service.resolveInquiry(id, notes);
        return ResponseEntity.ok(resolved);
    }
}
