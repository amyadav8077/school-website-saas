package com.schoolwebsite.backend.academics.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.schoolwebsite.backend.academics.entity.FacultyMember;
import com.schoolwebsite.backend.academics.repository.FacultyMemberRepository;
import com.schoolwebsite.backend.academics.service.FacultyMemberService;
import com.schoolwebsite.backend.common.exception.AppException;
import com.schoolwebsite.backend.common.exception.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class FacultyMemberServiceImpl implements FacultyMemberService
{
    private final FacultyMemberRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<FacultyMember> getFacultyByTenant(Long tenantId)
    {
        log.debug("Fetching faculty members for tenantId={}", tenantId);
        return repository.findByTenantId(tenantId);
    }

    @Override
    @Transactional
    public FacultyMember createFaculty(Long tenantId, FacultyMember member)
    {
        log.info("Creating faculty member for tenantId={}, name={}", tenantId, member.getName());
        member.setTenantId(tenantId);
        return repository.save(member);
    }

    @Override
    @Transactional
    public void deleteFaculty(Long id)
    {
        log.info("Deleting faculty member id={}", id);
        if (!repository.existsById(id))
        {
            throw AppException.of(ErrorCode.FACULTY_MEMBER_NOT_FOUND, id);
        }
        repository.deleteById(id);
    }
}
