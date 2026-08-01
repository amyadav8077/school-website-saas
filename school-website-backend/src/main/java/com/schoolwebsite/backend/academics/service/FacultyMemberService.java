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
public class FacultyMemberService {

    private final FacultyMemberRepository repository;

    @Transactional(readOnly = true)
    public List<FacultyMember> getFacultyByTenant(Long tenantId) {
        return repository.findByTenantId(tenantId);
    }

    @Transactional
    public FacultyMember createFaculty(Long tenantId, FacultyMember member) {
        member.setTenantId(tenantId);
        return repository.save(member);
    }

    @Transactional
    public void deleteFaculty(Long id) {
        if (!repository.existsById(id)) {
            throw AppException.notFound("Faculty member not found with id: " + id);
        }
        repository.deleteById(id);
    }
}
