package com.schoolwebsite.backend.academics.repository;

import com.schoolwebsite.backend.academics.entity.*;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EnrichmentActivityRepository extends JpaRepository<EnrichmentActivity, Long> {
    List<EnrichmentActivity> findByTenantId(Long tenantId);
}
