package com.schoolwebsite.backend.grades.service;

import java.util.List;

import com.schoolwebsite.backend.grades.entity.StudentGrade;

public interface StudentGradeService {

    List<StudentGrade> getGrades(Long tenantId, String studentName, String classLevel, String section);

    StudentGrade addGrade(Long tenantId, StudentGrade grade);

    void deleteGrade(Long id);
}
