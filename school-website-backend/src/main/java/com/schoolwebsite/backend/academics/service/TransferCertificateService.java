package com.schoolwebsite.backend.academics.service;

import java.util.List;

import com.schoolwebsite.backend.academics.entity.TransferCertificate;

public interface TransferCertificateService {
    List<TransferCertificate> searchTCs(Long tenantId, String studentName, String classLevel, String section,
            String admissionNo, String aadharNo);

    /**
     * Verifies the identity tuple (admissionNo + dateOfBirth + aadharNo) before a
     * Transfer Certificate may be downloaded. Returns the full unmasked record on
     * success; throws if the details do not match.
     */
    TransferCertificate verifyForDownload(Long tenantId, String admissionNo, String dateOfBirth, String aadharNo);

    /**
     * Admin-only full list for the issuing tenant (authorization enforced by caller).
     */
    List<TransferCertificate> getIssuedTCs(Long tenantId);

    TransferCertificate issueTC(Long tenantId, TransferCertificate tc);

    void deleteTC(Long id);
}
