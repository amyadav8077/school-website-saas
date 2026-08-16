package com.schoolwebsite.backend.academics.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.schoolwebsite.backend.academics.entity.GalleryItem;
import com.schoolwebsite.backend.academics.repository.GalleryItemRepository;
import com.schoolwebsite.backend.academics.service.GalleryItemService;
import com.schoolwebsite.backend.auth.security.CurrentUser;
import com.schoolwebsite.backend.common.exception.AppException;
import com.schoolwebsite.backend.common.exception.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class GalleryItemServiceImpl implements GalleryItemService {
    private final GalleryItemRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<GalleryItem> getGalleryByTenant(Long tenantId) {
        log.debug("Fetching gallery items for tenantId={}", tenantId);
        return repository.findByTenantId(tenantId);
    }

    @Override
    @Transactional
    public GalleryItem createGalleryItem(Long tenantId, GalleryItem item) {
        log.info("Creating gallery item for tenantId={}, title={}", tenantId, item.getTitle());
        CurrentUser.assertTenantAccess(tenantId);
        item.setId(null);
        item.setTenantId(tenantId);
        return repository.save(item);
    }

    @Override
    @Transactional
    public void deleteGalleryItem(Long id) {
        log.info("Deleting gallery item id={}", id);
        var existing = repository.findById(id).orElseThrow(() -> AppException.of(ErrorCode.GALLERY_ITEM_NOT_FOUND, id));
        CurrentUser.assertTenantAccess(existing.getTenantId());
        repository.deleteById(id);
    }
}
