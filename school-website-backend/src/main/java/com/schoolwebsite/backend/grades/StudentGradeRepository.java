package com.schoolwebsite.backend.grades;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentGradeRepository extends JpaRepository<StudentGrade, Long> {
    List<StudentGrade> findByTenantIdOrderByCreatedAtDesc(Long tenantId);
    List<StudentGrade> findByTenantIdAndStudentNameContainingIgnoreCaseOrderByCreatedAtDesc(Long tenantId, String studentName);
    
    List<StudentGrade> findByTenantIdAndClassLevelAndSectionAndStudentNameContainingIgnoreCaseOrderByCreatedAtDesc(
            Long tenantId, String classLevel, String section, String studentName);
            
    List<StudentGrade> findByTenantIdAndClassLevelAndSectionOrderByCreatedAtDesc(
            Long tenantId, String classLevel, String section);
}
