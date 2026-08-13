package com.schoolwebsite.backend.academics.service;

import java.util.List;

import com.schoolwebsite.backend.academics.entity.TransferCertificate;

public interface TransferCertificateService {

    List<TransferCertificate> searchTCs(Long tenantId, String studentName, String classLevel, String section,
            String admissionNo, String fatherName, String aadharNo);

    TransferCertificate issueTC(Long tenantId, TransferCertificate tc);

    void deleteTC(Long id);
}
