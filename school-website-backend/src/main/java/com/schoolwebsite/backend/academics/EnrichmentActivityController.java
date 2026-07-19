package com.schoolwebsite.backend.academics;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class EnrichmentActivityController {

    private final EnrichmentActivityRepository repository;

    @GetMapping("/sites/{tenantId}/enrichment")
    public ResponseEntity<List<EnrichmentActivity>> getEnrichment(@PathVariable Long tenantId) {
        List<EnrichmentActivity> list = repository.findByTenantId(tenantId);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/admin/sites/{tenantId}/enrichment")
    public ResponseEntity<EnrichmentActivity> createEnrichmentActivity(
            @PathVariable Long tenantId,
            @Valid @RequestBody EnrichmentActivity item) {
        item.setTenantId(tenantId);
        EnrichmentActivity saved = repository.save(item);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @DeleteMapping("/admin/enrichment/{id}")
    public ResponseEntity<Void> deleteEnrichmentActivity(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
