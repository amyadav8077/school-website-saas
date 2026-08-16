package com.schoolwebsite.backend.academics.service;

import java.util.List;

import com.schoolwebsite.backend.academics.entity.AcademicProgram;

public interface AcademicProgramService
{
    List<AcademicProgram> getProgramsByTenant(Long tenantId);

    AcademicProgram createProgram(Long tenantId, AcademicProgram program);

    void deleteProgram(Long id);
}
