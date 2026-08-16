# SECURITY AUDIT SUMMARY — School Website SaaS Platform

**Audit type:** Read-only source, config, dependency, and CI/CD review. No code, data, or credentials modified.
**Scope:** `school-website-backend` (Spring Boot 4 / Java 17), `school-website-frontend` (Angular 21), deploy config (Render/Vercel/Neon), GitHub Actions.

## Overall Security Risk: **CRITICAL**

The platform currently has **no server-side authentication or authorization on any business endpoint**. Every `/api/admin/**` and `/api/sites/**` route is `permitAll()`, and no controller/service checks the caller's identity or tenant. Tenant isolation exists only as a convention (the client sends the "right" `tenantId`). An attacker who changes a number in a URL can read, modify, and delete **any school's data**, including student PII and Aadhaar numbers on Transfer Certificates.

### Total Findings
| Severity | Count |
|---|---|
| Critical | 5 |
| High | 6 |
| Medium | 8 |
| Low | 5 |
| Informational | 4 |

---

# CRITICAL FINDINGS

## [SEC-C1] No authentication/authorization on any business endpoint (Broken Access Control)
**Severity:** CRITICAL
**Affected Files:** `config/SecurityConfig.java` (lines 27–33)
**Affected Endpoints:** `/api/admin/**`, `/api/sites/**`, `/api/auth/**` (all)
**Description:** `SecurityConfig` explicitly `permitAll()` for `/api/auth/**`, `/api/admin/**`, and `/api/sites/**`. Session policy is `STATELESS` and there is **no JWT, session, API key, or filter** that establishes a caller identity. No controller or service uses `Authentication`, `Principal`, `SecurityContext`, `@PreAuthorize`, `@Secured`, or `@RolesAllowed` (verified: zero matches across the codebase).
**Attack Scenario:** An attacker sends `POST /api/admin/sites/5/grades`, `DELETE /api/admin/tc/42`, `PUT /api/sites/7/config`, or `POST /api/admin/tenants` directly with `curl` — no token needed. Login is cosmetic; the "role" is only enforced in the Angular UI.
**Impact:** Full read/write/delete on every tenant's data; tenant creation; admin credential provisioning. Complete platform compromise.
**Recommended Fix:** Introduce real authentication (JWT bearer or server session) issued at `/api/auth/login`. Lock down `/api/admin/**` to authenticated admins and `/api/sites/**` writes to the owning tenant; keep only genuinely public reads (`/api/health`, public `GET` site content, `bootstrap`, public form POSTs) open. Add method/route authorization and derive `tenantId` from the authenticated principal, not the URL.
**How to Verify Fix:** `curl` each admin/write endpoint with no token → expect `401`; with a Tenant A token against Tenant B's id → expect `403`.

## [SEC-C2] Cross-tenant data access & IDOR on tenant-scoped reads/writes
**Severity:** CRITICAL
**Affected Files:** every controller under `/api/sites/{tenantId}/**` and `/api/admin/sites/{tenantId}/**` (e.g. `SiteConfigController`, `PageController`, `StudentGradeController`, `BillingController`, `AdmissionLeadController`, `TransferCertificateController`, all `academics/controller/*`).
**Affected Endpoints:** `GET/PUT /api/sites/{tenantId}/config`, `GET /api/sites/{tenantId}/grades`, `GET /api/admin/sites/{tenantId}/admissions`, etc.
**Description:** `tenantId` is taken straight from the path and trusted. There is no check that the caller belongs to that tenant (compounded by SEC-C1). Repositories are correctly tenant-scoped (`findByTenantId...`), but nothing stops a caller from supplying **any** `tenantId`.
**Attack Scenario:** `GET /api/admin/sites/2/admissions` returns Tenant 2's parent leads (names, emails, phones); iterate `tenantId=1..N` to scrape every school.
**Impact:** Horizontal privilege escalation / mass cross-tenant PII exfiltration.
**Recommended Fix:** Derive the tenant from the authenticated principal and ignore/validate the path `tenantId` against it. For super-admin, allow explicit cross-tenant access only.
**How to Verify Fix:** As Tenant A, request Tenant B's `tenantId` → `403`.

