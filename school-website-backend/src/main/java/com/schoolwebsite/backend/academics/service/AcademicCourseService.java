package com.schoolwebsite.backend.academics.service;

import com.schoolwebsite.backend.academics.entity.*;
import com.schoolwebsite.backend.academics.repository.*;

import com.schoolwebsite.backend.common.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AcademicCourseService {

    private final AcademicCourseRepository repository;

    @Transactional(readOnly = true)
    public List<AcademicCourse> getCoursesByTenant(Long tenantId) {
        return repository.findByTenantId(tenantId);
    }

    @Transactional
    public AcademicCourse createCourse(Long tenantId, AcademicCourse course) {
        course.setTenantId(tenantId);
        return repository.save(course);
    }

    @Transactional
    public void deleteCourse(Long id) {
        if (!repository.existsById(id)) {
            throw AppException.notFound("Academic course not found with id: " + id);
        }
        repository.deleteById(id);
    }
}
