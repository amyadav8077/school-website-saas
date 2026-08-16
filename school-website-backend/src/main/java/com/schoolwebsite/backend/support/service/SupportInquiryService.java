package com.schoolwebsite.backend.support.service;

import java.util.List;

import com.schoolwebsite.backend.support.entity.SupportInquiry;

public interface SupportInquiryService
{
    SupportInquiry submitInquiry(Long tenantId, SupportInquiry inquiry);

    List<SupportInquiry> getInquiries(Long tenantId);

    SupportInquiry resolveInquiry(Long id, String notes);
}
