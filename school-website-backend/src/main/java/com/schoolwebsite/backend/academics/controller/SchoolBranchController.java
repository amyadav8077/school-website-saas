package com.schoolwebsite.backend.academics.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.schoolwebsite.backend.academics.entity.*;
import com.schoolwebsite.backend.academics.service.*;
import com.schoolwebsite.backend.common.dto.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SchoolBranchController {
    private final SchoolBranchService service;

    @GetMapping("/sites/{tenantId}/branches")
    public ResponseEntity<ApiResponse<List<SchoolBranch>>> getBranches(@PathVariable Long tenantId) {
        return ResponseEntity.ok(ApiResponse.ok(service.getBranchesByTenant(tenantId)));
    }

    @PostMapping("/admin/sites/{tenantId}/branches")
    public ResponseEntity<ApiResponse<SchoolBranch>> createBranch(@PathVariable Long tenantId,
            @Valid @RequestBody SchoolBranch branch) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Branch created successfully", service.createBranch(tenantId, branch)));
    }

    @DeleteMapping("/admin/branches/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBranch(@PathVariable Long id) {
        service.deleteBranch(id);
        return ResponseEntity.ok(ApiResponse.ok("Branch deleted successfully", null));
    }
}
