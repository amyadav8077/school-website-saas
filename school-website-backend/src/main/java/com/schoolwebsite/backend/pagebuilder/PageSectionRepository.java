package com.schoolwebsite.backend.pagebuilder;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PageSectionRepository extends JpaRepository<PageSection, Long> {
    List<PageSection> findByPageIdOrderByPositionOrderAsc(Long pageId);
    void deleteByPageId(Long pageId);
}
