# OpenHire

> **Connect Talent. Discover Opportunities.**

OpenHire is a complete, modern, full-stack open-source job portal designed for student careers, developers, and modern recruiters. Built for academic excellence and startup-grade production quality, OpenHire bridges the gap between ambitious job seekers and forward-thinking companies through transparent 5-stage application tracking, rule-based matching, and intuitive management workflows.

---

## 📑 Table of Contents

- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [Screenshots & UI Showcase](#-screenshots--ui-showcase)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [Database Schema & Models](#-database-schema--models)
- [API Documentation](#-api-documentation)
- [Authentication & Security](#-authentication--security)
- [Installation Guide](#-installation-guide)
- [Environment Variables](#-environment-variables)
- [Running Locally](#-running-locally)
- [Demo Accounts (Academic Jury Testing)](#-demo-accounts-academic-jury-testing)
- [End-to-End Testing Verification](#-end-to-end-testing-verification)
- [Assignment Requirement Mapping](#-assignment-requirement-mapping)
- [Future Enhancements](#-future-enhancements)
- [License](#-license)

---

## 🎯 Project Overview

In today's fast-paced tech ecosystem, traditional recruitment platforms suffer from clutter, opaque application statuses, and aggressive paywalls. OpenHire solves this problem by providing a streamlined, high-performance, and community-driven job ecosystem where:
- **Job Seekers** discover curated technical roles, bookmark opportunities, apply with pre-filled profiles, and track their application lifecycle across 5 transparent milestones.
- **Employers & Recruiters** post openings with customizable requirements, analyze candidate inflow through weekly recruitment telemetry, and update candidate stages with a single click.

---

## 🚀 Key Features

### 🌟 Job Seeker Experience
1. **Interactive Career Search**: Instant full-text search across job titles, required skill sets, and company names with autocomplete suggestions.
2. **Multi-Faceted Filtering**: Filter by Domain Category (8 domains), Employment Type, Work Mode (Remote/Hybrid/On-site), Experience Level, and Date Posted.
3. **Personalized Job Recommendations**: Rule-based skill matching that surfaces relevant roles tailored to the seeker's declared abilities.
4. **Live 5-Stage Application Tracker**: Visual progress stepper:
   $$\text{Applied} \longrightarrow \text{Under Review} \longrightarrow \text{Shortlisted} \longrightarrow \text{Interview} \longrightarrow \text{Accepted / Rejected}$$
5. **Job Bookmarking**: One-click heart bookmarking stored securely in MongoDB.
6. **Dynamic Profile Completion**: Real-time percentage indicator evaluating profile richness and completeness.

### 🏢 Employer Experience
1. **Job Management Dashboard**: Complete lifecycle control (Publish, View, Edit, Mark as Filled, and Cascade Delete).
2. **Weekly Recruitment Analytics**: Interactive visual bar charts displaying applicant volume for the past 7 days.
3. **Candidate Review Portal**: Inspect candidate resumes, education, experience, and personalized cover letters.
4. **One-Click Candidate Progression**: Instantly advance candidate status (`APPLIED`, `UNDER REVIEW`, `SHORTLISTED`, `INTERVIEW`, `ACCEPTED`, `REJECTED`) with real-time UI synchronization.

### 🎨 Design System & Aesthetics
- **Dark/Light Theme Toggle**: Seamless persistent mode switching stored in `localStorage`.
- **Responsive Layout**: Designed specifically for 320px mobile, 375px, 425px, 768px tablet, 1024px laptop, and 1440px desktop screens.
- **Micro-Animations & Toasts**: Non-blocking toast notification stack for immediate user feedback.
- **Accessible & Accessible Typography**: Curated Inter sans-serif font stack with WCAG-compliant color contrasts.

---

## 📸 Screenshots & UI Showcase

| Desktop Landing Page | Search & Advanced Filters |
| :---: | :---: |
| *(Hero with floating statistics, domain grid, and featured roles)* | *(Multi-dimensional sidebar filters, live results counter)* |

| Seeker Dashboard & Tracker | Employer Management & Pipeline |
| :---: | :---: |
| *(Progress bar, recommended jobs, application timeline)* | *(Weekly analytics chart, job listings table, status modal)* |

---

## 🛠️ Technology Stack

### Frontend
- **HTML5**: Semantic markup with full accessibility standards (`aria-label`, `<main>`, `<section>`, `<nav>`, `<aside>`).
- **CSS3 / Vanilla CSS**: Zero external bloated frameworks. Custom design system utilizing CSS Custom Properties, Glassmorphism, Flexbox, and CSS Grid.
- **JavaScript (ES6+)**: Modular Vanilla JS architecture (`api.js`, `ui.js`, `auth.js`, `jobs.js`, `dashboard.js`, `applications.js`, `profile.js`).

### Backend
- **Node.js**: Asynchronous event-driven runtime environment.
- **Express.js**: RESTful API framework with modular controllers and routers.
- **MongoDB & Mongoose**: Document-oriented NoSQL database with schema validation, indexing, and cascade hooks.
- **JSON Web Tokens (JWT)**: Stateless token-based user authorization with 30-day expiry.
- **bcryptjs**: Blowfish cryptographic hashing (10 salt rounds) for password security.

### Middleware & Security
- **Helmet**: HTTP header hardening against XSS, clickjacking, and MIME sniffing.
- **CORS**: Cross-Origin Resource Sharing control.
- **Express-Rate-Limit**: Brute-force mitigation (300 requests / 15-minute window).

---

## 🏛️ System Architecture

```mermaid
graph TD
    Client["Browser Frontend (Vanilla HTML/CSS/JS)"] -->|REST API Requests / Bearer JWT| Server["Express.js Server (Port 5000)"]
    Server --> Helmet["Security Headers (Helmet)"]
    Server --> RateLimiter["Rate Limiter Middleware"]
    Server --> AuthMW["JWT Authentication & Role Middleware"]
    AuthMW --> Controllers["Controllers (Auth, Jobs, Apps, Profiles, Dashboard)"]
    Controllers --> Mongoose["Mongoose Models & Schemas"]
    Mongoose --> Database[("MongoDB Database (Local / Atlas / Embedded)")]
```

---

## 📁 Project Structure

```
openhire/
├── frontend/
│   ├── index.html                 # Main landing page
│   ├── login.html                 # Authentication login & demo access
│   ├── register.html              # Role-aware registration
│   ├── jobs.html                  # Search & advanced filtering catalog
│   ├── job-details.html           # Full job descriptions & apply modal
│   ├── seeker-dashboard.html      # Job seeker dashboard & recommendations
│   ├── employer-dashboard.html    # Employer dashboard & recruitment telemetry
│   ├── applications.html          # Dual-role application tracker
│   ├── profile.html               # Seeker & employer profile settings
│   ├── post-job.html              # Job posting creation studio
│   ├── edit-job.html              # Job editing & status toggling
│   │
│   ├── css/
│   │   ├── style.css              # Core tokens, buttons, badges, modals, toasts
│   │   ├── auth.css               # Auth cards, password meter, demo access
│   │   ├── dashboard.css          # Sidebars, stats cards, timelines, charts
│   │   └── responsive.css         # Breakpoint adaptations (320px - 1440px)
│   │
│   └── js/
│       ├── api.js                 # Centralized fetch client & JWT manager
│       ├── auth.js                # Auth forms & demo sign-in logic
│       ├── jobs.js                # Search, suggestions, filters & job detail
│       ├── dashboard.js           # Seeker & employer analytics controllers
│       ├── applications.js        # Timeline tracker & candidate reviewer
│       ├── profile.js             # Profile updater & completion score
│       └── ui.js                  # Theme toggler, toasts, modals & formatters
│
├── backend/
│   ├── config/
│   │   └── db.js                  # Resilient database connection with memory fallback
│   ├── controllers/
│   │   ├── authController.js      # Register, login, me & demo login
│   │   ├── jobController.js       # CRUD, filters, search suggestions, bookmarks
│   │   ├── applicationController.js # Apply, candidate status, reviews
│   │   ├── profileController.js   # Profile read & update
│   │   └── dashboardController.js # Analytics & metrics calculations
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT token validation
│   │   ├── roleMiddleware.js      # Role authorization (seeker vs employer)
│   │   └── errorMiddleware.js     # Standardized error responses
│   ├── models/
│   │   ├── User.js                # Users, credentials & profiles
│   │   ├── Job.js                 # Jobs, requirements & deadlines
│   │   ├── Application.js         # Applications, cover letters & stages
│   │   └── SavedJob.js            # Bookmarks with unique compound index
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── jobRoutes.js
│   │   ├── applicationRoutes.js
│   │   ├── profileRoutes.js
│   │   └── dashboardRoutes.js
│   ├── utils/
│   │   ├── generateToken.js       # JWT signing utility
│   │   ├── validation.js          # Password strength & email validators
│   │   └── seed.js                # Comprehensive realistic seed dataset
│   ├── .env.example               # Template environment variables
│   ├── package.json               # Backend dependencies and scripts
│   └── server.js                  # Main server entry point
│
├── .gitignore                     # Git exclusion rules
└── README.md                      # Comprehensive project documentation
```

---

## 🗄️ Database Schema & Models

### 1. User Model (`User.js`)
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `name` | String | Required, Trim | User's full display name |
| `email` | String | Required, Unique, Lowercase | Validated email address |
| `password` | String | Required, Hashed | bcrypt hashed password (select: false) |
| `role` | String | Enum: `['seeker', 'employer']` | Authorization role |
| `phone` | String | Optional | Contact phone number |
| `location` | String | Optional | City or geographic location |
| `skills` | [String] | Optional | Array of technical competencies |
| `education` | String | Optional | Degree, institution, year |
| `experience` | String | Optional | Work history summary |
| `resumeUrl` | String | Optional | PDF or online resume URL |
| `companyName` | String | Optional (Employer) | Name of employer company |
| `companyWebsite`| String | Optional (Employer) | Company URL |

### 2. Job Model (`Job.js`)
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `title` | String | Required | Position title |
| `category` | String | Enum: 8 Domains | Domain categorization |
| `company` | String | Required | Hiring organization |
| `location` | String | Required | Position city / location |
| `jobType` | String | Enum: Full Time, Part Time, etc. | Employment contract type |
| `workMode` | String | Enum: Remote, Hybrid, On-site | Work arrangement |
| `salaryMin` | Number | Default: 0 | Lower salary bound |
| `salaryMax` | Number | Default: 0 | Upper salary bound |
| `experienceLevel`| String| Enum: Fresher, 1-3, 3-5, 5+ | Seniority requirement |
| `applicationDeadline`| Date| Required | Validated deadline cutoff |
| `employer` | ObjectId| Ref: `User` | Job poster identifier |
| `status` | String | Enum: `['OPEN', 'FILLED']` | Current listing state |

### 3. Application Model (`Application.js`)
- **Fields**: `job` (ref Job), `applicant` (ref User), `employer` (ref User), `fullName`, `email`, `phone`, `coverLetter`, `resumeUrl`, `status` (`APPLIED`, `UNDER REVIEW`, `SHORTLISTED`, `INTERVIEW`, `ACCEPTED`, `REJECTED`), `appliedAt`.
- **Compound Index**: `{ job: 1, applicant: 1 }` (unique: true) prevents duplicate submissions.

### 4. SavedJob Model (`SavedJob.js`)
- **Fields**: `user` (ref User), `job` (ref Job), `createdAt`.
- **Compound Index**: `{ user: 1, job: 1 }` (unique: true) prevents redundant bookmarks.

---

## 📡 API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create account (Seeker or Employer).
- `POST /api/auth/login` - Authenticate with email/password; returns JWT.
- `POST /api/auth/demo` - 1-click demo login for academic evaluation.
- `GET /api/auth/me` - Retrieve current session profile (Protected).

### Jobs (`/api/jobs`)
- `GET /api/jobs` - Filtered job catalog (search, domain, type, mode, date).
- `GET /api/jobs/suggestions?q=term` - Autocomplete suggestions.
- `GET /api/jobs/:id` - Fetch single job details & expired status.
- `POST /api/jobs` - Create new job (Employer only).
- `PUT /api/jobs/:id` - Update job parameters (Job owner only).
- `DELETE /api/jobs/:id` - Cascade delete job and applications (Job owner only).
- `PATCH /api/jobs/:id/status` - Toggle `OPEN` / `FILLED` (Job owner only).
- `GET /api/jobs/employer/my` - Fetch all jobs created by logged-in employer.
- `POST /api/jobs/:id/save` - Bookmark job (Seeker only).
- `DELETE /api/jobs/:id/save` - Remove bookmark (Seeker only).
- `GET /api/jobs/saved` - Fetch bookmarked jobs (Seeker only).

### Applications (`/api/applications`)
- `POST /api/applications` - Submit application (Seeker only).
- `GET /api/applications/my` - List seeker's applications (Seeker only).
- `GET /api/applications/job/:jobId` - List applicants for specific job (Employer only).
- `GET /api/applications/employer/all` - List all applicants across employer postings.
- `PATCH /api/applications/:id/status` - Update stage milestone (Employer only).

### Profile & Dashboards
- `GET /api/profile` & `PUT /api/profile` - Profile management.
- `GET /api/dashboard/seeker` - Seeker metrics, recommendations & applications.
- `GET /api/dashboard/employer` - Employer metrics, weekly analytics & applicants.

---

## 🔒 Authentication & Security

1. **Password Encryption**: All passwords are automatically salted and hashed via bcrypt before writing to the database.
2. **Stateless JWT**: Standard Bearer authorization header verification; passwords are excluded from all query projections.
3. **Role Authorization Middleware**: Role-based access control enforces that seekers cannot post jobs or review competitors, and employers cannot apply to jobs.
4. **Deadline Enforcement**: Submissions are strictly verified against `applicationDeadline` on the backend; expired jobs reject application requests.
5. **No Duplicate Applications**: The database prevents candidates from spamming multiple applications to the same opening.
6. **Rate Limiting**: `express-rate-limit` prevents brute-force attempts on API routes.
7. **Security Headers**: `helmet` sets hardened Content Security Policy and prevents cross-site script injections.

---

## 💻 Installation Guide

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ or v20+
- [Git](https://git-scm.com/)
- Local MongoDB (optional, since an automatic in-memory fallback is embedded)

### 1. Clone the Repository
```bash
git clone https://github.com/abarnaanbazhagan2727/openhire.git
cd openhire
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

---

## ⚙️ Environment Variables

Create a `.env` file in the `backend/` directory using the provided `.env.example`:

```bash
# backend/.env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/openhire
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
JWT_EXPIRE=30d
```

> **Security Note:** The `.env` file is included in `.gitignore` and must never be committed to public version control.

---

## 🚀 Running Locally

### 1. Seed Demo Dataset
Populate 12+ real-world tech positions, demo users, applications, and bookmarks:
```bash
cd backend
npm run seed
```

### 2. Start the Server
```bash
npm start
```
The application will launch at:
👉 **`http://localhost:5000`**

Both the frontend static pages and backend REST APIs are served through this single port, preventing any CORS issues.

---

## 👥 Demo Accounts (Academic Jury Testing)

For quick demonstration and evaluation, pre-configured accounts are provided:

| Account Type | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Job Seeker** | `seeker.demo@openhire.dev` | `Password123!` | Job Seeker (Alex Rivera) |
| **Employer** | `employer.demo@openhire.dev` | `Password123!` | Talent Recruiter (TechNova Solutions) |

> 💡 **Tip:** On `login.html`, click **"👤 Job Seeker (Alex)"** or **"🏢 Employer (TechNova)"** to log in instantly without typing credentials!

---

## ✅ End-to-End Testing Verification

The complete application was verified through 26 end-to-end integration tests:

| Test ID | Test Scenario | Expected Result | Status |
| :---: | :--- | :--- | :---: |
| **TEST 1** | Register Job Seeker | Account created, JWT generated, redirect to Seeker Dashboard | ✅ PASS |
| **TEST 2** | Register Employer | Company profile created, redirect to Employer Dashboard | ✅ PASS |
| **TEST 3** | Login Job Seeker | Authenticated, user role verified in localStorage | ✅ PASS |
| **TEST 4** | Login Employer | Authenticated, employer company banner displayed | ✅ PASS |
| **TEST 5** | Employer creates job | Form validated, saved to MongoDB, toast notification | ✅ PASS |
| **TEST 6** | Job appears in public listing | Query returns new job on `/api/jobs` and `jobs.html` | ✅ PASS |
| **TEST 7** | Search job | Query filters by title, skill, and company accurately | ✅ PASS |
| **TEST 8** | Filter job | Multiple filters applied simultaneously | ✅ PASS |
| **TEST 9** | Open job details | Displays overview, responsibilities, requirements | ✅ PASS |
| **TEST 10** | Save job (Bookmark) | Saved in MongoDB `SavedJob`, heart icon turns active | ✅ PASS |
| **TEST 11** | Apply for job | Modal submits application, stored in `Application` model | ✅ PASS |
| **TEST 12** | Prevent duplicate application | Second apply attempt returns 400 error toast | ✅ PASS |
| **TEST 13** | View application in seeker dashboard | Application appears in tracker with current stage | ✅ PASS |
| **TEST 14** | Employer views applicant | Applicant details & cover letter accessible in modal | ✅ PASS |
| **TEST 15** | Employer changes applicant status | Status updated to `SHORTLISTED` via PATCH request | ✅ PASS |
| **TEST 16** | Seeker sees updated status | Tracker immediately reflects updated status | ✅ PASS |
| **TEST 17** | Employer edits job | Changes saved to database and reflected in details | ✅ PASS |
| **TEST 18** | Employer deletes job | Job deleted along with cascading applications | ✅ PASS |
| **TEST 19** | Employer marks job filled | Status updated to `FILLED` via PATCH request | ✅ PASS |
| **TEST 20** | Seeker cannot apply to filled job | Apply button disabled, displays "Applications Closed" | ✅ PASS |
| **TEST 21** | Update profile | Profile score recalculated and saved to DB | ✅ PASS |
| **TEST 22** | Logout | Session cleared, redirected to login | ✅ PASS |
| **TEST 23** | Unauthorized API access | Direct API request without JWT returns 401 Unauthorized | ✅ PASS |
| **TEST 24** | Mobile responsive test | Breakpoints 320px, 375px, 768px, 1024px render properly | ✅ PASS |
| **TEST 25** | Browser console check | Zero uncaught errors or warnings | ✅ PASS |
| **TEST 26** | Backend server console | Clean request logs without unhandled rejections | ✅ PASS |

---

## 📋 Assignment Requirement Mapping

| Requirement Item | Implementation Location | Compliance |
| :--- | :--- | :---: |
| **User Registration & Auth** | `authController.js`, `login.html`, `register.html`, JWT + bcrypt | 100% |
| **Job Listing Creation** | `jobController.js`, `post-job.html`, `edit-job.html` | 100% |
| **Job Search & Filtering** | `jobController.js`, `jobs.html`, `jobs.js` (Multi-filter) | 100% |
| **Job Application** | `applicationController.js`, `job-details.html`, modal dialog | 100% |
| **Job Seeker Dashboard** | `seeker-dashboard.html`, `dashboardController.js` | 100% |
| **Employer Dashboard** | `employer-dashboard.html`, `dashboardController.js` | 100% |
| **User Profiles** | `profile.html`, `profileController.js` (Role-specific) | 100% |
| **Responsive Design** | `responsive.css` (320px, 375px, 425px, 768px, 1024px, 1440px) | 100% |
| **Vanilla HTML/CSS/JS** | 11 HTML pages, 4 CSS stylesheets, 7 JS modules (No React) | 100% |
| **Node.js/Express Backend** | `server.js`, 5 Routers, 5 Controllers, 3 Middlewares | 100% |
| **MongoDB Database** | 4 Mongoose models with validation & compound indices | 100% |
| **Security Measures** | JWT, bcrypt, Helmet, Rate Limiter, Ownership verification | 100% |
| **GitHub / Open Source** | Clean directory structure, `.gitignore`, `.env.example`, README | 100% |

---

## 🔮 Future Enhancements

- WebSockets integration for real-time interview invitation notifications.
- In-browser PDF resume previewer.
- Video interview scheduling integration (Google Meet / Zoom API).
- AI resume keyword matcher based on vector embeddings.

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).

Developed with ❤️ for **Project 2 – Open Source Job Portal**.
