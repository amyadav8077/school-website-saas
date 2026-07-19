package com.schoolwebsite.backend.academics;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BoardResultRepository extends JpaRepository<BoardResult, Long> {
    List<BoardResult> findByTenantId(Long tenantId);
}
