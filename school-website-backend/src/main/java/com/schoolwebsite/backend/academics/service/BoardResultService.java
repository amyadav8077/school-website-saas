package com.schoolwebsite.backend.academics.service;

import java.util.List;

import com.schoolwebsite.backend.academics.entity.BoardResult;

public interface BoardResultService
{
    List<BoardResult> getBoardResultsByTenant(Long tenantId);

    BoardResult createBoardResult(Long tenantId, BoardResult result);

    void deleteBoardResult(Long id);
}
