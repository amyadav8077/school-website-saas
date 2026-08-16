# School Website SaaS Platform - Project Overview

This multi-tenant SaaS School Website Builder and Administrative Portal is split into two co-operating, highly responsive services: **School Website Backend (Spring Boot)** and **School Website Frontend (Angular)**.

---

## 1. School Website Backend (`school-website-backend`)

The backend is built with **Spring Boot** and **Java 17/Jakarta Persistence**. It serves as a secure, stateless REST API and multi-tenant persistence layer.

### Core Architecture & Domain Model:
*   **Tenants (`Tenant.java`):** Supports multi-tenancy. Every school has its own custom name, subdomain, and isolated portal configurations. A tenant can be opened **directly on its own custom domain or subdomain** — the app resolves the browser host to the owning tenant and serves that school's public website with no admin chrome.
*   **Database:** File-based **H2** locally; **PostgreSQL (Neon)** in production via the `prod` Spring profile. Schema is managed by **Flyway** migrations (`V1`–`V22`), including scale indexes for large student datasets.
*   **Security:** Admin passwords are **BCrypt-hashed** (legacy plaintext auto-upgrades on login); passwords/OTP are never returned in responses.
*   **Site Configurations (`SiteConfig.java`):** Persists all design tokens, theme presets, colors, custom logos, contact info, and generic settings like animated announcement banners.
*   **Page Sections (`PageSection.java`):** Persists dynamic pages structured as ordered lists of components. The layout configuration is stored as a flexible JSON string (`config` column) to support versatile front-end schemas without schema-churn.
*   **Academics & Gradebooks:** Handles curriculum programs, syllabus catalogs, and dynamic parent gradebook lookup records.
*   **Regulatory CBSE Disclosures:** Dynamically serves public legal disclosures and board appendix records.
*   **Verification Office (TC):** Handles legal CBSE-compliant student Transfer Certificates.

### REST Endpoints (highlights):
*   `/api/sites/bootstrap?host=` (GET): **Single aggregated call** returning tenant + config + pages + catalogs + news/events so a public site paints in one round-trip. Host→tenant and full-payload are cached (short TTL) with event-driven eviction on changes.
*   `/api/admin/tenants/resolve?host=` (GET): Resolves the owning tenant from a browser host (custom domain / subdomain).
*   `/api/sites/{tenantId}/config` (PUT): Updates school logo, theme colors, announcement banner, and Admissions Promo popup config.
*   `/api/sites/{tenantId}/grades|invoices|admissions .../paged` (GET): Server-side pagination for large student datasets; `/invoices/stats` returns DB-computed billing totals.
*   `/api/sites/pages/{pageId}/sections` (PUT): Saves and compiles layout sections dynamically.
*   `/api/sites/{tenantId}/pages` (POST): Pre-seeds pages with standard CBSE board template structures.

---

## 2. School Website Frontend (`school-website-frontend`)

The frontend is built with **Angular (v21+)** using standalone, reactive components and modern signal-based state management.

### Key Capabilities & Components:
*   **Branding & Styling (`branding-settings.ts`):** Renders custom brand theme options. Updates site Primary, Secondary, and Accent color tokens dynamically into document CSS Custom Properties (`--tenant-primary`, etc.) for real-time CSS reactivity.
*   **Page Builder Workspace (`page-builder.ts`):** Allows admins to pre-seed CBSE-compliant pages (Home, Admissions, Careers, Disclosures, TC lookup) and add/remove ordered page sections.
*   **Modern Announcement Banner:** A sleek, dismissible gradient strip with smooth CSS-based scrolling text (replaces the legacy `<marquee>`), a pill CTA, and pause-on-hover. Clicking the button navigates to the target detail page based on custom redirect slugs.
*   **Admissions Promo Popup:** A configurable, dismissible full-screen splash (hero video, feature boxes, admission process/requirements, cursive footer) shown only on the public site. Enabled and edited from Branding Settings; dismissal remembered per session.
*   **Direct-Domain Public Sites:** When opened via a tenant's custom domain/subdomain, the app runs in public-only mode (no admin console), loads the school via the single bootstrap call, and shows a branded loading/error screen with automatic retry (handles backend cold starts gracefully).
*   **Scalable Admin Lists:** Gradebook, Billing, and Admissions lists are paginated (with a shared pager) to stay fast at hundreds of thousands of student records; billing totals are computed server-side.
*   **Widescreen Workspace:** The entire admin panel and public sandbox are optimized for an ultra-widescreen `max-width: 100%` edge-to-edge layout.
*   **Sticky Footer:** Implemented using standard CSS Flexbox sticky parameters to guarantee the brand footer is permanently pinned to the absolute bottom of the viewport on pages with little to no content.

### Dynamic Media Uploads & Lists:
*   **Image Carousel:** Supports an unlimited list of slide images with customizable captions. File picker reads local files as Base64 data URLs to store them inside the page section configuration.
*   **Video Highlights Grid:** Renders video cards in a clean, responsive layout. Supports playing both embedded YouTube/Vimeo links and local uploaded video file playbacks.
*   **Branded Logo Uploader:** Allows administrators to select default emojis or upload their own school crest file (rendered as a circular frame in the header). Includes an **"Upload & Save Logo"** action that persists just the logo instantly, with a live preview — no need to submit the whole branding form.
