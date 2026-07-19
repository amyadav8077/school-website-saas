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
public class SchoolNewsController {

    private final SchoolNewsRepository repository;

    @GetMapping("/sites/{tenantId}/news")
    public ResponseEntity<List<SchoolNews>> getNews(@PathVariable Long tenantId) {
        List<SchoolNews> news = repository.findByTenantIdOrderByPublishedDateDesc(tenantId);
        return ResponseEntity.ok(news);
    }

    @PostMapping("/admin/sites/{tenantId}/news")
    public ResponseEntity<SchoolNews> createNews(
            @PathVariable Long tenantId,
            @Valid @RequestBody SchoolNews news) {
        news.setTenantId(tenantId);
        news.setPublishedDate(LocalDateTime.now());
        SchoolNews saved = repository.save(news);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @DeleteMapping("/admin/news/{id}")
    public ResponseEntity<Void> deleteNews(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
