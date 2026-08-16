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
public class AcademicProgramController
{
    private final AcademicProgramService service;

    @GetMapping("/sites/{tenantId}/programs")
    public ResponseEntity<ApiResponse<List<AcademicProgram>>> getPrograms(@PathVariable Long tenantId)
    {
        return ResponseEntity.ok(ApiResponse.ok(service.getProgramsByTenant(tenantId)));
    }

    @PostMapping("/admin/sites/{tenantId}/programs")
    public ResponseEntity<ApiResponse<AcademicProgram>> createProgram(@PathVariable Long tenantId,
            @Valid @RequestBody AcademicProgram program)
    {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Academic program created successfully",
                service.createProgram(tenantId, program)));
    }

    @DeleteMapping("/admin/programs/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProgram(@PathVariable Long id)
    {
        service.deleteProgram(id);
        return ResponseEntity.ok(ApiResponse.ok("Academic program deleted successfully", null));
    }
}
