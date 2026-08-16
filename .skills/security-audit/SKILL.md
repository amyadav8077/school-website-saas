---
name: security-audit
description: >
  Senior application-security / penetration-testing playbook for the School Website
  SaaS Platform (multi-tenant). Use whenever asked to audit, review security, threat-model,
  or before shipping any change that touches auth, tenant isolation, APIs, file uploads,
  DB queries, CORS/headers, secrets, CI/CD, or dependencies. Read-only during audit —
  never modify code, data, or credentials while auditing.
---

# Security Audit Skill — School Website SaaS

This is a **multi-tenant SaaS**: many schools (tenants) share one platform. The #1 rule is
**Tenant A must never read, modify, delete, enumerate, or infer Tenant B's data.**

## Non-negotiable rules while auditing
- Do NOT modify code during the audit.
- Do NOT delete, migrate, reset, or modify database data.
- Do NOT rotate credentials automatically.
- Do NOT print secrets, passwords, API keys, JWTs, tokens, DB creds, or PII. Report as
  `SECRET FOUND: file / line / type / severity` only.
- Do NOT run destructive pentest requests against external systems.
- Treat every client-provided value as untrusted: tenantId, userId, pageId, role, hidden
  fields, disabled UI controls are all attacker-controlled and bypassable.
- Assume the attacker inspects frontend JS, crafts raw HTTP requests, and skips the UI.

## Threat model anchors (this repo)
- Backend: Spring Boot (Java 17), `school-website-backend`. Layers: controller → service →
  impl → repository → entity. Public API base `/api/sites/**`, admin `/api/admin/**`,
  auth `/api/auth/**`.
- Frontend: Angular, `school-website-frontend`. Single monolithic `app.ts`, no router.
- DB: H2 local, Postgres/Neon prod. Flyway migrations `V1..Vn`.
- Known context: `SecurityConfig.java` currently permits `/api/auth/**`, `/api/admin/**`,
  `/api/sites/**` to everyone (no server-side authz). SiteConfig `socialLinks` holds JSON
  (banner + promo). Logos/media stored as Base64 in config JSON.

## Audit checklist (run all 25 domains)
1. Security architecture: authn/authz weaknesses, broken access control, IDOR, priv-esc
   (H & V), missing authz, backend trusting frontend, exposed admin/debug/dev endpoints.
2. **Multi-tenant isolation (most important):** every endpoint with an id
   (tenantId/userId/pageId/pageSectionId/mediaId/achievementId/admissionId/tcId/…). Verify
   ownership predicate at controller AND service AND repository. Check indirect refs
   (page 123 belongs to Tenant B). Look for repo queries without tenant filter, services
   trusting request tenantId, cross-tenant entity relationships, native/JPQL missing tenant
   filter, batch/search/pagination/sort/export leaks, media URLs crossing tenants.
3. Authentication: password hashing, reset, OTP, login/logout, session, JWT, refresh,
   expiry, revocation, remember-me, account enumeration, brute-force, default/test/hardcoded
   creds, secrets logging, tokens in URL/localStorage/errors.
4. Authorization / RBAC: enumerate roles (SUPER_ADMIN, TENANT_ADMIN/SCHOOL_ADMIN,
   PARENT_VISITOR…). Enforce server-side. Never trust route guards, hidden/disabled buttons,
   client role values. Test H/V priv-esc, role/userId/tenantId manipulation.
5. API security: methods, authn/authz per route, input validation, output filtering, errors,
   rate limiting, pagination caps, request/response size, mass assignment/over-posting,
   unsafe deserialization, excessive data exposure (full entities).
6. IDOR / object-level authz: for every {id} confirm the authenticated principal owns the
   exact object. Sequential IDs and UUIDs both require checks.
7. Database: SQLi/JPQLi/native injection, dynamic ORDER BY / WHERE, unsafe LIKE, tenant
   filtering, missing indexes → DoS, N+1, unbounded queries, missing pagination, sensitive
   columns exposed. Verify DB creds storage.
8. Input validation: bodies, params, path vars, headers, cookies, filenames, uploads, URLs,
   HTML, JSON/page-builder config, rich text → SQLi/XSS/HTMLi/SSTI/cmd-inj/path-traversal/
   SSRF/XXE/deserialization/proto-pollution/ReDoS/JSON bombs/large payloads.
9. XSS / frontend: innerHTML/[innerHTML]/outerHTML/bypassSecurityTrust*, dynamic HTML/URLs,
   user/page-builder/announcement/uploaded content, rich text. Stored/reflected/DOM XSS.
   Also localStorage/sessionStorage/cookies/tokens, source maps, exposed env.
