package com.schoolwebsite.backend.support;

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
                .orElseThrow(() -> new IllegalArgumentException("Support inquiry not found with id: " + id));
        
        inquiry.setStatus("RESOLVED");
        inquiry.setResolutionNotes(notes);
        return repository.save(inquiry);
    }
}
