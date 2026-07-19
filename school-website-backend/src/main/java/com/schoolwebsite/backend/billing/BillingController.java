package com.schoolwebsite.backend.billing;

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
public class BillingController {

    private final BillingService service;

    // Admin endpoint: Create FeeItem
    @PostMapping("/admin/sites/{tenantId}/fees")
    public ResponseEntity<FeeItem> createFeeItem(
            @PathVariable Long tenantId,
            @Valid @RequestBody FeeItem item) {
        FeeItem saved = service.createFeeItem(tenantId, item);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    // Public & Admin endpoint: List FeeItems
    @GetMapping("/sites/{tenantId}/fees")
    public ResponseEntity<List<FeeItem>> getFeeItems(@PathVariable Long tenantId) {
        List<FeeItem> list = service.getFeeItems(tenantId);
        return ResponseEntity.ok(list);
    }

    // Admin endpoint: Generate Student Invoice
    @PostMapping("/admin/sites/{tenantId}/invoices")
    public ResponseEntity<StudentInvoice> generateInvoice(
            @PathVariable Long tenantId,
            @Valid @RequestBody StudentInvoice invoice) {
        StudentInvoice saved = service.generateInvoice(tenantId, invoice);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    // Public & Admin endpoint: Lookup / List Invoices
    @GetMapping("/sites/{tenantId}/invoices")
    public ResponseEntity<List<StudentInvoice>> getInvoices(
            @PathVariable Long tenantId,
            @RequestParam(required = false) String studentName) {
        List<StudentInvoice> list = service.getInvoices(tenantId, studentName);
        return ResponseEntity.ok(list);
    }

    // Public endpoint: Mock payment execution
    @PutMapping("/sites/invoices/{id}/pay")
    public ResponseEntity<StudentInvoice> payInvoice(@PathVariable Long id) {
        StudentInvoice paid = service.payInvoice(id);
        return ResponseEntity.ok(paid);
    }
}
