package com.schoolwebsite.backend.academics.service;

import com.schoolwebsite.backend.academics.entity.*;
import com.schoolwebsite.backend.academics.repository.*;

import com.schoolwebsite.backend.common.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CareersService {

    private final JobPostingRepository jobRepository;
    private final JobApplicationRepository applicationRepository;

    @Transactional(readOnly = true)
    public List<JobPosting> getJobPostings(Long tenantId) {
        return jobRepository.findByTenantId(tenantId);
    }

    @Transactional
    public JobPosting createJobPosting(Long tenantId, JobPosting job) {
        job.setTenantId(tenantId);
        return jobRepository.save(job);
    }

    @Transactional
    public void deleteJobPosting(Long id) {
        if (!jobRepository.existsById(id)) {
            throw AppException.notFound("Job posting not found with id: " + id);
        }
        jobRepository.deleteById(id);
    }

    @Transactional
    public JobApplication submitApplication(Long tenantId, Long jobId, JobApplication application) {
        JobPosting job = jobRepository.findById(jobId)
                .orElseThrow(() -> AppException.notFound("Job posting not found with id: " + jobId));
        application.setTenantId(tenantId);
        application.setJobId(jobId);
        application.setJobTitle(job.getTitle());
        application.setStatus("PENDING");
        return applicationRepository.save(application);
    }

    @Transactional(readOnly = true)
    public List<JobApplication> getApplications(Long tenantId) {
        return applicationRepository.findByTenantIdOrderByCreatedAtDesc(tenantId);
    }

    @Transactional
    public JobApplication updateApplicationStatus(Long id, String status) {
        JobApplication app = applicationRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Job application not found with id: " + id));
        app.setStatus(status);
        return applicationRepository.save(app);
    }
}
