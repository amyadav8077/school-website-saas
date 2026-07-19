# School Website SaaS Platform - Project Overview

This multi-tenant SaaS School Website Builder and Administrative Portal is split into two co-operating, highly responsive services: **School Website Backend (Spring Boot)** and **School Website Frontend (Angular)**.

---

## 1. School Website Backend (`school-website-backend`)

The backend is built with **Spring Boot** and **Java 17/Jakarta Persistence**. It serves as a secure, stateless REST API and multi-tenant persistence layer.

### Core Architecture & Domain Model:
*   **Tenants (`Tenant.java`):** Supports multi-tenancy. Every school has its own custom name, subdomain, and isolated portal configurations.
*   **Site Configurations (`SiteConfig.java`):** Persists all design tokens, theme presets, colors, custom logos, contact info, and generic settings like animated announcement banners.
*   **Page Sections (`PageSection.java`):** Persists dynamic pages structured as ordered lists of components. The layout configuration is stored as a flexible JSON string (`config` column) to support versatile front-end schemas without schema-churn.
*   **Academics & Gradebooks:** Handles curriculum programs, syllabus catalogs, and dynamic parent gradebook lookup records.
*   **Regulatory CBSE Disclosures:** Dynamically serves public legal disclosures and board appendix records.
*   **Verification Office (TC):** Handles legal CBSE-compliant student Transfer Certificates.

### REST Endpoints:
*   `/api/sites/{tenantId}/config` (PUT): Updates school logo, theme colors, and marquee banner.
*   `/api/sites/pages/{pageId}/sections` (PUT): Saves and compiles layout sections dynamically.
*   `/api/sites/{tenantId}/pages` (POST): Pre-seeds pages with standard CBSE board template structures.

---

## 2. School Website Frontend (`school-website-frontend`)

The frontend is built with **Angular (v21+)** using standalone, reactive components and modern signal-based state management.

### Key Capabilities & Components:
*   **Branding & Styling (`branding-settings.ts`):** Renders custom brand theme options. Updates site Primary, Secondary, and Accent color tokens dynamically into document CSS Custom Properties (`--tenant-primary`, etc.) for real-time CSS reactivity.
*   **Page Builder Workspace (`page-builder.ts`):** Allows admins to pre-seed CBSE-compliant pages (Home, Admissions, Careers, Disclosures, TC lookup) and add/remove ordered page sections.
*   **Animated Announcement Banner:** Renders a gorgeous marquee alert at the absolute top of the public website. Clicking the button automatically navigates the visitor directly to the target detail page (Admissions form, News bulletins, etc.) based on custom redirect slug paths.
*   **Widescreen Workspace:** The entire admin panel and public sandbox are optimized for an ultra-widescreen `max-width: 100%` edge-to-edge layout.
*   **Sticky Footer:** Implemented using standard CSS Flexbox sticky parameters to guarantee the brand footer is permanently pinned to the absolute bottom of the viewport on pages with little to no content.

### Dynamic Media Uploads & Lists:
*   **Image Carousel:** Supports an unlimited list of slide images with customizable captions. File picker reads local files as Base64 data URLs to store them inside the page section configuration.
*   **Video Highlights Grid:** Renders video cards in a clean, responsive layout. Supports playing both embedded YouTube/Vimeo links and local uploaded video file playbacks.
*   **Branded Logo Uploader:** Allows administrators to select default emojis or upload their own school crest file (automatically rendered as a circular frame with hover animation in the header).
