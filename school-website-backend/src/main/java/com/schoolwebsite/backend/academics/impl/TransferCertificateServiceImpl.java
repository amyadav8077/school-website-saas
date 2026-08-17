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
     * PUBLIC lookup supporting two modes:
     * <ol>
     * <li><b>Secure verify</b> — the full identity tuple
     * (admissionNo + fatherName + aadharNo) returns the exact certificate.</li>
     * <li><b>Class &amp; section</b> — classLevel + section (optionally narrowed
     * by student name) lists certificates for that class/section.</li>
     * </ol>
     * The returned Aadhaar is always masked. Requests that provide neither a
     * complete secure tuple nor class+section are rejected.
     */
    @Override
    @Transactional(readOnly = true)
    public List<TransferCertificate> searchTCs(Long tenantId, String studentName, String classLevel, String section,
            String admissionNo, String fatherName, String aadharNo) {
        log.debug("Looking up transfer certificate(s) for tenantId={}", tenantId);

        // Mode 1: full secure identity tuple.
        if (StringUtils.hasText(admissionNo) && StringUtils.hasText(fatherName) && StringUtils.hasText(aadharNo)) {
            Optional<TransferCertificate> tc = repository.findByTenantIdAndAdmissionNoAndFatherNameIgnoreCaseAndAadharNo(
                    tenantId, admissionNo.trim(), fatherName.trim(), aadharNo.trim());
            return tc.map(t -> List.of(maskSensitive(t))).orElse(List.of());
        }

        // Mode 2: class + section (optionally narrowed by student name).
        // Returns a lightweight, heavily-masked list — the actual certificate can
        // only be downloaded after full identity verification (verifyForDownload).
        if (StringUtils.hasText(classLevel) && StringUtils.hasText(section)) {
            List<TransferCertificate> results;
            if (StringUtils.hasText(studentName)) {
                results = repository
                        .findByTenantIdAndClassLevelAndSectionAndStudentNameContainingIgnoreCaseOrderByIssueDateDesc(
                                tenantId, classLevel.trim(), section.trim(), studentName.trim());
            } else {
                results = repository.findByTenantIdAndClassLevelAndSectionOrderByIssueDateDesc(
                        tenantId, classLevel.trim(), section.trim());
            }
            return results.stream().map(this::maskForListing).collect(java.util.stream.Collectors.toList());
        }

        throw AppException.badRequest(
                "Provide either Class and Section, or the full verification details (Admission Number, Father's Name and Aadhaar Number).");
    }

    /**
     * PUBLIC download verification. All four details must match the record
     * exactly (father name is case-insensitive). Returns the full unmasked
     * certificate so the caller can render/download it; throws otherwise.
     */
    @Override
    @Transactional(readOnly = true)
    public TransferCertificate verifyForDownload(Long tenantId, String admissionNo, String fatherName,
            String dateOfBirth, String aadharNo) {
        log.debug("Verifying TC download eligibility for tenantId={}", tenantId);
        if (!StringUtils.hasText(admissionNo) || !StringUtils.hasText(fatherName) || !StringUtils.hasText(dateOfBirth)
                || !StringUtils.hasText(aadharNo)) {
            throw AppException.badRequest(
                    "Download requires Admission Number, Father's Name, Date of Birth and Aadhaar Number.");
        }
        return repository
                .findByTenantIdAndAdmissionNoAndFatherNameIgnoreCaseAndAadharNoAndDateOfBirth(
                        tenantId, admissionNo.trim(), fatherName.trim(), aadharNo.trim(), dateOfBirth.trim())
                .orElseThrow(() -> AppException.badRequest(
                        "The details provided do not match our records. Please check and try again."));
    }

    /**
     * Produces a privacy-safe copy for class/section listings: only the student
     * name, class, section and issue date are meaningful — admission number,
     * father name, Aadhaar and DOB are masked/blanked so the list cannot be used
     * to harvest the verification details needed to download a certificate.
     */
    private TransferCertificate maskForListing(TransferCertificate tc) {
        return TransferCertificate.builder()
                .id(tc.getId())
                .tenantId(tc.getTenantId())
                .studentName(tc.getStudentName())
                .classLevel(tc.getClassLevel())
                .section(tc.getSection())
                .admissionNo(maskAdmissionNo(tc.getAdmissionNo()))
                .fatherName(null)
                .aadharNo(null)
                .dateOfBirth(null)
                .tcNumber(null)
                .issueDate(tc.getIssueDate())
                .pdfUrl(null)
                .build();
    }

    /** Reveals only the last 2 characters of an admission number, e.g. ADM-901 -> ****01. */
    private String maskAdmissionNo(String admissionNo) {
        if (!StringUtils.hasText(admissionNo)) {
            return admissionNo;
        }
        String trimmed = admissionNo.trim();
        if (trimmed.length() <= 2) {
            return "**";
        }
        return "****" + trimmed.substring(trimmed.length() - 2);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransferCertificate> getIssuedTCs(Long tenantId) {
        // Even for the owning admin, return Aadhaar masked to minimize PII exposure.
        return repository.findByTenantIdOrderByIssueDateDesc(tenantId).stream().map(this::maskSensitive)
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * Masks the Aadhaar number so only the last 4 digits are ever returned.
     */
    private TransferCertificate maskSensitive(TransferCertificate tc) {
        tc.setAadharNo(com.schoolwebsite.backend.common.util.PiiMasker.maskAadhaar(tc.getAadharNo()));
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
