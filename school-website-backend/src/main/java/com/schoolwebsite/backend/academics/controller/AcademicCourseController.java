package com.schoolwebsite.backend.academics.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.schoolwebsite.backend.academics.entity.*;
import com.schoolwebsite.backend.academics.service.*;
import com.schoolwebsite.backend.common.dto.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AcademicCourseController {
    private final AcademicCourseService service;

    @GetMapping("/sites/{tenantId}/courses")
    public ResponseEntity<ApiResponse<List<AcademicCourse>>> getCourses(@PathVariable Long tenantId) {
        return ResponseEntity.ok(ApiResponse.ok(service.getCoursesByTenant(tenantId)));
    }

    @PreAuthorize("@tenantSecurity.canManage(#tenantId)")
    @PostMapping("/admin/sites/{tenantId}/courses")
    public ResponseEntity<ApiResponse<AcademicCourse>> createCourse(@PathVariable Long tenantId,
            @Valid @RequestBody AcademicCourse course) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Course created successfully", service.createCourse(tenantId, course)));
    }

    @DeleteMapping("/admin/courses/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCourse(@PathVariable Long id) {
        service.deleteCourse(id);
        return ResponseEntity.ok(ApiResponse.ok("Course deleted successfully", null));
    }
}
