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
public class BoardResultController
{
    private final BoardResultService service;

    @GetMapping("/sites/{tenantId}/board-results")
    public ResponseEntity<ApiResponse<List<BoardResult>>> getBoardResults(@PathVariable Long tenantId)
    {
        return ResponseEntity.ok(ApiResponse.ok(service.getBoardResultsByTenant(tenantId)));
    }

    @PostMapping("/admin/sites/{tenantId}/board-results")
    public ResponseEntity<ApiResponse<BoardResult>> createBoardResult(@PathVariable Long tenantId,
            @Valid @RequestBody BoardResult result)
    {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Board result created successfully", service.createBoardResult(tenantId, result)));
    }

    @DeleteMapping("/admin/board-results/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBoardResult(@PathVariable Long id)
    {
        service.deleteBoardResult(id);
        return ResponseEntity.ok(ApiResponse.ok("Board result deleted successfully", null));
    }
}
