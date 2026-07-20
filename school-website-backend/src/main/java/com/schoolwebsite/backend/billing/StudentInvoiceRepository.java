package com.schoolwebsite.backend.billing;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentInvoiceRepository extends JpaRepository<StudentInvoice, Long> {
    List<StudentInvoice> findByTenantIdOrderByCreatedAtDesc(Long tenantId);
    List<StudentInvoice> findByTenantIdAndStudentNameContainingIgnoreCaseOrderByCreatedAtDesc(Long tenantId, String studentName);

    List<StudentInvoice> findByTenantIdAndGradeLevelAndSectionAndStudentNameContainingIgnoreCaseOrderByCreatedAtDesc(
            Long tenantId, String gradeLevel, String section, String studentName);

    List<StudentInvoice> findByTenantIdAndGradeLevelAndSectionOrderByCreatedAtDesc(
            Long tenantId, String gradeLevel, String section);
}
