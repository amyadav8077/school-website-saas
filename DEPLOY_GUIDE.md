# Multi-Tenant School SaaS Platform - Step-by-Step Deployment & Security Guide

This beginner-friendly guide walks you through deploying your full-stack SaaS platform to the cloud for free, maintaining secure communication to prevent any data breaches, utilizing Git for source version control, and switching databases automatically between local testing (H2) and the web (PostgreSQL).

---

## 🗺️ 1. Complete Cloud Hosting Architecture

```
  ┌────────────────────────────────────────────────────────┐
  │         🅰️ FRONTEND: Vercel (Free Hosting)              │
  │          Hosts Compiled Angular Single-Page App        │
  └───────────────────────────┬────────────────────────────┘
                              │ Sends Secure HTTPS Requests
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │         ☕ BACKEND: Render.com (Free Web Service)       │
  │         Runs Spring Boot App from Dockerfile           │
  └───────────────────────────┬────────────────────────────┘
                              │ Secure SSL JDBC Database Connection
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │     💾 DATABASE: Neon.tech (Free Serverless Postgres)  │
  │      Persistent relational storage (replaces local H2) │
  └────────────────────────────────────────────────────────┘
```

---

## 🔒 2. How Your Code Keeps Data and Communications Safe
Security is built natively into your code at every layer to prevent breaches:

1. **HTTPS / SSL Everywhere:** 
   Both Vercel (frontend) and Render (backend) enforce secure, encrypted SSL tunnels (`https://`) by default. This encrypts passwords, admissions records, and invoices in transit so they cannot be sniffed or hijacked.
2. **Strict CORS (Cross-Origin Resource Sharing) Headers:**
   Your backend is configured with `@CrossOrigin(origins = "http://localhost:4200")`. Before releasing to production, we allow the server to accept connections from your live Vercel URL. This blocks malicious external scripts from trying to query your backend.
3. **Zero Secrets in Source Code:**
   Database passwords, API keys, and usernames are **never** written in code. Instead, we use spring parameter mapping (e.g. `${DB_PASSWORD}`) so you can type them directly into Render's secure admin dashboard panel.

---

## 💾 3. Local (H2) vs Production (PostgreSQL) Database Setup
We have configured your system to support **two separate environments** automatically:

- **Local Testing:** When you run the project locally, Spring Boot looks at `application.properties` and starts up a fast, zero-configuration **In-Memory H2 Database**.
- **Production Web:** When deployed on Render, Render sets the environment variable `SPRING_PROFILES_ACTIVE=prod`. The backend automatically loads `application-prod.properties`, bypasses H2, and connects securely to your live **PostgreSQL** cloud database.

---

## 🚀 4. Step-by-Step Deployment Instructions

### Step A: Spin Up Your Live Database (Neon.tech)
1. Go to [Neon.tech](https://neon.tech) and sign up for a free account.
2. Click **Create Project**, name it `school-saas-db`, and select **PostgreSQL**.
3. Once created, Neon will show your connection string. Copy the database credentials:
   - **Host:** e.g., `ep-cool-lake-1234.us-east-2.aws.neon.tech`
   - **Database Name:** `neondb`
   - **Username:** e.g., `neondb_owner`
   - **Password:** e.g., `AbCd1234XyZ`

---

### Step B: Push Your Code to GitHub (Version Control)
Maintaining versions of your code allows you to track modifications and deploy to the web in one click.

1. Open your terminal at `/Users/amyadav/Documents/SchoolWebsiteProject`.
2. Run these simple commands to initialize your Git repository:
   ```bash
   # Initialize repository
   git init

   # Stage all modified and new files (excluding build files automatically)
   git add .

   # Commit changes locally with a descriptive note
   git commit -m "feat: implement custom Godaddy domains and home page builder sections"
   ```
3. Go to [GitHub.com](https://github.com), sign in, and create a new **Private** or **Public** repository named `school-website-saas`.
4. Link and push your local code to GitHub:
   ```bash
   # Link your GitHub repository (replace with your actual GitHub URL)
   git remote add origin https://github.com/your-username/school-website-saas.git
   git branch -M main
   git push -u origin main
   ```

---

### Step C: Deploy Your Backend (Render.com)
Render reads your Spring Boot project and hosts it securely.

1. Sign up for a free account at [Render.com](https://render.com).
2. Click **New +** -> **Web Service**.
3. Select **Build and deploy from a Git repository** and connect your GitHub account.
4. Select your `school-website-saas` repository.
5. In the configuration panel, specify:
   - **Name:** `school-backend`
   - **Root Directory:** `school-website-backend`
   - **Runtime:** `Docker` *(Render will automatically find the Dockerfile inside your backend and compile Java 17 for you!)*
6. Scroll down and click **Advanced** -> **Add Environment Variable** to add your database secrets:
   - `SPRING_PROFILES_ACTIVE` = `prod`
   - `DB_HOST` = *(Your Neon database host e.g. `ep-cool-lake-1234.us-east-2.aws.neon.tech`)*
   - `DB_NAME` = `neondb`
   - `DB_USER` = *(Your Neon database username)*
   - `DB_PASSWORD` = *(Your Neon database password)*
7. Click **Deploy Web Service**. Render will compile and output a live secure URL:
   `https://school-backend.onrender.com`

---

### Step D: Deploy Your Frontend (Vercel)
Vercel is the ultimate CDNs hosting provider for single-page Angular applications.

1. Sign up for a free account at [Vercel.com](https://vercel.com).
2. Click **Add New** -> **Project** and import your `school-website-saas` repository.
3. Configure the settings:
   - **Framework Preset:** `Angular`
   - **Root Directory:** Click Edit and select `school-website-frontend`.
   - **Build Command:** `ng build`
   - **Output Directory:** `dist/school-website-frontend/browser`
4. Click **Deploy**. Vercel will compile your Angular client and yield a live secure link:
   `https://schoolsaas.vercel.app`

---

### Step E: Update Your API Endpoints Interceptor
To make your frontend securely talk to your Render backend:
1. Open `/Users/amyadav/Documents/SchoolWebsiteProject/school-website-frontend/src/app/app.config.ts`.
2. Locate line 18:
   ```typescript
   const liveBackendUrl = 'https://school-backend.onrender.com';
   ```
3. Replace the placeholder URL with your **actual** Render live secure backend URL.
4. Commit and push the change to GitHub:
   ```bash
   git add .
   git commit -m "chore: map live Render production backend URL"
   git push origin main
   ```
5. **Vercel will auto-detect the update and re-deploy your website automatically!**

---

### Step F: Connect Your Custom GoDaddy Domain
1. In your **Vercel Dashboard** -> Go to **Settings** -> **Domains**.
2. Type your purchased domain (e.g., `www.pioneeracademy.edu`) and click **Add**.
3. Vercel will display DNS records:
   - **Type:** `CNAME` | **Name:** `www` | **Value:** `cname.vercel-dns.com`
4. Log into your **GoDaddy Domain Control Panel**, navigate to **DNS Management** for your domain, and add the CNAME record.
5. In minutes, your school portal will be live, secure, and masked with your professional GoDaddy domain!
