package com.schoolwebsite.backend.billing.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.schoolwebsite.backend.auth.security.CurrentUser;
import com.schoolwebsite.backend.billing.entity.*;
import com.schoolwebsite.backend.billing.service.*;
import com.schoolwebsite.backend.common.dto.ApiResponse;
import com.schoolwebsite.backend.common.exception.AppException;
import com.schoolwebsite.backend.common.util.StringUtils;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BillingController {
    private final BillingService service;

    @PostMapping("/admin/sites/{tenantId}/fees")
    public ResponseEntity<ApiResponse<FeeItem>> createFeeItem(@PathVariable Long tenantId,
            @Valid @RequestBody FeeItem item) {
        CurrentUser.assertTenantAccess(tenantId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Fee category created successfully", service.createFeeItem(tenantId, item)));
    }

    @GetMapping("/sites/{tenantId}/fees")
    public ResponseEntity<ApiResponse<List<FeeItem>>> getFeeItems(@PathVariable Long tenantId) {
        return ResponseEntity.ok(ApiResponse.ok(service.getFeeItems(tenantId)));
    }

    @PostMapping("/admin/sites/{tenantId}/invoices")
    public ResponseEntity<ApiResponse<StudentInvoice>> generateInvoice(@PathVariable Long tenantId,
            @Valid @RequestBody StudentInvoice invoice) {
        CurrentUser.assertTenantAccess(tenantId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Invoice generated successfully", service.generateInvoice(tenantId, invoice)));
    }

    @GetMapping("/sites/{tenantId}/invoices")
    public ResponseEntity<ApiResponse<List<StudentInvoice>>> getInvoices(@PathVariable Long tenantId,
            @RequestParam(required = false) String studentName, @RequestParam(required = false) String gradeLevel,
            @RequestParam(required = false) String section) {
        // Public parent lookup: requires a student-name filter (no full dumps).
        if (!StringUtils.hasText(studentName)) {
            throw AppException.badRequest("A student name is required to look up invoices.");
        }
        return ResponseEntity.ok(ApiResponse.ok(service.getInvoices(tenantId, studentName, gradeLevel, section)));
    }

    @GetMapping("/sites/{tenantId}/invoices/paged")
    public ResponseEntity<ApiResponse<org.springframework.data.domain.Page<StudentInvoice>>> getInvoicesPaged(
            @PathVariable Long tenantId, @RequestParam(required = false) String studentName,
            @RequestParam(required = false) String gradeLevel, @RequestParam(required = false) String section,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "25") int size) {
        CurrentUser.assertTenantAccess(tenantId);
        return ResponseEntity
                .ok(ApiResponse.ok(service.getInvoicesPaged(tenantId, studentName, gradeLevel, section, page, size)));
    }

    @GetMapping("/sites/{tenantId}/invoices/stats")
    public ResponseEntity<ApiResponse<com.schoolwebsite.backend.billing.dto.InvoiceStatsResponse>> getInvoiceStats(
            @PathVariable Long tenantId) {
        CurrentUser.assertTenantAccess(tenantId);
        return ResponseEntity.ok(ApiResponse.ok(service.getInvoiceStats(tenantId)));
    }

    // Public parent payment: requires the student's admission number matching the
    // invoice, so a caller cannot flip an arbitrary invoice's status by guessing ids.
    @PutMapping("/sites/invoices/{id}/pay")
    public ResponseEntity<ApiResponse<StudentInvoice>> payInvoice(@PathVariable Long id,
            @RequestParam(required = false) String admissionNo) {
        return ResponseEntity.ok(ApiResponse.ok("Payment recorded successfully", service.payInvoice(id, admissionNo)));
    }
}