10. File upload: extension + MIME + magic-byte validation, size limits, filename
    sanitization, path traversal, executable/SVG/HTML/JS/polyglot uploads, malicious images,
    ZIP bombs, malware scan, public URLs, download authz, tenant isolation of files.
    SVG can carry scripts — treat as dangerous.
11. SSRF: any backend fetch of a user-supplied URL (image/video import, preview, webhook,
    metadata). Block localhost/127.0.0.1/0.0.0.0/private ranges/cloud metadata/docker/db.
12. Secrets: scan .env*, application*.properties/yml, Dockerfiles, docker-compose, GH
    Actions, scripts, tests, README, frontend env. Report location + type only, never value.
13. Cloud/deploy: Render, Docker, env vars, CI/CD, prod config, CORS, TLS, security headers,
    debug mode, actuator/health/metrics, swagger/openapi exposure, public buckets.
14. CORS/CSRF/headers: CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy,
    Permissions-Policy. Flag `Access-Control-Allow-Origin: *` with credentials.
15. Rate limiting/bot: login, register, password reset, OTP, search, public/admissions/
    contact forms, uploads, health, expensive/export/email/verify APIs. Prefer rate limiting
    + throttling over blanket CAPTCHA.
16. Business logic: self-approval, cross-school config edit, publish-without-permission,
    workflow bypass, unpublished-content access, status/price/limit manipulation, ownership
    change, self-grant admin, direct-endpoint workflow bypass.
17. Information disclosure: stack traces, SQL/DB errors, FS paths, hostnames, IPs, framework/
    Java/dep versions, env, PII, internal IDs in responses/errors.
18. Logging: never log passwords/tokens/authz headers/API keys/DB creds/PII. Check app/error/
    audit/GH Actions/Render/frontend-console logs.
19. Dependencies: package.json/lock, Gradle/Maven — known-vuln/outdated/abandoned. Recommend
    npm audit / OWASP Dependency-Check / Snyk / Dependabot. Do not auto-upgrade during audit.
20. GitHub/CI-CD: secrets in logs, PR workflows running untrusted code, excessive
    GITHUB_TOKEN perms / write-all, dependency confusion, script injection via event vars,
    secrets to fork PRs, deploy creds. Prefer `permissions: contents: read`.
21. DoS: unbounded uploads/bodies/queries, missing pagination, expensive regex/JSON,
    recursive/huge page-builder configs, large media processing, ZIP bombs, expensive
    search/export.
22. Backup/recovery: DB backups, encryption, retention, restore, object-storage backups, DR.
    Can a compromised account wipe all tenant data?
23. Privacy/data minimization: for each sensitive entity ask "does the API/frontend really
    need this field?" (student PII, parent/teacher info, email, phone, address, academic
    records, TCs, documents).
24. Security test cases: produce concrete manual tests (cross-tenant access/modify/delete,
    id swap, missing/expired/other-user token, role tamper, SVG/exe upload, HTML/JS in
    content, oversized request/file, path traversal, SSRF, SQLi, brute-force, user enum,
    admin endpoint as normal user, unpublished/other-tenant media, actuator/debug).
25. Rating: CRITICAL/HIGH/MEDIUM/LOW/INFO using the standard priority mapping.

## Dedicated Multi-Tenant Isolation Audit (standalone sub-playbook)
Run this focused pass whenever asked for a "multi-tenant" or "tenant isolation" audit. The
ONLY objective: can Tenant A read, modify, delete, enumerate, or **infer** Tenant B's data?

**Trace every API end-to-end:** Controller → Service → Impl → Repository → Database. For
each endpoint capture:
- How `tenantId` is obtained: from the JWT/SecurityContext (SAFE) vs. from a path variable,
  query param, or request body (UNTRUSTED — attacker-controlled).
- Where ownership is enforced (controller `CurrentUser.assertTenantAccess`, service, or a
  tenant-scoped repository method `...AndTenantId`). If enforcement is only in the UI, it's
  broken.
- What the row's real owner is for id-only operations (`/{id}` deletes/updates): must load
  the row and verify its `tenantId` before acting; return 404 (not 403) to avoid existence
  disclosure.

**Specifically hunt for:**
- IDOR (id-only `{id}`/`{pageId}`/`{mediaId}` with no ownership check).
- Missing `tenantId` filtering in repository queries.
- Trusting `tenantId` from request path / query param / body (mass-assignment of tenantId).
- Missing ownership checks in service/impl.
- Repository methods without tenant restrictions (`findById`, `findAll`, `deleteById`).
- Native SQL / JPQL missing a tenant predicate; dynamic WHERE/ORDER BY.
- Batch operations mixing tenants (`saveAll`, `deleteAll`, bulk updates).
- Search / pagination / sorting / export endpoints that ignore tenant scope.
- File/media access (URLs, Base64 blobs, download endpoints) crossing tenants.
- Public vs private content: which reads are legitimately anonymous vs. must be tenant-scoped.
- Admin APIs: `/api/admin/**` must be authenticated AND tenant-scoped (super-admin exempt).
- Inference channels: distinct 404 vs 403 vs 200, timing, error text, or counts that let A
  learn about B's data existence.

