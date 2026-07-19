package com.schoolwebsite.backend.admissions;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdmissionLeadRepository extends JpaRepository<AdmissionLead, Long> {
    List<AdmissionLead> findByTenantIdOrderByCreatedAtDesc(Long tenantId);
}
