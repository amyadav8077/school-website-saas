package com.schoolwebsite.backend.academics.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.schoolwebsite.backend.academics.entity.TransferCertificate;
import com.schoolwebsite.backend.academics.repository.TransferCertificateRepository;
import com.schoolwebsite.backend.academics.service.TransferCertificateService;
import com.schoolwebsite.backend.auth.security.CurrentUser;
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

    /**
     * PUBLIC verification lookup. Requires the full identity tuple
     * (admissionNo + fatherName + aadharNo) so a caller can only retrieve a
     * certificate they already have the details for — never browse or dump all
     * TCs. The returned Aadhaar is masked. Broad/empty queries are rejected.
     */
    @Override
    @Transactional(readOnly = true)
    public List<TransferCertificate> searchTCs(Long tenantId, String studentName, String classLevel, String section,
            String admissionNo, String fatherName, String aadharNo) {
        log.debug("Verifying transfer certificate for tenantId={}", tenantId);
        if (!StringUtils.hasText(admissionNo) || !StringUtils.hasText(fatherName) || !StringUtils.hasText(aadharNo)) {
            throw AppException.badRequest("Verification requires Admission Number, Father's Name and Aadhaar Number.");
        }
        Optional<TransferCertificate> tc = repository
                .findByTenantIdAndAdmissionNoAndFatherNameContainingIgnoreCaseAndAadharNo(tenantId, admissionNo.trim(),
                        fatherName.trim(), aadharNo.trim());
        return tc.map(t -> List.of(maskSensitive(t))).orElse(List.of());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransferCertificate> getIssuedTCs(Long tenantId) {
        // Even for the owning admin, return Aadhaar masked to minimize PII exposure.
        return repository.findByTenantIdOrderByIssueDateDesc(tenantId).stream().map(this::maskSensitive)
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * Masks the Aadhaar number so only the last 4 digits are ever returned publicly.
     */
    private TransferCertificate maskSensitive(TransferCertificate tc) {
        String aadhar = tc.getAadharNo();
        if (aadhar != null && aadhar.length() > 4) {
            tc.setAadharNo("XXXX-XXXX-" + aadhar.substring(aadhar.length() - 4));
        }
        return tc;
    }

    @Override
    @Transactional
    public TransferCertificate issueTC(Long tenantId, TransferCertificate tc) {
        log.info("Issuing transfer certificate for tenantId={}", tenantId);
        tc.setId(null);
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
        var existing = repository.findById(id)
                .orElseThrow(() -> AppException.of(ErrorCode.TRANSFER_CERTIFICATE_NOT_FOUND, id));
        CurrentUser.assertTenantAccess(existing.getTenantId());
        repository.deleteById(id);
    }
}
