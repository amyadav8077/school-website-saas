package com.schoolwebsite.backend.academics.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.schoolwebsite.backend.academics.dto.TCDownloadRequest;
import com.schoolwebsite.backend.academics.entity.*;
import com.schoolwebsite.backend.academics.service.*;
import com.schoolwebsite.backend.auth.security.CurrentUser;
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

    @PostMapping("/sites/{tenantId}/tc/verify-download")
    public ResponseEntity<ApiResponse<TransferCertificate>> verifyForDownload(@PathVariable Long tenantId,
            @RequestBody TCDownloadRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(service.verifyForDownload(tenantId, req.getAdmissionNo(),
                req.getFatherName(), req.getDateOfBirth(), req.getAadharNo())));
    }

    @GetMapping("/admin/sites/{tenantId}/tc")
    public ResponseEntity<ApiResponse<List<TransferCertificate>>> getIssuedTCs(@PathVariable Long tenantId) {
        CurrentUser.assertTenantAccess(tenantId);
        return ResponseEntity.ok(ApiResponse.ok(service.getIssuedTCs(tenantId)));
    }

    @PostMapping("/admin/sites/{tenantId}/tc")
    public ResponseEntity<ApiResponse<TransferCertificate>> issueTC(@PathVariable Long tenantId,
            @Valid @RequestBody TransferCertificate tc) {
        CurrentUser.assertTenantAccess(tenantId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Transfer certificate issued successfully", service.issueTC(tenantId, tc)));
    }

    @DeleteMapping("/admin/tc/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTC(@PathVariable Long id) {
        service.deleteTC(id);
        return ResponseEntity.ok(ApiResponse.ok("Transfer certificate deleted successfully", null));
    }
}
