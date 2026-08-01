package com.schoolwebsite.backend.grades.controller;

import com.schoolwebsite.backend.grades.entity.*;
import com.schoolwebsite.backend.grades.service.*;

import com.schoolwebsite.backend.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class StudentGradeController {

    private final StudentGradeService service;

    @GetMapping("/sites/{tenantId}/grades")
    public ResponseEntity<ApiResponse<List<StudentGrade>>> getGrades(
            @PathVariable Long tenantId,
            @RequestParam(required = false) String studentName,
            @RequestParam(required = false) String classLevel,
            @RequestParam(required = false) String section) {
        return ResponseEntity.ok(ApiResponse.ok(service.getGrades(tenantId, studentName, classLevel, section)));
    }

    @PostMapping("/admin/sites/{tenantId}/grades")
    public ResponseEntity<ApiResponse<StudentGrade>> addGrade(
            @PathVariable Long tenantId,
            @Valid @RequestBody StudentGrade grade) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Grade record added successfully", service.addGrade(tenantId, grade)));
    }

    @DeleteMapping("/admin/grades/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteGrade(@PathVariable Long id) {
        service.deleteGrade(id);
        return ResponseEntity.ok(ApiResponse.ok("Grade record deleted successfully", null));
    }
}
