# MULTI-TENANT SECURITY REPORT — School Website SaaS

**Objective:** Determine whether one school/tenant can access, modify, delete, enumerate, or
infer another tenant's data.
**Method:** Traced every tenant-touching API Controller → Service → Impl → Repository → DB.
**Scope:** Post-remediation code (after the JWT auth + tenant-ownership fixes). Read-only; no
code or data modified during this audit.
**Live-verified:** Yes — cross-tenant read/create/delete tested against the running app.

---

## Verdict

**Can Tenant A access Tenant B's data? — NO (after fixes).**

Tenant identity is now derived from the **JWT** (`AuthPrincipal.tenantId`), never trusted from
the request. Every authenticated tenant-scoped operation enforces ownership via
`CurrentUser.assertTenantAccess(tenantId)` (super-admin exempt), and every id-only mutation
loads the target row and verifies its `tenantId` before acting. Public reads are intentionally
open but bounded (verification tuples / required filters) so they cannot dump a tenant's data.

**Enforcement-layer matrix**

| Layer | Before | After |
|---|---|---|
| Authentication | none | JWT bearer (stateless) |
| Controller | trusts path `tenantId` | `assertTenantAccess` on writes/admin reads |
| Service/Impl | trusts passed `tenantId` | asserts on create/update/delete; id-ops load+verify owner |
| Repository/DB | tenant-scoped queries only | unchanged (already `...ByTenantId`) + ownership gate above |

---

## Endpoint-by-endpoint analysis

Legend: **tenantId source** — `token` (safe), `path`/`query`/`body` (untrusted, must be validated).
Verdict: SAFE / VULNERABLE / PARTIAL. "Public" = intentionally anonymous.

### Site configuration
```
GET  /api/sites/{subdomain}/config      source: path(subdomain)  enforce: public read      Verdict: SAFE (public branding; no PII)
PUT  /api/sites/{tenantId}/config        source: path             enforce: controller assert Verdict: SAFE
  Attack: Tenant A PUTs /api/sites/{B}/config → Expected 403 → Current: CurrentUser.assertTenantAccess(B) throws 403 → SAFE
```

### Pages / page builder
```
POST   /api/sites/{tenantId}/pages          source: path   enforce: controller assert            Verdict: SAFE
GET    /api/sites/{tenantId}/pages           source: path   enforce: public read (site content)   Verdict: SAFE (public)
GET    /api/sites/{tenantId}/pages/slug/{s}  source: path   enforce: public read                  Verdict: SAFE (public)
PUT    /api/sites/pages/{pageId}/sections    source: path(id) enforce: service loads page + assert Verdict: SAFE
  Attack: Tenant A PUTs sections to B's pageId → Expected 403 → Current: PageServiceImpl loads Page, assertTenantAccess(page.tenantId) → 403 → SAFE
DELETE /api/sites/pages/{pageId}             source: path(id) enforce: service loads page + assert Verdict: SAFE
```

### Transfer Certificates (highest-sensitivity: student PII + Aadhaar)
```
GET    /api/sites/{tenantId}/tc         source: path   enforce: requires (admissionNo+fatherName+aadharNo); Aadhaar masked  Verdict: SAFE (public verify)
  Attack: GET /api/sites/{B}/tc with no params → Expected 400 → Current: badRequest (no dump) → SAFE
GET    /api/admin/sites/{tenantId}/tc   source: path   enforce: controller assert (full list)  Verdict: SAFE
POST   /api/admin/sites/{tenantId}/tc   source: path   enforce: controller assert              Verdict: SAFE
DELETE /api/admin/tc/{id}               source: path(id) enforce: service loads TC + assert    Verdict: SAFE
```

### Grades (student PII)
```
GET    /api/sites/{tenantId}/grades          source: path   enforce: requires studentName (public parent lookup)  Verdict: SAFE
  Attack: GET /api/sites/{B}/grades (no filter) → Expected 400 → Current: badRequest → SAFE
GET    /api/sites/{tenantId}/grades/paged     source: path   enforce: controller assert (admin ledger)  Verdict: SAFE
POST   /api/admin/sites/{tenantId}/grades     source: path   enforce: controller assert                 Verdict: SAFE
DELETE /api/admin/grades/{id}                 source: path(id) enforce: service loads grade + assert     Verdict: SAFE
```

