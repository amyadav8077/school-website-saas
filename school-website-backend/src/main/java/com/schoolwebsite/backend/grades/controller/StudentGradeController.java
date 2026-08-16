package com.schoolwebsite.backend.grades.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.schoolwebsite.backend.common.dto.ApiResponse;
import com.schoolwebsite.backend.grades.entity.*;
import com.schoolwebsite.backend.grades.service.*;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class StudentGradeController
{
    private final StudentGradeService service;

    @GetMapping("/sites/{tenantId}/grades")
    public ResponseEntity<ApiResponse<List<StudentGrade>>> getGrades(@PathVariable Long tenantId,
            @RequestParam(required = false) String studentName, @RequestParam(required = false) String classLevel,
            @RequestParam(required = false) String section)
    {
        return ResponseEntity.ok(ApiResponse.ok(service.getGrades(tenantId, studentName, classLevel, section)));
    }

    @GetMapping("/sites/{tenantId}/grades/paged")
    public ResponseEntity<ApiResponse<org.springframework.data.domain.Page<StudentGrade>>> getGradesPaged(
            @PathVariable Long tenantId, @RequestParam(required = false) String studentName,
            @RequestParam(required = false) String classLevel, @RequestParam(required = false) String section,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "25") int size)
    {
        return ResponseEntity
                .ok(ApiResponse.ok(service.getGradesPaged(tenantId, studentName, classLevel, section, page, size)));
    }

    @PostMapping("/admin/sites/{tenantId}/grades")
    public ResponseEntity<ApiResponse<StudentGrade>> addGrade(@PathVariable Long tenantId,
            @Valid @RequestBody StudentGrade grade)
    {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Grade record added successfully", service.addGrade(tenantId, grade)));
    }

    @DeleteMapping("/admin/grades/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteGrade(@PathVariable Long id)
    {
        service.deleteGrade(id);
        return ResponseEntity.ok(ApiResponse.ok("Grade record deleted successfully", null));
    }
}
