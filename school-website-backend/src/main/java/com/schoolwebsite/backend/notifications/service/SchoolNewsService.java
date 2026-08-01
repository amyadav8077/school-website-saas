package com.schoolwebsite.backend.notifications.service;

import com.schoolwebsite.backend.notifications.entity.*;
import com.schoolwebsite.backend.notifications.repository.*;

import com.schoolwebsite.backend.common.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SchoolNewsService {

    private final SchoolNewsRepository repository;

    @Transactional(readOnly = true)
    public List<SchoolNews> getNewsByTenant(Long tenantId) {
        return repository.findByTenantIdOrderByPublishedDateDesc(tenantId);
    }

    @Transactional
    public SchoolNews createNews(Long tenantId, SchoolNews news) {
        news.setTenantId(tenantId);
        news.setPublishedDate(LocalDateTime.now());
        return repository.save(news);
    }

    @Transactional
    public void deleteNews(Long id) {
        if (!repository.existsById(id)) {
            throw AppException.notFound("School news not found with id: " + id);
        }
        repository.deleteById(id);
    }
}
