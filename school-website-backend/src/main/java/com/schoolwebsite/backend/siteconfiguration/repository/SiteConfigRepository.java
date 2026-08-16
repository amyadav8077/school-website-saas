package com.schoolwebsite.backend.siteconfiguration.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.schoolwebsite.backend.siteconfiguration.entity.*;

@Repository
public interface SiteConfigRepository extends JpaRepository<SiteConfig, Long>
{
    Optional<SiteConfig> findByTenantId(Long tenantId);
}