**For every vulnerable endpoint, write an attack scenario in this exact shape:**
```
Endpoint:        <METHOD /path>
tenantId source: <path|query|body|token>
Enforcement:     <controller? service? repository? none>
Attack:          Authenticated user from Tenant A → change {id/tenantId} to Tenant B → send raw HTTP
Expected:        403 (cross-tenant) or 404 (id-only) / masked / rejected
Current (code):  <what the source actually does today> 
Verdict:         VULNERABLE | SAFE | PARTIAL
```

**Enforcement-layer matrix** — state, per resource, whether isolation holds at:
Authentication · Controller · Service · Repository/DB. The strongest architecture derives
tenantId from the token and scopes every query by it; controllers/services never trust a
client-supplied tenantId.

Output a standalone **MULTI-TENANT SECURITY REPORT**: table of every tenant-touching
endpoint with the attack-scenario fields above, the enforcement matrix, a plain-English
verdict ("can Tenant A access Tenant B? yes/no and where"), and prioritized fixes. Read-only.

## Low-Privilege Attacker Assessment (red-team sub-playbook)
Use when asked "what damage could a normal user cause" / ethical-hacker / pentest framing.

**Assume the tester has:** a normal (non-admin) user account only. **No** server access,
**no** DB access, **no** source access, **no** admin creds. Tooling limited to: browser,
frontend JS, hand-crafted HTTP requests, modified request bodies/IDs/headers/cookies/tokens.
Do NOT attack external systems; do NOT change code. (Internally you MAY read the source to
reason about realistic attack paths, but the *attacker model* has none of the above.)

**Reason through these 15 questions and answer each with evidence from the code:**
1. Can I become another user? (token forgery, weak JWT secret, id in token not verified)
2. Can I become an administrator? (role in token/body trusted, privilege escalation)
3. Can I access another school's data? (cross-tenant IDOR on reads)
4. Can I modify another school's website? (cross-tenant writes to config/pages/sections)
5. Can I upload malicious files? (SVG/HTML/polyglot, missing MIME/magic-byte, size caps)
6. Can I execute JavaScript? (stored/DOM XSS via page-builder/media/announcement content)
7. Can I access unpublished content? (draft pages/status filters enforced server-side?)
8. Can I retrieve private documents? (TC/Aadhaar/invoices/grades without authorization)
9. Can I enumerate users? (login/forgot-password/lookup responses differ by existence)
10. Can I brute force accounts? (no rate limit/lockout on login/OTP)
11. Can I bypass frontend restrictions? (hidden/disabled controls, client-only role guards)
12. Can I manipulate IDs? (sequential ids, id-only deletes/updates without ownership)
13. Can I bypass workflow restrictions? (call endpoints out of order, self-approve, skip pay)
14. Can I cause excessive resource consumption? (no size caps, unbounded lists, huge Base64)
15. Can I extract sensitive information? (excessive fields, stack traces, verbose errors)

**For every successful OR potentially-successful attack, report in this exact shape:**
```
Attack:
Required privileges:      (anonymous | normal user | tenant admin)
Affected endpoint:
Attack vector:            (raw HTTP request, modified id/body/header/token, etc.)
Impact:
Severity:                 CRITICAL | HIGH | MEDIUM | LOW
Recommended mitigation:
```
Also list attacks that were **attempted and correctly blocked** (with the observed status
code, e.g. 401/403/400) so the report shows current defenses, not just gaps. Prefer live
verification (curl against a running instance) when available. Read-only.

## Sensitive-Data & Privacy Sweep (standalone sub-playbook)
Use when asked for a "sensitive data" / "privacy" / "data-exposure" audit. Goal: find where
secrets or PII could leak. **NEVER print actual secret/PII values** — report only file, line,
type, severity, why, and fix.

**Secret/credential classes to hunt:** passwords, API keys, JWT/refresh tokens, DB creds,
private keys, cloud/storage creds, SMTP creds, OAuth secrets, webhook URLs.
**PII classes to hunt:** email, phone, address, student info, parent/guardian info, academic
records/grades, transfer certificates, Aadhaar/national IDs, uploaded documents, DOB, photos,
tenant/internal IDs.

