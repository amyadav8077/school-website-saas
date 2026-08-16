package com.schoolwebsite.backend.common.constant;

public final class AppConstants {

    private AppConstants() {
    }

    // ── Generic status values ───────────────────────────────────────────────
    public static final String STATUS_PENDING = "PENDING";

    public static final String STATUS_ACTIVE = "ACTIVE";

    public static final String STATUS_PAID = "PAID";

    public static final String STATUS_RESOLVED = "RESOLVED";

    // ── Admin roles ─────────────────────────────────────────────────────────
    public static final String ROLE_SUPER_ADMIN = "SUPER_ADMIN";

    public static final String ROLE_TENANT_ADMIN = "TENANT_ADMIN";

    // ── Site configuration defaults ─────────────────────────────────────────
    public static final String DEFAULT_THEME = "DEFAULT";

    public static final String DEFAULT_PRIMARY_COLOR = "#1e3a8a";

    public static final String DEFAULT_SECONDARY_COLOR = "#3b82f6";

    public static final String DEFAULT_ACCENT_COLOR = "#f59e0b";

    public static final String DEFAULT_FONT_FAMILY = "Segoe UI";

    // ── Billing ─────────────────────────────────────────────────────────────
    public static final int INVOICE_DUE_DAYS = 30;

    // ── Notifications ───────────────────────────────────────────────────────
    public static final int DEFAULT_EVENT_LEAD_DAYS = 7;

    // ── Auth / OTP ──────────────────────────────────────────────────────────
    public static final int OTP_VALIDITY_MINUTES = 5;
}
