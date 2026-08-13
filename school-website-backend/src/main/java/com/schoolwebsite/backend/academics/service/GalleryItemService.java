package com.schoolwebsite.backend.academics.service;

import java.util.List;

import com.schoolwebsite.backend.academics.entity.GalleryItem;

public interface GalleryItemService {

    List<GalleryItem> getGalleryByTenant(Long tenantId);

    GalleryItem createGalleryItem(Long tenantId, GalleryItem item);

    void deleteGalleryItem(Long id);
}
