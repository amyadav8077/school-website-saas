package com.schoolwebsite.backend.academics.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.schoolwebsite.backend.academics.entity.AcademicCourse;
import com.schoolwebsite.backend.academics.repository.AcademicCourseRepository;
import com.schoolwebsite.backend.academics.service.AcademicCourseService;
import com.schoolwebsite.backend.auth.security.CurrentUser;
import com.schoolwebsite.backend.common.exception.AppException;
import com.schoolwebsite.backend.common.exception.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AcademicCourseServiceImpl implements AcademicCourseService {
    private final AcademicCourseRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<AcademicCourse> getCoursesByTenant(Long tenantId) {
        log.debug("Fetching academic courses for tenantId={}", tenantId);
        return repository.findByTenantId(tenantId);
    }

    @Override
    @Transactional
    public AcademicCourse createCourse(Long tenantId, AcademicCourse course) {
        log.info("Creating academic course for tenantId={}, name={}", tenantId, course.getName());
        CurrentUser.assertTenantAccess(tenantId);
        course.setId(null);
        course.setTenantId(tenantId);
        return repository.save(course);
    }

    @Override
    @Transactional
    public void deleteCourse(Long id) {
        log.info("Deleting academic course id={}", id);
        var existing = repository.findById(id)
                .orElseThrow(() -> AppException.of(ErrorCode.ACADEMIC_COURSE_NOT_FOUND, id));
        CurrentUser.assertTenantAccess(existing.getTenantId());
        repository.deleteById(id);
    }
}
