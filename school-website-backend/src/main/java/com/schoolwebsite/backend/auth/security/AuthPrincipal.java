package com.schoolwebsite.backend.auth.security;

import com.schoolwebsite.backend.common.constant.AppConstants;

/**
 * The authenticated caller derived from a validated JWT. This is the single
 * source of truth for identity and tenant scope — controllers/services must
 * read tenantId from here, never from request paths or bodies.
 */
public record AuthPrincipal(Long userId, String username, String role, Long tenantId) {
    public boolean isSuperAdmin() {
        return AppConstants.ROLE_SUPER_ADMIN.equals(role);
    }

    /** True when this principal is allowed to act within the given tenant. */
    public boolean canActOnTenant(Long targetTenantId) {
        if (isSuperAdmin()) {
            return true;
        }
        return tenantId != null && tenantId.equals(targetTenantId);
    }
}
