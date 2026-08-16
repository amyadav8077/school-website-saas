package com.schoolwebsite.backend.notifications.service;

import java.util.List;

import com.schoolwebsite.backend.notifications.entity.SchoolEvent;

public interface SchoolEventService
{
    List<SchoolEvent> getEventsByTenant(Long tenantId);

    SchoolEvent createEvent(Long tenantId, SchoolEvent event);

    void deleteEvent(Long id);
}
