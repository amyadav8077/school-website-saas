package com.schoolwebsite.backend.config;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Lightweight in-memory, per-IP fixed-window rate limiter for abuse-prone
 * endpoints (auth, OTP, public forms, search). Dependency-free; suitable for a
 * single instance. For multi-instance production, back this with Redis.
 *
 * NOTE: this is deliberately conservative and only throttles a small set of
 * sensitive paths so normal browsing/admin usage is unaffected.
 */
@Order(1)
@Component
public class RateLimitFilter extends OncePerRequestFilter {
    private static final long WINDOW_MS = 60_000L;

    // Path prefix -> max requests per IP per minute.
    private static final List<Rule> RULES = List.of(new Rule("/api/auth/login", 10),
            new Rule("/api/auth/forgot-password", 5), new Rule("/api/auth/change-password", 10));

    // Suffix-based rules (public form submissions / lookups) checked separately.
    private static final int PUBLIC_WRITE_LIMIT = 15;

    private final Map<String, Window> counters = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String path = request.getRequestURI();
        String method = request.getMethod();
        Integer limit = limitFor(path, method);

        if (limit != null) {
            String key = clientIp(request) + "|" + bucketKey(path, method);
            if (isOverLimit(key, limit)) {
                response.setStatus(429);
                response.setContentType("application/json");
                response.getWriter()
                        .write("{\"success\":false,\"message\":\"Too many requests. Please try again in a minute.\"}");
                return;
            }
        }
        chain.doFilter(request, response);
    }

    private Integer limitFor(String path, String method) {
        for (Rule r : RULES) {
            if (path.startsWith(r.prefix)) {
                return r.limit;
            }
        }
        // Public form submissions and public lookups.
        if ("POST".equals(method)
                && (path.endsWith("/admissions") || path.endsWith("/support") || path.endsWith("/apply"))) {
            return PUBLIC_WRITE_LIMIT;
        }
        if ("GET".equals(method) && (path.endsWith("/tc") || path.endsWith("/grades") || path.endsWith("/invoices"))) {
            return PUBLIC_WRITE_LIMIT;
        }
        return null;
    }

    private String bucketKey(String path, String method) {
        for (Rule r : RULES) {
            if (path.startsWith(r.prefix)) {
                return r.prefix;
            }
        }
        return method + ":" + path;
    }

    private boolean isOverLimit(String key, int limit) {
        long now = System.currentTimeMillis();
        Window window = counters.compute(key, (k, existing) -> {
            if (existing == null || now - existing.start > WINDOW_MS) {
                return new Window(now);
            }
            return existing;
        });
        return window.count.incrementAndGet() > limit;
    }

    private String clientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private static final class Rule {
        private final String prefix;

        private final int limit;

        private Rule(String prefix, int limit) {
            this.prefix = prefix;
            this.limit = limit;
        }
    }

    private static final class Window {
        private final long start;

        private final AtomicInteger count = new AtomicInteger(0);

        private Window(long start) {
            this.start = start;
        }
    }
}