## [SEC-C3] IDOR on id-only mutations (delete/update by raw ID, no ownership check)
**Severity:** CRITICAL
**Affected Files:** `PageController.updateSections`/`deletePage` (pageId), and all `@DeleteMapping("/admin/.../{id}")`: `TransferCertificateController` (`/admin/tc/{id}`), `StudentGradeController` (`/admin/grades/{id}`), `BillingController`, `academics/controller/*` (faculty, gallery, achievers, enrichment, jobs, board-results, branches, programs, courses), `notifications/*` (news, events). Service impls call `repository.deleteById(id)` / `findById(id)` with no tenant predicate (confirmed in `PageServiceImpl.updatePageSections`, `TransferCertificateServiceImpl.deleteTC`).
**Affected Endpoints:** `PUT /api/sites/pages/{pageId}/sections`, `DELETE /api/sites/pages/{pageId}`, `DELETE /api/admin/tc/{id}`, `DELETE /api/admin/grades/{id}`, etc.
**Description:** These operate on a global primary key with no tenant/ownership validation. `updatePageSections` fetches the page by id, deletes its sections, and rewrites them — for **any** page in the DB.
**Attack Scenario:** `DELETE /api/admin/tc/1000` walks the id space and deletes another school's certificates; `PUT /api/sites/pages/55/sections` overwrites another school's homepage with attacker content (also a stored-XSS vector — see SEC-H4).
**Impact:** Cross-tenant tampering, defacement, and destruction of data.
**Recommended Fix:** Every id-based mutation must verify the target row's `tenantId` equals the caller's tenant before acting (`findByIdAndTenantId`, or load + assert). Return `404` (not `403`) to avoid existence disclosure.
**How to Verify Fix:** Attempt to delete/update a row belonging to another tenant → `404`.

## [SEC-C4] Transfer Certificate lookup dumps all student PII (incl. Aadhaar) without verification
**Severity:** CRITICAL
**Affected Files:** `academics/controller/TransferCertificateController.java` (lines 23–31), `TransferCertificateServiceImpl.searchTCs` (final branch `findByTenantIdOrderByIssueDateDesc`).
**Affected Endpoint:** `GET /api/sites/{tenantId}/tc` (all query params optional)
**Description:** The public TC "verify & download" endpoint accepts all verification fields as optional. Calling it with **no parameters** falls through to returning **every** TC for the tenant — including `studentName`, `admissionNo`, `fatherName`, and `aadharNo`.
**Attack Scenario:** `GET /api/sites/3/tc` → full dump of Tenant 3's transfer certificates with Aadhaar numbers. Combined with SEC-C2, dump all tenants.
**Impact:** Mass exposure of minors' PII and government identifiers — severe privacy/regulatory (DPDP Act) breach.
**Recommended Fix:** Require a minimum verification tuple (e.g. `admissionNo` + `aadharNo` + `fatherName`, or `tcNumber` + one identifier); reject empty/broad queries; never return `aadharNo` in the response body (mask it). Rate-limit lookups.
**How to Verify Fix:** `GET /api/sites/{id}/tc` with no/weak params → `400`; a valid single-record verification → one record with masked Aadhaar.

## [SEC-C5] Password reset / OTP flow allows account takeover (no rate limit, user enumeration, weak OTP store)
**Severity:** CRITICAL
**Affected Files:** `auth/controller/AuthController` (`/forgot-password/request`, `/reset`), `auth/impl/AuthServiceImpl.issueOtp/verifyOtp`, `auth/util/OtpUtil`.
**Affected Endpoints:** `POST /api/auth/forgot-password/request`, `POST /api/auth/forgot-password/reset`
**Description:** `/request` returns `404` "no account found" vs `200` — **user/contact enumeration**. There is **no rate limiting** on `/request` or `/reset`, and OTP verification (`OtpUtil`) has no attempt-lockout. Any admin's password can be reset by brute-forcing the OTP (short numeric code) for a known email/phone. `/change-password` also takes `username` in the body and (given SEC-C1) is unauthenticated.
**Attack Scenario:** Attacker submits a target admin email, then scripts `/reset` guessing the OTP until it succeeds, then sets a new password and logs in.
**Impact:** Admin account takeover → tenant (or super-admin) takeover.
**Recommended Fix:** Rate-limit + lockout on request/verify; generic response regardless of account existence; sufficient OTP entropy + max attempts + single-use + short TTL (already single-use/TTL — add attempt cap and throttling); require authentication for `/change-password` and derive the user from the token.
**How to Verify Fix:** Enumeration returns identical response; N wrong OTPs locks the flow; `/change-password` without a token → `401`.

