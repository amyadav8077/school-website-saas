package com.schoolwebsite.backend.bootstrap.dto;

import java.util.List;

import com.schoolwebsite.backend.academics.entity.AcademicCourse;
import com.schoolwebsite.backend.academics.entity.AcademicProgram;
import com.schoolwebsite.backend.academics.entity.FacultyMember;
import com.schoolwebsite.backend.academics.entity.StudentAchiever;
import com.schoolwebsite.backend.notifications.entity.SchoolEvent;
import com.schoolwebsite.backend.notifications.entity.SchoolNews;
import com.schoolwebsite.backend.pagebuilder.dto.PageResponse;
import com.schoolwebsite.backend.siteconfiguration.dto.SiteConfigResponse;
import com.schoolwebsite.backend.tenantsubscription.dto.TenantResponse;

import lombok.Builder;
import lombok.Getter;

/**
 * Everything the public website needs to paint its first screen, aggregated
 * into a single response so a visitor's browser makes just one round-trip.
 */
@Getter
@Builder
public class SiteBootstrapResponse
{
    private final TenantResponse tenant;

    private final SiteConfigResponse config;

    private final List<PageResponse> pages;

    private final List<AcademicCourse> courses;

    private final List<AcademicProgram> programs;

    private final List<FacultyMember> faculty;

    private final List<StudentAchiever> achievers;

    private final List<SchoolNews> news;

    private final List<SchoolEvent> events;
}
