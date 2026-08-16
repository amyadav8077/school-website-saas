package com.schoolwebsite.backend.academics.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.schoolwebsite.backend.academics.entity.*;

@Repository
public interface FacultyMemberRepository extends JpaRepository<FacultyMember, Long> {
    List<FacultyMember> findByTenantId(Long tenantId);
}
