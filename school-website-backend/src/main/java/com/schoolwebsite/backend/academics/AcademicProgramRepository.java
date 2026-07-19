package com.schoolwebsite.backend.academics;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AcademicProgramRepository extends JpaRepository<AcademicProgram, Long> {
    List<AcademicProgram> findByTenantId(Long tenantId);
}
