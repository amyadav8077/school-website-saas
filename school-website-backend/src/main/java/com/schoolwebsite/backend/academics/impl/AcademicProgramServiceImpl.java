package com.schoolwebsite.backend.academics.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.schoolwebsite.backend.academics.entity.AcademicProgram;
import com.schoolwebsite.backend.academics.repository.AcademicProgramRepository;
import com.schoolwebsite.backend.academics.service.AcademicProgramService;
import com.schoolwebsite.backend.auth.security.CurrentUser;
import com.schoolwebsite.backend.common.exception.AppException;
import com.schoolwebsite.backend.common.exception.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AcademicProgramServiceImpl implements AcademicProgramService {
    private final AcademicProgramRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<AcademicProgram> getProgramsByTenant(Long tenantId) {
        log.debug("Fetching academic programs for tenantId={}", tenantId);
        return repository.findByTenantId(tenantId);
    }

    @Override
    @Transactional
    public AcademicProgram createProgram(Long tenantId, AcademicProgram program) {
        log.info("Creating academic program for tenantId={}, name={}", tenantId, program.getName());
        CurrentUser.assertTenantAccess(tenantId);
        program.setId(null);
        program.setTenantId(tenantId);
        return repository.save(program);
    }

    @Override
    @Transactional
    public void deleteProgram(Long id) {
        log.info("Deleting academic program id={}", id);
        var existing = repository.findById(id)
                .orElseThrow(() -> AppException.of(ErrorCode.ACADEMIC_PROGRAM_NOT_FOUND, id));
        CurrentUser.assertTenantAccess(existing.getTenantId());
        repository.deleteById(id);
    }
}
