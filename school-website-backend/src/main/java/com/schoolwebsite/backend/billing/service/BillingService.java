package com.schoolwebsite.backend.billing.service;

import java.util.List;

import com.schoolwebsite.backend.billing.entity.FeeItem;
import com.schoolwebsite.backend.billing.entity.StudentInvoice;

public interface BillingService {

    FeeItem createFeeItem(Long tenantId, FeeItem item);

    List<FeeItem> getFeeItems(Long tenantId);

    StudentInvoice generateInvoice(Long tenantId, StudentInvoice invoice);

    List<StudentInvoice> getInvoices(Long tenantId, String studentName, String gradeLevel, String section);

    StudentInvoice payInvoice(Long id);
}
