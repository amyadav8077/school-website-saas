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
public class SchoolEventService {

    private final SchoolEventRepository repository;

    @Transactional(readOnly = true)
    public List<SchoolEvent> getEventsByTenant(Long tenantId) {
        return repository.findByTenantIdOrderByEventDateAsc(tenantId);
    }

    @Transactional
    public SchoolEvent createEvent(Long tenantId, SchoolEvent event) {
        event.setTenantId(tenantId);
        if (event.getEventDate() == null) {
            event.setEventDate(LocalDateTime.now().plusDays(7));
        }
        return repository.save(event);
    }

    @Transactional
    public void deleteEvent(Long id) {
        if (!repository.existsById(id)) {
            throw AppException.notFound("School event not found with id: " + id);
        }
        repository.deleteById(id);
    }
}
