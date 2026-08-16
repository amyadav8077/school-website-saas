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

## Per-school steps (exact click-by-click, in order)

> This is the exact sequence that was used to bring `www.pioneerschools.co.in` live. Do the
> steps in this order. Steps 1–2 give you the values you need for Step 3.

### Step 1 — Confirm the domain is active & on GoDaddy nameservers
GoDaddy → **My Products → the domain → DNS / Manage DNS**. Scroll to **Nameservers**:
- It should say **"Using default nameservers"** with values like `NS75.DOMAINCONTROL.COM` /
  `NS76.DOMAINCONTROL.COM`.
- If it shows **custom/parked** nameservers → click **Change Nameservers → default (GoDaddy)**.
  DNS records won't take effect otherwise.

Sanity check from a terminal (query a public resolver, not your possibly-cached local one):
```bash
dig NS <SCHOOL_DOMAIN> @8.8.8.8 +short   # expect ns**.domaincontrol.com
```
> New registrations (incl. `.co.in`) can take a few hours to become resolvable. If this returns
> nothing, wait and retry before continuing.

### Step 2 — Add the domain in Vercel (this gives you the DNS target)
Vercel → your project (e.g. `school-website-saas`) → **Settings → Domains**:
1. Type `<WWW_DOMAIN>` (e.g. `www.pioneerschools.co.in`) → **Add**.
2. Type `<SCHOOL_DOMAIN>` (apex, e.g. `pioneerschools.co.in`) → **Add** → choose **Redirect to
   `<WWW_DOMAIN>`**.
3. Vercel now lists each domain with **"Invalid Configuration"** and shows the DNS record(s) to
   create. **Copy the exact values shown**, e.g. for `www`:
   ```
   Type: CNAME   Name: www   Value: be2d9a436431fc29.vercel-dns-017.com
   ```
   > ⚠️ The CNAME target is a **unique per-domain value** (like above), **not** the generic
   > `cname.vercel-dns.com`. "Invalid Configuration" is just a to-do — it clears once the record
   > below exists and propagates. Vercel issues the SSL certificate automatically afterward.

### Step 3 — Create the DNS records in GoDaddy
GoDaddy → **DNS / Manage DNS** for `<SCHOOL_DOMAIN>`.

