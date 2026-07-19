package com.schoolwebsite.backend.tenantsubscription;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TenantOnboardRequest {

    @NotBlank(message = "School name is required")
    private String name;

    @NotBlank(message = "Subdomain is required")
    @Pattern(regexp = "^[a-z0-9-]+$", message = "Subdomain must contain only lowercase letters, numbers, and hyphens")
    private String subdomain;

    private String primaryColor = "#1e3a8a"; // Default deep blue
    private String secondaryColor = "#3b82f6"; // Default light blue
    private String accentColor = "#f59e0b"; // Default warm amber
    private String fontFamily = "Inter";
}
