package com.schoolwebsite.backend.pagebuilder.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageResponse {
    private Long id;
    private Long tenantId;
    private String title;
    private String slug;
    private String status;
    private String metaTitle;
    private String metaDescription;
    private List<PageSectionDTO> sections;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
