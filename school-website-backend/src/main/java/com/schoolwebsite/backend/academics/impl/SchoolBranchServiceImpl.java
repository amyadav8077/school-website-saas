package com.schoolwebsite.backend.academics.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.schoolwebsite.backend.academics.entity.SchoolBranch;
import com.schoolwebsite.backend.academics.repository.SchoolBranchRepository;
import com.schoolwebsite.backend.academics.service.SchoolBranchService;
import com.schoolwebsite.backend.auth.security.CurrentUser;
import com.schoolwebsite.backend.common.exception.AppException;
import com.schoolwebsite.backend.common.exception.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class SchoolBranchServiceImpl implements SchoolBranchService {
    private final SchoolBranchRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<SchoolBranch> getBranchesByTenant(Long tenantId) {
        log.debug("Fetching school branches for tenantId={}", tenantId);
        return repository.findByTenantId(tenantId);
    }

    @Override
    @Transactional
    public SchoolBranch createBranch(Long tenantId, SchoolBranch branch) {
        log.info("Creating school branch for tenantId={}, name={}", tenantId, branch.getName());
        CurrentUser.assertTenantAccess(tenantId);
        branch.setId(null);
        branch.setTenantId(tenantId);
        return repository.save(branch);
    }

    @Override
    @Transactional
    public void deleteBranch(Long id) {
        log.info("Deleting school branch id={}", id);
        var existing = repository.findById(id)
                .orElseThrow(() -> AppException.of(ErrorCode.SCHOOL_BRANCH_NOT_FOUND, id));
        CurrentUser.assertTenantAccess(existing.getTenantId());
        repository.deleteById(id);
    }
}
