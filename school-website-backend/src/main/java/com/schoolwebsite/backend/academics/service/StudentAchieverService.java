package com.schoolwebsite.backend.academics.service;

import java.util.List;

import com.schoolwebsite.backend.academics.entity.StudentAchiever;

public interface StudentAchieverService
{
    List<StudentAchiever> getAchieversByTenant(Long tenantId);

    StudentAchiever createAchiever(Long tenantId, StudentAchiever achiever);

    void deleteAchiever(Long id);
}
