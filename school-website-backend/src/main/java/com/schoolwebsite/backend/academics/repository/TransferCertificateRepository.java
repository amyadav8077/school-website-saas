package com.schoolwebsite.backend.academics.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.schoolwebsite.backend.academics.entity.*;

@Repository
public interface TransferCertificateRepository extends JpaRepository<TransferCertificate, Long> {
    List<TransferCertificate> findByTenantIdOrderByIssueDateDesc(Long tenantId);

    // Exact-match verification tuple (case-insensitive father name) so a caller must
    // know the precise record — a substring match would weaken the guarantee.
    Optional<TransferCertificate> findByTenantIdAndAdmissionNoAndFatherNameIgnoreCaseAndAadharNo(Long tenantId,
            String admissionNo, String fatherName, String aadharNo);

    // Full download-verification tuple: adds date of birth on top of the secure tuple.
    Optional<TransferCertificate> findByTenantIdAndAdmissionNoAndFatherNameIgnoreCaseAndAadharNoAndDateOfBirth(
            Long tenantId, String admissionNo, String fatherName, String aadharNo, String dateOfBirth);

    List<TransferCertificate> findByTenantIdAndClassLevelAndSectionOrderByIssueDateDesc(Long tenantId,
            String classLevel, String section);

    List<TransferCertificate> findByTenantIdAndClassLevelAndSectionAndStudentNameContainingIgnoreCaseOrderByIssueDateDesc(
            Long tenantId, String classLevel, String section, String studentName);

    List<TransferCertificate> findByTenantIdAndAdmissionNoOrderByIssueDateDesc(Long tenantId, String admissionNo);

    List<TransferCertificate> findByTenantIdAndStudentNameContainingIgnoreCaseOrderByIssueDateDesc(Long tenantId,
            String studentName);
}
