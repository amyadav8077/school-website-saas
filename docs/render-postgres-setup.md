# Migrating the Backend to Render PostgreSQL (Persistent Data)

## Why

The backend currently runs on Render's free tier using **file-based H2**
(`jdbc:h2:file:./data/...`). Render's free web-service filesystem is **ephemeral** —
it is wiped on every spin-down (after ~15 min idle) and on every redeploy. Result:

- Data resets to the seeded baseline whenever the service restarts.
- You see "less data" / "data reloading" because the H2 file was wiped and the
  seeder re-ran (or the instance is mid-restart).

**Fix:** use a managed **Render PostgreSQL** database. It persists independently of
the web service, so data survives spin-downs and redeploys.

The backend is already prepared for this — no code changes required:
- `application-prod.properties` is configured for PostgreSQL via environment variables.
- Flyway migrations (`db/migration/V1..V21`) create all tables automatically.
- The PostgreSQL JDBC driver is already a dependency in `build.gradle`.

---

## Step 1 — Create a PostgreSQL database on Render

1. Render Dashboard → **New +** → **PostgreSQL**.
2. Set:
   - **Name**: `school-saas-db` (any name)
   - **Database**: `school_saas_db`
   - **User**: leave default (Render generates one)
   - **Region**: **same region as your web service** (important for latency)
   - **Plan**: **Free**
3. Click **Create Database** and wait until status is **Available**.
4. Open the database page and copy its connection details from **Connections**:
   - **Hostname** (e.g. `dpg-xxxxx-a.oregon-postgres.render.com`)
   - **Port** (`5432`)
   - **Database** (`school_saas_db`)
   - **Username**
   - **Password**
   - Also note the **Internal Database URL** (preferred when the web service is in
     the same region — faster and free of egress).

> Free Render PostgreSQL expires after **90 days**. Note the expiry; you can create a
> fresh one and re-seed later if needed. For long-term use, upgrade the DB plan.

---

## Step 2 — Point the backend at PostgreSQL (env vars)

On your **web service** (the Spring Boot backend) → **Environment** → add:

| Key | Value |
|-----|-------|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `DB_HOST` | the Postgres **Hostname** from Step 1 |
| `DB_PORT` | `5432` |
| `DB_NAME` | `school_saas_db` |
| `DB_USER` | the Postgres **Username** |
| `DB_PASSWORD` | the Postgres **Password** |

These map to `application-prod.properties`:

```properties
spring.datasource.url=jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}
spring.datasource.username=${DB_USER}
spring.datasource.password=${DB_PASSWORD}
```

> **Alternative:** if you prefer the single **Internal Database URL** Render provides,
> you can instead set `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, and
> `SPRING_DATASOURCE_PASSWORD` directly — Spring picks these up automatically. Using
> the discrete `DB_*` vars above keeps it aligned with the existing prod profile.

---

## Step 3 — Deploy

1. Save the environment variables (Render will trigger a redeploy).
2. Watch the deploy **Logs**. On first boot you should see:
   - **Flyway** applying migrations `V1 … V21` (creates all tables).
   - The **DatabaseSeeder** inserting the `admin` user and the `pioneer` tenant with
     full seed data (12 faculty, 12 achievers, events, carousel, achievements page,
     etc.) — because the Postgres DB starts empty.
3. Wait for **Live**.

---

## Step 4 — Verify

From your machine (the first call may cold-start ~60–90s on free tier):

```bash
curl -s https://school-backend-b6yr.onrender.com/api/health
# {"status":"UP",...}

curl -s https://school-backend-b6yr.onrender.com/api/sites/1/faculty | python3 -c "import sys,json;d=json.load(sys.stdin);print('faculty:',len(d if isinstance(d,list) else d.get('data',[])))"
# faculty: 12

curl -s https://school-backend-b6yr.onrender.com/api/sites/1/achievers | python3 -c "import sys,json;d=json.load(sys.stdin);print('achievers:',len(d if isinstance(d,list) else d.get('data',[])))"
# achievers: 12
```

Then open the Vercel site and refresh a few times — the data should now be **stable**
and **complete** (no more resets), because it lives in PostgreSQL.

---

## How the seeder behaves now (important)

The seeder only inserts data **when it is missing**:

```java
if (!tenantRepository.existsBySubdomain("pioneer")) { /* seed everything */ }
```

- **First deploy against the new empty Postgres** → seeds full data once.
- **Subsequent restarts/redeploys** → tenant already exists → **seeder skips**, and
  your data (including any edits made in the CMS) **persists**.

### If you later change the seed data
Because the seeder skips when `pioneer` exists, new seed changes won't apply to an
already-seeded Postgres DB. To re-seed from scratch, either:
- Drop/recreate the Render PostgreSQL database, or
- Manually delete the `pioneer` tenant rows, then redeploy.

---

## Notes & limitations

- **Free Postgres expires in 90 days** and has storage/row limits — fine for a
  demo/hobby project; upgrade for production.
- Keep the **web service and database in the same Render region** to use the fast,
  free internal network.
- The **keep-alive** (GitHub Action / UptimeRobot) is still useful to avoid cold
  starts, but it is no longer needed for data persistence — Postgres handles that.
- Redis is configured in the prod profile but **not used by any code**, so it does not
  need to be provisioned on Render.

---

## Quick reference

| Item | Value |
|------|-------|
| Profile | `SPRING_PROFILES_ACTIVE=prod` |
| DB env vars | `DB_HOST`, `DB_PORT=5432`, `DB_NAME=school_saas_db`, `DB_USER`, `DB_PASSWORD` |
| Schema creation | Flyway (`db/migration/V1..V21`) — automatic |
| Seeding | `DatabaseSeeder` — runs once when `pioneer` tenant is absent |
| Verify faculty | `GET /api/sites/1/faculty` → 12 |
| Verify achievers | `GET /api/sites/1/achievers` → 12 |
