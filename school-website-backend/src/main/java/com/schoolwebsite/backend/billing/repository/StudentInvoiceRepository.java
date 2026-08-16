package com.schoolwebsite.backend.billing.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.schoolwebsite.backend.billing.entity.*;

@Repository
public interface StudentInvoiceRepository extends JpaRepository<StudentInvoice, Long>
{
    // Aggregate totals computed in the DB so financial figures stay accurate at
    // any scale without loading every invoice into memory.
    @Query("SELECT COALESCE(SUM(i.amount), 0) FROM StudentInvoice i WHERE i.tenantId = :tenantId")
    double sumBilledByTenant(@Param("tenantId") Long tenantId);

    @Query("SELECT COALESCE(SUM(i.amount), 0) FROM StudentInvoice i WHERE i.tenantId = :tenantId AND i.status = :status")
    double sumByTenantAndStatus(@Param("tenantId") Long tenantId, @Param("status") String status);

    long countByTenantId(Long tenantId);

    List<StudentInvoice> findByTenantIdOrderByCreatedAtDesc(Long tenantId);

    List<StudentInvoice> findByTenantIdAndStudentNameContainingIgnoreCaseOrderByCreatedAtDesc(Long tenantId,
            String studentName);

    List<StudentInvoice> findByTenantIdAndGradeLevelAndSectionAndStudentNameContainingIgnoreCaseOrderByCreatedAtDesc(
            Long tenantId, String gradeLevel, String section, String studentName);

    List<StudentInvoice> findByTenantIdAndGradeLevelAndSectionOrderByCreatedAtDesc(Long tenantId, String gradeLevel,
            String section);

    // Paginated variants for admin lists at scale.
    Page<StudentInvoice> findByTenantIdOrderByCreatedAtDesc(Long tenantId, Pageable pageable);

    Page<StudentInvoice> findByTenantIdAndStudentNameContainingIgnoreCaseOrderByCreatedAtDesc(Long tenantId,
            String studentName, Pageable pageable);

    Page<StudentInvoice> findByTenantIdAndGradeLevelAndSectionOrderByCreatedAtDesc(Long tenantId, String gradeLevel,
            String section, Pageable pageable);
}
