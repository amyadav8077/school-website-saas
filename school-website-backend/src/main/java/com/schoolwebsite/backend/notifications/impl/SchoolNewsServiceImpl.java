package com.schoolwebsite.backend.notifications.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.schoolwebsite.backend.auth.security.CurrentUser;
import com.schoolwebsite.backend.common.exception.AppException;
import com.schoolwebsite.backend.common.exception.ErrorCode;
import com.schoolwebsite.backend.notifications.entity.SchoolNews;
import com.schoolwebsite.backend.notifications.repository.SchoolNewsRepository;
import com.schoolwebsite.backend.notifications.service.SchoolNewsService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class SchoolNewsServiceImpl implements SchoolNewsService {
    private final SchoolNewsRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<SchoolNews> getNewsByTenant(Long tenantId) {
        log.debug("Fetching school news for tenantId={}", tenantId);
        return repository.findByTenantIdOrderByPublishedDateDesc(tenantId);
    }

    @Override
    @Transactional
    public SchoolNews createNews(Long tenantId, SchoolNews news) {
        log.info("Creating school news for tenantId={}, title={}", tenantId, news.getTitle());
        CurrentUser.assertTenantAccess(tenantId);
        news.setId(null);
        news.setTenantId(tenantId);
        news.setPublishedDate(LocalDateTime.now());
        return repository.save(news);
    }

    @Override
    @Transactional
    public void deleteNews(Long id) {
        log.info("Deleting school news id={}", id);
        var existing = repository.findById(id).orElseThrow(() -> AppException.of(ErrorCode.SCHOOL_NEWS_NOT_FOUND, id));
        CurrentUser.assertTenantAccess(existing.getTenantId());
        repository.deleteById(id);
    }
}
