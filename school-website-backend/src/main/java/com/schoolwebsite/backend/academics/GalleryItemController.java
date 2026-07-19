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
public class GalleryItemController {

    private final GalleryItemRepository repository;

    @GetMapping("/sites/{tenantId}/gallery")
    public ResponseEntity<List<GalleryItem>> getGallery(@PathVariable Long tenantId) {
        List<GalleryItem> list = repository.findByTenantId(tenantId);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/admin/sites/{tenantId}/gallery")
    public ResponseEntity<GalleryItem> createGalleryItem(
            @PathVariable Long tenantId,
            @Valid @RequestBody GalleryItem item) {
        item.setTenantId(tenantId);
        GalleryItem saved = repository.save(item);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @DeleteMapping("/admin/gallery/{id}")
    public ResponseEntity<Void> deleteGalleryItem(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