---

# HIGH FINDINGS

## [SEC-H1] CORS allows any origin with credentials
**Severity:** HIGH
**Affected Files:** `config/SecurityConfig.java` (lines 44–53)
**Description:** `setAllowedOriginPatterns(List.of("*"))` + `setAllowCredentials(true)` + all methods/headers. This reflects any origin and permits credentialed cross-site requests.
**Attack Scenario:** Once cookie/session auth is added, any malicious site could make authenticated calls on a victim admin's behalf. Even today it broadens the attack surface for browser-based abuse.
**Impact:** Cross-site request forgery / credential misuse once auth exists.
**Recommended Fix:** Restrict `allowedOriginPatterns` to the Vercel app domain(s) and tenant custom domains (a controlled allowlist or pattern), keep `allowCredentials` only if truly needed.

## [SEC-H2] No request size / upload limits — DoS via giant Base64 media
**Severity:** HIGH
**Affected Files:** `application.properties` / `application-prod.properties` (no `spring.servlet.multipart.*` / `server.tomcat.max-http-*`), `siteconfiguration` config JSON, page-builder `config` JSON storing Base64 images/video.
**Description:** Logos and carousel/media are stored as Base64 inside JSON config with no size cap; no max request body configured. A single `PUT /config` or page-section save can be hundreds of MB.
**Attack Scenario:** Attacker POSTs multi-hundred-MB payloads repeatedly → memory pressure, DB bloat, service outage.
**Impact:** Application-level denial of service; storage exhaustion.
**Recommended Fix:** Set max HTTP request size and multipart limits; cap logo/media payload size server-side (frontend already caps logo at 1 MB — enforce on server too); prefer object storage + URL over inline Base64 for large media.

## [SEC-H3] No rate limiting on any endpoint (login, OTP, public forms, search, uploads)
**Severity:** HIGH
**Affected Files:** whole API (no filter/bucket); notably `AuthController.login`, forgot-password, `AdmissionLeadController` (public POST), `SupportInquiryController` (public POST), TC/grades/invoice search.
**Description:** No throttling anywhere. Enables brute-force login, OTP guessing, tenant enumeration, form spam, and scraping.
**Impact:** Credential attacks, spam, scraping, resource exhaustion.
**Recommended Fix:** Add rate limiting (e.g. Bucket4j / gateway) keyed by IP + account on auth and public write/search endpoints; stricter limits on login/OTP.

## [SEC-H4] Stored XSS via page-builder / config content and unsanitized URL binding
**Severity:** HIGH
**Affected Files:** frontend `app.ts:631` and `pages/gallery/campus-gallery.component.ts:170` (`bypassSecurityTrustResourceUrl` on tenant-supplied URLs); page-section `config` JSON rendered into the public site; promo `promoVideoUrl` bound to a video/iframe source.
**Description:** Admin-controlled content (section config, media URLs, promo video URL) is rendered on the public tenant site. `bypassSecurityTrustResourceUrl` disables Angular's sanitizer, allowing `javascript:`/data URIs or hostile embeds. Combined with SEC-C3 (any tenant can overwrite another tenant's page sections), this becomes **cross-tenant stored XSS**.
**Attack Scenario:** Attacker writes a malicious section/URL into a victim school's page; every visitor to that school's site executes attacker JS (session theft once auth exists, defacement, drive-by).
**Impact:** Stored XSS against public visitors and admins; brand/defacement.
**Recommended Fix:** Validate/allowlist embeddable URL schemes and hosts (https + known video providers) before trusting; avoid `bypassSecurityTrust*` on user input; sanitize/escape rendered config content; enforce a Content-Security-Policy.

## [SEC-H5] Missing security response headers (CSP, HSTS, X-Frame-Options, etc.)
**Severity:** HIGH
**Affected Files:** `SecurityConfig.java` (no `headers(...)` config); no CSP anywhere.
**Description:** No CSP, HSTS, X-Content-Type-Options, X-Frame-Options/frame-ancestors, Referrer-Policy, or Permissions-Policy. Increases XSS/clickjacking impact.
**Impact:** Amplifies XSS (SEC-H4), allows framing/clickjacking, MIME sniffing.
**Recommended Fix:** Configure security headers in Spring Security (and/or Vercel). Add a strict CSP, `X-Content-Type-Options: nosniff`, `frame-ancestors 'none'`, HSTS on HTTPS.

