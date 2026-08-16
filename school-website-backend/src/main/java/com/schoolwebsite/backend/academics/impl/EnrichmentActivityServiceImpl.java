package com.schoolwebsite.backend.academics.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.schoolwebsite.backend.academics.entity.EnrichmentActivity;
import com.schoolwebsite.backend.academics.repository.EnrichmentActivityRepository;
import com.schoolwebsite.backend.academics.service.EnrichmentActivityService;
import com.schoolwebsite.backend.common.exception.AppException;
import com.schoolwebsite.backend.common.exception.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class EnrichmentActivityServiceImpl implements EnrichmentActivityService
{
    private final EnrichmentActivityRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<EnrichmentActivity> getActivitiesByTenant(Long tenantId)
    {
        log.debug("Fetching enrichment activities for tenantId={}", tenantId);
        return repository.findByTenantId(tenantId);
    }

    @Override
    @Transactional
    public EnrichmentActivity createActivity(Long tenantId, EnrichmentActivity activity)
    {
        log.info("Creating enrichment activity for tenantId={}, title={}", tenantId, activity.getTitle());
        activity.setTenantId(tenantId);
        return repository.save(activity);
    }

    @Override
    @Transactional
    public void deleteActivity(Long id)
    {
        log.info("Deleting enrichment activity id={}", id);
        if (!repository.existsById(id))
        {
            throw AppException.of(ErrorCode.ENRICHMENT_ACTIVITY_NOT_FOUND, id);
        }
        repository.deleteById(id);
    }
}
