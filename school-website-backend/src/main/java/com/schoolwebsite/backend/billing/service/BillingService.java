package com.schoolwebsite.backend.billing.service;

import java.util.List;

import org.springframework.data.domain.Page;

import com.schoolwebsite.backend.billing.dto.InvoiceStatsResponse;
import com.schoolwebsite.backend.billing.entity.FeeItem;
import com.schoolwebsite.backend.billing.entity.StudentInvoice;

public interface BillingService {
    InvoiceStatsResponse getInvoiceStats(Long tenantId);

    FeeItem createFeeItem(Long tenantId, FeeItem item);

    List<FeeItem> getFeeItems(Long tenantId);

    StudentInvoice generateInvoice(Long tenantId, StudentInvoice invoice);

    List<StudentInvoice> getInvoices(Long tenantId, String studentName, String gradeLevel, String section);

    /**
     * Verifies the full identity tuple (admissionNo + fatherName + dateOfBirth +
     * aadharNo) and, on success, returns that student's full unmasked invoices so
     * they can be viewed and paid. Throws if the details do not match.
     */
    List<StudentInvoice> verifyInvoices(Long tenantId, String admissionNo, String fatherName, String dateOfBirth,
            String aadharNo);

    Page<StudentInvoice> getInvoicesPaged(Long tenantId, String studentName, String gradeLevel, String section,
            int page, int size);

    StudentInvoice payInvoice(Long id, String admissionNo);
}
