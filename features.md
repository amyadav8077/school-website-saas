# School Website SaaS Platform - Features & System Architecture Reference

This document provides a highly detailed, comprehensive architectural breakdown of both the **School Website Backend (Spring Boot)** and the **School Website Frontend (Angular 21+)** components of the multi-tenant SaaS School Website Builder and Portal. This reference serves as a developer blueprint to start immediate, frictionless code development.

---

## Table of Contents
1. [Part 1: School Website Backend Architecture (`school-website-backend`)](#1-backend-architecture)
   - [1.1 Tech Stack & Database Strategy](#11-tech-stack-database)
   - [1.2 Domain Entities & Database Persistence Layer](#12-domain-entities)
   - [1.3 Core REST API Endpoints Dictionary](#13-rest-endpoints)
   - [1.4 Seed Data Infrastructure (`DatabaseSeeder.java`)](#14-seed-infrastructure)
2. [Part 2: School Website Frontend Architecture (`school-website-frontend`)](#2-frontend-architecture)
   - [2.1 Angular Bootstrapping & Global Signals Hub](#21-bootstrapping-signals)
   - [2.2 Reactive Brand Tokens Mechanism (`branding-settings.ts`)](#22-branding-tokens)
   - [2.3 Core Standalone Components Catalog](#23-components-catalog)
   - [2.4 Interactive Page Builder & Seeding Engine](#24-page-builder)
3. [Part 3: Project Configuration & Commands Cheat Sheet](#3-command-cheat-sheet)

---

<a name="1-backend-architecture"></a>
## 1. Part 1: School Website Backend Architecture

The backend is structured as a modular, stateless Spring Boot monolith supporting multi-tenancy. Data isolation is maintained through a relational reference model using `tenantId` mapping.

---

<a name="11-tech-stack-database"></a>
### 1.1 Tech Stack & Database Strategy
- **Framework:** Spring Boot (Java 17 / Jakarta Persistence)
- **Dependency Management:** Gradle (`./gradlew`)
- **Database:** Embedded H2 Database (In-Memory, auto-created and pre-seeded on startup)
- **Lombok Integration:** Rich usage of annotations like `@Getter`, `@Setter`, `@NoArgsConstructor`, `@AllArgsConstructor`, and `@Builder` for clean boilerplates.
- **Security:** Custom role-based security configurations (`SecurityConfig.java`) with cross-origin headers (`@CrossOrigin(origins = "http://localhost:4200")`).

---

<a name="12-domain-entities"></a>
### 1.2 Domain Entities & Database Persistence Layer

Each key feature is modeled as a database entity in its respective domain package:

| Package | Entity | Table | Key Fields & Description |
| :--- | :--- | :--- | :--- |
| `tenantsubscription` | `Tenant` | `tenants` | `id`, `name` (unique), `subdomain` (unique), `customDomain`, `status` (ACTIVE/SUSPENDED/PENDING), timestamps. |
| `siteconfiguration` | `SiteConfig` | `site_configs` | `id`, `tenantId` (unique), `logoUrl`, `primaryColor`, `secondaryColor`, `accentColor`, `fontFamily`, `themeName` (preset), `contactEmail`, `contactPhone`, `socialLinks` (contains stringified top alert banner JSON). |
| `pagebuilder` | `Page` | `pages` | `id`, `tenantId`, `title`, `slug` (unique per tenant), `status` (DRAFT/PUBLISHED), meta SEO tags. |
| `pagebuilder` | `PageSection` | `page_sections` | `id`, `pageId`, `type` (HERO/FEATURES/DISCLOSURES/CONTACT/NOTICES/CAROUSEL/VIDEO/INTRO/FOUNDERS/FACILITIES/PHOTO_GRID), `positionOrder`, `config` (JSON configuration string containing versatile block contents to avoid database schema churn). |
| `academics` | `AcademicCourse` | `academic_courses` | `id`, `tenantId`, `name`, `gradeLevel`, `description`, `syllabusSummary`. |
| `academics` | `FacultyMember` | `faculty_members` | `id`, `tenantId`, `name`, `designation`, `qualification`, `bio`. |
| `academics` | `AcademicProgram` | `academic_programs` | `id`, `tenantId`, `name`, `type` (SCHOOL/COLLEGE/COACHING/PROFESSIONAL), `description`, `details`. |
| `academics` | `StudentAchiever` | `student_achievers` | `id`, `tenantId`, `name`, `score` (board grades/exam ranks), `courseName`, `testimonialText`. |
| `academics` | `GalleryItem` | `gallery_items` | `id`, `tenantId`, `type` (PHOTO/VIDEO), `title`, `category`, `mediaUrl`. |
| `academics` | `SchoolBranch` | `school_branches` | `id`, `tenantId`, `name`, `state`, `city`, `address`, `contactEmail`, `phone`. |
| `academics` | `EnrichmentActivity` | `enrichment_activities` | `id`, `tenantId`, `type` (SPORTS/UNIFORMS/EXPO), `title`, `description`, `details`. |
| `academics` | `BoardResult` | `board_results` | `id`, `tenantId`, `classLevel` (CLASS 10/CLASS 12), `assessmentYear`, `registeredStudents`, `passedStudents`, `passPercentage`, `remarks` (CBSE regulatory requirements). |
| `academics` | `TransferCertificate`| `transfer_certificates`| `id`, `tenantId`, `studentName`, `admissionNo`, `classLevel`, `section`, `fatherName`, `aadharNo`, `tcNumber`, `issueDate`, `pdfUrl` (CBSE TC validation). |
| `academics` | `JobPosting` | `job_postings` | `id`, `tenantId`, `title`, `department`, `qualification`, `experience`, `description`. |
| `academics` | `JobApplication` | `job_applications` | `id`, `tenantId`, `jobId`, `jobTitle`, `candidateName`, `candidateEmail`, `candidatePhone`, `status` (PENDING/ACCEPTED/REJECTED). |
| `grades` | `StudentGrade` | `student_grades` | `id`, `tenantId`, `studentName`, `subjectName`, `term`, `grade`, `remarks` (Student assessment grades lookup ledger). |
| `billing` | `FeeItem` | `fee_items` | `id`, `tenantId`, `name`, `amount`, `description`, `gradeLevel`. |
| `billing` | `StudentInvoice` | `student_invoices` | `id`, `tenantId`, `studentName`, `gradeLevel`, `feeItemName`, `amount`, `status` (PENDING/PAID), `dueDate`. |
| `admissions` | `AdmissionLead` | `admission_leads` | `id`, `tenantId`, `studentName`, `gradeLevel`, `parentName`, `parentEmail`, `parentPhone`, `status` (PENDING/CONTACTED/ADMITTED), `message`. |
| `support` | `SupportInquiry` | `support_inquiries` | `id`, `senderName`, `senderEmail`, `subject`, `message`, `status` (PENDING/RESOLVED), resolution notes. |
| `notifications` | `SchoolNews` | `school_news` | `id`, `tenantId`, `title`, `content`, `author`, `publishedDate` (circular notices board). |
| `notifications` | `SchoolEvent` | `school_events` | `id`, `tenantId`, `title`, `description`, `eventDate`, `location` (calendar milestones). |
| `auth` | `AdminUser` | `admin_users` | `id`, `username`, `password`, `role` (SUPER_ADMIN/TENANT_ADMIN), `tenantId`. |

---

<a name="13-rest-endpoints"></a>
### 1.3 Core REST API Endpoints Dictionary

The backend serves REST API endpoints classified by security/access level:

#### 🟢 SaaS Platform Core & Tenant Admins (Public / Global)
- `GET /api/health` -> System heart-beat. Returns `{"status": "UP", "message": "School Website Backend is fully functional!"}`.
- `POST /api/admin/tenants` -> Onboards a new Tenant School and auto-generates its baseline `SiteConfig`.
- `GET /api/admin/tenants` -> Lists all registered tenant schools.
- `GET /api/admin/tenants/{subdomain}` -> Resolves tenant record by custom subdomain.
- `PUT /api/admin/tenants/{tenantId}/custom-domain` -> Updates and registers a custom GoDaddy domain for a tenant school.
- `POST /api/admin/tenants/{sourceTenantId}/clone` -> Duplicates/clones an entire school's site branding configs and page builder layouts to a brand new school template workspace.
- `POST /api/auth/login` -> Authenticates admin credentials.
- `POST /api/auth/tenant-admins` -> Provisions credentials for a new Tenant School administrator.
- `GET /api/auth/tenant-admins/{tenantId}` -> Reads tenant administrator settings.
- `POST /api/auth/change-password` -> Processes secure password rotations.
- `POST /api/auth/forgot-password/request` -> Generates a secure, 5-minute random OTP code to reset admin passwords via registered email or phone, logging it securely to console.
- `POST /api/auth/forgot-password/reset` -> Verifies the OTP code and securely overrides the target administrator password.

#### 🎨 Custom Site Branding & Customizations (Public/Staff)
- `GET /api/sites/{subdomain}/config` -> Retrieves primary logo, custom theme colors, marquee announcement strings, and contacts by subdomain.
- `PUT /api/sites/{tenantId}/config` -> Updates design configurations (Primary, Secondary, Accent, Font, Logo Base64 string, Marquee alert JSON).

#### 🏗️ Dynamic Page Layout Builder
- `POST /api/sites/{tenantId}/pages` -> Provisions a custom blank page or pre-seeds predefined template pages.
- `GET /api/sites/{tenantId}/pages` -> Lists all compiled dynamic pages and nested section orders for a school.
- `GET /api/sites/{tenantId}/pages/slug/{slug}` -> Queries specific page structure by slug (e.g. `home`, `admissions`).
- `PUT /api/sites/pages/{pageId}/sections` -> Updates and re-compiles the entire ordered section list.
- `DELETE /api/sites/pages/{pageId}` -> Safely purges an obsolete custom page.

#### 📚 Academics & Faculty Portals
- `GET /api/sites/{tenantId}/courses` -> Returns academic syllabus courses.
- `POST /api/admin/sites/{tenantId}/courses` -> Creates a new course syllabus record.
- `DELETE /api/admin/courses/{id}` -> Purges a course record.
- `GET /api/sites/{tenantId}/faculty` -> Retrieves department faculty staff directories.
- `POST /api/admin/sites/{tenantId}/faculty` -> Adds a faculty instructor.
- `DELETE /api/admin/faculty/{id}` -> Deletes a faculty member.
- `GET /api/sites/{tenantId}/programs` -> Fetches coaching curriculum programs (e.g. Narayana-style NEET/JEE JEE models).
- `POST /api/admin/sites/{tenantId}/programs` -> Appends a new coaching or professional program stream.
- `DELETE /api/admin/programs/{id}` -> Removes an academic program.

#### 🏆 Board Disclosures, CBSE Appendices, & Transfer Certificates (TC)
- `GET /api/sites/{tenantId}/board-results` -> Fetches regulatory CBSE 3-year board statistics.
- `POST /api/admin/sites/{tenantId}/board-results` -> Submits a class board score report.
- `DELETE /api/admin/board-results/{id}` -> Purges board result row.
- `GET /api/sites/{tenantId}/tc` -> Validates TC lookup using `tcNumber` or Aadhar card details.
- `GET /api/admin/sites/{tenantId}/tc` -> Retrieves all issued student Transfer Certificates.
- `POST /api/admin/sites/{tenantId}/tc` -> Issues a new CBSE compliant certificate.
- `DELETE /api/admin/tc/{id}` -> Retracts / deletes a TC record.

#### 📊 Student Grades Ledger (Gradebook lookup)
- `GET /api/sites/{tenantId}/grades` -> Resolves grade lookup (queries student name via `?studentName=`).
- `POST /api/admin/sites/{tenantId}/grades` -> Submits student evaluation report card data.
- `DELETE /api/admin/grades/{id}` -> Purges grade record.

#### 💼 Campus Life Gallery, Branches & Enrichment
- `GET /api/sites/{tenantId}/gallery` -> Reads image carousel slides and video items.
- `POST /api/admin/sites/{tenantId}/gallery` -> Appends photo or video items to campus catalogs.
- `DELETE /api/admin/gallery/{id}` -> Removes items from the media catalog.
- `GET /api/sites/{tenantId}/branches` -> Lists all branch campuses (IT Madhapur, HSR Layout, etc.).
- `POST /api/admin/sites/{tenantId}/branches` -> Maps an additional sister branch.
- `DELETE /api/admin/branches/{id}` -> Deletes branch listing.
- `GET /api/sites/{tenantId}/enrichment` -> Returns sports clubs, uniform definitions, and student expo events.
- `POST /api/admin/sites/{tenantId}/enrichment` -> Registers enrichment activities.
- `DELETE /api/admin/enrichment/{id}` -> Removes enrichment activities.

#### 💼 Career Opportunities & Applicant Tracking System (ATS)
- `GET /api/sites/{tenantId}/jobs` -> Fetches active faculty vacancies.
- `POST /api/sites/{tenantId}/jobs/{jobId}/apply` -> Submits candidate details and resume indicators for a job opening.
- `GET /api/admin/sites/{tenantId}/applications` -> Retrieves all job candidate application leads.
- `PUT /api/admin/applications/{id}/status` -> Updates candidate status (e.g. ACCEPTED, REJECTED, PENDING).
- `POST /api/admin/sites/{tenantId}/jobs` -> Spawns a new career vacancy.
- `DELETE /api/admin/jobs/{id}` -> Removes a job opening.

#### 💳 Tuition Invoicing & Fee Payment Desks
- `GET /api/sites/{tenantId}/fees` -> Fetches fee structures (Bus, Tuition, Lab, etc.).
- `POST /api/admin/sites/{tenantId}/fees` -> Logs a new fee Category.
- `GET /api/sites/{tenantId}/invoices` -> Parents invoices lookup (queries student name via `?studentName=`).
- `POST /api/admin/sites/{tenantId}/invoices` -> Dispatches an invoice to a student record.
- `PUT /api/sites/invoices/{id}/pay` -> Simulates parent checkout payment and marks status as `PAID`.

#### 📝 Admissions CRM & Help Desk Support
- `POST /api/sites/{tenantId}/admissions` -> Receives prospective parents' admissions inquiry leads.
- `GET /api/admin/sites/{tenantId}/admissions` -> Retrieves pipeline leads for CRM review.
- `PUT /api/admin/admissions/{leadId}/status` -> Transitions lead status (PENDING -> CONTACTED -> ADMITTED).
- `POST /api/sites/{tenantId}/support` -> Submits a technical inquiry or parent feedback ticket.
- `GET /api/admin/sites/{tenantId}/support` -> Fetches active support requests.
- `PUT /api/admin/support/{id}/resolve` -> Resolves support ticket and records response comments.

---

<a name="14-seed-infrastructure"></a>
### 1.4 Seed Data Infrastructure (`DatabaseSeeder.java`)

When the backend starts up, `DatabaseSeeder.java` initializes standard user permissions and boots up a pre-configured, highly stylized school workspace to immediately test frontend integrations:

1. **Default Super Admin:**
   - **Username:** `admin`
   - **Password:** `admin123`
   - **Role:** `SUPER_ADMIN`

2. **Pre-populated Tenant School: "SaaS Pioneer Academy" (`pioneer`)**
   - **Subdomain:** `pioneer`
   - **Admin login:** `pioneer_admin` / `pioneer123`
   - **Theme Preset:** `ROYAL_NAVY`
   - **Branding Palette:** Royal Navy Blue (`#1e3a8a`), Academic Crimson (`#991b1b`), and Gold Accent (`#fbbf24`).
   - **CMS Pages & Content Loaded:** Complete setup with `home` (Hero, Carousel, Highlight Features, Video player), `admissions` (Inquiry Form, board affiliation files), `courses`, `faculty`, `fees`, `contact`, `news`, `grades`, `gallery`, `careers`, `disclosures`, and `tc`.
   - **Mock Data Seeds:**
     - 4 Academic Programs (Gurukul-style primary, Coaching camps NEET & JEE prep, Professional bootcamps).
     - 3 Board Toppers & student achievers (e.g. Riddhi Sharma scoring CBSE 499/500).
     - 3 CBSE regulatory Class 10 & Class 12 board result trends (2023 - 2025).
     - 2 Mock student Transfer Certificates (Harry Potter, Ron Weasley).
     - 2 Active Career vacancies (Senior IIT-JEE Prep Physics faculty with applicant Bruce Banner).
     - Tuition & Bus invoicing logs under active parent query indexes.

---

<a name="2-frontend-architecture"></a>
## 2. Part 2: School Website Frontend Architecture

The frontend is implemented in **Angular (v21+)** as a modern, standalone reactive client. It leverages Signals for highly responsive state management and dynamic template bindings.

---

<a name="21-bootstrapping-signals"></a>
### 2.1 Angular Bootstrapping & Global Signals Hub
The entry component `App` (`src/app/app.ts`) maintains core application state. It manages:

- **Active Tenant Context (`activeTenant`):** Holds the current school ID, name, and subdomain of the active workspace.
- **Active Role Context (`activeRole`):** Dynamically alternates application layout between `SCHOOL_ADMIN` (staff customization desk) and `PARENT_VISITOR` (customized public sandbox view).
- **Global Signals Directories:** Stores public catalog lists fetched from backend APIs (e.g., `publicCourses`, `publicFaculty`, `publicPrograms`, `publicNews`, `publicEvents`).
- **Sync Trigger Signals:** Increments integers (e.g. `admissionsRefreshTrigger`, `billingRefreshTrigger`) which are input-bound to nested components. This forces sub-components to auto-refresh their list views when changes are made.

---

<a name="22-branding-tokens"></a>
### 2.2 Reactive Brand Tokens Mechanism (`branding-settings.ts`)

School design themes are dynamic and reactive. Under `branding-settings.ts`, when an administrator alters colors, fonts, or selects default emojis as a crest, the changes are updated live on the viewport using **CSS Custom Properties**:

```typescript
// Dynamically mapping brand attributes into Document CSS custom variables:
if (typeof document !== 'undefined') {
  const root = document.documentElement;
  root.style.setProperty('--tenant-primary', config.primaryColor);
  root.style.setProperty('--tenant-secondary', config.secondaryColor);
  root.style.setProperty('--tenant-accent', config.accentColor);
  root.style.setProperty('--tenant-font', config.fontFamily);
}
```

The app's styling sheets (`app.scss` and global assets) bind UI elements to these tokens (e.g., `background: var(--tenant-primary);`), yielding an instant theme-switching experience.

---

<a name="23-components-catalog"></a>
### 2.3 Core Standalone Components Catalog

All features exist as single-file, standalone Angular components located in `src/app/features/`. Each component is self-contained with integrated styles, templates, logic, and state:

| Component | Target Role | Actions & API Interactivity |
| :--- | :--- | :--- |
| `login.ts` | Platform User | Authenticates username and password against `POST /api/auth/login`. Sets session storage of logged-in admin identity. |
| `user-profile.ts` | Logged-in User| Facilitates secure profile password changes (`POST /api/auth/change-password`). |
| `tenant-onboarding.ts`| Super Admin | Onboards a new school (`POST /api/admin/tenants`) and provisions its default administrator account (`POST /api/auth/tenant-admins`). |
| `branding-settings.ts`| School Admin | Manages theme presets (Traditional Gurukul, Academic Navy, Holistic Forest Green, Tech Slate). Serializes the marquee alert details into JSON strings for DB updates (`PUT /api/sites/{tenantId}/config`). |
| `admissions-form.ts` | Parent / Visitor | Submits prospective parent inquiry records (`POST /api/sites/{tenantId}/admissions`). |
| `admissions-manager.ts`| School Admin | CRM terminal for reviewing parents' inquiries. Transitions leads (`PUT /api/admin/admissions/{id}/status?status=CONTACTED`). |
| `contact-form.ts` | Parent / Visitor | Submits general help desk tickets (`POST /api/sites/{tenantId}/support`). |
| `support-manager.ts` | School Admin | Dashboard for managing parent inquiries. Allows staff to record resolution remarks and close requests (`PUT /api/admin/support/{id}/resolve`). |
| `payment-portal.ts` | Parent / Visitor | Looks up fee outstanding bills by student name (`GET /api/sites/{tenantId}/invoices`). Simulates secure mock online payment checkouts (`PUT /api/sites/invoices/{id}/pay`). |
| `billing-manager.ts` | School Admin | Issues invoice bills (`POST /api/admin/sites/{tenantId}/invoices`) and catalogs new fee structures (`POST /api/admin/sites/{tenantId}/fees`). |
| `report-card-lookup.ts`| Parent / Visitor | Looks up student midterm/final assessment transcripts by student name (`GET /api/sites/{tenantId}/grades`). |
| `gradebook-manager.ts`| School Admin | Input terminal for recording student scores. Supports bulk grid entry inputs (`POST /api/admin/sites/{tenantId}/grades`). |
| `tc-lookup.ts` | Parent / Visitor | Compliance search engine. Validates official Transfer Certificates by TC No or Aadhar number (`GET /api/sites/{tenantId}/tc`). |
| `tc-manager.ts` | School Admin | Issues CBSE-compliant student transfer credentials (`POST /api/admin/sites/{tenantId}/tc`). |
| `careers-portal.ts` | Job Applicant | Views vacancy opportunities (`GET /api/sites/{tenantId}/jobs`) and submits job applications (`POST /api/sites/{tenantId}/jobs/{jobId}/apply`). |
| `careers-manager.ts` | School Admin | Tracks applicants. Allows staff to accept/reject candidates (`PUT /api/admin/applications/{id}/status`). |
| `achievers-carousel.ts`| Parent / Visitor | Renders testimonial carousels of board toppers. |
| `public-disclosures.ts`| Regulatory | Renders Mandatory CBSE Appendix IX regulatory documents. Charts the 3-year board trends. |
| `school-branches.ts` | Parent / Visitor | Lists branch campuses with localized emails, physical maps, and telephone lines. |
| `campus-enrichment.ts` | Parent / Visitor | Displays sports academies, student expo schedules, and official uniform protocols. |
| `campus-gallery.ts` | Parent / Visitor | Displays responsive galleries of campus events. Handles Base64 local image carousels and YouTube virtual video playback integrations. |
| `page-builder.ts` | School Admin | Section-composition panel. Customizes page section order, hero titles, notices, and uploads local carousel assets. |

---

<a name="24-page-builder"></a>
### 2.4 Interactive Page Builder & Seeding Engine

The **CMS School Page Builder** (`page-builder.ts`) provides a powerful visual interface for customizing the public-facing pages of the school:

- **Predefined Page Templates:** Allows one-click seeding of standard compliance pages (Home, Admissions, Careers, Mandatory Disclosures, Gallery, TC, etc.). Choosing a template automatically sends a payload pre-seeding necessary page sections (e.g., a HOME page is seeded with `HERO`, `CAROUSEL`, and `FEATURES` sections).
- **Visual Section Palette:** Appends structure blocks to the selected page's section list:
  - `HERO`: Header title and subtitles.
  - `FEATURES`: Twin highlight cards (e.g. Science Labs, Athletic Grounds).
  - `NOTICES`: Announcement notice boards.
  - `DISCLOSURES`: CBSE compliance regulatory links.
  - `CAROUSEL`: Unlimited local image slide uploads with captions.
  - `VIDEO`: Multiple virtual tour video plays (YouTube embeds or uploaded files).
  - `INTRO`: Core school introduction, welcome message, and side-by-side welcome photograph.
  - `FOUNDERS`: Infinite list of founder boards featuring portrait uploads, roles, and bios.
  - `FACILITIES`: Comprehensive visual campus infrastructure cards (Title, Description, and Photo uploads).
  - `PHOTO_GRID`: Filterable, responsive photos masonry/gallery (Academics, Sports, Cultural, Campus filters).
- **Layout Compiler:** Handles real-time section re-ordering (using **▲ / ▼** buttons) and deletions. When the admin clicks **Save Page Sections**, the layout list is compiled and saved (`PUT /api/sites/pages/{pageId}/sections`).

---

<a name="3-command-cheat-sheet"></a>
## 3. Part 3: Project Configuration & Commands Cheat Sheet

Use these exact commands to build, compile, and run the complete multi-tenant environment:

### ☕ Running the Backend (Spring Boot)
Ensure Java 17+ is configured on your development terminal.
```bash
# 1. Navigate to backend directory
cd /Users/amyadav/Documents/SchoolWebsiteProject/school-website-backend

# 2. Build application, skipping tests for fast compilation
./gradlew build -x test

# 3. Launch Spring Boot Server (starts up locally at http://localhost:8080)
./gradlew bootRun
```

### 🅰️ Running the Frontend (Angular 21)
Ensure Node.js v18+ and npm are installed.
```bash
# 1. Navigate to frontend directory
cd /Users/amyadav/Documents/SchoolWebsiteProject/school-website-frontend

# 2. Install NPM packages
npm install

# 3. Build & verify compilation for widescreen page templates & CSS assets
npm run build

# 4. Start Local Development Server (starts up locally at http://localhost:4200)
npm start
```
