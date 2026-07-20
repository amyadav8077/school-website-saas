package com.schoolwebsite.backend.academics;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransferCertificateRepository extends JpaRepository<TransferCertificate, Long> {
    List<TransferCertificate> findByTenantIdOrderByIssueDateDesc(Long tenantId);
    
    Optional<TransferCertificate> findByTenantIdAndAdmissionNoAndFatherNameContainingIgnoreCaseAndAadharNo(
            Long tenantId, String admissionNo, String fatherName, String aadharNo);

    List<TransferCertificate> findByTenantIdAndClassLevelAndSectionOrderByIssueDateDesc(
            Long tenantId, String classLevel, String section);

    List<TransferCertificate> findByTenantIdAndClassLevelAndSectionAndStudentNameContainingIgnoreCaseOrderByIssueDateDesc(
            Long tenantId, String classLevel, String section, String studentName);

    List<TransferCertificate> findByTenantIdAndAdmissionNoOrderByIssueDateDesc(
            Long tenantId, String admissionNo);
}
