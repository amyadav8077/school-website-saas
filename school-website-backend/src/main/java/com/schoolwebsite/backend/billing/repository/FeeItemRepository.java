package com.schoolwebsite.backend.billing.repository;

import com.schoolwebsite.backend.billing.entity.*;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeeItemRepository extends JpaRepository<FeeItem, Long> {
    List<FeeItem> findByTenantId(Long tenantId);
}
