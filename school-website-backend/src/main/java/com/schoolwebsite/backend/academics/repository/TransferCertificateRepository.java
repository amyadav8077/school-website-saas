package com.schoolwebsite.backend.academics.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.schoolwebsite.backend.academics.entity.*;

@Repository
public interface TransferCertificateRepository extends JpaRepository<TransferCertificate, Long>
{
    List<TransferCertificate> findByTenantIdOrderByIssueDateDesc(Long tenantId);

    Optional<TransferCertificate> findByTenantIdAndAdmissionNoAndFatherNameContainingIgnoreCaseAndAadharNo(
            Long tenantId, String admissionNo, String fatherName, String aadharNo);

    List<TransferCertificate> findByTenantIdAndClassLevelAndSectionOrderByIssueDateDesc(Long tenantId,
            String classLevel, String section);

    List<TransferCertificate> findByTenantIdAndClassLevelAndSectionAndStudentNameContainingIgnoreCaseOrderByIssueDateDesc(
            Long tenantId, String classLevel, String section, String studentName);

    List<TransferCertificate> findByTenantIdAndAdmissionNoOrderByIssueDateDesc(Long tenantId, String admissionNo);

    List<TransferCertificate> findByTenantIdAndStudentNameContainingIgnoreCaseOrderByIssueDateDesc(Long tenantId,
            String studentName);
}
