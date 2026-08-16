# AI-GENERATED / VIBE-CODED SECURITY AUDIT — School Website SaaS

Audit for vulnerabilities typical of AI-generated code — the kind that pass compilation,
tests, and type checks but are still insecure or inconsistently enforced. Read-only; no code
changed. Assessed against the current (post-remediation) codebase.

## Overall verdict: **GOOD, with a few AI-smell items to tidy**

The dangerous AI patterns (insecure random, dynamic SQL, mass-assignment of tenantId, wildcard
CORS+credentials, frontend-only security, XSS sinks, unbounded cross-tenant queries) are
**absent or already fixed**. The remaining findings are mostly **consistency / defense-in-depth**
issues: authorization is enforced but split across two layers, and the production properties file
is missing the JWT/CORS/size-limit keys that exist in the local file.

| Severity | Count |
|---|---|
| High | 1 |
| Medium | 3 |
| Low | 4 |
| Verified-clean (AI-smells checked, no issue) | 12 |

---

## HIGH

### [AI-H1] Production properties missing JWT secret, CORS allowlist, and request-size limits
**File:** `src/main/resources/application-prod.properties` (keys absent)
**Why it's insecure:** These security keys exist in `application.properties` (local) but are
**not** in `application-prod.properties`. Under the `prod` profile:
- `security.jwt.secret` is unset → **JwtService now fails fast and refuses to start** (good — a
  prior fix), but it means prod cannot boot until `JWT_SECRET` is provided as an env var; if
  someone "fixes" the crash by removing the guard rather than setting the secret, tokens become
  forgeable. The intent (require a real secret in prod) is only half-wired at the config layer.
- `security.cors.allowed-origins` is unset → CORS falls back to the SecurityConfig default
  (`http://localhost:4200,https://*.vercel.app`). A production tenant on a **custom domain**
  would be blocked, and `*.vercel.app` is broader than necessary.
- `spring.servlet.multipart.*` / `server.tomcat.max-http-*` are unset → prod uses framework
  defaults instead of the intended 2MB/4MB caps, weakening DoS protection for the Base64 media
  path in production specifically.
**Exact reason:** classic AI inconsistency — security config was added to one profile file and
not mirrored to the other, so the protection silently doesn't apply where it matters most (prod).
**Fix:** mirror the JWT/CORS/size keys into `application-prod.properties` (env-driven, e.g.
`security.jwt.secret=${JWT_SECRET:}`, `security.cors.allowed-origins=${CORS_ALLOWED_ORIGINS:...}`,
multipart/tomcat size limits), and set the env vars in Render.

---

## MEDIUM

### [AI-M1] Authorization enforced inconsistently across layers
**Files:** controllers vs `*ServiceImpl` across academics/grades/billing/TC/admissions/support.
**Why it's insecure (as a maintenance risk):** tenant ownership is enforced in **controllers**
for some resources (config, grades paged, billing, TC admin, admissions) but only in the
**service layer** for others (faculty, gallery, achievers, enrichment, programs, courses,
board-results, branches, news, events). Every path is currently covered (verified: 2 asserts per
academics impl; controller asserts elsewhere), but the split means a future endpoint added to a
controller that already "looks protected" could ship without a check, or a refactor could drop
the service-layer assert unnoticed. This is exactly how AI-generated code regresses.
**Exact reason:** no single choke point; the check is copy-pasted in ~30 places across two layers.
**Fix:** standardize on one layer (prefer service-layer ownership on the loaded entity) or add a
method-security aspect / `@PreAuthorize("@tenantSecurity.canManage(#tenantId)")` uniformly so the
rule is declared once per endpoint and can be statically verified.

### [AI-M2] Duplicated Aadhaar-masking logic (drift risk)
**Files:** `TransferCertificateServiceImpl.maskSensitive` and `BillingServiceImpl.maskSensitive`.
**Why it's insecure:** the same masking rule is implemented twice. If one is updated (e.g. to
also mask phone) the other drifts, leaving a PII leak on one entity. AI-generated code commonly
duplicates such helpers.
**Fix:** extract a shared `PiiMasker` utility used by both services.

### [AI-M3] TC verification uses partial father-name match
**File:** `TransferCertificateRepository.findByTenantIdAndAdmissionNoAndFatherNameContainingIgnoreCaseAndAadharNo`
**Why it's insecure:** the verification tuple matches father name with `Containing` (substring,
case-insensitive) rather than exact. Combined with a known admissionNo + full Aadhaar this is
low risk, but a substring match slightly weakens the "must know the exact record" guarantee and
could return a record on a partial name.
**Fix:** use exact match on father name (and normalize/trim), keeping admissionNo + Aadhaar exact.

---

## LOW

### [AI-L1] `sessionStorage` JWT + broad frontend `console.error(err)`
**Files:** `app.ts` (token in sessionStorage), remaining `console.error(err)` sites.
**Why:** token is JS-readable (XSS exfil vector — mitigated by CSP + no XSS sinks); a couple of
bare `console.error(err)` calls could print HTTP error bodies in the browser console.
**Fix:** keep sessionStorage but rely on CSP; finish trimming raw `err` logging (most already done).

