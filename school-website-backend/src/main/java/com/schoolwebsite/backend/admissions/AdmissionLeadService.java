package com.schoolwebsite.backend.admissions;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdmissionLeadService {

    private final AdmissionLeadRepository repository;

    @Transactional
    public AdmissionLeadResponse submitLead(Long tenantId, AdmissionLeadRequest request) {
        AdmissionLead lead = AdmissionLead.builder()
                .tenantId(tenantId)
                .studentName(request.getStudentName())
                .gradeLevel(request.getGradeLevel())
                .parentName(request.getParentName())
                .parentEmail(request.getParentEmail())
                .parentPhone(request.getParentPhone())
                .status("PENDING")
                .message(request.getMessage())
                .build();

        AdmissionLead saved = repository.save(lead);
        return mapToResponse(saved);
    }

    public List<AdmissionLeadResponse> getLeadsByTenant(Long tenantId) {
        return repository.findByTenantIdOrderByCreatedAtDesc(tenantId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AdmissionLeadResponse updateStatus(Long leadId, String status) {
        AdmissionLead lead = repository.findById(leadId)
                .orElseThrow(() -> new IllegalArgumentException("Admission lead not found with id: " + leadId));
        
        lead.setStatus(status);
        AdmissionLead saved = repository.save(lead);
        return mapToResponse(saved);
    }

    private AdmissionLeadResponse mapToResponse(AdmissionLead lead) {
        return AdmissionLeadResponse.builder()
                .id(lead.getId())
                .tenantId(lead.getTenantId())
                .studentName(lead.getStudentName())
                .gradeLevel(lead.getGradeLevel())
                .parentName(lead.getParentName())
                .parentEmail(lead.getParentEmail())
                .parentPhone(lead.getParentPhone())
                .status(lead.getStatus())
                .message(lead.getMessage())
                .createdAt(lead.getCreatedAt())
                .build();
    }
}
