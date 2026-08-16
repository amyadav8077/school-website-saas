package com.schoolwebsite.backend.admissions.service;

import java.util.List;

import org.springframework.data.domain.Page;

import com.schoolwebsite.backend.admissions.dto.AdmissionLeadRequest;
import com.schoolwebsite.backend.admissions.dto.AdmissionLeadResponse;

public interface AdmissionLeadService {
    AdmissionLeadResponse submitLead(Long tenantId, AdmissionLeadRequest request);

    List<AdmissionLeadResponse> getLeadsByTenant(Long tenantId);

    Page<AdmissionLeadResponse> getLeadsByTenantPaged(Long tenantId, int page, int size);

    AdmissionLeadResponse updateStatus(Long leadId, String status);
}
