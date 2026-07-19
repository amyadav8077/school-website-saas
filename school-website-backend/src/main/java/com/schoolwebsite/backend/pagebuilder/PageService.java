package com.schoolwebsite.backend.pagebuilder;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PageService {

    private final PageRepository pageRepository;
    private final PageSectionRepository pageSectionRepository;

    @Transactional
    public PageResponse createPage(Long tenantId, PageCreateRequest request) {
        if (pageRepository.existsByTenantIdAndSlug(tenantId, request.getSlug())) {
            throw new IllegalArgumentException("A page with slug '" + request.getSlug() + "' already exists for this tenant");
        }

        Page page = Page.builder()
                .tenantId(tenantId)
                .title(request.getTitle())
                .slug(request.getSlug())
                .status(request.getStatus())
                .metaTitle(request.getMetaTitle())
                .metaDescription(request.getMetaDescription())
                .build();

        Page saved = pageRepository.save(page);
        return mapToResponse(saved, List.of());
    }

    public List<PageResponse> getPagesByTenant(Long tenantId) {
        return pageRepository.findByTenantId(tenantId).stream()
                .map(page -> {
                    List<PageSection> sections = pageSectionRepository.findByPageIdOrderByPositionOrderAsc(page.getId());
                    return mapToResponse(page, sections);
                })
                .collect(Collectors.toList());
    }

    public PageResponse getPageByTenantAndSlug(Long tenantId, String slug) {
        Page page = pageRepository.findByTenantIdAndSlug(tenantId, slug)
                .orElseThrow(() -> new IllegalArgumentException("Page not found with slug: " + slug));

        List<PageSection> sections = pageSectionRepository.findByPageIdOrderByPositionOrderAsc(page.getId());
        return mapToResponse(page, sections);
    }

    @Transactional
    public PageResponse updatePageSections(Long pageId, List<PageSectionDTO> sectionDTOs) {
        Page page = pageRepository.findById(pageId)
                .orElseThrow(() -> new IllegalArgumentException("Page not found with id: " + pageId));

        // Replace old sections
        pageSectionRepository.deleteByPageId(pageId);

        List<PageSection> newSections = sectionDTOs.stream()
                .map(dto -> PageSection.builder()
                        .pageId(pageId)
                        .type(dto.getType())
                        .positionOrder(dto.getPositionOrder())
                        .config(dto.getConfig())
                        .build())
                .collect(Collectors.toList());

        List<PageSection> savedSections = pageSectionRepository.saveAll(newSections);

        return mapToResponse(page, savedSections);
    }

    @Transactional
    public void deletePage(Long pageId) {
        if (!pageRepository.existsById(pageId)) {
            throw new IllegalArgumentException("Page not found with id: " + pageId);
        }
        pageRepository.deleteById(pageId);
    }

    private PageResponse mapToResponse(Page page, List<PageSection> sections) {
        List<PageSectionDTO> sectionDTOs = sections.stream()
                .map(sec -> PageSectionDTO.builder()
                        .id(sec.getId())
                        .type(sec.getType())
                        .positionOrder(sec.getPositionOrder())
                        .config(sec.getConfig())
                        .build())
                .collect(Collectors.toList());

        return PageResponse.builder()
                .id(page.getId())
                .tenantId(page.getTenantId())
                .title(page.getTitle())
                .slug(page.getSlug())
                .status(page.getStatus())
                .metaTitle(page.getMetaTitle())
                .metaDescription(page.getMetaDescription())
                .sections(sectionDTOs)
                .createdAt(page.getCreatedAt())
                .updatedAt(page.getUpdatedAt())
                .build();
    }
}
