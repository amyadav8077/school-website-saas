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
public class CareersController {
    private final CareersService service;

    @GetMapping("/sites/{tenantId}/jobs")
    public ResponseEntity<ApiResponse<List<JobPosting>>> getJobPostings(@PathVariable Long tenantId) {
        return ResponseEntity.ok(ApiResponse.ok(service.getJobPostings(tenantId)));
    }

    @PostMapping("/sites/{tenantId}/jobs/{jobId}/apply")
    public ResponseEntity<ApiResponse<JobApplication>> submitApplication(@PathVariable Long tenantId,
            @PathVariable Long jobId, @Valid @RequestBody JobApplication application) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Application submitted successfully",
                service.submitApplication(tenantId, jobId, application)));
    }

    @GetMapping("/admin/sites/{tenantId}/applications")
    public ResponseEntity<ApiResponse<List<JobApplication>>> getApplications(@PathVariable Long tenantId) {
        return ResponseEntity.ok(ApiResponse.ok(service.getApplications(tenantId)));
    }

    @PutMapping("/admin/applications/{id}/status")
    public ResponseEntity<ApiResponse<JobApplication>> updateApplicationStatus(@PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(ApiResponse.ok("Status updated", service.updateApplicationStatus(id, status)));
    }

    @PostMapping("/admin/sites/{tenantId}/jobs")
    public ResponseEntity<ApiResponse<JobPosting>> createJobPosting(@PathVariable Long tenantId,
            @Valid @RequestBody JobPosting job) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Job posting created successfully", service.createJobPosting(tenantId, job)));
    }

    @DeleteMapping("/admin/jobs/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteJobPosting(@PathVariable Long id) {
        service.deleteJobPosting(id);
        return ResponseEntity.ok(ApiResponse.ok("Job posting deleted successfully", null));
    }
}
