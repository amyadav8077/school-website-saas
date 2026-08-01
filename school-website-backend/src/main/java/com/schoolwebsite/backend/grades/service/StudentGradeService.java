package com.schoolwebsite.backend.grades.service;

import com.schoolwebsite.backend.grades.entity.*;
import com.schoolwebsite.backend.grades.repository.*;

import com.schoolwebsite.backend.common.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentGradeService {

    private final StudentGradeRepository repository;

    @Transactional(readOnly = true)
    public List<StudentGrade> getGrades(Long tenantId, String studentName, String classLevel, String section) {
        if (studentName != null && !studentName.trim().isEmpty()) {
            return repository.findByTenantIdAndStudentNameContainingIgnoreCaseOrderByCreatedAtDesc(
                    tenantId, studentName.trim());
        }
        if (classLevel != null && !classLevel.trim().isEmpty()
                && section != null && !section.trim().isEmpty()) {
            return repository.findByTenantIdAndClassLevelAndSectionOrderByCreatedAtDesc(
                    tenantId, classLevel.trim(), section.trim());
        }
        return repository.findByTenantIdOrderByCreatedAtDesc(tenantId);
    }

    @Transactional
    public StudentGrade addGrade(Long tenantId, StudentGrade grade) {
        grade.setTenantId(tenantId);
        return repository.save(grade);
    }

    @Transactional
    public void deleteGrade(Long id) {
        if (!repository.existsById(id)) {
            throw AppException.notFound("Student grade not found with id: " + id);
        }
        repository.deleteById(id);
    }
}
