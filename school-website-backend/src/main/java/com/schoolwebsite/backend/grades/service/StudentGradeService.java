package com.schoolwebsite.backend.grades.service;

import java.util.List;

import org.springframework.data.domain.Page;

import com.schoolwebsite.backend.grades.entity.StudentGrade;

public interface StudentGradeService
{
    List<StudentGrade> getGrades(Long tenantId, String studentName, String classLevel, String section);

    Page<StudentGrade> getGradesPaged(Long tenantId, String studentName, String classLevel, String section, int page,
            int size);

    StudentGrade addGrade(Long tenantId, StudentGrade grade);

    void deleteGrade(Long id);
}
