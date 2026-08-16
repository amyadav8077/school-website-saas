package com.schoolwebsite.backend.auth.security;

import org.springframework.stereotype.Component;

/**
 * SpEL-accessible authorization helper for @PreAuthorize expressions, e.g.
 * {@code @PreAuthorize("@tenantSecurity.canManage(#tenantId)")}.
 */
@Component("tenantSecurity")
public class TenantSecurity {
    /** True when the current principal is super-admin or owns the given tenant. */
    public boolean canManage(Long tenantId) {
        return CurrentUser.get().map(p -> p.canActOnTenant(tenantId)).orElse(false);
    }
}
