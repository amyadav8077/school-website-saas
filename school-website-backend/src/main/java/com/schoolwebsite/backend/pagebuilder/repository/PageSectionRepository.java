package com.schoolwebsite.backend.pagebuilder.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.schoolwebsite.backend.pagebuilder.entity.*;

@Repository
public interface PageSectionRepository extends JpaRepository<PageSection, Long>
{
    List<PageSection> findByPageIdOrderByPositionOrderAsc(Long pageId);

    void deleteByPageId(Long pageId);
}
