package com.schoolwebsite.backend.support.service;

import com.schoolwebsite.backend.support.entity.*;
import com.schoolwebsite.backend.support.repository.*;

import com.schoolwebsite.backend.common.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SupportInquiryService {

    private final SupportInquiryRepository repository;

    @Transactional
    public SupportInquiry submitInquiry(Long tenantId, SupportInquiry inquiry) {
        inquiry.setTenantId(tenantId);
        inquiry.setStatus("PENDING");
        return repository.save(inquiry);
    }

    public List<SupportInquiry> getInquiries(Long tenantId) {
        return repository.findByTenantIdOrderByCreatedAtDesc(tenantId);
    }

    @Transactional
    public SupportInquiry resolveInquiry(Long id, String notes) {
        SupportInquiry inquiry = repository.findById(id)
                .orElseThrow(() -> AppException.notFound("Support inquiry not found with id: " + id));
        
        inquiry.setStatus("RESOLVED");
        inquiry.setResolutionNotes(notes);
        return repository.save(inquiry);
    }
}
