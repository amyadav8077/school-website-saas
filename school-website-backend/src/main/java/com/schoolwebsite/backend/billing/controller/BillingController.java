package com.schoolwebsite.backend.billing.controller;

import com.schoolwebsite.backend.billing.entity.*;
import com.schoolwebsite.backend.billing.service.*;

import com.schoolwebsite.backend.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BillingController {

    private final BillingService service;

    @PostMapping("/admin/sites/{tenantId}/fees")
    public ResponseEntity<ApiResponse<FeeItem>> createFeeItem(
            @PathVariable Long tenantId,
            @Valid @RequestBody FeeItem item) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Fee category created successfully", service.createFeeItem(tenantId, item)));
    }

    @GetMapping("/sites/{tenantId}/fees")
    public ResponseEntity<ApiResponse<List<FeeItem>>> getFeeItems(@PathVariable Long tenantId) {
        return ResponseEntity.ok(ApiResponse.ok(service.getFeeItems(tenantId)));
    }

    @PostMapping("/admin/sites/{tenantId}/invoices")
    public ResponseEntity<ApiResponse<StudentInvoice>> generateInvoice(
            @PathVariable Long tenantId,
            @Valid @RequestBody StudentInvoice invoice) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Invoice generated successfully", service.generateInvoice(tenantId, invoice)));
    }

    @GetMapping("/sites/{tenantId}/invoices")
    public ResponseEntity<ApiResponse<List<StudentInvoice>>> getInvoices(
            @PathVariable Long tenantId,
            @RequestParam(required = false) String studentName,
            @RequestParam(required = false) String gradeLevel,
            @RequestParam(required = false) String section) {
        return ResponseEntity.ok(ApiResponse.ok(service.getInvoices(tenantId, studentName, gradeLevel, section)));
    }

    @PutMapping("/sites/invoices/{id}/pay")
    public ResponseEntity<ApiResponse<StudentInvoice>> payInvoice(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Payment recorded successfully", service.payInvoice(id)));
    }
}
