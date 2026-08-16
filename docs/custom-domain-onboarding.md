# Custom Domain Onboarding — per-school runbook

How to make a school's own domain (e.g. `www.pioneerschools.co.in`) open **that school's
public website directly** — no admin console, no login.

This is repeatable: do it once per school. The worked example uses **Pioneer**
(`pioneerschools.co.in`); substitute the new school's values from the placeholder table.

---

## How it works (so the steps make sense)

```
Visitor → https://www.<school-domain>
        → GoDaddy DNS (CNAME) → Vercel (frontend, serves the Angular app + SSL)
        → app reads window.location.hostname
        → GET /api/sites/bootstrap?host=www.<school-domain>   (Render backend)
        → backend resolves host → tenant (by customDomain, then subdomain)
        → returns that tenant's public site (config + pages + catalogs)
        → app renders the school's site in public-only mode
```

Key rules baked into the app:
- **Platform hosts** (`localhost`, `*.vercel.app`, `*.onrender.com`, bare IPs) → normal
  admin/dashboard experience.
- **Any other host** → public-only tenant site (resolved from the host).
- Host resolution matches an exact **customDomain**, a `www.`-optional customDomain, or the
  first DNS label as a **subdomain**.

---

## Placeholders (fill these per school)

| Placeholder | Pioneer example | Your value |
|---|---|---|
| `<SCHOOL_DOMAIN>` | `pioneerschools.co.in` | |
| `<WWW_DOMAIN>` | `www.pioneerschools.co.in` | |
| `<TENANT_ID>` | `1` | |
| `<SUBDOMAIN>` | `pioneer` | |
| `<VERCEL_APP_URL>` | `https://<your-app>.vercel.app` | |
| `<BACKEND_URL>` | `https://school-backend-b6yr.onrender.com` | |

Find `<TENANT_ID>` / `<SUBDOMAIN>`: log in as super-admin and `GET <BACKEND_URL>/api/admin/tenants`.

---

## Prerequisites (one-time, platform-wide)

These are set once for the whole platform, not per school.

### Render (backend) environment variables
Render dashboard → backend service → **Environment**:
- `SPRING_PROFILES_ACTIVE = prod`
- `JWT_SECRET` = strong 32+ char random value (the blueprint auto-generates it via
  `generateValue`). **Required** — the backend refuses to start in prod without it.
- `CORS_ALLOWED_ORIGINS` = comma-separated allowlist of every origin that may call the API:
  ```
  <VERCEL_APP_URL>,https://<WWW_DOMAIN>,https://<SCHOOL_DOMAIN>
  ```
  Add each new school's two origins (www + apex) here as you onboard them.
- `MAIL_FROM`, `SPRING_MAIL_USERNAME`, `SPRING_MAIL_PASSWORD` = mail sender + SMTP creds.
- DB_* are wired automatically by the Render blueprint.

> ⚠️ After changing env vars, redeploy and confirm `GET <BACKEND_URL>/api/health` → 200.
> If it won't boot, `JWT_SECRET` is almost certainly missing (fail-fast guard).

### Frontend (Vercel)
The Angular app already routes API calls to `<BACKEND_URL>` in production (see
`app.config.ts`). No per-school frontend change is needed.

---

## Per-school steps

### Step 1 — Map the domain to the tenant (app database)
As **super-admin**, set the tenant's `customDomain`. Either use the admin UI, or curl the live
backend:

```bash
# 1. Get a super-admin token
TOKEN=$(curl -s -X POST "<BACKEND_URL>/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"<SUPER_ADMIN_PASSWORD>"}' \
  | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")

# 2. Set the custom domain for the school (use the www form)
curl -X PUT "<BACKEND_URL>/api/admin/tenants/<TENANT_ID>/custom-domain?customDomain=<WWW_DOMAIN>" \
  -H "Authorization: Bearer $TOKEN"
```
The resolver treats `www.` as optional, so both `<WWW_DOMAIN>` and `<SCHOOL_DOMAIN>` will match.

### Step 2 — Add the domain in Vercel
Vercel project → **Settings → Domains → Add**:
- Add `<WWW_DOMAIN>` (primary).
- Add `<SCHOOL_DOMAIN>` (apex) and set it to **redirect → `<WWW_DOMAIN>`**.
Vercel provisions SSL automatically and shows the exact DNS records to create.

> **Vercel will show "Invalid Configuration" until the DNS record exists** — that is a to-do,
> not an error. It clears automatically once the record below is created and propagates.
>
> ⚠️ **Copy the EXACT CNAME target Vercel shows** for `www`. It is often a **unique per-domain
> value** like `be2d9a436431fc29.vercel-dns-017.com`, **not** the generic `cname.vercel-dns.com`.
> Use whatever Vercel displays for your domain.

