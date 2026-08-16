package com.schoolwebsite.backend.academics.service;

import java.util.List;

import com.schoolwebsite.backend.academics.entity.EnrichmentActivity;

public interface EnrichmentActivityService {
    List<EnrichmentActivity> getActivitiesByTenant(Long tenantId);

    EnrichmentActivity createActivity(Long tenantId, EnrichmentActivity activity);

    void deleteActivity(Long id);
}
