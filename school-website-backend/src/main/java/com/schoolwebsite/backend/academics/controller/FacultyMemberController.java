package com.schoolwebsite.backend.academics.controller;

import com.schoolwebsite.backend.academics.entity.*;
import com.schoolwebsite.backend.academics.service.*;

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
public class FacultyMemberController {

    private final FacultyMemberService service;

    @GetMapping("/sites/{tenantId}/faculty")
    public ResponseEntity<ApiResponse<List<FacultyMember>>> getFaculty(@PathVariable Long tenantId) {
        return ResponseEntity.ok(ApiResponse.ok(service.getFacultyByTenant(tenantId)));
    }

    @PostMapping("/admin/sites/{tenantId}/faculty")
    public ResponseEntity<ApiResponse<FacultyMember>> createFaculty(
            @PathVariable Long tenantId,
            @Valid @RequestBody FacultyMember member) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Faculty member created successfully", service.createFaculty(tenantId, member)));
    }

    @DeleteMapping("/admin/faculty/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFaculty(@PathVariable Long id) {
        service.deleteFaculty(id);
        return ResponseEntity.ok(ApiResponse.ok("Faculty member deleted successfully", null));
    }
}