### Step 0 (pre-flight) — Confirm the domain is active & delegated to GoDaddy
Before touching DNS records, verify the domain actually resolves to a nameserver:
```bash
dig NS <SCHOOL_DOMAIN> +short
```
- **Returns GoDaddy nameservers** (e.g. `ns**.domaincontrol.com`) → good, continue.
- **Returns nothing / NXDOMAIN** → the domain is not usable yet. Causes: brand-new registration
  still provisioning (new `.co.in` can take a few hours), domain parked, or **custom nameservers**
  set (not GoDaddy). Fix in GoDaddy: ensure the domain is **registered/active** and its
  **Nameservers = GoDaddy default** before adding records — DNS records you add won't take effect
  under custom/parked nameservers.

### Step 3 — Configure DNS at GoDaddy
GoDaddy → **DNS / Manage DNS** for `<SCHOOL_DOMAIN>` → **Add Record**:
- **www (CNAME):** Type `CNAME`, Name `www` (just `www`, not the full domain), Value = the exact
  target Vercel showed (e.g. `be2d9a436431fc29.vercel-dns-017.com`). If a default `www` record
  already exists, **edit it** instead of adding a duplicate.
- **apex (@):** use the **A record** Vercel shows for the apex (e.g. `76.76.21.21`), OR use
  GoDaddy **Domain Forwarding** `<SCHOOL_DOMAIN>` → `https://<WWW_DOMAIN>`.
  (Many registrars, incl. some `.co.in` setups, don't allow a CNAME on the apex — use the A
  record or forwarding.)

DNS propagation takes minutes to a few hours. Verify as it propagates:
```bash
dig CNAME www.<SCHOOL_DOMAIN> +short   # should show the Vercel target
nslookup www.<SCHOOL_DOMAIN>           # NXDOMAIN = not propagated yet
```
Once the record is visible, Vercel flips to **"Valid Configuration"** and issues SSL.

### Step 4 — Add the domain to CORS
Append `https://<WWW_DOMAIN>,https://<SCHOOL_DOMAIN>` to `CORS_ALLOWED_ORIGINS` in Render and
redeploy (if not already added in prerequisites).

---

## Testing checklist

Run after DNS propagates. All should pass.

| # | Test | Expected |
|---|---|---|
| 1 | Open `https://<WWW_DOMAIN>` | School's public site loads directly (no admin, no login), branded |
| 2 | Open `https://<SCHOOL_DOMAIN>` (apex) | Redirects to www and loads the same site |
| 3 | Browser Network tab | one call `GET /api/sites/bootstrap?host=<WWW_DOMAIN>` → 200 with the school's data |
| 4 | Open `<VERCEL_APP_URL>` | Normal platform/admin experience (NOT a tenant site) |
| 5 | SSL padlock present | HTTPS valid on both www and apex |
| 6 | First hit after idle | Branded "Loading…" screen (Render cold start), then the site — never a broken page |

### Quick backend-only checks (independent of DNS)
```bash
# Resolver returns the right tenant
curl -s "<BACKEND_URL>/api/admin/tenants/resolve?host=<WWW_DOMAIN>"
# Full public payload for the site
curl -s "<BACKEND_URL>/api/sites/bootstrap?host=<WWW_DOMAIN>"
```
Both should return the school (tenant name, subdomain, pages, config).

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Vercel shows **"Invalid Configuration"** | DNS record not created/propagated yet | Add the exact CNAME Vercel shows in GoDaddy (Step 3); wait for propagation — it clears itself |
| `nslookup`/browser gives **NXDOMAIN** (domain won't open) | no DNS records / domain not delegated to GoDaddy | Confirm domain is active + Nameservers = GoDaddy default (Step 0); new registrations can take hours |
| Added CNAME but Vercel still invalid | wrong target (used generic `cname.vercel-dns.com`) or `www.<domain>` typed in the Name field | Use the **exact per-domain target** Vercel shows; Name field = just `www` |
| Domain shows the platform/dashboard, not the school | host not mapped, or matched as a platform host | Verify `customDomain` is set (Step 1); confirm the host isn't `*.vercel.app` |
| "We couldn't load this school's website" | backend asleep or unreachable | Wait for cold start / retry; check `<BACKEND_URL>/api/health` |
| CORS error in console | domain missing from allowlist | Add `https://<WWW_DOMAIN>` + apex to `CORS_ALLOWED_ORIGINS`, redeploy |
| Backend won't start after deploy | `JWT_SECRET` unset in prod | Set a strong `JWT_SECRET` env var (fail-fast guard) |
| Apex doesn't resolve | registrar disallows apex CNAME | Use Vercel's A record or GoDaddy forwarding to www |
| Site loads but blank/old data | bootstrap/host cache (60s) or wrong tenant data | Wait 60s (cache TTL); changing customDomain evicts caches immediately |

---

## Quick reference: onboarding a NEW school (condensed)
1. Ensure the tenant exists (super-admin onboards it) → note `<TENANT_ID>`.
2. `PUT /api/admin/tenants/<TENANT_ID>/custom-domain?customDomain=www.<domain>` (super-admin).
3. Vercel → add `www.<domain>` + apex (redirect to www).
4. GoDaddy → `CNAME www → cname.vercel-dns.com`; apex → A record / forwarding.
5. Render → append the two origins to `CORS_ALLOWED_ORIGINS`; redeploy.
6. Run the testing checklist.
No code changes required per school.
