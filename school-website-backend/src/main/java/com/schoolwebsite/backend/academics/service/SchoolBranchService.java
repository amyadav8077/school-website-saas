package com.schoolwebsite.backend.academics.service;

import java.util.List;

import com.schoolwebsite.backend.academics.entity.SchoolBranch;

public interface SchoolBranchService {
    List<SchoolBranch> getBranchesByTenant(Long tenantId);

    SchoolBranch createBranch(Long tenantId, SchoolBranch branch);

    void deleteBranch(Long id);
}
