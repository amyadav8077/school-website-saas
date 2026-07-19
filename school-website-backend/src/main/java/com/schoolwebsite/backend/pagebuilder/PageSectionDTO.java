package com.schoolwebsite.backend.pagebuilder;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageSectionDTO {
    private Long id;
    private String type;
    private Integer positionOrder;
    private String config; // JSON config
}
