# School Website SaaS Platform - Step-by-Step Build Instructions

Follow this guide to compile, run, and verify both the backend and frontend services on your local machine.

---

## Prerequisites
Before you begin, ensure you have the following installed on your local computer:
1.  **Java Development Kit (JDK 17 or higher)**
2.  **Node.js (v18 or higher)** and **npm**
3.  **Angular CLI (v17+)** (Can be run locally via `npx` or installed globally with `npm install -g @angular/cli`)

---

## Step 1: Run the Backend Service (`school-website-backend`)

The backend is a Spring Boot application using Gradle and an embedded H2 database (so no separate database setup is required).

### 1. Navigate to the Backend Directory:
```bash
cd /Users/amyadav/Documents/SchoolWebsiteProject/school-website-backend
```

### 2. Build the Application:
```bash
./gradlew build -x test
```

### 3. Run the Spring Boot Server:
```bash
./gradlew bootRun
```
*The REST API server will start up locally at **`http://localhost:8080`**.*

---

## Step 2: Run the Frontend Application (`school-website-frontend`)

The frontend is an Angular standalone application that hot-reloads in response to any changes you make in real-time.

### 1. Navigate to the Frontend Directory:
```bash
cd /Users/amyadav/Documents/SchoolWebsiteProject/school-website-frontend
```

### 2. Install Package Dependencies:
```bash
npm install
```

### 3. Build & Verify compilation:
```bash
npm run build
```
*(This compiles and validates all widescreen page templates, custom logo upload tools, and sticky footers without any TypeScript errors).*

### 4. Run the Local Development Server:
```bash
npm start
```
*The development server will launch locally at **`http://localhost:4200`**.*

---

## Step 3: Test the Complete Flow in Your Browser

1.  Open **`http://localhost:4200`** in your browser.
2.  Onboard a new tenant school (e.g. Oakridge Academy).
3.  **Admin Customizations:**
    *   Toggle role to **School Administrator** at the top.
    *   Under **Branding Settings**, click *"Upload Custom Logo"* to upload a school emblem PNG/JPG, and configure your **Top Announcement Banner** (message, scroll direction, redirect button, etc.).
    *   Under **Page Builder**, add a page or pre-seed a template (like the **School Photo & Video Gallery** page). Add dynamic carousel slides or video files!
    *   Click **"Save & Propagate Brand Theme"** or **"Save Page Layout"**.
4.  **Public Preview View:**
    *   Toggle role back to **Parent / Visitor**.
    *   Look at the live, widescreen website preview below. Click **"🖥️ Full-Page Preview"** to experience it in absolute full-screen mode!
    *   Click the scrolling top announcement banner button; it will dynamically slide open and focus directly onto your selected admissions/news page!
