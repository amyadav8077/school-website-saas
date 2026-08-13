package com.schoolwebsite.backend.pagebuilder.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.schoolwebsite.backend.common.exception.AppException;
import com.schoolwebsite.backend.common.exception.ErrorCode;
import com.schoolwebsite.backend.pagebuilder.dto.PageCreateRequest;
import com.schoolwebsite.backend.pagebuilder.dto.PageResponse;
import com.schoolwebsite.backend.pagebuilder.dto.PageSectionDTO;
import com.schoolwebsite.backend.pagebuilder.entity.Page;
import com.schoolwebsite.backend.pagebuilder.entity.PageSection;
import com.schoolwebsite.backend.pagebuilder.repository.PageRepository;
import com.schoolwebsite.backend.pagebuilder.repository.PageSectionRepository;
import com.schoolwebsite.backend.pagebuilder.service.PageService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class PageServiceImpl implements PageService {

    private final PageRepository pageRepository;
    private final PageSectionRepository pageSectionRepository;

    @Override
    @Transactional
    public PageResponse createPage(Long tenantId, PageCreateRequest request) {
        log.info("Creating page for tenantId={}, slug={}", tenantId, request.getSlug());
        if (pageRepository.existsByTenantIdAndSlug(tenantId, request.getSlug())) {
            throw AppException.of(ErrorCode.PAGE_SLUG_CONFLICT, request.getSlug());
        }

        Page page = Page.builder().tenantId(tenantId).title(request.getTitle()).slug(request.getSlug())
                .status(request.getStatus()).metaTitle(request.getMetaTitle())
                .metaDescription(request.getMetaDescription()).build();

        Page saved = pageRepository.save(page);
        return toResponse(saved, List.of());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PageResponse> getPagesByTenant(Long tenantId) {
        log.debug("Fetching pages for tenantId={}", tenantId);
        return pageRepository.findByTenantId(tenantId).stream().map(page -> {
            List<PageSection> sections = pageSectionRepository.findByPageIdOrderByPositionOrderAsc(page.getId());
            return toResponse(page, sections);
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse getPageByTenantAndSlug(Long tenantId, String slug) {
        log.debug("Fetching page for tenantId={}, slug={}", tenantId, slug);
        Page page = pageRepository.findByTenantIdAndSlug(tenantId, slug)
                .orElseThrow(() -> AppException.of(ErrorCode.PAGE_NOT_FOUND_BY_SLUG, slug));

        List<PageSection> sections = pageSectionRepository.findByPageIdOrderByPositionOrderAsc(page.getId());
        return toResponse(page, sections);
    }

    @Override
    @Transactional
    public PageResponse updatePageSections(Long pageId, List<PageSectionDTO> sectionDTOs) {
        log.info("Updating {} sections for pageId={}", sectionDTOs.size(), pageId);
        Page page = pageRepository.findById(pageId)
                .orElseThrow(() -> AppException.of(ErrorCode.PAGE_NOT_FOUND_BY_ID, pageId));

        pageSectionRepository.deleteByPageId(pageId);

        List<PageSection> newSections = sectionDTOs.stream().map(dto -> toSectionEntity(pageId, dto))
                .collect(Collectors.toList());

        List<PageSection> savedSections = pageSectionRepository.saveAll(newSections);

        return toResponse(page, savedSections);
    }

    @Override
    @Transactional
    public void deletePage(Long pageId) {
        log.info("Deleting page id={}", pageId);
        if (!pageRepository.existsById(pageId)) {
            throw AppException.of(ErrorCode.PAGE_NOT_FOUND_BY_ID, pageId);
        }
        pageRepository.deleteById(pageId);
    }

    private PageResponse toResponse(Page page, List<PageSection> sections) {
        List<PageSectionDTO> sectionDTOs = sections.stream().map(this::toSectionDTO).collect(Collectors.toList());

        return PageResponse.builder().id(page.getId()).tenantId(page.getTenantId()).title(page.getTitle())
                .slug(page.getSlug()).status(page.getStatus()).metaTitle(page.getMetaTitle())
                .metaDescription(page.getMetaDescription()).sections(sectionDTOs).createdAt(page.getCreatedAt())
                .updatedAt(page.getUpdatedAt()).build();
    }

    private PageSectionDTO toSectionDTO(PageSection section) {
        return PageSectionDTO.builder().id(section.getId()).type(section.getType())
                .positionOrder(section.getPositionOrder()).config(section.getConfig()).build();
    }

    private PageSection toSectionEntity(Long pageId, PageSectionDTO dto) {
        return PageSection.builder().pageId(pageId).type(dto.getType()).positionOrder(dto.getPositionOrder())
                .config(dto.getConfig()).build();
    }
}
