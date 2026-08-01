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
public class AcademicProgramService {

    private final AcademicProgramRepository repository;

    @Transactional(readOnly = true)
    public List<AcademicProgram> getProgramsByTenant(Long tenantId) {
        return repository.findByTenantId(tenantId);
    }

    @Transactional
    public AcademicProgram createProgram(Long tenantId, AcademicProgram program) {
        program.setTenantId(tenantId);
        return repository.save(program);
    }

    @Transactional
    public void deleteProgram(Long id) {
        if (!repository.existsById(id)) {
            throw AppException.notFound("Academic program not found with id: " + id);
        }
        repository.deleteById(id);
    }
}
