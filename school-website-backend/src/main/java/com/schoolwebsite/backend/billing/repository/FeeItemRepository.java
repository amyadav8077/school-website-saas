package com.schoolwebsite.backend.billing.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.schoolwebsite.backend.billing.entity.*;

@Repository
public interface FeeItemRepository extends JpaRepository<FeeItem, Long> {
    List<FeeItem> findByTenantId(Long tenantId);
}
