package com.schoolwebsite.backend.analytics.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.schoolwebsite.backend.analytics.entity.SiteVisit;

public interface SiteVisitRepository extends JpaRepository<SiteVisit, Long> {

    long countByTenantId(Long tenantId);

    /**
     * Daily visit counts for a tenant since the given instant. Returns rows of
     * [java.sql.Date day, Long count] so the service can bucket them by day.
     */
    @Query("SELECT CAST(v.visitedAt AS date) AS day, COUNT(v) AS total " +
            "FROM SiteVisit v WHERE v.tenantId = :tenantId AND v.visitedAt >= :since " +
            "GROUP BY CAST(v.visitedAt AS date) ORDER BY day")
    List<Object[]> countDailySince(@Param("tenantId") Long tenantId, @Param("since") LocalDateTime since);
}
