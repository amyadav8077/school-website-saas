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
public class BoardResultService {

    private final BoardResultRepository repository;

    @Transactional(readOnly = true)
    public List<BoardResult> getBoardResultsByTenant(Long tenantId) {
        return repository.findByTenantIdOrderByAssessmentYearDesc(tenantId);
    }

    @Transactional
    public BoardResult createBoardResult(Long tenantId, BoardResult result) {
        result.setTenantId(tenantId);
        return repository.save(result);
    }

    @Transactional
    public void deleteBoardResult(Long id) {
        if (!repository.existsById(id)) {
            throw AppException.notFound("Board result not found with id: " + id);
        }
        repository.deleteById(id);
    }
}
