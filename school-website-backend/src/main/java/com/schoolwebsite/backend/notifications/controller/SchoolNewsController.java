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
public class SchoolNewsController
{
    private final SchoolNewsService service;

    @GetMapping("/sites/{tenantId}/news")
    public ResponseEntity<ApiResponse<List<SchoolNews>>> getNews(@PathVariable Long tenantId)
    {
        return ResponseEntity.ok(ApiResponse.ok(service.getNewsByTenant(tenantId)));
    }

    @PostMapping("/admin/sites/{tenantId}/news")
    public ResponseEntity<ApiResponse<SchoolNews>> createNews(@PathVariable Long tenantId,
            @Valid @RequestBody SchoolNews news)
    {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("News article created successfully", service.createNews(tenantId, news)));
    }

    @DeleteMapping("/admin/news/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNews(@PathVariable Long id)
    {
        service.deleteNews(id);
        return ResponseEntity.ok(ApiResponse.ok("News article deleted successfully", null));
    }
}
