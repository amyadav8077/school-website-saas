package com.schoolwebsite.backend.academics.service;

import java.util.List;

import com.schoolwebsite.backend.academics.entity.FacultyMember;

public interface FacultyMemberService
{
    List<FacultyMember> getFacultyByTenant(Long tenantId);

    FacultyMember createFaculty(Long tenantId, FacultyMember member);

    void deleteFaculty(Long id);
}
