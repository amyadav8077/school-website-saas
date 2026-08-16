package com.schoolwebsite.backend.notifications.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.schoolwebsite.backend.notifications.entity.*;

@Repository
public interface SchoolEventRepository extends JpaRepository<SchoolEvent, Long>
{
    List<SchoolEvent> findByTenantIdOrderByEventDateAsc(Long tenantId);
}
