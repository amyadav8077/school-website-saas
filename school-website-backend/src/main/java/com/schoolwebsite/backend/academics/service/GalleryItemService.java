package com.schoolwebsite.backend.academics.service;

import com.schoolwebsite.backend.academics.entity.*;
import com.schoolwebsite.backend.academics.repository.*;

import com.schoolwebsite.backend.common.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GalleryItemService {

    private final GalleryItemRepository repository;

    @Transactional(readOnly = true)
    public List<GalleryItem> getGalleryByTenant(Long tenantId) {
        return repository.findByTenantId(tenantId);
    }

    @Transactional
    public GalleryItem createGalleryItem(Long tenantId, GalleryItem item) {
        item.setTenantId(tenantId);
        return repository.save(item);
    }

    @Transactional
    public void deleteGalleryItem(Long id) {
        if (!repository.existsById(id)) {
            throw AppException.notFound("Gallery item not found with id: " + id);
        }
        repository.deleteById(id);
    }
}
