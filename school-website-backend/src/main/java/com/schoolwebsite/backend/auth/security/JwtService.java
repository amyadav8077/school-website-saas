package com.schoolwebsite.backend.auth.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.schoolwebsite.backend.auth.entity.AdminUser;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

/**
 * Issues and validates stateless JWT access tokens. Tokens carry the caller's
 * identity (userId, username, role, tenantId) so the server never has to trust
 * a tenantId supplied in the request path.
 */
@Service
public class JwtService {
    private final SecretKey signingKey;

    private final long expiryMillis;

    public JwtService(@Value("${security.jwt.secret:}") String secret,
            @Value("${security.jwt.expiry-minutes:720}") long expiryMinutes,
            org.springframework.core.env.Environment env) {
        boolean isProd = java.util.Arrays.asList(env.getActiveProfiles()).contains("prod");
        boolean blank = (secret == null || secret.isBlank());
        if (isProd && blank) {
            // Never run production with a fallback signing key — tokens would be forgeable.
            throw new IllegalStateException(
                    "JWT_SECRET (security.jwt.secret) must be set to a strong 32+ char value in the prod profile.");
        }
        // Fall back to a stable dev secret only for non-prod when none is configured.
        String effective = blank ? "dev-only-insecure-jwt-secret-change-me-please-32b+" : secret;
        byte[] keyBytes = effective.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            // Pad short dev secrets so HS256 has a valid-length key; real secrets
            // from env are expected to be >= 32 bytes.
            byte[] padded = new byte[32];
            System.arraycopy(keyBytes, 0, padded, 0, keyBytes.length);
            for (int i = keyBytes.length; i < 32; i++) {
                padded[i] = (byte) ('x');
            }
            keyBytes = padded;
        }
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        this.expiryMillis = expiryMinutes * 60_000L;
    }

    public String generateToken(AdminUser user) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + expiryMillis);
        return Jwts.builder().subject(user.getUsername()).claim("uid", user.getId()).claim("role", user.getRole())
                .claim("tenantId", user.getTenantId()).issuedAt(now).expiration(exp).signWith(signingKey).compact();
    }

    public AuthPrincipal parse(String token) {
        Jws<Claims> jws = Jwts.parser().verifyWith(signingKey).build().parseSignedClaims(token);
        Claims c = jws.getPayload();
        Long uid = c.get("uid", Number.class) == null ? null : c.get("uid", Number.class).longValue();
        Long tenantId = c.get("tenantId", Number.class) == null ? null : c.get("tenantId", Number.class).longValue();
        String role = c.get("role", String.class);
        return new AuthPrincipal(uid, c.getSubject(), role, tenantId);
    }
}
