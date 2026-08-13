package com.schoolwebsite.backend.grades.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.schoolwebsite.backend.common.exception.AppException;
import com.schoolwebsite.backend.common.exception.ErrorCode;
import com.schoolwebsite.backend.common.util.StringUtils;
import com.schoolwebsite.backend.grades.entity.StudentGrade;
import com.schoolwebsite.backend.grades.repository.StudentGradeRepository;
import com.schoolwebsite.backend.grades.service.StudentGradeService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class StudentGradeServiceImpl implements StudentGradeService {

    private final StudentGradeRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<StudentGrade> getGrades(Long tenantId, String studentName, String classLevel, String section) {
        log.debug("Fetching student grades for tenantId={}", tenantId);
        if (StringUtils.hasText(studentName)) {
            return repository.findByTenantIdAndStudentNameContainingIgnoreCaseOrderByCreatedAtDesc(tenantId,
                    studentName.trim());
        }
        if (StringUtils.hasText(classLevel) && StringUtils.hasText(section)) {
            return repository.findByTenantIdAndClassLevelAndSectionOrderByCreatedAtDesc(tenantId, classLevel.trim(),
                    section.trim());
        }
        return repository.findByTenantIdOrderByCreatedAtDesc(tenantId);
    }

    @Override
    @Transactional
    public StudentGrade addGrade(Long tenantId, StudentGrade grade) {
        log.info("Adding student grade for tenantId={}, student={}, subject={}", tenantId, grade.getStudentName(),
                grade.getSubjectName());
        grade.setTenantId(tenantId);
        return repository.save(grade);
    }

    @Override
    @Transactional
    public void deleteGrade(Long id) {
        log.info("Deleting student grade id={}", id);
        if (!repository.existsById(id)) {
            throw AppException.of(ErrorCode.STUDENT_GRADE_NOT_FOUND, id);
        }
        repository.deleteById(id);
    }
}
