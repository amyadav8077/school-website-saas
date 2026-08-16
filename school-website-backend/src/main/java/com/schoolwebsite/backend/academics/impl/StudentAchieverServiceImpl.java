package com.schoolwebsite.backend.academics.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.schoolwebsite.backend.academics.entity.StudentAchiever;
import com.schoolwebsite.backend.academics.repository.StudentAchieverRepository;
import com.schoolwebsite.backend.academics.service.StudentAchieverService;
import com.schoolwebsite.backend.auth.security.CurrentUser;
import com.schoolwebsite.backend.common.exception.AppException;
import com.schoolwebsite.backend.common.exception.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class StudentAchieverServiceImpl implements StudentAchieverService {
    private final StudentAchieverRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<StudentAchiever> getAchieversByTenant(Long tenantId) {
        log.debug("Fetching student achievers for tenantId={}", tenantId);
        return repository.findByTenantId(tenantId);
    }

    @Override
    @Transactional
    public StudentAchiever createAchiever(Long tenantId, StudentAchiever achiever) {
        log.info("Creating student achiever for tenantId={}, name={}", tenantId, achiever.getName());
        CurrentUser.assertTenantAccess(tenantId);
        achiever.setId(null);
        achiever.setTenantId(tenantId);
        return repository.save(achiever);
    }

    @Override
    @Transactional
    public void deleteAchiever(Long id) {
        log.info("Deleting student achiever id={}", id);
        var existing = repository.findById(id)
                .orElseThrow(() -> AppException.of(ErrorCode.STUDENT_ACHIEVER_NOT_FOUND, id));
        CurrentUser.assertTenantAccess(existing.getTenantId());
        repository.deleteById(id);
    }
}
