# Keeping the Backend Awake with UptimeRobot

Our Spring Boot backend is hosted on **Render (free tier)**. Render spins a free
web service down after **~15 minutes of no inbound traffic**, so the first request
after a period of inactivity triggers a slow **cold start (~30–60s)**.

UptimeRobot is a free uptime-monitoring service. By pointing it at our backend
health endpoint on a short interval, it sends regular traffic that keeps the
service warm — and gives us an uptime dashboard and downtime alerts as a bonus.

This is an alternative (or complement) to the GitHub Actions keep-alive workflow
in `.github/workflows/keep-backend-alive.yml`.

---

## Prerequisites

- The backend must be deployed and publicly reachable on Render.
- Health endpoint: **`GET /api/health`**
  - Full URL example: `https://school-backend-b6yr.onrender.com/api/health`
  - Returns HTTP `200` with body:
    ```json
    { "status": "UP", "message": "School Website SaaS Backend is running" }
    ```

Quick manual check before configuring anything:

```bash
curl -i https://school-backend-b6yr.onrender.com/api/health
```

Expect a `200 OK` and the JSON body above.

---

## Step-by-step configuration

### 1. Create a free UptimeRobot account
1. Go to <https://uptimerobot.com>.
2. Click **Sign Up** (Register) and create a free account.
3. Verify your email and log in — you'll land on the **Dashboard**.

### 2. Add a new monitor
1. Click **+ New monitor** (top left).
2. Fill in the fields:
   | Field | Value |
   |-------|-------|
   | **Monitor Type** | `HTTP(s)` |
   | **Friendly Name** | `School Backend Health` |
   | **URL (or IP)** | `https://school-backend-b6yr.onrender.com/api/health` |
   | **Monitoring Interval** | `5 minutes` |
3. Leave the other defaults as-is for now.

> **Why 5 minutes?** Render sleeps after ~15 minutes of inactivity, so any interval
> under 15 minutes keeps it warm. 5 minutes gives a comfortable safety margin and is
> the smallest interval available on the free plan.

### 3. (Recommended) Confirm it expects a healthy response
UptimeRobot marks the monitor **Up** on any `2xx` response by default, which matches
our endpoint. Optionally, to be stricter:
1. Open the monitor → **Edit**.
2. Expand **Advanced / Optional settings**.
3. Under **Keyword** (if available on your plan), set:
   - Keyword Type: **exists**
   - Keyword: `UP`
   This makes the check pass only when the response body actually contains `UP`.

### 4. Set up alerts (optional but useful)
1. In the monitor's settings, find **Alert Contacts To Notify**.
2. Ensure your email is selected (add SMS/Slack/webhook if you like).
3. Save. You'll now get an email if the backend ever goes down.

### 5. Save and verify
1. Click **Create Monitor** (or **Save Changes**).
2. Back on the dashboard, the monitor should turn **green / Up** within a few minutes.
3. Click the monitor to see its **uptime %, response times, and event log**.

---

## How to test it works

- **Immediate check:** open the monitor and use **Test / Check now** (if shown), or
  just wait for the next 5-minute cycle and confirm status is **Up**.
- **Cold-start behavior:** if the service was asleep, the very first check may show a
  slow response time (or a brief timeout) while Render wakes it, then recover to
  normal on the next check. That's expected and is exactly the cold start we're
  avoiding for real users.

---

## Is 5 minutes enough? (Render free-tier behavior)

- Render free web services spin down after **~15 minutes** of no inbound requests.
- **Any interval < 15 minutes keeps the service warm.** 5 minutes is well within that.
- The **first** ping after a sleep still cold-starts, but it wakes the service so the
  next real user gets a fast response.

> **Measured on this backend:** a cold-start request to
> `https://school-backend-b6yr.onrender.com/api/health` took **~97 seconds**, while
> the very next (warm) request returned in **~0.35 seconds**. That ~97s first-hit
> penalty is exactly what the keep-alive prevents for real users.

---

## Limitations & things to know

- **Free plan interval floor is 5 minutes** — you can't go faster without a paid plan.
  That's still fine for Render's 15-minute sleep window.
- UptimeRobot is generally **more punctual than GitHub Actions cron**, which is
  best-effort and can be delayed or skipped under load. This is why UptimeRobot is a
  more reliable keep-alive than the Actions workflow.
- Keeping a free service always-on via external pings is a common practice, but it
  does mean the service effectively never idles — acceptable for a hobby/free project.
- This only keeps the service **warm**; it is **not** a substitute for real
  monitoring/observability if this ever becomes production-critical.

---

## Using UptimeRobot together with the GitHub Action

You can run both:

- **UptimeRobot** — primary keep-alive (punctual 5-min pings + alerts + dashboard).
- **GitHub Action** (`keep-backend-alive.yml`) — CI-visible backup ping, useful if
  you want the keep-alive to live alongside the codebase and show up in the Actions tab.

Both simply call `GET /api/health`; running both causes no harm.

---

## Quick reference

| Item | Value |
|------|-------|
| Monitor type | HTTP(s) |
| URL | `https://school-backend-b6yr.onrender.com/api/health` |
| Interval | 5 minutes |
| Expected status | `200 OK` |
| Expected body contains | `UP` |
| Render sleep threshold | ~15 minutes of inactivity |