**Surfaces to scan (each):**
- Backend API responses (controllers returning full entities incl. sensitive columns).
- Backend DTOs vs entities (does the response DTO include fields the client doesn't need?).
- Database entities (which columns are sensitive; are they ever serialized outward?).
- Debug/log statements (`log.info/debug/error`, printStackTrace) leaking PII/secrets/tokens.
- Exception/error responses (stack traces, SQL, paths, versions).
- Frontend models/interfaces holding sensitive fields.
- Frontend state + storage: `localStorage`, `sessionStorage`, `cookies` (tokens/PII persisted?).
- `console.log`/`console.error` in frontend leaking tokens/PII/responses.
- Config: `application*.properties/yml`, `.env*` (only `.env.example` should be tracked),
  Dockerfiles, docker-compose, render.yaml.
- CI/CD: GitHub Actions logs/echoes of secrets, `${{ secrets.* }}` misuse.
- Hardcoded values: emails, phone numbers, keys, URLs with embedded creds/tokens (incl. the
  git remote URL).

**Suggested grep seeds (adapt):**
`password|secret|api[_-]?key|token|Authorization|Bearer|private[_-]?key|BEGIN .*PRIVATE`
`aadhar|aadhaar|ssn|dob|phone|email|address` · `console\.(log|error|debug)` ·
`printStackTrace|log\.(info|debug|error).*(password|otp|token|aadhar|email|phone)` ·
`localStorage|sessionStorage|document\.cookie` · scan `.env`, `*.properties`, `*.yml`,
`Dockerfile*`, `.github/**`.

**Report table columns (values redacted):**
`file | line | type of sensitive information | severity | why it is exposed | recommended fix`
Also give a short verdict per surface (clean / issues) and confirm secrets are env-driven and
gitignored. Read-only.

## AI-Generated / "Vibe-Coded" Code Audit (sub-playbook)
Use when asked to audit for vulnerabilities typical of AI-generated code. Core principle:
**do NOT assume code is secure just because it compiles, tests pass, types are correct,
Spring Security is "configured", route guards exist, IDs are UUIDs, or endpoints are hidden
from the UI.** AI-generated code tends to produce *plausible-looking* security that is
inconsistent or enforced in the wrong layer.

**Hunt specifically for:**
- Authorization missing from *service* methods (only added in some controllers, not others).
- Security enforced **only** in the frontend (route guards, `*ngIf`, disabled buttons).
- Trusting client-provided **role** (role read from token body/param instead of a signed claim).
- Trusting client-provided **tenantId** (from path/body instead of the authenticated principal).
- Trusting hidden form fields / disabled UI controls.
- **Mass assignment** (`@RequestBody Entity`), excessive DTO/entity fields in responses.
- **Insecure defaults** (dev secrets, `admin123`, permissive CORS `*`, `ddl-auto=update`).
- **Broad exception handling** that swallows/obscures security errors or returns 500 for authz.
- **Inconsistent** security: same resource protected on one endpoint, open on a sibling.
- **Duplicated authorization logic** that can drift (copy-pasted checks vs one helper).
- Bypassable workflow checks (status transitions/payment/publish callable out of order).
- Insecure CORS (wildcard + credentials), missing security headers/CSP.
- Dangerous regex (catastrophic backtracking / ReDoS) on user input.
- Unsafe file upload (no MIME/magic-byte/size/extension checks; SVG/polyglot).
- Unsafe URL handling / `bypassSecurityTrust*` on user input; SSRF on server-side fetch.
- XSS (innerHTML/page-builder content), sensitive logging, secrets in config.
- Insecure random (`java.util.Random`/`Math.random` for tokens/OTP), predictable IDs.
- Missing rate limits, missing pagination, missing request/upload size limits.
- Dangerous deserialization; unsafe dynamic SQL / dynamic ORDER BY; unbounded DB ops
  (`findAll`, `deleteAll`, `saveAll` across tenants, no `LIMIT`).

**For every finding:** give the exact file:line, the precise reason it is insecure (not just
the category), severity, and the fix. Explicitly call out where a check exists but is enforced
in the wrong layer or applied inconsistently. Also list the AI-smell classes that were checked
and found CLEAN, so the report distinguishes "verified safe" from "not looked at". Read-only.

## For every finding report
1. What is vulnerable  2. Why  3. How an attacker exploits it  4. Severity
5. Recommended fix  6. Exact file/class/function.

## Report format
Use the sections: Summary (overall risk + counts) → Critical → High → Medium → Low →
Multi-Tenant Isolation Report → Authentication → Authorization → Secrets (no values) →
File Upload → API Security → Dependency → CI/CD → Security Test Plan → Top 10 Fixes →
Hardening Roadmap (Phase 1 critical, 2 high, 3 hardening, 4 continuous monitoring).

## Workflow
1. Audit READ-ONLY and deliver the full report first.
2. Then ASK whether to start fixing findings one by one. Do not fix during the audit.
3. When fixing later: smallest safe change, keep tenant isolation server-side, add a
   regression test per fix, re-verify build + tests.
