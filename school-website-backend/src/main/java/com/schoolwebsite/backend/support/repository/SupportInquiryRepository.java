package com.schoolwebsite.backend.support.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.schoolwebsite.backend.support.entity.*;

@Repository
public interface SupportInquiryRepository extends JpaRepository<SupportInquiry, Long>
{
    List<SupportInquiry> findByTenantIdOrderByCreatedAtDesc(Long tenantId);
}
