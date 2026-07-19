package com.schoolwebsite.backend.academics;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentAchieverRepository extends JpaRepository<StudentAchiever, Long> {
    List<StudentAchiever> findByTenantId(Long tenantId);
}
