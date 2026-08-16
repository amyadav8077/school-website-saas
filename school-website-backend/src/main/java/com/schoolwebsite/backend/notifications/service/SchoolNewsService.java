package com.schoolwebsite.backend.notifications.service;

import java.util.List;

import com.schoolwebsite.backend.notifications.entity.SchoolNews;

public interface SchoolNewsService
{
    List<SchoolNews> getNewsByTenant(Long tenantId);

    SchoolNews createNews(Long tenantId, SchoolNews news);

    void deleteNews(Long id);
}
