package com.schoolwebsite.backend.auth.security;

import java.util.Optional;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.schoolwebsite.backend.common.exception.AppException;

/**
 * Convenience accessor for the authenticated {@link AuthPrincipal} in the
 * current request's SecurityContext.
 */
public final class CurrentUser {
    private CurrentUser() {
    }

    public static Optional<AuthPrincipal> get() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof AuthPrincipal principal) {
            return Optional.of(principal);
        }
        return Optional.empty();
    }

    public static AuthPrincipal require() {
        return get().orElseThrow(() -> AppException.unauthorized("Authentication is required."));
    }

    /** Asserts the caller may act within targetTenantId, else throws forbidden. */
    public static void assertTenantAccess(Long targetTenantId) {
        AuthPrincipal principal = require();
        if (!principal.canActOnTenant(targetTenantId)) {
            throw AppException.forbidden("You do not have access to this tenant's resources.");
        }
    }
}
