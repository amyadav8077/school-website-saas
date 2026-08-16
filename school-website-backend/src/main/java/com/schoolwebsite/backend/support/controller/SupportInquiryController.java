package com.schoolwebsite.backend.support.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.schoolwebsite.backend.common.dto.ApiResponse;
import com.schoolwebsite.backend.support.entity.*;
import com.schoolwebsite.backend.support.service.*;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SupportInquiryController
{
    private final SupportInquiryService service;

    @PostMapping("/sites/{tenantId}/support")
    public ResponseEntity<ApiResponse<SupportInquiry>> submitInquiry(@PathVariable Long tenantId,
            @Valid @RequestBody SupportInquiry inquiry)
    {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Support inquiry submitted successfully",
                service.submitInquiry(tenantId, inquiry)));
    }

    @GetMapping("/admin/sites/{tenantId}/support")
    public ResponseEntity<ApiResponse<List<SupportInquiry>>> getInquiries(@PathVariable Long tenantId)
    {
        return ResponseEntity.ok(ApiResponse.ok(service.getInquiries(tenantId)));
    }

    @PutMapping("/admin/support/{id}/resolve")
    public ResponseEntity<ApiResponse<SupportInquiry>> resolveInquiry(@PathVariable Long id, @RequestParam String notes)
    {
        return ResponseEntity.ok(ApiResponse.ok("Inquiry resolved", service.resolveInquiry(id, notes)));
    }
}
