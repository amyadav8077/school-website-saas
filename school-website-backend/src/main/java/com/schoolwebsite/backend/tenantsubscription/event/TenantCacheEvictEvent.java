package com.schoolwebsite.backend.tenantsubscription.event;

/**
 * Published whenever a tenant's public-facing data changes (custom domain,
 * site config, pages, etc.) so host-resolution and payload caches evict the
 * affected tenant immediately instead of waiting for TTL expiry.
 */
public record TenantCacheEvictEvent(Long tenantId)
{
}