**www (CNAME) — the important one:**
- GoDaddy usually already has a default **`www`** CNAME (often pointing to `@`). **Edit that one**
  (don't add a duplicate):
  - **Type:** `CNAME`
  - **Name:** `www`  ← just `www`, GoDaddy appends the domain automatically
  - **Value:** the exact target Vercel showed (e.g. `be2d9a436431fc29.vercel-dns-017.com`)
  - **TTL:** default (1 hour)
- Leave the auto-created **`_domainconnect`** CNAME as-is — it's GoDaddy's helper record, unrelated
  to Vercel; do not delete or edit it.

**apex (@):**
- Add the **A record** Vercel shows for the bare domain (e.g. `76.76.21.21`), **or**
- Use GoDaddy **Domain Forwarding**: `<SCHOOL_DOMAIN>` → `https://<WWW_DOMAIN>` (301, forward with
  masking off). Simplest when the registrar won't allow an apex A/CNAME.

**Save.** Then wait for propagation (minutes to a few hours) and verify against a public resolver:
```bash
dig CNAME www.<SCHOOL_DOMAIN> @8.8.8.8 +short    # expect the Vercel target
dig www.<SCHOOL_DOMAIN> @8.8.8.8 +short          # expect Vercel IPs (e.g. 216.198.79.65)
```
When these resolve, Vercel flips the domain to **"Valid Configuration"** and starts SSL issuance.

### Step 4 — Map the domain to the tenant (PROD database)
> The prod database is separate from local — the tenant IDs differ. Do this against the **live**
> backend, not local.

```bash
# 1. Super-admin token from the LIVE backend
TOKEN=$(curl -s -X POST "<BACKEND_URL>/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"<SUPER_ADMIN_PASSWORD>"}' \
  | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")

# 2. Find the school's PROD tenant id (IDs differ between local and prod!)
curl -s -H "Authorization: Bearer $TOKEN" "<BACKEND_URL>/api/admin/tenants" \
  | python3 -c "import sys,json;[print(t['id'],t['subdomain'],t.get('customDomain')) for t in json.load(sys.stdin)['data']]"

# 3. Set the custom domain on that tenant (use the www form; apex matches automatically)
curl -X PUT "<BACKEND_URL>/api/admin/tenants/<PROD_TENANT_ID>/custom-domain?customDomain=<WWW_DOMAIN>" \
  -H "Authorization: Bearer $TOKEN"
```
Verify the prod backend now resolves the host to the school:
```bash
curl -s "<BACKEND_URL>/api/admin/tenants/resolve?host=<WWW_DOMAIN>"
curl -s "<BACKEND_URL>/api/sites/bootstrap?host=<WWW_DOMAIN>"   # tenant + pages + config
```

### Step 5 — Add the domain to CORS (Render)
Render → backend service → **Environment** → edit `CORS_ALLOWED_ORIGINS`, append:
```
https://<WWW_DOMAIN>,https://<SCHOOL_DOMAIN>
```
Save (redeploys). Verify the preflight is allowed:
```bash
curl -s -i -X OPTIONS "<BACKEND_URL>/api/sites/bootstrap?host=<WWW_DOMAIN>" \
  -H "Origin: https://<WWW_DOMAIN>" \
  -H "Access-Control-Request-Method: GET" \
  | grep -i "access-control-allow-origin"
# expect: access-control-allow-origin: https://<WWW_DOMAIN>
```

### Step 6 — Wait for Vercel SSL, then open the site
The **last** thing to complete is Vercel's SSL certificate (HTTPS). Until it finishes:
- `http://<WWW_DOMAIN>` returns 200, but `https://` may fail (`curl` code 000). This is normal.
- Vercel → Domains shows the domain going from "Invalid" → "Valid Configuration" → padlock.
- If it's stuck > ~1 hour, click **Refresh** on the domain in Vercel (or remove + re-add it).

Once HTTPS is live, open **`https://<WWW_DOMAIN>`** → the school's public site loads directly.

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
| `nslookup`/browser gives **NXDOMAIN** (domain won't open) | no DNS records / domain not delegated to GoDaddy | Confirm domain is active + Nameservers = GoDaddy default (Step 1); new registrations can take hours |
| Added CNAME but Vercel still invalid | wrong target (used generic `cname.vercel-dns.com`) or `www.<domain>` typed in the Name field | Use the **exact per-domain target** Vercel shows; Name field = just `www` |
| HTTP works (200) but HTTPS fails (curl code 000) | Vercel SSL certificate still issuing | Normal right after DNS validates; wait, or click Refresh on the domain in Vercel |
| Domain shows the platform/dashboard, not the school | host not mapped on PROD, or matched as a platform host | Verify `customDomain` is set on the **prod** tenant (Step 4); confirm the host isn't `*.vercel.app` |
| Site loads but API 403/CORS on the tenant domain | Pioneer origin missing from prod CORS | Add `https://<WWW_DOMAIN>` + apex to `CORS_ALLOWED_ORIGINS` in Render (Step 5), redeploy |
| "We couldn't load this school's website" | backend asleep or unreachable | Wait for cold start / retry; check `<BACKEND_URL>/api/health` |
| CORS error in console | domain missing from allowlist | Add `https://<WWW_DOMAIN>` + apex to `CORS_ALLOWED_ORIGINS`, redeploy |
| Backend won't start after deploy | `JWT_SECRET` unset in prod | Set a strong `JWT_SECRET` env var (fail-fast guard) |
| Apex doesn't resolve | registrar disallows apex CNAME | Use Vercel's A record or GoDaddy forwarding to www |
| Site loads but blank/old data | bootstrap/host cache (60s) or wrong tenant data | Wait 60s (cache TTL); changing customDomain evicts caches immediately |

---

## Quick reference: onboarding a NEW school (condensed)
1. GoDaddy → confirm domain active + **default GoDaddy nameservers**.
2. Vercel → **Settings → Domains** → add `www.<domain>` + apex (redirect to www); copy the exact
   CNAME target it shows (unique per-domain, e.g. `xxxx.vercel-dns-017.com`).
3. GoDaddy → **Manage DNS** → edit the `www` CNAME → set Value = that Vercel target; apex → A
   record / forwarding to www. (Leave `_domainconnect` alone.)
4. PROD backend (super-admin): find the school's prod tenant id, then
   `PUT /api/admin/tenants/<PROD_TENANT_ID>/custom-domain?customDomain=www.<domain>`.
5. Render → append `https://www.<domain>,https://<domain>` to `CORS_ALLOWED_ORIGINS`; redeploy.
6. Wait for Vercel SSL (padlock), then run the testing checklist.
No code changes required per school.
