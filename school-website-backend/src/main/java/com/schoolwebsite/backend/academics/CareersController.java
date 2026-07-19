package com.schoolwebsite.backend.academics;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class CareersController {

    private final JobPostingRepository jobRepository;
    private final JobApplicationRepository applicationRepository;

    // Public Endpoint: List active job postings
    @GetMapping("/sites/{tenantId}/jobs")
    public ResponseEntity<List<JobPosting>> getJobPostings(@PathVariable Long tenantId) {
        List<JobPosting> list = jobRepository.findByTenantId(tenantId);
        return ResponseEntity.ok(list);
    }

    // Public Endpoint: Submit Application
    @PostMapping("/sites/{tenantId}/jobs/{jobId}/apply")
    public ResponseEntity<JobApplication> submitApplication(
            @PathVariable Long tenantId,
            @PathVariable Long jobId,
            @Valid @RequestBody JobApplication application) {
        JobPosting job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job posting not found with id: " + jobId));

        application.setTenantId(tenantId);
        application.setJobId(jobId);
        application.setJobTitle(job.getTitle());
        application.setStatus("PENDING");

        JobApplication saved = applicationRepository.save(application);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    // Admin Endpoint: List candidate applications
    @GetMapping("/admin/sites/{tenantId}/applications")
    public ResponseEntity<List<JobApplication>> getApplications(@PathVariable Long tenantId) {
        List<JobApplication> list = applicationRepository.findByTenantIdOrderByCreatedAtDesc(tenantId);
        return ResponseEntity.ok(list);
    }

    // Admin Endpoint: Update candidate application status
    @PutMapping("/admin/applications/{id}/status")
    public ResponseEntity<JobApplication> updateApplicationStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        JobApplication app = applicationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Job application not found with id: " + id));

        app.setStatus(status);
        JobApplication saved = applicationRepository.save(app);
        return ResponseEntity.ok(saved);
    }

    // Admin Endpoint: Create job vacancy
    @PostMapping("/admin/sites/{tenantId}/jobs")
    public ResponseEntity<JobPosting> createJobPosting(
            @PathVariable Long tenantId,
            @Valid @RequestBody JobPosting job) {
        job.setTenantId(tenantId);
        JobPosting saved = jobRepository.save(job);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    // Admin Endpoint: Delete job vacancy
    @DeleteMapping("/admin/jobs/{id}")
    public ResponseEntity<Void> deleteJobPosting(@PathVariable Long id) {
        if (!jobRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        jobRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
