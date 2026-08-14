# Keeping the Backend Awake with GitHub Actions

Our Spring Boot backend is hosted on **Render (free tier)**. Render spins a free
web service down after **~15 minutes of no inbound traffic**, so the first request
after inactivity triggers a slow **cold start** (measured at **~97 seconds** on this
backend; the next warm request returned in **~0.35 seconds**).

To keep the service warm, a scheduled **GitHub Actions** workflow periodically calls
the backend health endpoint.

- Workflow file: `.github/workflows/keep-backend-alive.yml`
- Health endpoint pinged: `GET {BACKEND_URL}/api/health`
- Expected response: `200 OK` with `{ "status": "UP", "message": "..." }`

> This is one option. For a more punctual alternative, see
> [`uptimerobot-setup.md`](./uptimerobot-setup.md). You can run both.

---

## What the workflow does

- Runs on a **cron schedule** (every 10 minutes by default) and can be **triggered
  manually** from the Actions tab.
- Reads the backend base URL from a **Repository Variable** named `BACKEND_URL`
  (falls back to a Secret of the same name). The URL is **not hardcoded**.
- Calls `{BACKEND_URL}/api/health` with `curl`, tolerant of Render cold starts
  (`--max-time 90`, retries with delay).
- **Fails the job** if the endpoint returns a non-2xx status or is unreachable.
- Logs the timestamp, endpoint, response body, and HTTP status with GitHub
  `::notice::` / `::error::` annotations.

---

## Configure the `BACKEND_URL` Repository Variable

The backend URL is not secret, so a **Repository Variable** is preferred (a Secret
also works — the workflow checks the Variable first, then the Secret).

1. Open the repo on GitHub:
   <https://github.com/amyadav8077/school-website-saas>
2. Click **Settings** (top menu of the repository).
3. In the left sidebar: **Secrets and variables** → **Actions**.
4. Select the **Variables** tab (not Secrets).
5. Click **New repository variable**.
6. Enter:
   | Field | Value |
   |-------|-------|
   | **Name** | `BACKEND_URL` |
   | **Value** | `https://school-backend-b6yr.onrender.com` |
7. Click **Add variable**.

### Important
- Use the **base URL only** — do **not** append `/api/health` or a trailing slash.
  The workflow adds `/api/health` itself (and strips a trailing slash if present).
- To change the backend later, just edit this variable — no code change needed.

### Where it is consumed in the workflow
```yaml
env:
  BACKEND_URL_VAR: ${{ vars.BACKEND_URL }}      # repository variable (preferred)
  BACKEND_URL_SECRET: ${{ secrets.BACKEND_URL }} # fallback if you used a secret
```

---

## Manually trigger the workflow (for testing)

1. Make sure the workflow file exists on the **default branch** (`main`) and is pushed.
2. Repo → **Actions** tab.
3. In the left list, click **Keep Backend Alive**.
4. Click **Run workflow** → choose branch `main` → **Run workflow**.
5. Open the run → **ping** job → **Call health endpoint** step.
6. Confirm the log shows the response body and `HTTP status code: 200`, plus a
   `Backend is awake and healthy` notice.

Local sanity check (optional):
```bash
curl -i https://school-backend-b6yr.onrender.com/api/health
```
Expect `200 OK` and `{"status":"UP","message":"School Website SaaS Backend is running"}`.

---

## Changing the schedule

Edit the `cron` line in `.github/workflows/keep-backend-alive.yml`:

```yaml
on:
  schedule:
    - cron: "*/10 * * * *"   # every 10 minutes (UTC)
```

- Times are **UTC**.
- Minimum granularity on GitHub is **5 minutes** (`*/5 * * * *`).
- Any interval **under 15 minutes** keeps Render warm. 10 minutes is a safe default
  with margin for the occasional delayed/skipped run.

---

## Is every 5–10 minutes enough? (Render free-tier behavior)

- Render free web services spin down after **~15 minutes** of no inbound traffic.
- **Any interval < 15 minutes keeps it warm.** 10 minutes gives comfortable margin.
- The first ping after a sleep still cold-starts (~90s here), but it wakes the
  service so the next real user gets a fast response.

---

## Limitations & concerns with GitHub Actions

- **Cron is best-effort, not exact.** Scheduled workflows are frequently **delayed**
  (sometimes 5–15+ minutes) under load and can occasionally be **skipped**. So a
  "10-minute" schedule may sometimes slip past Render's 15-minute window and let it
  sleep. It reduces cold starts a lot but does not guarantee zero.
- **Minimum interval is 5 minutes** — you can't go faster on GitHub.
- **Auto-disable after 60 days** of no repository activity (any commit re-enables it;
  a manual run also helps).
- **Only the default branch's** copy of the workflow runs on schedule.
- **Actions minutes**: public repos get unlimited minutes; private repos draw from
  the free tier (2,000 min/month). Each run is only a few seconds, so usage is tiny.

For maximum reliability, consider **UptimeRobot at 5 minutes** as the primary
keep-alive and this GitHub Action as a CI-visible backup.

---

## Quick reference

| Item | Value |
|------|-------|
| Workflow file | `.github/workflows/keep-backend-alive.yml` |
| Variable name | `BACKEND_URL` |
| Variable value | `https://school-backend-b6yr.onrender.com` |
| Endpoint pinged | `{BACKEND_URL}/api/health` |
| Default schedule | every 10 minutes (`*/10 * * * *`, UTC) |
| Manual run | Actions tab → Keep Backend Alive → Run workflow |
| Expected status | `200 OK` |
| Render sleep threshold | ~15 minutes of inactivity |
