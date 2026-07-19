package com.schoolwebsite.backend.notifications;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SchoolNewsRepository extends JpaRepository<SchoolNews, Long> {
    List<SchoolNews> findByTenantIdOrderByPublishedDateDesc(Long tenantId);
}
