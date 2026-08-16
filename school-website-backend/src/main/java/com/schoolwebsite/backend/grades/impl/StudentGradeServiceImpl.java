package com.schoolwebsite.backend.grades.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.schoolwebsite.backend.auth.security.CurrentUser;
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
    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<StudentGrade> getGradesPaged(Long tenantId, String studentName,
            String classLevel, String section, int page, int size) {
        int safeSize = size <= 0 || size > 100 ? 25 : size;
        int safePage = Math.max(page, 0);
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(safePage,
                safeSize);

        if (StringUtils.hasText(studentName)) {
            return repository.findByTenantIdAndStudentNameContainingIgnoreCaseOrderByCreatedAtDesc(tenantId,
                    studentName.trim(), pageable);
        }
        if (StringUtils.hasText(classLevel) && StringUtils.hasText(section)) {
            return repository.findByTenantIdAndClassLevelAndSectionOrderByCreatedAtDesc(tenantId, classLevel.trim(),
                    section.trim(), pageable);
        }
        return repository.findByTenantIdOrderByCreatedAtDesc(tenantId, pageable);
    }

    @Override
    @Transactional
    public StudentGrade addGrade(Long tenantId, StudentGrade grade) {
        log.info("Adding student grade for tenantId={}", tenantId);
        grade.setId(null);
        grade.setTenantId(tenantId);
        return repository.save(grade);
    }

    @Override
    @Transactional
    public void deleteGrade(Long id) {
        log.info("Deleting student grade id={}", id);
        var existing = repository.findById(id)
                .orElseThrow(() -> AppException.of(ErrorCode.STUDENT_GRADE_NOT_FOUND, id));
        CurrentUser.assertTenantAccess(existing.getTenantId());
        repository.deleteById(id);
    }
}
