package com.schoolwebsite.backend.admissions.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.schoolwebsite.backend.admissions.dto.AdmissionLeadRequest;
import com.schoolwebsite.backend.admissions.dto.AdmissionLeadResponse;
import com.schoolwebsite.backend.admissions.entity.AdmissionLead;
import com.schoolwebsite.backend.admissions.repository.AdmissionLeadRepository;
import com.schoolwebsite.backend.admissions.service.AdmissionLeadService;
import com.schoolwebsite.backend.auth.security.CurrentUser;
import com.schoolwebsite.backend.common.constant.AppConstants;
import com.schoolwebsite.backend.common.exception.AppException;
import com.schoolwebsite.backend.common.exception.ErrorCode;
import com.schoolwebsite.backend.notification.AdminNotificationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdmissionLeadServiceImpl implements AdmissionLeadService {
    private final AdmissionLeadRepository repository;
    private final AdminNotificationService adminNotificationService;

    @Override
    @Transactional
    public AdmissionLeadResponse submitLead(Long tenantId, AdmissionLeadRequest request) {
        log.info("Submitting admission lead for tenantId={}", tenantId);
        AdmissionLead lead = AdmissionLead.builder().tenantId(tenantId).studentName(request.getStudentName())
                .gradeLevel(request.getGradeLevel()).parentName(request.getParentName())
                .parentEmail(request.getParentEmail()).parentPhone(request.getParentPhone())
                .status(AppConstants.STATUS_PENDING).message(request.getMessage()).build();

        AdmissionLead saved = repository.save(lead);
        adminNotificationService.notifyNewAdmissionLead(tenantId, saved.getStudentName(), saved.getGradeLevel(),
                saved.getParentName(), saved.getParentEmail(), saved.getParentPhone(), saved.getMessage());
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdmissionLeadResponse> getLeadsByTenant(Long tenantId) {
        log.debug("Fetching admission leads for tenantId={}", tenantId);
        return repository.findByTenantIdOrderByCreatedAtDesc(tenantId).stream().map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<AdmissionLeadResponse> getLeadsByTenantPaged(Long tenantId, int page,
            int size) {
        int safeSize = size <= 0 || size > 100 ? 25 : size;
        int safePage = Math.max(page, 0);
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(safePage,
                safeSize);
        return repository.findByTenantIdOrderByCreatedAtDesc(tenantId, pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional
    public AdmissionLeadResponse updateStatus(Long leadId, String status) {
        log.info("Updating admission lead id={} to status={}", leadId, status);
        AdmissionLead lead = repository.findById(leadId)
                .orElseThrow(() -> AppException.of(ErrorCode.ADMISSION_LEAD_NOT_FOUND, leadId));
        CurrentUser.assertTenantAccess(lead.getTenantId());

        lead.setStatus(status);
        AdmissionLead saved = repository.save(lead);
        return mapToResponse(saved);
    }

    private AdmissionLeadResponse mapToResponse(AdmissionLead lead) {
        return AdmissionLeadResponse.builder().id(lead.getId()).tenantId(lead.getTenantId())
                .studentName(lead.getStudentName()).gradeLevel(lead.getGradeLevel()).parentName(lead.getParentName())
                .parentEmail(lead.getParentEmail()).parentPhone(lead.getParentPhone()).status(lead.getStatus())
                .message(lead.getMessage()).createdAt(lead.getCreatedAt()).build();
    }
}
