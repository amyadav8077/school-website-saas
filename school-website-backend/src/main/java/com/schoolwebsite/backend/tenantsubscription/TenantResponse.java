package com.schoolwebsite.backend.tenantsubscription;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenantResponse {
    private Long id;
    private String name;
    private String subdomain;
    private String customDomain;
    private String status;
    private LocalDateTime createdAt;
}
