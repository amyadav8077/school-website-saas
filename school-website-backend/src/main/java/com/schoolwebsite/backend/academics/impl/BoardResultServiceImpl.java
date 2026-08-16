package com.schoolwebsite.backend.academics.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.schoolwebsite.backend.academics.entity.BoardResult;
import com.schoolwebsite.backend.academics.repository.BoardResultRepository;
import com.schoolwebsite.backend.academics.service.BoardResultService;
import com.schoolwebsite.backend.auth.security.CurrentUser;
import com.schoolwebsite.backend.common.exception.AppException;
import com.schoolwebsite.backend.common.exception.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class BoardResultServiceImpl implements BoardResultService {
    private final BoardResultRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<BoardResult> getBoardResultsByTenant(Long tenantId) {
        log.debug("Fetching board results for tenantId={}", tenantId);
        return repository.findByTenantIdOrderByAssessmentYearDesc(tenantId);
    }

    @Override
    @Transactional
    public BoardResult createBoardResult(Long tenantId, BoardResult result) {
        log.info("Creating board result for tenantId={}, classLevel={}, year={}", tenantId, result.getClassLevel(),
                result.getAssessmentYear());
        CurrentUser.assertTenantAccess(tenantId);
        result.setId(null);
        result.setTenantId(tenantId);
        return repository.save(result);
    }

    @Override
    @Transactional
    public void deleteBoardResult(Long id) {
        log.info("Deleting board result id={}", id);
        var existing = repository.findById(id).orElseThrow(() -> AppException.of(ErrorCode.BOARD_RESULT_NOT_FOUND, id));
        CurrentUser.assertTenantAccess(existing.getTenantId());
        repository.deleteById(id);
    }
}
