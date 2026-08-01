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
public class EnrichmentActivityService {

    private final EnrichmentActivityRepository repository;

    @Transactional(readOnly = true)
    public List<EnrichmentActivity> getActivitiesByTenant(Long tenantId) {
        return repository.findByTenantId(tenantId);
    }

    @Transactional
    public EnrichmentActivity createActivity(Long tenantId, EnrichmentActivity activity) {
        activity.setTenantId(tenantId);
        return repository.save(activity);
    }

    @Transactional
    public void deleteActivity(Long id) {
        if (!repository.existsById(id)) {
            throw AppException.notFound("Enrichment activity not found with id: " + id);
        }
        repository.deleteById(id);
    }
}
