package com.schoolwebsite.backend.admissions.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.schoolwebsite.backend.admissions.entity.*;

@Repository
public interface AdmissionLeadRepository extends JpaRepository<AdmissionLead, Long>
{
    List<AdmissionLead> findByTenantIdOrderByCreatedAtDesc(Long tenantId);

    Page<AdmissionLead> findByTenantIdOrderByCreatedAtDesc(Long tenantId, Pageable pageable);
}
