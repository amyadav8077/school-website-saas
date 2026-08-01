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
public class StudentAchieverService {

    private final StudentAchieverRepository repository;

    @Transactional(readOnly = true)
    public List<StudentAchiever> getAchieversByTenant(Long tenantId) {
        return repository.findByTenantId(tenantId);
    }

    @Transactional
    public StudentAchiever createAchiever(Long tenantId, StudentAchiever achiever) {
        achiever.setTenantId(tenantId);
        return repository.save(achiever);
    }

    @Transactional
    public void deleteAchiever(Long id) {
        if (!repository.existsById(id)) {
            throw AppException.notFound("Student achiever not found with id: " + id);
        }
        repository.deleteById(id);
    }
}
