package com.schoolwebsite.backend.pagebuilder;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sites")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class PageController {

    private final PageService pageService;

    @PostMapping("/{tenantId}/pages")
    public ResponseEntity<PageResponse> createPage(
            @PathVariable Long tenantId,
            @Valid @RequestBody PageCreateRequest request) {
        PageResponse response = pageService.createPage(tenantId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{tenantId}/pages")
    public ResponseEntity<List<PageResponse>> getPages(@PathVariable Long tenantId) {
        List<PageResponse> response = pageService.getPagesByTenant(tenantId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{tenantId}/pages/slug/{slug}")
    public ResponseEntity<PageResponse> getPageBySlug(
            @PathVariable Long tenantId,
            @PathVariable String slug) {
        PageResponse response = pageService.getPageByTenantAndSlug(tenantId, slug);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/pages/{pageId}/sections")
    public ResponseEntity<PageResponse> updateSections(
            @PathVariable Long pageId,
            @RequestBody List<PageSectionDTO> sections) {
        PageResponse response = pageService.updatePageSections(pageId, sections);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/pages/{pageId}")
    public ResponseEntity<Void> deletePage(@PathVariable Long pageId) {
        pageService.deletePage(pageId);
        return ResponseEntity.noContent().build();
    }
}
