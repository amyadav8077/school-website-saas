package com.schoolwebsite.backend.tenantsubscription.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.schoolwebsite.backend.tenantsubscription.entity.*;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, Long> {
    Optional<Tenant> findBySubdomain(String subdomain);

    Optional<Tenant> findByCustomDomain(String customDomain);

    boolean existsBySubdomain(String subdomain);

    boolean existsByName(String name);
}
