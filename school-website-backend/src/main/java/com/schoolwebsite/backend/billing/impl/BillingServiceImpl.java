package com.schoolwebsite.backend.billing.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.schoolwebsite.backend.billing.entity.FeeItem;
import com.schoolwebsite.backend.billing.entity.StudentInvoice;
import com.schoolwebsite.backend.billing.repository.FeeItemRepository;
import com.schoolwebsite.backend.billing.repository.StudentInvoiceRepository;
import com.schoolwebsite.backend.billing.service.BillingService;
import com.schoolwebsite.backend.common.constant.AppConstants;
import com.schoolwebsite.backend.common.exception.AppException;
import com.schoolwebsite.backend.common.exception.ErrorCode;
import com.schoolwebsite.backend.common.util.StringUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class BillingServiceImpl implements BillingService {
    private final FeeItemRepository feeItemRepository;

    private final StudentInvoiceRepository invoiceRepository;

    @Override
    @Transactional
    public FeeItem createFeeItem(Long tenantId, FeeItem item) {
        log.info("Creating fee item for tenantId={}, name={}", tenantId, item.getName());
        item.setId(null);
        item.setTenantId(tenantId);
        return feeItemRepository.save(item);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeeItem> getFeeItems(Long tenantId) {
        log.debug("Fetching fee items for tenantId={}", tenantId);
        return feeItemRepository.findByTenantId(tenantId);
    }

    @Override
    @Transactional
    public StudentInvoice generateInvoice(Long tenantId, StudentInvoice invoice) {
        log.info("Generating invoice for tenantId={}", tenantId);
        invoice.setId(null);
        invoice.setTenantId(tenantId);
        invoice.setStatus(AppConstants.STATUS_PENDING);
        invoice.setDueDate(LocalDateTime.now().plusDays(AppConstants.INVOICE_DUE_DAYS));
        return invoiceRepository.save(invoice);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentInvoice> getInvoices(Long tenantId, String studentName, String gradeLevel, String section) {
        log.debug("Fetching invoices for tenantId={}", tenantId);
        List<StudentInvoice> result;
        if (StringUtils.hasText(studentName)) {
            result = invoiceRepository.findByTenantIdAndStudentNameContainingIgnoreCaseOrderByCreatedAtDesc(tenantId,
                    studentName.trim());
        } else if (StringUtils.hasText(gradeLevel) && StringUtils.hasText(section)) {
            result = invoiceRepository.findByTenantIdAndGradeLevelAndSectionOrderByCreatedAtDesc(tenantId,
                    gradeLevel.trim(), section.trim());
        } else {
            result = invoiceRepository.findByTenantIdOrderByCreatedAtDesc(tenantId);
        }
        result.forEach(this::maskSensitive);
        return result;
    }

    /** Masks the Aadhaar number so only the last 4 digits are returned. */
    private StudentInvoice maskSensitive(StudentInvoice inv) {
        String aadhar = inv.getAadharNo();
        if (aadhar != null && aadhar.length() > 4) {
            inv.setAadharNo("XXXX-XXXX-" + aadhar.substring(aadhar.length() - 4));
        }
        return inv;
    }

    @Override
    @Transactional(readOnly = true)
    public com.schoolwebsite.backend.billing.dto.InvoiceStatsResponse getInvoiceStats(Long tenantId) {
        double billed = invoiceRepository.sumBilledByTenant(tenantId);
        double paid = invoiceRepository.sumByTenantAndStatus(tenantId, AppConstants.STATUS_PAID);
        long count = invoiceRepository.countByTenantId(tenantId);
        return com.schoolwebsite.backend.billing.dto.InvoiceStatsResponse.builder().totalBilled(billed).totalPaid(paid)
                .totalPending(billed - paid).invoiceCount(count).build();
    }

    @Override
    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<StudentInvoice> getInvoicesPaged(Long tenantId, String studentName,
            String gradeLevel, String section, int page, int size) {
        int safeSize = size <= 0 || size > 100 ? 25 : size;
        int safePage = Math.max(page, 0);
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(safePage,
                safeSize);

        org.springframework.data.domain.Page<StudentInvoice> result;
        if (StringUtils.hasText(studentName)) {
            result = invoiceRepository.findByTenantIdAndStudentNameContainingIgnoreCaseOrderByCreatedAtDesc(tenantId,
                    studentName.trim(), pageable);
        } else if (StringUtils.hasText(gradeLevel) && StringUtils.hasText(section)) {
            result = invoiceRepository.findByTenantIdAndGradeLevelAndSectionOrderByCreatedAtDesc(tenantId,
                    gradeLevel.trim(), section.trim(), pageable);
        } else {
            result = invoiceRepository.findByTenantIdOrderByCreatedAtDesc(tenantId, pageable);
        }
        result.forEach(this::maskSensitive);
        return result;
    }

    @Override
    @Transactional
    public StudentInvoice payInvoice(Long id, String admissionNo) {
        log.info("Marking invoice id={} as PAID", id);
        StudentInvoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> AppException.of(ErrorCode.INVOICE_NOT_FOUND, id));

        // Verify the caller knows the student's admission number for this invoice,
        // so an arbitrary invoice's status cannot be flipped by guessing ids.
        String expected = invoice.getAdmissionNo();
        if (expected != null && !expected.isBlank()) {
            if (admissionNo == null || !expected.trim().equalsIgnoreCase(admissionNo.trim())) {
                throw AppException.badRequest("Payment verification failed: admission number does not match.");
            }
        }

        invoice.setStatus(AppConstants.STATUS_PAID);
        invoice.setPaymentDate(LocalDateTime.now());
        return invoiceRepository.save(invoice);
    }
}
