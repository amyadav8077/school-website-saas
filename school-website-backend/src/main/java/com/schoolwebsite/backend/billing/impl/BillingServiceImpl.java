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
public class BillingServiceImpl implements BillingService
{
    private final FeeItemRepository feeItemRepository;

    private final StudentInvoiceRepository invoiceRepository;

    @Override
    @Transactional
    public FeeItem createFeeItem(Long tenantId, FeeItem item)
    {
        log.info("Creating fee item for tenantId={}, name={}", tenantId, item.getName());
        item.setTenantId(tenantId);
        return feeItemRepository.save(item);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeeItem> getFeeItems(Long tenantId)
    {
        log.debug("Fetching fee items for tenantId={}", tenantId);
        return feeItemRepository.findByTenantId(tenantId);
    }

    @Override
    @Transactional
    public StudentInvoice generateInvoice(Long tenantId, StudentInvoice invoice)
    {
        log.info("Generating invoice for tenantId={}, student={}", tenantId, invoice.getStudentName());
        invoice.setTenantId(tenantId);
        invoice.setStatus(AppConstants.STATUS_PENDING);
        invoice.setDueDate(LocalDateTime.now().plusDays(AppConstants.INVOICE_DUE_DAYS));
        return invoiceRepository.save(invoice);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentInvoice> getInvoices(Long tenantId, String studentName, String gradeLevel, String section)
    {
        log.debug("Fetching invoices for tenantId={}", tenantId);
        if (StringUtils.hasText(studentName))
        {
            return invoiceRepository.findByTenantIdAndStudentNameContainingIgnoreCaseOrderByCreatedAtDesc(tenantId,
                    studentName.trim());
        }
        if (StringUtils.hasText(gradeLevel) && StringUtils.hasText(section))
        {
            return invoiceRepository.findByTenantIdAndGradeLevelAndSectionOrderByCreatedAtDesc(tenantId,
                    gradeLevel.trim(), section.trim());
        }
        return invoiceRepository.findByTenantIdOrderByCreatedAtDesc(tenantId);
    }

    @Override
    @Transactional(readOnly = true)
    public com.schoolwebsite.backend.billing.dto.InvoiceStatsResponse getInvoiceStats(Long tenantId)
    {
        double billed = invoiceRepository.sumBilledByTenant(tenantId);
        double paid = invoiceRepository.sumByTenantAndStatus(tenantId, AppConstants.STATUS_PAID);
        long count = invoiceRepository.countByTenantId(tenantId);
        return com.schoolwebsite.backend.billing.dto.InvoiceStatsResponse.builder().totalBilled(billed).totalPaid(paid)
                .totalPending(billed - paid).invoiceCount(count).build();
    }

    @Override
    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<StudentInvoice> getInvoicesPaged(Long tenantId, String studentName,
            String gradeLevel, String section, int page, int size)
    {
        int safeSize = size <= 0 || size > 100 ? 25 : size;
        int safePage = Math.max(page, 0);
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(safePage,
                safeSize);

        if (StringUtils.hasText(studentName))
        {
            return invoiceRepository.findByTenantIdAndStudentNameContainingIgnoreCaseOrderByCreatedAtDesc(tenantId,
                    studentName.trim(), pageable);
        }
        if (StringUtils.hasText(gradeLevel) && StringUtils.hasText(section))
        {
            return invoiceRepository.findByTenantIdAndGradeLevelAndSectionOrderByCreatedAtDesc(tenantId,
                    gradeLevel.trim(), section.trim(), pageable);
        }
        return invoiceRepository.findByTenantIdOrderByCreatedAtDesc(tenantId, pageable);
    }

    @Override
    @Transactional
    public StudentInvoice payInvoice(Long id)
    {
        log.info("Marking invoice id={} as PAID", id);
        StudentInvoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> AppException.of(ErrorCode.INVOICE_NOT_FOUND, id));

        invoice.setStatus(AppConstants.STATUS_PAID);
        invoice.setPaymentDate(LocalDateTime.now());
        return invoiceRepository.save(invoice);
    }
}
