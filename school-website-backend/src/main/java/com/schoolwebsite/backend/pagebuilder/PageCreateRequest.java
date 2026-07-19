package com.schoolwebsite.backend.pagebuilder;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PageCreateRequest {
    @NotBlank(message = "Page title is required")
    private String title;
    
    @NotBlank(message = "Page slug is required")
    private String slug;
    
    private String status = "DRAFT";
    private String metaTitle;
    private String metaDescription;
}
