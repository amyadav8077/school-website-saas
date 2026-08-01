package com.schoolwebsite.backend.pagebuilder.repository;

import com.schoolwebsite.backend.pagebuilder.entity.*;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PageSectionRepository extends JpaRepository<PageSection, Long> {
    List<PageSection> findByPageIdOrderByPositionOrderAsc(Long pageId);
    void deleteByPageId(Long pageId);
}