## [SEC-H6] Sensitive data logged (OTP, PII, usernames) & verbose auth logging
**Severity:** HIGH
**Affected Files:** `AuthServiceImpl.logOtpToConsole` (line 216 logs OTP + contact), `authenticate`/`updatePassword` log usernames; historical prod `DEBUG` logging (now INFO/WARN after prior session, but security still WARN).
**Description:** OTP codes and contact info are written to logs (Render logs are readable by anyone with dashboard access; also a retention risk). Logging OTPs defeats the OTP control.
**Impact:** Log-based account takeover; PII in logs.
**Recommended Fix:** Never log OTPs or contact PII; remove `logOtpToConsole`. Redact identifiers in auth logs.

---

# MEDIUM FINDINGS

## [SEC-M1] Full JPA entities returned (excessive data exposure / over-posting)
**Severity:** MEDIUM
**Affected Files:** academics/grades/billing/notifications controllers return entities directly (`List<StudentGrade>`, `List<TransferCertificate>`, `List<StudentInvoice>`, etc.); create endpoints bind request bodies straight to entities (`@RequestBody TransferCertificate`, `@RequestBody StudentGrade`, `@RequestBody StudentInvoice`).
**Description:** Responses expose all columns (incl. `aadharNo`, internal ids, timestamps). Binding the request body to the JPA entity enables **mass assignment / over-posting** (e.g. client sets `tenantId`, `id`, `status`). Note `issueTC`/`addGrade` overwrite `tenantId` server-side, but other create paths should be checked.
**Recommended Fix:** Use request/response DTOs; never bind untrusted bodies to entities; whitelist fields; mask sensitive columns.

## [SEC-M2] User/tenant enumeration via distinct responses
**Severity:** MEDIUM
**Affected Files:** `AuthController` forgot-password (`404` vs `200`), tenant resolve/`/tenant-admins/{tenantId}` responses, `resolveByHost` 404 vs 200.
**Recommended Fix:** Return generic responses for auth-adjacent lookups; don't reveal account/tenant existence.

## [SEC-M3] `bootstrap`/public reads expose config JSON that may contain internal data
**Severity:** MEDIUM
**Affected Files:** `bootstrap/service/SiteBootstrapService`, `SiteConfigController` — `socialLinks` JSON is returned wholesale.
**Description:** Everything in `socialLinks`/config is public. If any internal or admin-only field is ever stored there, it leaks. Currently banner/promo/social — acceptable, but the pattern is risky.
**Recommended Fix:** Return an explicit public projection; never round-trip raw admin blobs to anonymous callers.

## [SEC-M4] SSRF/abuse via user-supplied media/video URLs
**Severity:** MEDIUM
**Affected Files:** promo `promoVideoUrl`/`promoPosterUrl`, gallery/section media URLs (rendered client-side; if any server-side fetch/preview is added later this becomes server SSRF).
**Description:** Currently URLs are client-rendered (browser-side SSRF/XSS), not server-fetched, so server SSRF risk is low today — but the "website preview" pattern and any future server fetch would be exploitable.
**Recommended Fix:** Allowlist schemes/hosts; if server-side fetching is added, block localhost/private/link-local/metadata ranges.

## [SEC-M5] No CSRF protection (acceptable only while token-based)
**Severity:** MEDIUM
**Affected Files:** `SecurityConfig.csrf(disable)`.
**Description:** CSRF is disabled. Fine for a pure bearer-token API, but combined with `allowCredentials(true)` + `*` origins (SEC-H1), cookie-based auth would be CSRF-exploitable.
**Recommended Fix:** Keep API stateless with bearer tokens (no cookies), or enable CSRF if cookies are used; fix CORS regardless.

## [SEC-M6] Verbose/leaky error handling not verified as production-safe
**Severity:** MEDIUM
**Affected Files:** global exception handling (`common/exception/*`), `/error` permitted.
**Description:** Ensure stack traces, SQL errors, and framework/version details are never returned to clients in prod. `AppException` gives structured errors, but default Spring error page and validation errors should be checked for leakage.
**Recommended Fix:** Confirm a sanitized global `@ControllerAdvice` for all exceptions; disable stack traces in prod responses.

