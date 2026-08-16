package com.schoolwebsite.backend.notifications.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.schoolwebsite.backend.common.dto.ApiResponse;
import com.schoolwebsite.backend.notifications.entity.*;
import com.schoolwebsite.backend.notifications.service.*;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SchoolEventController {
    private final SchoolEventService service;

    @GetMapping("/sites/{tenantId}/events")
    public ResponseEntity<ApiResponse<List<SchoolEvent>>> getEvents(@PathVariable Long tenantId) {
        return ResponseEntity.ok(ApiResponse.ok(service.getEventsByTenant(tenantId)));
    }

    @PostMapping("/admin/sites/{tenantId}/events")
    public ResponseEntity<ApiResponse<SchoolEvent>> createEvent(@PathVariable Long tenantId,
            @Valid @RequestBody SchoolEvent event) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Event created successfully", service.createEvent(tenantId, event)));
    }

    @DeleteMapping("/admin/events/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEvent(@PathVariable Long id) {
        service.deleteEvent(id);
        return ResponseEntity.ok(ApiResponse.ok("Event deleted successfully", null));
    }
}
