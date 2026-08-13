package com.schoolwebsite.backend.academics.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.schoolwebsite.backend.academics.entity.TransferCertificate;
import com.schoolwebsite.backend.academics.repository.TransferCertificateRepository;
import com.schoolwebsite.backend.academics.service.TransferCertificateService;
import com.schoolwebsite.backend.common.exception.AppException;
import com.schoolwebsite.backend.common.exception.ErrorCode;
import com.schoolwebsite.backend.common.util.StringUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransferCertificateServiceImpl implements TransferCertificateService {

    private final TransferCertificateRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<TransferCertificate> searchTCs(Long tenantId, String studentName, String classLevel, String section,
            String admissionNo, String fatherName, String aadharNo) {
        log.debug("Searching transfer certificates for tenantId={}", tenantId);
        if (StringUtils.hasText(studentName)) {
            return repository.findByTenantIdAndStudentNameContainingIgnoreCaseOrderByIssueDateDesc(tenantId,
                    studentName.trim());
        }
        if (StringUtils.hasText(classLevel) && StringUtils.hasText(section)) {
            return repository.findByTenantIdAndClassLevelAndSectionOrderByIssueDateDesc(tenantId, classLevel.trim(),
                    section.trim());
        }
        if (StringUtils.hasText(admissionNo)) {
            if (StringUtils.hasText(fatherName) && StringUtils.hasText(aadharNo)) {
                Optional<TransferCertificate> tc = repository
                        .findByTenantIdAndAdmissionNoAndFatherNameContainingIgnoreCaseAndAadharNo(tenantId,
                                admissionNo.trim(), fatherName.trim(), aadharNo.trim());
                return tc.map(List::of).orElse(List.of());
            }
            return repository.findByTenantIdAndAdmissionNoOrderByIssueDateDesc(tenantId, admissionNo.trim());
        }
        return repository.findByTenantIdOrderByIssueDateDesc(tenantId);
    }

    @Override
    @Transactional
    public TransferCertificate issueTC(Long tenantId, TransferCertificate tc) {
        log.info("Issuing transfer certificate for tenantId={}, student={}", tenantId, tc.getStudentName());
        tc.setTenantId(tenantId);
        if (tc.getIssueDate() == null) {
            tc.setIssueDate(LocalDateTime.now());
        }
        return repository.save(tc);
    }

    @Override
    @Transactional
    public void deleteTC(Long id) {
        log.info("Deleting transfer certificate id={}", id);
        if (!repository.existsById(id)) {
            throw AppException.of(ErrorCode.TRANSFER_CERTIFICATE_NOT_FOUND, id);
        }
        repository.deleteById(id);
    }
}
