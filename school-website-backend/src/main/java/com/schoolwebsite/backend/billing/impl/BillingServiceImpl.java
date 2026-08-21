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
        // Class/section browsing returns a privacy-safe listing (name + class only);
        // full invoice detail is released only after identity verification.
        if (!StringUtils.hasText(studentName) && StringUtils.hasText(gradeLevel) && StringUtils.hasText(section)) {
            return invoiceRepository
                    .findByTenantIdAndGradeLevelAndSectionOrderByCreatedAtDesc(tenantId, gradeLevel.trim(),
                            section.trim())
                    .stream().map(this::maskForListing).collect(java.util.stream.Collectors.toList());
        }
        List<StudentInvoice> result;
        if (StringUtils.hasText(studentName)) {
            result = invoiceRepository.findByTenantIdAndStudentNameContainingIgnoreCaseOrderByCreatedAtDesc(tenantId,
                    studentName.trim());
        } else {
            result = invoiceRepository.findByTenantIdOrderByCreatedAtDesc(tenantId);
        }
        result.forEach(this::maskSensitive);
        return result;
    }

    /**
     * PUBLIC fee-view verification. All four details must match the student's
     * records; returns that student's full unmasked invoices so they can be
     * viewed and paid. Throws if nothing matches.
     */
    @Override
    @Transactional(readOnly = true)
    public List<StudentInvoice> verifyInvoices(Long tenantId, String admissionNo, String fatherName, String dateOfBirth,
            String aadharNo) {
        log.debug("Verifying fee-view eligibility for tenantId={}", tenantId);
        if (!StringUtils.hasText(admissionNo) || !StringUtils.hasText(fatherName) || !StringUtils.hasText(dateOfBirth)
                || !StringUtils.hasText(aadharNo)) {
            throw AppException.badRequest(
                    "Verification requires Admission Number, Father's Name, Date of Birth and Aadhaar Number.");
        }
        List<StudentInvoice> invoices = invoiceRepository
                .findByTenantIdAndAdmissionNoAndFatherNameIgnoreCaseAndAadharNoAndDateOfBirthOrderByCreatedAtDesc(
                        tenantId, admissionNo.trim(), fatherName.trim(), aadharNo.trim(), dateOfBirth.trim());
        if (invoices.isEmpty()) {
            throw AppException.badRequest("The details provided do not match our records. Please check and try again.");
        }
        invoices.forEach(this::maskSensitive);
        return invoices;
    }

    /** Masks the Aadhaar number so only the last 4 digits are returned. */
    private StudentInvoice maskSensitive(StudentInvoice inv) {
        inv.setAadharNo(com.schoolwebsite.backend.common.util.PiiMasker.maskAadhaar(inv.getAadharNo()));
        return inv;
    }

    /**
     * Privacy-safe copy for class/section listings: only student name, class and
     * section are meaningful. Admission number is heavily masked; father name,
     * Aadhaar, DOB, amounts and fee details are withheld so the listing cannot be
     * used to harvest verification details or expose a student's financials.
     */
    private StudentInvoice maskForListing(StudentInvoice inv) {
        return StudentInvoice.builder().id(inv.getId()).tenantId(inv.getTenantId()).studentName(inv.getStudentName())
                .gradeLevel(inv.getGradeLevel()).section(inv.getSection())
                .admissionNo(maskAdmissionNo(inv.getAdmissionNo())).fatherName(null).aadharNo(null).dateOfBirth(null)
                .feeItemName("Hidden — verify to view").amount(0.0).status(inv.getStatus()).dueDate(inv.getDueDate())
                .build();
    }

    /** Reveals only the last 2 characters of an admission number, e.g. ADM-901 -> ****01. */
    private String maskAdmissionNo(String admissionNo) {
        if (!StringUtils.hasText(admissionNo)) {
            return admissionNo;
        }
        String trimmed = admissionNo.trim();
        if (trimmed.length() <= 2) {
            return "**";
        }
        return "****" + trimmed.substring(trimmed.length() - 2);
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
