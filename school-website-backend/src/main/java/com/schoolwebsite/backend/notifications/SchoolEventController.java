package com.schoolwebsite.backend.notifications;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class SchoolEventController {

    private final SchoolEventRepository repository;

    @GetMapping("/sites/{tenantId}/events")
    public ResponseEntity<List<SchoolEvent>> getEvents(@PathVariable Long tenantId) {
        List<SchoolEvent> events = repository.findByTenantIdOrderByEventDateAsc(tenantId);
        return ResponseEntity.ok(events);
    }

    @PostMapping("/admin/sites/{tenantId}/events")
    public ResponseEntity<SchoolEvent> createEvent(
            @PathVariable Long tenantId,
            @Valid @RequestBody SchoolEvent event) {
        event.setTenantId(tenantId);
        if (event.getEventDate() == null) {
            event.setEventDate(LocalDateTime.now().plusDays(7)); // Default 1 week out
        }
        SchoolEvent saved = repository.save(event);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @DeleteMapping("/admin/events/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
