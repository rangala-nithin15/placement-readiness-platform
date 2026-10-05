# Placement Readiness Platform

A full-stack, enterprise-grade college placement-readiness and mentor-management platform designed for engineering institutions. The system deterministically calculates student placement eligibility across **12 placement parameters** (250 total marks), enforces strict **mentor-student isolation**, supports public profile verification (LeetCode, GitHub, CodeChef, HackerRank, LinkedIn), provides task tracking and notifications, and features a **WhatsApp-style real-time mentorship group chat**.

---

## 🌟 Key Architecture & Features

### 1. Role-Based Access Control & Strict Security
* **STUDENT**: Registers with basic academic info (Name, Reg No, College Email, Password, Department, Batch). Accesses student dashboard, profile completion, 12 parameter tracking, external profile claiming, task submissions, notifications, and group chat.
* **MENTOR**: Authenticated faculty mentor with unique mentor code (e.g. `CSE-MENTOR-001`). Accesses assigned mentee cohorts, conducts profile verifications, assigns tasks with priority & due dates, and hosts the cohort group chat.
* **ADMIN**: Central administrator console for overseeing students, mentors, departments, batches, and mentor-mentee assignments.
* **Strict Backend Isolation**: Mentors can only query and verify students actively assigned to them. Direct API access attempts across unassigned students return **HTTP 404/403**.

### 2. Deterministic 12-Parameter Placement Engine (250 Marks Total)
The platform evaluates readiness via a deterministic backend calculation engine based on institutional guidelines:
1. **Coding Problems Solved** (30 marks) – Real LeetCode / platform problem milestones
2. **Open-Source Contribution** (20 marks) – Real GitHub merged PRs & contributions
3. **Competition Achievement** (25 marks) – Hackathons & coding contests
4. **Certification Achievement** (20 marks) – Industry-recognized certifications
5. **Competitive Programming Rating** (25 marks) – CodeChef / Codeforces contest rating
6. **Project, Publication & Patent Achievement** (25 marks) – Capstone projects & publications
7. **External Aptitude & Communication** (20 marks) – Soft skills & aptitude metrics
8. **Monthly Coding Assessment** (20 marks) – Institutional assessment performance
9. **GATE & Higher Studies Examinations** (15 marks) – Qualifying exam benchmarks
10. **Internship, Startup & Off-Campus Achievement** (25 marks) – Verified industry experience
11. **Foreign Language Proficiency** (10 marks) – Language certifications
12. **Hundred Days Training Programme** (15 marks) – Intensive boot camp milestone

**Placement Levels**:
* **LEVEL 1**: 0 – 99 marks
* **LEVEL 2**: 100 – 159 marks
* **LEVEL 3**: 160 – 209 marks
* **ELITE**: 210 – 250 marks

### 3. External Profile Claiming & Verification Adapter Architecture
* Public coding profiles (LeetCode, GitHub, CodeChef, HackerRank, LinkedIn) are claimed via validated URLs.
* **Duplicate Claim Prevention**: The same profile handle cannot be claimed by multiple students.
* **Modular Adapter Service**: `ExternalProfileService` utilizes platform-specific adapters to fetch public statistics without simulating or inventing numbers.
* **Mentor Verification Workflow**: Status transitions between `PENDING`, `VERIFIED`, and `REJECTED` with rejection remarks and mentor identity stamps.

### 4. Task Management & In-App Notification Center
* Mentors assign targeted tasks to assigned mentees with priority (`LOW`, `MEDIUM`, `HIGH`) and deadlines.
* Students update task status (`PENDING`, `IN_PROGRESS`, `COMPLETED`).
* Automated notification triggers dispatch real-time alerts upon task assignments, status completions, and profile verifications.

### 5. WhatsApp-Style Mentorship Group Chat
* **Cohort Isolation**: Group room is scoped strictly to 1 Mentor + their assigned mentees.
* **Dual Real-Time Transport**: WebSocket endpoint (`ws://localhost:8000/api/chat/ws/{room_id}`) paired with background REST polling fallback for zero message loss.
* **WhatsApp Visuals**: Clean message bubbles, sender badges (`[Mentor]` or Register Number), timestamps, send status checkmarks, and member drawer.

### 6. Light & Dark Mode
* Persistent theme toggle with `system`, `light`, and `dark` modes, fully styled using Tailwind CSS classes.

---

