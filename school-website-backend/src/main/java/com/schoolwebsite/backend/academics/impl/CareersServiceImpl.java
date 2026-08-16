package com.schoolwebsite.backend.academics.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.schoolwebsite.backend.academics.entity.JobApplication;
import com.schoolwebsite.backend.academics.entity.JobPosting;
import com.schoolwebsite.backend.academics.repository.JobApplicationRepository;
import com.schoolwebsite.backend.academics.repository.JobPostingRepository;
import com.schoolwebsite.backend.academics.service.CareersService;
import com.schoolwebsite.backend.common.constant.AppConstants;
import com.schoolwebsite.backend.common.exception.AppException;
import com.schoolwebsite.backend.common.exception.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class CareersServiceImpl implements CareersService
{
    private final JobPostingRepository jobRepository;

    private final JobApplicationRepository applicationRepository;

    @Override
    @Transactional(readOnly = true)
    public List<JobPosting> getJobPostings(Long tenantId)
    {
        log.debug("Fetching job postings for tenantId={}", tenantId);
        return jobRepository.findByTenantId(tenantId);
    }

    @Override
    @Transactional
    public JobPosting createJobPosting(Long tenantId, JobPosting job)
    {
        log.info("Creating job posting for tenantId={}, title={}", tenantId, job.getTitle());
        job.setTenantId(tenantId);
        return jobRepository.save(job);
    }

    @Override
    @Transactional
    public void deleteJobPosting(Long id)
    {
        log.info("Deleting job posting id={}", id);
        if (!jobRepository.existsById(id))
        {
            throw AppException.of(ErrorCode.JOB_POSTING_NOT_FOUND, id);
        }
        jobRepository.deleteById(id);
    }

    @Override
    @Transactional
    public JobApplication submitApplication(Long tenantId, Long jobId, JobApplication application)
    {
        log.info("Submitting job application for tenantId={}, jobId={}, candidate={}", tenantId, jobId,
                application.getCandidateName());
        JobPosting job = jobRepository.findById(jobId)
                .orElseThrow(() -> AppException.of(ErrorCode.JOB_POSTING_NOT_FOUND, jobId));
        application.setTenantId(tenantId);
        application.setJobId(jobId);
        application.setJobTitle(job.getTitle());
        application.setStatus(AppConstants.STATUS_PENDING);
        return applicationRepository.save(application);
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobApplication> getApplications(Long tenantId)
    {
        log.debug("Fetching job applications for tenantId={}", tenantId);
        return applicationRepository.findByTenantIdOrderByCreatedAtDesc(tenantId);
    }

    @Override
    @Transactional
    public JobApplication updateApplicationStatus(Long id, String status)
    {
        log.info("Updating job application id={} to status={}", id, status);
        JobApplication app = applicationRepository.findById(id)
                .orElseThrow(() -> AppException.of(ErrorCode.JOB_APPLICATION_NOT_FOUND, id));
        app.setStatus(status);
        return applicationRepository.save(app);
    }
}