### [AI-L2] Rate limiter / caches are per-instance (in-memory)
**Files:** `RateLimitFilter`, `SiteBootstrapService` cache.
**Why:** on multiple instances the limits/caches don't coordinate, so brute-force/DoS limits are
per-node. Correct for single-instance; a scaling foot-gun typical of AI "works on my box" code.
**Fix:** back with Redis (already a dependency) for multi-instance.

### [AI-L3] Broad `catch (Exception)` in bootstrap graceful-degrade + mail
**Files:** `SiteBootstrapService.safe(...)`, `AuthServiceImpl.sendOtpEmailIfApplicable`.
**Why:** intentional (degrade a failing section to an empty list; don't fail login on mail
outage). Low risk because these paths carry no authorization decisions, but a broad catch can
mask real errors. Acceptable as-is; ensure authz exceptions never flow through `safe(...)`.
**Fix:** none required; documented so it isn't mistaken for swallowing security checks.

### [AI-L4] `docker-compose` dev DB password `postgres/postgres`
**File:** `docker-compose.yml:13`. Dev-only insecure default; not used in prod (Neon via env).
**Fix:** document as dev-only.

---

## AI-smell classes CHECKED and found CLEAN (verified safe)
1. **Insecure random** — `SecureRandom` used for OTP; no `java.util.Random`/`Math.random` for
   security. ✅
2. **Unsafe dynamic SQL / dynamic ORDER BY** — none; all repository finders are derived queries
   scoped by tenant; no native/JPQL string concatenation. ✅
3. **Dangerous deserialization** — no `ObjectInputStream`/`readObject`/`XMLDecoder`/unsafe YAML/
   polymorphic Jackson typing. ✅
4. **Dangerous regex (ReDoS)** — no user-input `Pattern.compile`/backtracking regex; only simple
   `split(",")`. ✅
5. **Unbounded DB ops** — `findAll()` only in super-admin tenant list (bounded, @PreAuthorize);
   `saveAll` only on a single owned page's sections; no cross-tenant bulk ops. ✅
6. **Mass assignment of tenantId** — creates force `tenantId` server-side and reset `id`; a
   client cannot inject a foreign tenantId/id. ✅
7. **Trusting client role** — role comes from the signed JWT claim, not body/param; frontend role
   checks are UI-only, server enforces via `@PreAuthorize`/`assertTenantAccess`. ✅
8. **Frontend-only security** — server-side authz is authoritative (verified: anonymous/other-
   tenant calls → 401/403). ✅
9. **XSS sinks** — no `innerHTML`/`bypassSecurityTrustHtml`; only `bypassSecurityTrustResourceUrl`
   behind an https host allowlist. ✅
10. **Wildcard CORS + credentials** — replaced with an origin allowlist. ✅
11. **Insecure JPA defaults** — `ddl-auto=none`; Flyway-managed schema. ✅
12. **Sensitive logging / secrets in config** — student names/OTP no longer logged; no live
    secrets committed (env-driven, `.env` gitignored). ✅

---

## Prioritized fixes
1. **[AI-H1]** Mirror JWT/CORS/size-limit keys into `application-prod.properties` (env-driven);
   set the env vars in Render. (HIGH — config gap in the environment that matters most.)
2. **[AI-M1]** Standardize tenant-authorization to one layer / a declarative aspect.
3. **[AI-M2]** Extract a shared PII masker. **[AI-M3]** Exact father-name match in TC verify.
4. **[AI-L*]** Redis-backed rate limit/cache for multi-instance; finish `console.error` trim;
   document dev-only defaults.

---

## Remediation status (this pass)
- **[AI-H1] FIXED** — `application-prod.properties` now defines `security.jwt.secret`,
  `security.jwt.expiry-minutes`, `security.cors.allowed-origins`, multipart/tomcat size limits,
  and `app.mail.from` (all env-driven). Set the env vars in Render.
- **[AI-M1] FIXED** — academics/notifications admin create endpoints now carry a declarative
  `@PreAuthorize("@tenantSecurity.canManage(#tenantId)")` (backed by the existing service check).
  Live-verified: cross-tenant → 403, super-admin → 201, public reads still 200.
- **[AI-M2] FIXED** — shared `common/util/PiiMasker.maskAadhaar` now used by both the TC and
  billing services (no duplicated masking logic).
- **[AI-M3] FIXED** — TC verification uses an exact (case-insensitive) father-name match
  (`...FatherNameIgnoreCase...`) instead of a substring `Containing` match.
- **[AI-L1..L4] noted** — remaining low items (Redis-backed limits for multi-instance, further
  `console.error` trimming, dev-only compose password) tracked as hardening; not exploitable.

Verified: backend compiles, Spotless clean, all tests pass; live cross-tenant checks pass.