## 🛠️ Technology Stack

* **Backend**: FastAPI (Python 3.8+), PyMongo, Pydantic v2, PyJWT, Passlib / Bcrypt, WebSockets, Uvicorn.
* **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, React Router v7.
* **Database**: MongoDB 5.0+ (native connection & indexing).

---

## 🚀 Getting Started

### 1. Prerequisites
* **MongoDB**: Running locally on `localhost:27017` (or configured via `.env`).
* **Python**: 3.8.10+
* **Node.js**: v18+ (tested on v24.18.0)

---

### 2. Database Initialization & Seeding

The application fully supports running against a completely empty database. To quickly populate the system with verified faculty mentors, students, assignments, and sample tasks:

```powershell
# In the backend directory:
cd backend
.\venv\Scripts\python -m app.database.seed
```

#### Pre-Configured Test Credentials:

| Role | Email | Password | Identifier / Details |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@placement.edu` | `Admin@12345` | System Administrator |
| **Faculty Mentor (CSE)** | `mentor.cse@placement.edu` | `Password@123` | Dr. Rajesh Kumar (`CSE-MENTOR-001`) |
| **Faculty Mentor (ECE)** | `mentor.ece@placement.edu` | `Password@123` | Dr. Anitha Sharma (`ECE-MENTOR-001`) |
| **Student (CSE)** | `aravind@placement.edu` | `Password@123` | Aravind Swaminathan (`23CSE001`, Assigned to CSE Mentor) |
| **Student (CSE)** | `bhavani@placement.edu` | `Password@123` | Bhavani Shankar (`23CSE002`, Assigned to CSE Mentor) |
| **Student (CSE)** | `deepa@placement.edu` | `Password@123` | Deepa Ramesh (`23CSE003`, Assigned to CSE Mentor) |
| **Student (ECE)** | `karthik@placement.edu` | `Password@123` | Karthik Raja (`23ECE001`, Assigned to ECE Mentor) |

---

### 3. Starting the Backend Server

```powershell
cd backend
.\venv\Scripts\uvicorn app.main:app --reload --port 8000
```

The API documentation will be available at:
* Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
* Health Check: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

### 4. Starting the Frontend Application

```powershell
cd frontend
npm install
npm run dev
```

The application interface will be available at [http://localhost:5173](http://localhost:5173).

---

## 🧪 Running Automated Tests

The backend test suite covers authentication, role authorization, student profile completion, deterministic placement score calculation, external profile claiming, verification workflows, mentor-student isolation, task assignment, notifications, and group chat isolation:

```powershell
cd backend
.\venv\Scripts\python -m unittest discover tests -v
```

All **38 unit and integration tests** execute and pass against the local test database.

---

## 📁 Repository Structure

```text
placement-readiness-platform/
├── backend/
│   ├── app/
│   │   ├── api/                     # REST & WebSocket routers (auth, student, mentor, admin, tasks, chat, etc.)
│   │   ├── core/                    # Security, JWT, config & CORS
│   │   ├── database/                # MongoDB client connection, seed script
│   │   ├── repositories/            # Data access layers (users, profiles, tasks, chat, notifications)
│   │   ├── services/                # Business logic (placement engine, profile adapters)
│   │   └── main.py                  # FastAPI app entry point & index initialization
│   ├── tests/                       # 38 unit & integration tests
│   └── requirements.txt             # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/              # Chat view, theme toggle, reusable UI
│   │   ├── context/                 # ThemeContext (dark/light)
│   │   ├── layouts/                 # StudentLayout, MentorLayout
│   │   ├── pages/                   # Role-based pages (student, mentor, admin, auth)
│   │   ├── routes/                  # AppRoutes, ProtectedRoute (role guards)
│   │   ├── services/                # API client services (auth, tasks, chat, notifications, placement)
│   │   └── index.css                # Tailwind styling & dark variant
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

---

## 🔒 Security & Quality Assurances

* **Zero Fake Data**: Dynamic database storage with persistent documents.
* **Safe External Profiles**: Validates profile URLs, extracts normalized handles, and prevents cross-student claiming.
* **Deterministic Scoring**: Transparent calculation formulas strictly adhering to evaluation parameters without nondeterministic AI grading.
* **Complete Role Guarding**: Frontend protected routes prevent unauthorized screen transitions, reinforced by backend token role validation and mentor assignment checks on every request.
