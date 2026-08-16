package com.schoolwebsite.backend.academics.service;

import java.util.List;

import com.schoolwebsite.backend.academics.entity.JobApplication;
import com.schoolwebsite.backend.academics.entity.JobPosting;

public interface CareersService {
    List<JobPosting> getJobPostings(Long tenantId);

    JobPosting createJobPosting(Long tenantId, JobPosting job);

    void deleteJobPosting(Long id);

    JobApplication submitApplication(Long tenantId, Long jobId, JobApplication application);

    List<JobApplication> getApplications(Long tenantId);

    JobApplication updateApplicationStatus(Long id, String status);
}
