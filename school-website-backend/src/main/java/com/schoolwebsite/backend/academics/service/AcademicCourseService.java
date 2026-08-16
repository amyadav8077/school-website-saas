package com.schoolwebsite.backend.academics.service;

import java.util.List;

import com.schoolwebsite.backend.academics.entity.AcademicCourse;

public interface AcademicCourseService {
    List<AcademicCourse> getCoursesByTenant(Long tenantId);

    AcademicCourse createCourse(Long tenantId, AcademicCourse course);

    void deleteCourse(Long id);
}
