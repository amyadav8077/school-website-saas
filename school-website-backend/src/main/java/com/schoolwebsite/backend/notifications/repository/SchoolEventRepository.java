package com.schoolwebsite.backend.notifications.repository;

import com.schoolwebsite.backend.notifications.entity.*;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SchoolEventRepository extends JpaRepository<SchoolEvent, Long> {
    List<SchoolEvent> findByTenantIdOrderByEventDateAsc(Long tenantId);
}
