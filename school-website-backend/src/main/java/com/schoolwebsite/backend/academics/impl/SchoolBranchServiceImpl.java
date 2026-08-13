package com.schoolwebsite.backend.academics.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.schoolwebsite.backend.academics.entity.SchoolBranch;
import com.schoolwebsite.backend.academics.repository.SchoolBranchRepository;
import com.schoolwebsite.backend.academics.service.SchoolBranchService;
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
        branch.setTenantId(tenantId);
        return repository.save(branch);
    }

    @Override
    @Transactional
    public void deleteBranch(Long id) {
        log.info("Deleting school branch id={}", id);
        if (!repository.existsById(id)) {
            throw AppException.of(ErrorCode.SCHOOL_BRANCH_NOT_FOUND, id);
        }
        repository.deleteById(id);
    }
}
