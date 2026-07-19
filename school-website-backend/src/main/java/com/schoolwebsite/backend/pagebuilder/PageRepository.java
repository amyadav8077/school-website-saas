package com.schoolwebsite.backend.pagebuilder;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PageRepository extends JpaRepository<Page, Long> {
    List<Page> findByTenantId(Long tenantId);
    Optional<Page> findByTenantIdAndSlug(Long tenantId, String slug);
    boolean existsByTenantIdAndSlug(Long tenantId, String slug);
}