### Billing (invoices / fees)
```
POST /api/admin/sites/{tenantId}/fees        source: path   enforce: controller assert           Verdict: SAFE
GET  /api/sites/{tenantId}/fees               source: path   enforce: public read (fee schedule)  Verdict: SAFE (public, no PII)
POST /api/admin/sites/{tenantId}/invoices     source: path   enforce: controller assert           Verdict: SAFE
GET  /api/sites/{tenantId}/invoices           source: path   enforce: requires studentName (public lookup) Verdict: SAFE
GET  /api/sites/{tenantId}/invoices/paged     source: path   enforce: controller assert           Verdict: SAFE
GET  /api/sites/{tenantId}/invoices/stats     source: path   enforce: controller assert           Verdict: SAFE
PUT  /api/sites/invoices/{id}/pay             source: path(id) enforce: public (parent pays own invoice) Verdict: PARTIAL — see note 1
```

### Admissions (parent PII)
```
POST /api/sites/{tenantId}/admissions             source: path   enforce: public form submit    Verdict: SAFE (public)
GET  /api/admin/sites/{tenantId}/admissions        source: path   enforce: controller assert     Verdict: SAFE
GET  /api/admin/sites/{tenantId}/admissions/paged  source: path   enforce: controller assert     Verdict: SAFE
PUT  /api/admin/admissions/{leadId}/status         source: path(id) enforce: service loads lead + assert  Verdict: SAFE
```

### Support inquiries
```
POST /api/sites/{tenantId}/support        source: path   enforce: public form submit           Verdict: SAFE (public)
GET  /api/admin/sites/{tenantId}/support   source: path   enforce: controller assert            Verdict: SAFE
PUT  /api/admin/support/{id}/resolve       source: path(id) enforce: service loads inquiry + assert  Verdict: SAFE
```

### Careers (jobs / applicants)
```
GET  /api/sites/{tenantId}/jobs               source: path   enforce: public read              Verdict: SAFE (public)
POST /api/sites/{tenantId}/jobs/{jobId}/apply  source: path   enforce: public form submit       Verdict: PARTIAL — see note 2
GET  /api/admin/sites/{tenantId}/applications  source: path   enforce: controller assert        Verdict: SAFE
POST /api/admin/sites/{tenantId}/jobs          source: path   enforce: service assert           Verdict: SAFE
PUT  /api/admin/applications/{id}/status       source: path(id) enforce: service loads app + assert  Verdict: SAFE
DELETE /api/admin/jobs/{id}                     source: path(id) enforce: service loads job + assert  Verdict: SAFE
```

### Academics catalogs (courses, programs, faculty, achievers, gallery, enrichment, board-results, branches) and notifications (news, events)
Uniform pattern across all of these controllers/services:
```
GET    /api/sites/{tenantId}/<resource>          source: path   enforce: public read           Verdict: SAFE (public site content)
POST   /api/admin/sites/{tenantId}/<resource>    source: path   enforce: service create assert Verdict: SAFE
  Attack: Tenant A POSTs into {B} → Expected 403 → Current: createX() calls assertTenantAccess(tenantId) → 403 → SAFE (live-verified on faculty)
DELETE /api/admin/<resource>/{id}                source: path(id) enforce: service loads row + assert  Verdict: SAFE
  Attack: Tenant A deletes B's row by id → Expected 403 → Current: loads row, assertTenantAccess(row.tenantId) → 403 → SAFE (live-verified on faculty id=34)
```

