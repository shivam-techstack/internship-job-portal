# CareerLaunch — Internship & Job Listing Portal

A modern, full-stack **MERN** (MongoDB, Express.js, React.js, Node.js) recruitment platform connecting students, freshers, and professionals with curated tech internships and career roles.

---

## 🚀 Key Features

### For Candidates / Job Seekers
- **Account Registration & Secure JWT Login:** Register with email and hashed password (`bcryptjs`), persistent sessions.
- **Browse Opportunities:** High-performance searchable and filterable feed of active internships and jobs.
- **Domain & Type Filtering:** Real-time filtering across Web Development, Data Science, AI/ML, UI/UX, Cloud & DevOps, and Employment Types (Internship, Full-Time, etc.).
- **Detailed Opportunity View:** Full job description, location, experience requirements, compensation/stipend tags, and official application references.
- **One-Click Application:** Simplified submission form that auto-fills candidate information if logged in.
- **Duplicate Application Prevention:** Guardrails preventing candidates from accidentally submitting duplicate applications for the same role.
- **My Applications Dashboard:** Candidate-facing tracking center displaying application status (⏳ *Pending*, 🔍 *Reviewing*, 🌟 *Shortlisted*, 🎉 *Accepted*, ✕ *Rejected*) and recruiter feedback.

### For Recruiters / Administrators
- **Role-Based Access Control (RBAC):** Protected routes ensuring only authenticated administrators can access management tooling.
- **KPI Metrics Dashboard:** Real-time statistics tracking total active opportunities, candidate applications, shortlisted talent, and active domains.
- **Job Listing Management (CRUD):** Create new listings, edit existing listings, or delete obsolete roles.
- **Candidate Pipeline Management:** Filter applications by status or search candidates; update applicant review status and leave recruiter evaluation notes.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, React Router v6, Axios, Vite 6, Modern CSS Variables & Responsive Grid |
| **Backend** | Node.js, Express.js 4.21, REST APIs |
| **Database** | MongoDB, Mongoose 8.10 (Data Validation, Compound Indexes) |
| **Authentication** | JWT (JSON Web Tokens), `bcryptjs` password hashing |
| **Testing** | Native Node.js Automated E2E Verification Suite |

---

## 📁 Project Structure

```
internship-job-portal/
├── client/                     # React + Vite Frontend
│   ├── public/                 # Static assets & icons
│   ├── src/
│   │   ├── components/         # Reusable UI (Navbar, OpportunityCard, ProtectedRoute)
│   │   ├── context/            # AuthContext (login, register, logout, session persistence)
│   │   ├── pages/              # Views (Home, OpportunityDetail, ApplyPage, Confirmation,
│   │   │                       #        Login, Register, UserDashboard, AdminPanel)
│   │   ├── services/           # Axios API client with automatic JWT token interceptor
│   │   ├── App.jsx             # Router layout & route definitions
│   │   ├── App.css             # Component styling & layout rules
│   │   ├── index.css           # Global typography, themes, and CSS custom properties
│   │   └── main.jsx            # React root mount
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Express.js Backend
│   ├── config/
│   │   └── db.js               # MongoDB connection logic
│   ├── controllers/            # Controller business logic
│   │   ├── authController.js   # Register, login, current user profile
│   │   ├── opportunityController.js # CRUD & search for job/internship listings
│   │   └── applicationController.js # Submission, status updates, my-applications
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT verification (protect, adminOnly, optionalAuth)
│   │   └── errorMiddleware.js  # Global 404 & centralized error handling
│   ├── models/
│   │   ├── User.js             # User schema with bcrypt password hashing
│   │   ├── Opportunity.js      # Job & internship schema with indexed fields
│   │   └── Application.js      # Application schema with status enum & unique index
│   ├── routes/
│   │   ├── authRoutes.js       # /api/auth endpoints
│   │   ├── opportunityRoutes.js# /api/opportunities endpoints
│   │   └── applicationRoutes.js# /api/applications endpoints
│   ├── app.js                  # Express application setup & middleware
│   ├── server.js               # Entry point (connects DB and listens)
│   ├── seed.js                 # Database seeding script with default accounts
│   ├── test-e2e.js             # Automated 20-test E2E verification suite
│   ├── package.json
│   └── .env
│
├── package.json                # Root orchestration scripts
└── README.md
```

---

## ⚙️ Environment Variables

### Backend (`server/.env`)
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/internship_job_portal
NODE_ENV=development
JWT_SECRET=careerlaunch_jwt_super_secret_key_2026_secure
JWT_EXPIRE=30d
```

### Frontend (`client/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🏃 Setup & Execution Instructions

### 1. Prerequisites
- **Node.js**: v18+ or v20+ installed.
- **MongoDB**: MongoDB Server installed and running locally on port `27017` (or MongoDB Atlas connection string configured in `server/.env`).

### 2. Install Dependencies
```bash
# In server directory
cd server
npm install

# In client directory
cd ../client
npm install
```

### 3. Seed Database
Populates standard opportunities, applications, and default user accounts:
```bash
# From server/ directory:
npm run seed

# Or from root directory:
npm run seed
```

### 4. Start the Application

#### Start Backend:
```bash
# In server directory:
npm run dev
# Server will run on: http://localhost:5000
```

#### Start Frontend:
```bash
# In client directory:
npm run dev
# Frontend will run on: http://localhost:5173
```

---

## 🔑 Default Seed Credentials

For rapid testing and evaluation, the following pre-configured credentials are ready to use:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@careerlaunch.com` | `Admin@12345` | Full CRUD on opportunities, review/manage all applications, change statuses, view metrics. |
| **Candidate 1** | `aarav.sharma@example.edu` | `Candidate@12345` | Browse roles, submit applications, view "My Applications" dashboard. |
| **Candidate 2** | `priya.nair@example.edu` | `Candidate@12345` | Candidate account with shortlisted application state. |

*(The Sign In page also includes convenient one-click "Fill Admin" and "Fill Candidate" buttons.)*

---

## 🧪 Testing & Verification

Run the end-to-end automated verification suite covering 20 test cases across User Workflows, Admin Workflows, and Security Controls:

```bash
# From root directory:
npm run test

# Or directly:
node server/test-e2e.js
```

### Automated Tests Verified:
1. System Health API (`GET /api/health`)
2. User Registration with password hashing
3. Duplicate Registration rejection
4. Candidate Authentication & JWT issuance
5. Rejection of invalid credentials (401)
6. Admin Authentication & Role Authorization
7. Public Opportunities Catalog retrieval
8. Opportunity Filtering by domain and keyword search
9. Single Opportunity retrieval by ID
10. Security: Non-Admin forbidden from posting opportunities (403)
11. Admin Opportunity Creation (201)
12. Admin Opportunity Update (200)
13. Candidate Application Submission (201)
14. Duplicate Application Prevention (400)
15. Candidate "My Applications" retrieval (200)
16. Security: Candidate forbidden from viewing all applications (403)
17. Admin retrieval of complete candidate pipeline (200)
18. Admin updating application review status to "Accepted" with notes (200)
19. Admin deleting opportunity (200)
20. Admin deleting application record (200)
