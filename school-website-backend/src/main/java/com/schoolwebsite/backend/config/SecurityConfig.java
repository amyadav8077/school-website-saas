package com.schoolwebsite.backend.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.schoolwebsite.backend.auth.security.JwtAuthenticationFilter;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    /**
     * Comma-separated allowlist of CORS origins. Defaults cover local dev + the
     * known Vercel app; production/tenant domains should be added via env
     * (CORS_ALLOWED_ORIGINS). Wildcard patterns (e.g. https://*.vercel.app) are
     * supported.
     */
    @Value("${security.cors.allowed-origins:http://localhost:4200,https://*.vercel.app}")
    private String allowedOrigins;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource())).csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .headers(headers -> headers.contentTypeOptions(cto -> {
                }).frameOptions(frame -> frame.deny()).referrerPolicy(rp -> rp.policy(
                        org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy.SAME_ORIGIN))
                        .httpStrictTransportSecurity(hsts -> hsts.includeSubDomains(true).maxAgeInSeconds(31536000))
                        .addHeaderWriter(new org.springframework.security.web.header.writers.StaticHeadersWriter(
                                "Content-Security-Policy",
                                "default-src 'self'; frame-ancestors 'none'; base-uri 'self'; object-src 'none'"))
                        .addHeaderWriter(new org.springframework.security.web.header.writers.StaticHeadersWriter(
                                "Permissions-Policy", "geolocation=(), microphone=(), camera=()")))
                .authorizeHttpRequests(auth -> auth
                        // CORS preflight
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Framework/monitoring
                        .requestMatchers("/api/health", "/error").permitAll()
                        // Public auth flows (login, OTP-based reset). change-password is protected below.
                        .requestMatchers("/api/auth/login", "/api/auth/login/phone", "/api/auth/forgot-password/**")
                        .permitAll()
                        // Public website reads (anonymous visitors browse a school's site)
                        .requestMatchers(HttpMethod.GET, "/api/sites/bootstrap").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/admin/tenants/resolve").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/sites/**").permitAll()
                        // Public form submissions (prospective parents / support tickets)
                        .requestMatchers(HttpMethod.POST, "/api/sites/*/admissions").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/sites/*/support").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/sites/*/jobs/*/apply").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/sites/invoices/*/pay").permitAll()
                        // Public identity-verification gates for TC download and fee viewing
                        .requestMatchers(HttpMethod.POST, "/api/sites/*/tc/verify-download").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/sites/*/invoices/verify").permitAll()
                        // Everything else (all /api/admin/** management, all writes) requires auth
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(
                Arrays.stream(allowedOrigins.split(",")).map(String::trim).filter(s -> !s.isEmpty()).toList());
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "Origin"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