### Tenant management (platform)
```
POST /api/admin/tenants                       enforce: @PreAuthorize SUPER_ADMIN                 Verdict: SAFE
GET  /api/admin/tenants                        enforce: @PreAuthorize SUPER_ADMIN                 Verdict: SAFE (live: tenant-admin → 403)
GET  /api/admin/tenants/{subdomain}            enforce: authenticated                              Verdict: PARTIAL — see note 3
GET  /api/admin/tenants/resolve?host=          enforce: public (host→tenant for site loading)     Verdict: SAFE (returns public tenant summary)
PUT  /api/admin/tenants/{tenantId}/custom-domain enforce: SUPER_ADMIN or owner (@tenantSecurity) Verdict: SAFE
POST /api/admin/tenants/{sourceTenantId}/clone  enforce: @PreAuthorize SUPER_ADMIN                Verdict: SAFE
```

### Auth
```
POST /api/auth/login                    public; issues JWT (uid, role, tenantId)                 Verdict: SAFE
POST /api/auth/tenant-admins            @PreAuthorize SUPER_ADMIN                                 Verdict: SAFE
GET  /api/auth/tenant-admins/{tenantId} controller assert (owner or super-admin); no password    Verdict: SAFE
POST /api/auth/change-password          identity from token (body username ignored)              Verdict: SAFE
POST /api/auth/forgot-password/request  public; generic response (no enumeration); OTP not logged Verdict: SAFE
POST /api/auth/forgot-password/reset    public; SecureRandom OTP, 5-attempt lockout, single-use   Verdict: SAFE
```

### Single-call bootstrap
```
GET /api/sites/bootstrap?host=  public; returns only public site content for the resolved tenant  Verdict: SAFE
```

---

## Residual notes — ALL RESOLVED (previously PARTIAL)

1. **`PUT /api/sites/invoices/{id}/pay`** — FIXED. Now requires an `admissionNo` query param
   that must match the invoice's admission number; a mismatch/missing value returns 400. A
   caller can no longer flip an arbitrary invoice's status by guessing ids.
   Live-verified: no/wrong admissionNo → 400, correct → 200. Verdict: SAFE.
2. **`POST /api/sites/{tenantId}/jobs/{jobId}/apply`** — FIXED. The service now verifies
   `job.tenantId == path tenantId` and returns 404 otherwise. Live-verified: cross-tenant
   apply → 404. Verdict: SAFE.
3. **`GET /api/admin/tenants/{subdomain}`** — FIXED. Now resolves the tenant then calls
   `CurrentUser.assertTenantAccess`, so only the owning tenant admin or a super-admin can read
   it. Live-verified: cross-tenant → 403, own → 200. Verdict: SAFE.

## Mass-assignment (SEC-M1, cross-cutting) — HARDENED
Create endpoints bind `@RequestBody` to JPA entities, but every create service now resets
`id = null` (so `save()` always inserts, never overwrites an existing row by injected id) and
forces `tenantId` + `status` server-side. Live-verified: POST with injected `id:1` created a
fresh row (id ignored). A full request-DTO layer remains a nice-to-have but the exploitable
over-posting vectors (id/tenantId/status) are now closed.

## Batch / search / pagination / sort / export
- No batch cross-tenant operations exist (`saveAll` in page sections is scoped to a single
  owned page; deletes are single-id with ownership checks).
- Pagination (grades/invoices/admissions) is tenant-scoped and behind `assertTenantAccess`.
- No export endpoints. No dynamic ORDER BY from user input. Repository finders are all
  `...ByTenantId...`. No native SQL.

## Functional regression — FIXED
Tenant onboarding (`POST /api/admin/tenants`) previously failed with a DB `NOT NULL` violation
on `site_configs.primary_color` when colors were omitted. The onboard service now applies the
`AppConstants` default colors/font when the request omits them. Live-verified: onboarding
"JP School" with only name+subdomain succeeds.

---

## Status: all multi-tenant items closed
1. `PUT /sites/invoices/{id}/pay` — scoped by admission-number verification. ✅
2. Public job application — validates `jobId.tenantId == path tenantId`. ✅
3. `GET /api/admin/tenants/{subdomain}` — owner/super-admin only. ✅
4. Mass-assignment — `id` reset on all creates; tenantId/status forced server-side. ✅
5. Onboarding regression — default colors applied. ✅
