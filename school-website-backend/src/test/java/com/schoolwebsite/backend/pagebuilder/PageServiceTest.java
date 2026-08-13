package com.schoolwebsite.backend.pagebuilder;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.schoolwebsite.backend.pagebuilder.dto.PageCreateRequest;
import com.schoolwebsite.backend.pagebuilder.dto.PageResponse;
import com.schoolwebsite.backend.pagebuilder.dto.PageSectionDTO;
import com.schoolwebsite.backend.pagebuilder.service.PageService;
import com.schoolwebsite.backend.tenantsubscription.entity.Tenant;
import com.schoolwebsite.backend.tenantsubscription.repository.TenantRepository;

@SpringBootTest
@Transactional
public class PageServiceTest {

    @Autowired
    private PageService pageService;

    @Autowired
    private TenantRepository tenantRepository;

    @Test
    public void testCreatePageAndUpdateSections() {
        Tenant tenant = tenantRepository.save(Tenant.builder().name("Page Builder Academy")
                .subdomain("pagebuilder-academy").status("ACTIVE").build());
        Long tenantId = tenant.getId();

        PageCreateRequest request = new PageCreateRequest();
        request.setTitle("Home");
        request.setSlug("home");
        request.setStatus("PUBLISHED");

        PageResponse created = pageService.createPage(tenantId, request);
        assertNotNull(created.getId());
        assertEquals("home", created.getSlug());
        assertTrue(created.getSections().isEmpty());

        List<PageSectionDTO> sections = List.of(
                PageSectionDTO.builder().type("HERO").positionOrder(0).config("{\"title\":\"Welcome\"}").build(),
                PageSectionDTO.builder().type("FEATURES").positionOrder(1).config("{}").build());

        PageResponse updated = pageService.updatePageSections(created.getId(), sections);
        assertEquals(2, updated.getSections().size());
        assertEquals("HERO", updated.getSections().get(0).getType());
        assertEquals("FEATURES", updated.getSections().get(1).getType());
    }

    @Test
    public void testDuplicateSlugRejected() {
        Tenant tenant = tenantRepository.save(
                Tenant.builder().name("Duplicate Slug Academy").subdomain("dup-slug-academy").status("ACTIVE").build());
        Long tenantId = tenant.getId();

        PageCreateRequest request = new PageCreateRequest();
        request.setTitle("About");
        request.setSlug("about");

        pageService.createPage(tenantId, request);
        assertThrows(RuntimeException.class, () -> pageService.createPage(tenantId, request));
    }
}
