# SENSITIVE-DATA & PRIVACY AUDIT — School Website SaaS

Dedicated sweep for exposure of secrets and PII across backend responses, DTOs/entities, logs,
exceptions, frontend models/state/storage, `console.*`, config, Docker, CI, and env files.
**No actual secret or PII values are printed** — locations and types only. Read-only.

## Overall verdict: **LOW residual risk**

No live secrets are committed; credentials are environment-driven and `.env` is gitignored.
The main residual items are **PII (student names) written to application logs at INFO** and
**admin endpoints returning full entities** (including Aadhaar to the authorized owner). Both
are MEDIUM/LOW and easily hardened.

---

## Findings (values redacted)

| file | line | type | severity | why exposed | recommended fix |
|---|---|---|---|---|---|
| school-website-backend/.../grades/impl/StudentGradeServiceImpl.java | 63 | Student name (PII) in log | MEDIUM | `log.info` includes `student=<name>` → PII lands in Render/app logs & retention | Log `tenantId`/grade id only; drop student name |
| school-website-backend/.../billing/impl/BillingServiceImpl.java | 49 | Student name (PII) in log | MEDIUM | `log.info("...student={}", invoice.getStudentName())` | Remove name; log invoice id + tenantId |
| school-website-backend/.../admissions/impl/AdmissionLeadServiceImpl.java | 31 | Student name (PII) in log | MEDIUM | logs applicant student name at submit | Remove name from log line |
| school-website-backend/.../academics/impl/TransferCertificateServiceImpl.java | 67 | Student name (PII) in log | MEDIUM | logs student name on TC issue | Remove name; keep tenantId + tc number |
| school-website-backend/.../auth/impl/AuthServiceImpl.java | 131 | Username in log | LOW | `log.info("Updating password for username={}")` — identifies an account in logs | Log user id or a hashed marker; drop username |
| school-website-backend/.../academics/controller/TransferCertificateController.java (+service) | 33-37 | Aadhaar + full student PII in admin response | MEDIUM | `GET /admin/sites/{tenantId}/tc` returns raw `TransferCertificate` entities incl. unmasked `aadharNo` to the authorized tenant admin | Return a DTO; mask Aadhaar except last 4 even for admins unless explicitly needed |
| school-website-backend/.../grades/controller/StudentGradeController.java | 23-56 | Full grade entity | LOW | returns raw `StudentGrade` (all columns) | Response DTO with only needed fields |
| school-website-backend/.../billing/controller/BillingController.java | 45-80 | Full invoice entity (name, admissionNo, fatherName, aadharNo) | MEDIUM | admin invoice endpoints return raw `StudentInvoice` incl. `aadharNo`/`fatherName` | DTO; mask Aadhaar; drop fields the UI doesn't render |
| school-website-backend/.../admissions/controller/AdmissionLeadController.java | 31-44 | Parent/student contact PII | LOW | returns lead DTO with email/phone to the owning admin (legitimate) — ensure not over-returned | Confirm DTO trims to needed fields |
| school-website-backend/.../support/controller/SupportInquiryController.java | 31-35 | Contact PII in raw entity | LOW | returns raw `SupportInquiry` | DTO projection |
| school-website-backend/.../academics/controller/CareersController.java | 37-41 | Applicant PII (raw `JobApplication`) | LOW | returns raw entity incl. email/phone | DTO projection |
| school-website-backend/.../auth/security/JwtService.java | 34-35 | Dev JWT fallback secret (literal) | MEDIUM | a hardcoded dev signing secret is used when `JWT_SECRET` is unset; if prod ever runs without the env var, tokens are forgeable | Fail fast (throw) when `security.jwt.secret` is blank under the `prod` profile |
| school-website-frontend/src/app/admin/tenant-onboarding/tenant-onboarding.component.ts | 132 | Hardcoded default password `admin123` | MEDIUM | if the onboarding admin leaves the password blank, a well-known default is set for the new tenant admin | Require a strong password (no silent default); enforce server-side too |
| school-website-frontend/src/app/app.ts | 761 | JWT stored in `sessionStorage` | LOW | token in `sessionStorage` is readable by any JS → XSS could exfiltrate it | Acceptable for SPA; mitigate via CSP + input sanitization (self-XSS is the only vector left). Consider httpOnly cookie only if moving off bearer tokens |
| school-website-frontend/src/app/**/*.ts | (78 sites) | `console.error(err)` of HTTP errors | LOW | error objects may include response bodies with PII in the browser console | Log a generic message; avoid dumping full `err` in production builds |
| docker-compose.yml | 13 | `POSTGRES_PASSWORD: postgres` | LOW | local-dev compose default only (not used in prod; prod uses env/Neon) | Fine for local; document that it is dev-only |

---

## Surface-by-surface verdict

- **Secrets in repo:** CLEAN. No live API keys, private keys, JWT secrets, or DB passwords are
  committed. All are `${ENV}`-driven. `.env` is gitignored; only `.env.example` (placeholders)
  is tracked (verified: no raw `.env` in `git ls-files`).
- **application*.properties / render.yaml / Dockerfiles:** CLEAN. Secrets referenced via env
  vars / Render dashboard; `render.yaml` binds `DB_PASSWORD` to a managed property, no inline
  value; mail creds explicitly deferred to the dashboard.
- **GitHub Actions:** CLEAN. `keep-backend-alive.yml` reads the URL from a var/secret, hides it
  in logs, and now has `permissions: contents: read`.
- **Login response:** MINIMAL. Returns token + username + role + tenantId (+ name/subdomain).
  No password/hash returned (previously fixed).
- **Backend logs:** ISSUE — student names logged at INFO in 4 services (table above).
- **API responses:** ISSUE — admin endpoints return full entities incl. Aadhaar/father name
  (table above); the *public* TC lookup already masks Aadhaar and requires verification.
- **Frontend models/state:** contains PII fields by necessity (grades, invoices, TCs) — only
  loaded for the owning tenant after auth; no cross-tenant exposure.
- **Storage:** `sessionStorage` holds the JWT + a token-free user profile + a promo-dismiss
  flag. No passwords/PII beyond the user's own profile. Cookies: none used for auth.
- **Exceptions:** CLEAN. Global handler returns a sanitized envelope — no stack traces/SQL/paths
  (verified in the pentest pass).

---

## Prioritized fixes
1. **Stop logging student names / usernames** (StudentGrade, Billing, AdmissionLead, TC, Auth) —
   log ids + tenantId only. (MEDIUM, quick.)
2. **Mask Aadhaar in admin responses too** and move sensitive endpoints to response DTOs that
   omit fields the UI doesn't need (TC, invoices, grades, applications). (MEDIUM.)
3. **JwtService:** fail fast if `security.jwt.secret` is blank under `prod` (never use the dev
   fallback in production). (MEDIUM.)
4. **Remove the `admin123` default** in tenant onboarding; require an explicit strong password.
   (MEDIUM.)
5. **Trim `console.error(err)`** to generic messages in production builds. (LOW.)
6. Document `docker-compose` `postgres/postgres` as dev-only. (LOW.)

None of these are live secret leaks; they are PII-in-logs and excessive-field-exposure hardening.
