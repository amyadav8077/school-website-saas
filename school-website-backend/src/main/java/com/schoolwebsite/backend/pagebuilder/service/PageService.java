package com.schoolwebsite.backend.pagebuilder.service;

import java.util.List;

import com.schoolwebsite.backend.pagebuilder.dto.PageCreateRequest;
import com.schoolwebsite.backend.pagebuilder.dto.PageResponse;
import com.schoolwebsite.backend.pagebuilder.dto.PageSectionDTO;

public interface PageService {

    PageResponse createPage(Long tenantId, PageCreateRequest request);

    List<PageResponse> getPagesByTenant(Long tenantId);

    PageResponse getPageByTenantAndSlug(Long tenantId, String slug);

    PageResponse updatePageSections(Long pageId, List<PageSectionDTO> sectionDTOs);

    void deletePage(Long pageId);
}
