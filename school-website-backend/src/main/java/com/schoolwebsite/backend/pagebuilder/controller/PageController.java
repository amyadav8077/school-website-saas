package com.schoolwebsite.backend.pagebuilder.controller;

import com.schoolwebsite.backend.pagebuilder.service.*;
import com.schoolwebsite.backend.pagebuilder.dto.*;

import com.schoolwebsite.backend.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sites")
@RequiredArgsConstructor
public class PageController {

    private final PageService pageService;

    @PostMapping("/{tenantId}/pages")
    public ResponseEntity<ApiResponse<PageResponse>> createPage(
            @PathVariable Long tenantId,
            @Valid @RequestBody PageCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Page created successfully", pageService.createPage(tenantId, request)));
    }

    @GetMapping("/{tenantId}/pages")
    public ResponseEntity<ApiResponse<List<PageResponse>>> getPages(@PathVariable Long tenantId) {
        return ResponseEntity.ok(ApiResponse.ok(pageService.getPagesByTenant(tenantId)));
    }

    @GetMapping("/{tenantId}/pages/slug/{slug}")
    public ResponseEntity<ApiResponse<PageResponse>> getPageBySlug(
            @PathVariable Long tenantId,
            @PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.ok(pageService.getPageByTenantAndSlug(tenantId, slug)));
    }

    @PutMapping("/pages/{pageId}/sections")
    public ResponseEntity<ApiResponse<PageResponse>> updateSections(
            @PathVariable Long pageId,
            @RequestBody List<PageSectionDTO> sections) {
        return ResponseEntity.ok(ApiResponse.ok("Page sections updated",
                pageService.updatePageSections(pageId, sections)));
    }

    @DeleteMapping("/pages/{pageId}")
    public ResponseEntity<ApiResponse<Void>> deletePage(@PathVariable Long pageId) {
        pageService.deletePage(pageId);
        return ResponseEntity.ok(ApiResponse.ok("Page deleted successfully", null));
    }
}
