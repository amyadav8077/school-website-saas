package com.schoolwebsite.backend.bootstrap.service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Supplier;

import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.schoolwebsite.backend.academics.service.AcademicCourseService;
import com.schoolwebsite.backend.academics.service.AcademicProgramService;
import com.schoolwebsite.backend.academics.service.FacultyMemberService;
import com.schoolwebsite.backend.academics.service.StudentAchieverService;
import com.schoolwebsite.backend.bootstrap.dto.SiteBootstrapResponse;
import com.schoolwebsite.backend.notifications.service.SchoolEventService;
import com.schoolwebsite.backend.notifications.service.SchoolNewsService;
import com.schoolwebsite.backend.pagebuilder.service.PageService;
import com.schoolwebsite.backend.siteconfiguration.dto.SiteConfigResponse;
import com.schoolwebsite.backend.siteconfiguration.service.SiteConfigService;
import com.schoolwebsite.backend.tenantsubscription.dto.TenantResponse;
import com.schoolwebsite.backend.tenantsubscription.event.TenantCacheEvictEvent;
import com.schoolwebsite.backend.tenantsubscription.service.TenantService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Assembles the entire public website payload for a given host in one call.
 *
 * Scale/latency notes:
 * - Host -> tenant resolution is cached in-memory with a short TTL so repeat
 *   visits skip the DB lookup. The cache is per-instance and self-healing (it
 *   simply re-resolves after TTL), so onboarding a new tenant needs no cache
 *   wiring — it becomes resolvable immediately (new host = cache miss).
 * - Catalog sections degrade gracefully: if one module fails, its list comes
 *   back empty rather than failing the whole page.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SiteBootstrapService {
    private static final long CACHE_TTL_MS = 60_000L;

    private static final long PAYLOAD_TTL_MS = 30_000L;

    private final TenantService tenantService;

    private final SiteConfigService siteConfigService;

    private final PageService pageService;

    private final AcademicCourseService courseService;

    private final AcademicProgramService programService;

    private final FacultyMemberService facultyService;

    private final StudentAchieverService achieverService;

    private final SchoolNewsService newsService;

    private final SchoolEventService eventService;

    private final Map<String, CachedTenant> hostCache = new ConcurrentHashMap<>();

    private final Map<String, CachedPayload> payloadCache = new ConcurrentHashMap<>();

    @Transactional(readOnly = true)
    public SiteBootstrapResponse bootstrap(String host) {
        String key = host == null ? "" : host.trim().toLowerCase();
        long now = System.currentTimeMillis();

        // Fast path: serve the fully assembled payload from cache so repeat and
        // concurrent visitors barely touch the database.
        CachedPayload cachedPayload = payloadCache.get(key);
        if (cachedPayload != null && (now - cachedPayload.timestamp) < PAYLOAD_TTL_MS) {
            return cachedPayload.payload;
        }

        SiteBootstrapResponse response = assemble(host);
        payloadCache.put(key, new CachedPayload(response, response.getTenant().getId(), now));
        return response;
    }

    private SiteBootstrapResponse assemble(String host) {
        TenantResponse tenant = resolveTenantCached(host);
        Long tenantId = tenant.getId();

        SiteConfigResponse config = safe(() -> siteConfigService.getSiteConfigBySubdomain(tenant.getSubdomain()), null,
                "config");

        return SiteBootstrapResponse.builder().tenant(tenant).config(config)
                .pages(safeList(() -> pageService.getPagesByTenant(tenantId), "pages"))
                .courses(safeList(() -> courseService.getCoursesByTenant(tenantId), "courses"))
                .programs(safeList(() -> programService.getProgramsByTenant(tenantId), "programs"))
                .faculty(safeList(() -> facultyService.getFacultyByTenant(tenantId), "faculty"))
                .achievers(safeList(() -> achieverService.getAchieversByTenant(tenantId), "achievers"))
                .news(safeList(() -> newsService.getNewsByTenant(tenantId), "news"))
                .events(safeList(() -> eventService.getEventsByTenant(tenantId), "events")).build();
    }

    private TenantResponse resolveTenantCached(String host) {
        String key = host == null ? "" : host.trim().toLowerCase();
        CachedTenant cached = hostCache.get(key);
        long now = System.currentTimeMillis();
        if (cached != null && (now - cached.timestamp) < CACHE_TTL_MS) {
            return cached.tenant;
        }
        // Cache miss / expired — this throws TENANT_NOT_FOUND_BY_HOST for unknown
        // hosts, which the controller surfaces as a clean 404 (never cached).
        TenantResponse tenant = tenantService.resolveByHost(host);
        hostCache.put(key, new CachedTenant(tenant, now));
        return tenant;
    }

    /** Drops any cached host + payload entries pointing at the given tenant. */
    public void evictTenant(Long tenantId) {
        if (tenantId == null) {
            return;
        }
        hostCache.entrySet().removeIf(e -> tenantId.equals(e.getValue().tenant.getId()));
        payloadCache.entrySet().removeIf(e -> tenantId.equals(e.getValue().tenantId));
    }

    @EventListener
    public void onTenantCacheEvict(TenantCacheEvictEvent event) {
        log.debug("Evicting caches for tenantId={} after content change", event.tenantId());
        evictTenant(event.tenantId());
    }

    private <T> List<T> safeList(Supplier<List<T>> supplier, String label) {
        List<T> result = safe(supplier, Collections.emptyList(), label);
        return result != null ? result : Collections.emptyList();
    }

    private <T> T safe(Supplier<T> supplier, T fallback, String label) {
        try {
            return supplier.get();
        } catch (Exception e) {
            log.warn("Bootstrap section '{}' failed, returning fallback: {}", label, e.getMessage());
            return fallback;
        }
    }

    private static final class CachedTenant {
        private final TenantResponse tenant;

        private final long timestamp;

        private CachedTenant(TenantResponse tenant, long timestamp) {
            this.tenant = tenant;
            this.timestamp = timestamp;
        }
    }

    private static final class CachedPayload {
        private final SiteBootstrapResponse payload;

        private final Long tenantId;

        private final long timestamp;

        private CachedPayload(SiteBootstrapResponse payload, Long tenantId, long timestamp) {
            this.payload = payload;
            this.tenantId = tenantId;
            this.timestamp = timestamp;
        }
    }
}
