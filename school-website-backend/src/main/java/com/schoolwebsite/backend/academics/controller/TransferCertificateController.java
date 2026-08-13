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
public class TransferCertificateController {
    private final TransferCertificateService service;

    @GetMapping("/sites/{tenantId}/tc")
    public ResponseEntity<ApiResponse<List<TransferCertificate>>> verifyAndDownloadTC(@PathVariable Long tenantId,
            @RequestParam(required = false) String classLevel, @RequestParam(required = false) String section,
            @RequestParam(required = false) String studentName, @RequestParam(required = false) String admissionNo,
            @RequestParam(required = false) String fatherName, @RequestParam(required = false) String aadharNo) {
        return ResponseEntity.ok(ApiResponse
                .ok(service.searchTCs(tenantId, studentName, classLevel, section, admissionNo, fatherName, aadharNo)));
    }

    @GetMapping("/admin/sites/{tenantId}/tc")
    public ResponseEntity<ApiResponse<List<TransferCertificate>>> getIssuedTCs(@PathVariable Long tenantId) {
        return ResponseEntity.ok(ApiResponse.ok(service.searchTCs(tenantId, null, null, null, null, null, null)));
    }

    @PostMapping("/admin/sites/{tenantId}/tc")
    public ResponseEntity<ApiResponse<TransferCertificate>> issueTC(@PathVariable Long tenantId,
            @Valid @RequestBody TransferCertificate tc) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Transfer certificate issued successfully", service.issueTC(tenantId, tc)));
    }

    @DeleteMapping("/admin/tc/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTC(@PathVariable Long id) {
        service.deleteTC(id);
        return ResponseEntity.ok(ApiResponse.ok("Transfer certificate deleted successfully", null));
    }
}
