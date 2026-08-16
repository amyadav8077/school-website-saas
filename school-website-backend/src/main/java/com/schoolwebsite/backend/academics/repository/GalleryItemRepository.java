package com.schoolwebsite.backend.academics.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.schoolwebsite.backend.academics.entity.*;

@Repository
public interface GalleryItemRepository extends JpaRepository<GalleryItem, Long>
{
    List<GalleryItem> findByTenantId(Long tenantId);
}
