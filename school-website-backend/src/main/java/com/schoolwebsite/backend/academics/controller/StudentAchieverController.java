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
public class StudentAchieverController {

    private final StudentAchieverService service;

    @GetMapping("/sites/{tenantId}/achievers")
    public ResponseEntity<ApiResponse<List<StudentAchiever>>> getAchievers(@PathVariable Long tenantId) {
        return ResponseEntity.ok(ApiResponse.ok(service.getAchieversByTenant(tenantId)));
    }

    @PostMapping("/admin/sites/{tenantId}/achievers")
    public ResponseEntity<ApiResponse<StudentAchiever>> createAchiever(
            @PathVariable Long tenantId,
            @Valid @RequestBody StudentAchiever achiever) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Student achiever created successfully", service.createAchiever(tenantId, achiever)));
    }

    @DeleteMapping("/admin/achievers/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAchiever(@PathVariable Long id) {
        service.deleteAchiever(id);
        return ResponseEntity.ok(ApiResponse.ok("Student achiever deleted successfully", null));
    }
}
