package com.schoolwebsite.backend.academics.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.schoolwebsite.backend.academics.entity.*;
import com.schoolwebsite.backend.academics.service.*;
import com.schoolwebsite.backend.common.dto.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class GalleryItemController {
    private final GalleryItemService service;

    @GetMapping("/sites/{tenantId}/gallery")
    public ResponseEntity<ApiResponse<List<GalleryItem>>> getGallery(@PathVariable Long tenantId) {
        return ResponseEntity.ok(ApiResponse.ok(service.getGalleryByTenant(tenantId)));
    }

    @PostMapping("/admin/sites/{tenantId}/gallery")
    public ResponseEntity<ApiResponse<GalleryItem>> createGalleryItem(@PathVariable Long tenantId,
            @Valid @RequestBody GalleryItem item) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Gallery item created successfully", service.createGalleryItem(tenantId, item)));
    }

    @DeleteMapping("/admin/gallery/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteGalleryItem(@PathVariable Long id) {
        service.deleteGalleryItem(id);
        return ResponseEntity.ok(ApiResponse.ok("Gallery item deleted successfully", null));
    }
}
