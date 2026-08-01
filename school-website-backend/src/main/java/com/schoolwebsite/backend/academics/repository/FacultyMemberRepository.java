package com.schoolwebsite.backend.academics.repository;

import com.schoolwebsite.backend.academics.entity.*;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FacultyMemberRepository extends JpaRepository<FacultyMember, Long> {
    List<FacultyMember> findByTenantId(Long tenantId);
}
