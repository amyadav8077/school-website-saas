package com.schoolwebsite.backend.academics.service;

import com.schoolwebsite.backend.academics.entity.*;
import com.schoolwebsite.backend.academics.repository.*;

import com.schoolwebsite.backend.common.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TransferCertificateService {

    private final TransferCertificateRepository repository;

    @Transactional(readOnly = true)
    public List<TransferCertificate> searchTCs(Long tenantId, String studentName, String classLevel,
                                                String section, String admissionNo, String fatherName,
                                                String aadharNo) {
        if (studentName != null && !studentName.trim().isEmpty()) {
            return repository.findByTenantIdAndStudentNameContainingIgnoreCaseOrderByIssueDateDesc(
                    tenantId, studentName.trim());
        }
        if (classLevel != null && !classLevel.trim().isEmpty() && section != null && !section.trim().isEmpty()) {
            return repository.findByTenantIdAndClassLevelAndSectionOrderByIssueDateDesc(
                    tenantId, classLevel.trim(), section.trim());
        }
        if (admissionNo != null && !admissionNo.trim().isEmpty()) {
            if (fatherName != null && !fatherName.trim().isEmpty()
                    && aadharNo != null && !aadharNo.trim().isEmpty()) {
                Optional<TransferCertificate> tc =
                        repository.findByTenantIdAndAdmissionNoAndFatherNameContainingIgnoreCaseAndAadharNo(
                                tenantId, admissionNo.trim(), fatherName.trim(), aadharNo.trim());
                return tc.map(List::of).orElse(List.of());
            }
            return repository.findByTenantIdAndAdmissionNoOrderByIssueDateDesc(tenantId, admissionNo.trim());
        }
        return repository.findByTenantIdOrderByIssueDateDesc(tenantId);
    }

    @Transactional
    public TransferCertificate issueTC(Long tenantId, TransferCertificate tc) {
        tc.setTenantId(tenantId);
        if (tc.getIssueDate() == null) {
            tc.setIssueDate(LocalDateTime.now());
        }
        return repository.save(tc);
    }

    @Transactional
    public void deleteTC(Long id) {
        if (!repository.existsById(id)) {
            throw AppException.notFound("Transfer certificate not found with id: " + id);
        }
        repository.deleteById(id);
    }
}
