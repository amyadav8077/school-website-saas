package com.schoolwebsite.backend.notifications.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.schoolwebsite.backend.common.constant.AppConstants;
import com.schoolwebsite.backend.common.exception.AppException;
import com.schoolwebsite.backend.common.exception.ErrorCode;
import com.schoolwebsite.backend.notifications.entity.SchoolEvent;
import com.schoolwebsite.backend.notifications.repository.SchoolEventRepository;
import com.schoolwebsite.backend.notifications.service.SchoolEventService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class SchoolEventServiceImpl implements SchoolEventService {

    private final SchoolEventRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<SchoolEvent> getEventsByTenant(Long tenantId) {
        log.debug("Fetching school events for tenantId={}", tenantId);
        return repository.findByTenantIdOrderByEventDateAsc(tenantId);
    }

    @Override
    @Transactional
    public SchoolEvent createEvent(Long tenantId, SchoolEvent event) {
        log.info("Creating school event for tenantId={}, title={}", tenantId, event.getTitle());
        event.setTenantId(tenantId);
        if (event.getEventDate() == null) {
            event.setEventDate(LocalDateTime.now().plusDays(AppConstants.DEFAULT_EVENT_LEAD_DAYS));
        }
        return repository.save(event);
    }

    @Override
    @Transactional
    public void deleteEvent(Long id) {
        log.info("Deleting school event id={}", id);
        if (!repository.existsById(id)) {
            throw AppException.of(ErrorCode.SCHOOL_EVENT_NOT_FOUND, id);
        }
        repository.deleteById(id);
    }
}