## [SEC-M7] Public form spam (admissions/support/contact) — no validation depth or anti-abuse
**Severity:** MEDIUM
**Affected Files:** `AdmissionLeadController`, `SupportInquiryController`.
**Description:** Public POSTs with basic bean validation but no rate limiting, size caps, or spam controls → DB flooding, email abuse (if wired), PII injection.
**Recommended Fix:** Rate limit + size caps + optional lightweight bot mitigation on public forms.

## [SEC-M8] `TenantController` clone/onboard/custom-domain unauthenticated
**Severity:** MEDIUM (CRITICAL in combination with SEC-C1)
**Affected Files:** `tenantsubscription/controller/TenantController` (`POST /api/admin/tenants`, `/clone`, `PUT /custom-domain`).
**Description:** Anyone can create/clone tenants and hijack a domain mapping (`custom-domain` → point a rival domain at their tenant, or remap a victim's).
**Recommended Fix:** Restrict to SUPER_ADMIN once auth exists; validate domain ownership before mapping.

---

# LOW FINDINGS

## [SEC-L1] GitHub Actions workflow has no explicit `permissions` block
`.github/workflows/keep-backend-alive.yml` — add `permissions: contents: read` (least privilege). No secrets are printed (good).

## [SEC-L2] Local fallback DB creds `postgres/postgres` in `application-prod.properties`
Only used if env vars are unset; harmless in prod (env vars set) but remove misleading defaults for prod profile.

## [SEC-L3] `getTenantAdmin` still returns username for any tenantId
`GET /api/auth/tenant-admins/{tenantId}` leaks the admin username per tenant (no password now). Restrict to authorized callers.

## [SEC-L4] Frontend trusts client-held role/tenant (`activeRole`, `activeTenant`)
Expected for UI, but must never be the enforcement point. Listed to reinforce that all checks belong server-side.

## [SEC-L5] Hardcoded backend URL in `app.config.ts`
`https://school-backend-b6yr.onrender.com` is committed. Not secret, but should be environment-config; also differs from docs.

---

# INFORMATIONAL

- **[SEC-I1]** Good: passwords now BCrypt-hashed with legacy upgrade; passwords/OTP no longer returned in responses (fixed in a prior session).
- **[SEC-I2]** Good: secrets externalized via env vars; `.env` gitignored; only `.env.example` (placeholders) tracked. No actuator dependency; H2 console not enabled.
- **[SEC-I3]** Good: repositories are consistently tenant-scoped (`findByTenantId...`) — so the fix for isolation is "enforce the caller's tenant", not "rewrite queries".
- **[SEC-I4]** Reminder (out of scope to change per your instruction): the git remote URL embeds a GitHub PAT — should be revoked/rotated by you and moved to a credential helper.

---

# MULTI-TENANT ISOLATION REPORT

**Can Tenant A access Tenant B's data? — YES, trivially, today.**

- **Enforcement present at:** Repository layer only (queries are scoped by `tenantId`).
- **Enforcement missing at:** Authentication (none), Controller (trusts path `tenantId`), Service (trusts passed `tenantId`), Object-level (id-only deletes/updates ignore tenant).
- **Net effect:** Isolation is "honor system". Any caller supplies any `tenantId` or any row `{id}`.

**Suspicious/at-risk APIs (all of them; representative list):**
- `GET/PUT /api/sites/{tenantId}/config` — read/overwrite any school's branding/config.
- `GET /api/admin/sites/{tenantId}/admissions` (+`/paged`) — any school's parent leads (PII).
- `GET /api/admin/sites/{tenantId}/support` — any school's support tickets.
- `GET /api/admin/sites/{tenantId}/applications` — any school's job applicants.
- `GET /api/sites/{tenantId}/tc` — any school's TCs incl. Aadhaar (SEC-C4).
- `GET /api/sites/{tenantId}/grades|invoices` (+`/paged`, `/stats`) — any school's student grades/finances.
- `PUT /api/sites/pages/{pageId}/sections`, `DELETE /api/sites/pages/{pageId}` — edit/delete any page.
- `DELETE /api/admin/{tc|grades|news|events|faculty|gallery|achievers|enrichment|jobs|board-results|branches|programs|courses}/{id}` — delete any tenant's row.
- `POST /api/admin/tenants`, `/clone`, `PUT /custom-domain` — create/clone/hijack tenants & domains.

**Strongest recommended architecture:** Stateless JWT auth. Encode `tenantId` + `role` in the token at login. A servlet filter populates a `SecurityContext`/request-scoped `TenantContext`. **Services derive `tenantId` from context, never from the request.** All id-based reads/writes use `...AndTenantId(...)` (or assert ownership) and return `404` on mismatch. Super-admin is the only role allowed explicit cross-tenant access, gated by `@PreAuthorize`.

---

# AUTHENTICATION REPORT
- Password hashing: **BCrypt** ✅ (with safe legacy-plaintext upgrade).
- Login: returns identity JSON but **issues no token/session** — auth is not actually established. ❌
- Session/JWT/refresh/revocation: **none**. ❌
- `/change-password`: takes `username` from body, unauthenticated (SEC-C5). ❌
- OTP reset: single-use + TTL ✅ but no rate limit, no attempt cap, enumeration, OTP logged (SEC-C5/H6). ❌
- Default/seed creds: `admin/admin123`, `pioneer_admin/pioneer123` (hashed, but well-known — change in prod). ⚠️
- Tokens in URL/localStorage: only non-secret user profile in `sessionStorage` (no token exists yet). ✅ for now.

# AUTHORIZATION REPORT
- Roles present: `SUPER_ADMIN`, `TENANT_ADMIN` (backend), `SCHOOL_ADMIN`/`PARENT_VISITOR` (frontend UI states).
- Server-side enforcement: **none** — no `@PreAuthorize`, no principal checks (SEC-C1).
- Result: both **vertical** (normal user → admin/super-admin actions) and **horizontal** (Tenant A → Tenant B) privilege escalation are trivial.

# SECRETS REPORT
No secret values printed. Findings:
- **No hardcoded secrets found in tracked source.** ✅ (`.env` gitignored; `.env.example` holds placeholders only.)
- `SECRET-ADJACENT: file: school-website-backend/src/main/resources/application-prod.properties / lines 3-4 / type: DB fallback creds (postgres/postgres) / severity: LOW` (defaults only; overridden by env).
- `SECRET-EXPOSURE (out of scope): git remote URL contains a GitHub PAT / type: VCS token / severity: HIGH` — user chose to leave; recommend revoke+rotate.

# FILE UPLOAD REPORT
- No true multipart upload endpoint; media/logos are **Base64 in JSON config**. So classic upload-RCE risk is low, but:
  - **No server-side size limit** → DoS/storage bloat (SEC-H2).
  - **SVG/data-URI in media/logo** can carry script and is rendered client-side → XSS (relates to SEC-H4). Validate MIME/scheme server-side and sanitize on render.
  - No magic-byte/MIME validation; frontend-only 1 MB cap is bypassable.

# API SECURITY REPORT
- Methods/routing sane; but **authn/authz absent** (SEC-C1), **entities returned/bound directly** (SEC-M1), **no rate limiting** (SEC-H3), **no size caps** (SEC-H2). Pagination added for grades/invoices/admissions with a 100 cap ✅; other list endpoints (TC, support, applications, catalogs) are still unbounded lists.

# DEPENDENCY REPORT
- Backend: Spring Boot **4.1.0**, Java 17, Flyway, Redis, Security, Mail, Postgres, H2. Modern; no obviously abandoned libs. Run `./gradlew dependencies` + OWASP Dependency-Check to confirm CVEs.
- Frontend: Angular 21, GSAP. Run `npm audit` (do not auto-upgrade). Recommend enabling **Dependabot** on the repo.
- No dependency changes made during this audit (per instruction).

# CI/CD SECURITY REPORT
- Single workflow `keep-backend-alive.yml`: does not print secrets ✅, uses repo var/secret for URL ✅. **Missing least-privilege `permissions:` block** (SEC-L1). No PR-triggered workflow running untrusted code ✅. No deploy credentials in Actions (Render/Vercel auto-deploy from Git) ✅.

---

# SECURITY TEST PLAN (manual)

| # | Request | Expected (after fix) | Actual (current code) | Implication |
|---|---|---|---|---|
| 1 | `GET /api/admin/sites/2/admissions` with no token | 401 | **200 + Tenant 2 PII** | Cross-tenant PII (SEC-C2) |
| 2 | `GET /api/sites/3/tc` (no params) | 400 | **200 + all TCs incl. Aadhaar** | PII dump (SEC-C4) |
| 3 | `DELETE /api/admin/tc/1000` (other tenant) | 404 | **200 deletes it** | Cross-tenant destroy (SEC-C3) |
| 4 | `PUT /api/sites/pages/{B's id}/sections` with `<script>` | 403/404 | **overwrites page** | Cross-tenant stored XSS (SEC-C3/H4) |
| 5 | `PUT /api/sites/2/config` as Tenant 1 | 403 | **overwrites branding** | Cross-tenant tamper (SEC-C2) |
| 6 | `POST /api/admin/tenants` unauth | 401 | **creates tenant** | Unauth admin op (SEC-M8) |
| 7 | `POST /api/auth/forgot-password/request` unknown email | generic 200 | **404 (enumeration)** | User enumeration (SEC-C5/M2) |
| 8 | Brute-force `/forgot-password/reset` OTP | lockout after N | **no limit** | Account takeover (SEC-C5) |
| 9 | `POST /api/auth/change-password` other user, no token | 401 | **changes their password** | Takeover (SEC-C1/C5) |
| 10 | `PUT /api/sites/1/config` with 300MB Base64 | 413 | **accepted** | DoS (SEC-H2) |
| 11 | Cross-origin credentialed fetch from evil.com | blocked | **allowed by CORS** | CSRF surface (SEC-H1) |
| 12 | Set promo/media URL to `javascript:...`/hostile embed | sanitized/blocked | **trusted via bypass** | XSS (SEC-H4) |
| 13 | Inspect response headers | CSP/HSTS/nosniff present | **absent** | Weak hardening (SEC-H5) |
| 14 | Read Render logs after an OTP request | no OTP present | **OTP logged** | Log-based takeover (SEC-H6) |
| 15 | `PUT /api/admin/tenants/{id}/custom-domain` unauth | 401 | **remaps domain** | Domain hijack (SEC-M8) |

---

# TOP 10 FIXES (priority order)
1. **Add real authentication** (JWT) at `/api/auth/login`; establish `SecurityContext`. [SEC-C1/C5]
2. **Lock down `SecurityConfig`**: `/api/admin/**` = authenticated; `/api/sites/**` writes = owning tenant; keep minimal public reads/forms open. [SEC-C1]
3. **Derive `tenantId` from the token**, not the URL; validate path tenantId against it. [SEC-C2]
4. **Enforce object-level ownership** on every id-based read/update/delete (`...AndTenantId`, 404 on mismatch). [SEC-C3]
5. **Fix TC lookup**: require verification tuple, reject empty queries, mask Aadhaar, rate-limit. [SEC-C4]
6. **Harden password reset**: rate limit + attempt lockout + generic responses + stop logging OTP; authenticate `/change-password`. [SEC-C5/H6]
7. **Restrict CORS** to known frontend + tenant domains; reconsider `allowCredentials`. [SEC-H1]
8. **Add request/upload size limits** and server-side media size caps. [SEC-H2]
9. **Add rate limiting** on login/OTP/public forms/search. [SEC-H3]
10. **Add security headers + CSP** and stop trusting user URLs via `bypassSecurityTrust*`. [SEC-H4/H5]

---

# SECURITY HARDENING ROADMAP

**Phase 1 — Immediate critical (auth & isolation):** SEC-C1..C5. Introduce JWT + `SecurityConfig` lockdown + token-derived tenant + object-level ownership + TC verification + password-reset hardening. This closes the platform-compromise class.

**Phase 2 — High-risk:** SEC-H1..H6. CORS allowlist, request/upload size caps, rate limiting, XSS/URL sanitization, security headers/CSP, stop logging OTP/PII.

**Phase 3 — Hardening:** SEC-M1..M8, SEC-L1..L5. DTOs + anti-mass-assignment, enumeration-safe responses, public projections, public-form anti-abuse, restrict tenant/clone/domain ops, least-privilege Actions permissions, remove misleading defaults, config-driven backend URL.

**Phase 4 — Continuous monitoring:** Dependabot + `npm audit` + OWASP Dependency-Check in CI; add authz regression tests (cross-tenant/IDOR test suite); centralized redacted logging + alerting; periodic re-audit using this skill; backup/restore + least-privilege DB user (SEC backup review).
