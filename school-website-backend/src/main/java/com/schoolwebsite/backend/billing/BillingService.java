package com.schoolwebsite.backend.billing;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BillingService {

    private final FeeItemRepository feeItemRepository;
    private final StudentInvoiceRepository invoiceRepository;

    @Transactional
    public FeeItem createFeeItem(Long tenantId, FeeItem item) {
        item.setTenantId(tenantId);
        return feeItemRepository.save(item);
    }

    public List<FeeItem> getFeeItems(Long tenantId) {
        return feeItemRepository.findByTenantId(tenantId);
    }

    @Transactional
    public StudentInvoice generateInvoice(Long tenantId, StudentInvoice invoice) {
        invoice.setTenantId(tenantId);
        invoice.setStatus("PENDING");
        invoice.setDueDate(LocalDateTime.now().plusDays(30)); // 30 days due
        return invoiceRepository.save(invoice);
    }

    public List<StudentInvoice> getInvoices(Long tenantId, String studentName) {
        if (studentName == null || studentName.trim().isEmpty()) {
            return invoiceRepository.findByTenantIdOrderByCreatedAtDesc(tenantId);
        }
        return invoiceRepository.findByTenantIdAndStudentNameContainingIgnoreCaseOrderByCreatedAtDesc(tenantId, studentName);
    }

    @Transactional
    public StudentInvoice payInvoice(Long id) {
        StudentInvoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found with id: " + id));
        
        invoice.setStatus("PAID");
        invoice.setPaymentDate(LocalDateTime.now());
        return invoiceRepository.save(invoice);
    }
}
