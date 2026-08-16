package com.schoolwebsite.backend.support.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.schoolwebsite.backend.common.constant.AppConstants;
import com.schoolwebsite.backend.common.exception.AppException;
import com.schoolwebsite.backend.common.exception.ErrorCode;
import com.schoolwebsite.backend.support.entity.SupportInquiry;
import com.schoolwebsite.backend.support.repository.SupportInquiryRepository;
import com.schoolwebsite.backend.support.service.SupportInquiryService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class SupportInquiryServiceImpl implements SupportInquiryService
{
    private final SupportInquiryRepository repository;

    @Override
    @Transactional
    public SupportInquiry submitInquiry(Long tenantId, SupportInquiry inquiry)
    {
        log.info("Submitting support inquiry for tenantId={}, subject={}", tenantId, inquiry.getSubject());
        inquiry.setTenantId(tenantId);
        inquiry.setStatus(AppConstants.STATUS_PENDING);
        return repository.save(inquiry);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupportInquiry> getInquiries(Long tenantId)
    {
        log.debug("Fetching support inquiries for tenantId={}", tenantId);
        return repository.findByTenantIdOrderByCreatedAtDesc(tenantId);
    }

    @Override
    @Transactional
    public SupportInquiry resolveInquiry(Long id, String notes)
    {
        log.info("Resolving support inquiry id={}", id);
        SupportInquiry inquiry = repository.findById(id)
                .orElseThrow(() -> AppException.of(ErrorCode.SUPPORT_INQUIRY_NOT_FOUND, id));

        inquiry.setStatus(AppConstants.STATUS_RESOLVED);
        inquiry.setResolutionNotes(notes);
        return repository.save(inquiry);
    }
}
